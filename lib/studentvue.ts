/* ==========================================================================
   Chezburger Grades — StudentVUE client for the 2026 Synergy servers.

   Protocol (verified live against md-mcps-psv.edupoint.com):
   - JSON mobile API: POST {district}/api/v1/mobile/PXPWebServices/<Method>
     HTTP Basic auth at AttemptLogin -> Bearer token for everything else.
     Every call needs the `edupointkeyversion` header (32-byte base64 key
     served by the public key service, cached in localStorage).
   - SOAP fallback: POST {district}/Service/PXPCommunication.asmx with
     ProcessWebServiceRequestMultiWeb + credentials in the envelope + the
     key in a cookie (relays add it from the x-ojjy-key header).
   - District servers send no CORS headers, so browser requests go through
     a relay chain: user relay -> hosted relay -> direct -> public proxy.

   Exposes the exact surface of the old `studentvue` npm package so the
   rest of the app is unchanged:
     login(districtUrl, credentials) -> {client, responses: [Gradebook, extra][]}
     client.gradebook(index?, orgYearGu?) -> [Gradebook, extra]
     client.ChildList() / studentInfo()   -> [StudentInfo, extra]
     client.attendance() / schedule() / documents()
     findDistricts(zip)

   Speed: sessions (access + refresh token) are cached in localStorage and
   reused across reloads instead of re-signing-in every visit, and all
   reporting-period gradebooks are fetched in parallel. ojjyMelon does
   neither (one login round-trip + serial per-view fetches), which is why
   it feels slow.
   ========================================================================== */

const APP_VERSION = "2.0.16";
const USER_AGENT = "ksoap";
const APP_NAME_HEADER = `StudentVUE|Android|${APP_VERSION}`;

/* ---------- edupointkeyversion ---------- */
const KEY_ENDPOINTS = [
	"https://axum-svue.fly.dev/akey",
	"https://corsproxy.io/?url=" +
		encodeURIComponent("https://axum-svue.fly.dev/akey"),
];
const KEY_TTL_MS = 12 * 60 * 60 * 1000; // refresh at most twice a day
const LAST_KNOWN_KEY =
	"Fws7lq+y7btySqYP52MXIZEjQbNo1EUhdAdwCvic8Ptlsf65icaE//ZYiHvvw8hh";
const KEY_STORAGE = "chezburger.key.v2";

let keyPromise: Promise<string> | null = null;

function cachedKey(): string | null {
	try {
		const raw = localStorage.getItem(KEY_STORAGE);
		if (!raw) return null;
		const { value, at } = JSON.parse(raw);
		if (value && Date.now() - at < KEY_TTL_MS) return value;
	} catch {
		/* ignore */
	}
	return null;
}

function saveKey(value: string) {
	try {
		localStorage.setItem(
			KEY_STORAGE,
			JSON.stringify({ value, at: Date.now() })
		);
	} catch {
		/* ignore */
	}
}

async function fetchKeyFromEndpoints(): Promise<string> {
	for (const url of KEY_ENDPOINTS) {
		try {
			const res = await fetch(url, { cache: "no-store" });
			if (!res.ok) continue;
			const text = (await res.text()).trim();
			// sanity: base64-ish, 40-64 chars
			if (/^[A-Za-z0-9+/=]{40,64}$/.test(text)) return text;
		} catch {
			/* try next */
		}
	}
	// stale cache beats nothing
	try {
		const raw = JSON.parse(localStorage.getItem(KEY_STORAGE) || "null");
		if (raw?.value) return raw.value;
	} catch {
		/* ignore */
	}
	if (LAST_KNOWN_KEY) return LAST_KNOWN_KEY;
	throw new Error(
		"Could not fetch the edupoint access key. Try again later."
	);
}

export async function getVersionKey(): Promise<string> {
	const cached = cachedKey();
	if (cached) return cached;
	if (keyPromise) return keyPromise;
	keyPromise = fetchKeyFromEndpoints()
		.then((k) => {
			saveKey(k);
			keyPromise = null;
			return k;
		})
		.catch((e) => {
			keyPromise = null;
			throw e;
		});
	return keyPromise;
}

/* ---------- Relay chain ---------- */
/* Each relay is a function (url, init) -> fetch-like call. */
const BUILTIN_RELAY = "https://ojjymelon-relay.jonasamlee.workers.dev";
const USER_RELAY_STORAGE = "chezburger.worker";

function getConfiguredWorkerUrl(): string {
	try {
		return localStorage.getItem(USER_RELAY_STORAGE) || "";
	} catch {
		return "";
	}
}

export function setConfiguredWorkerUrl(url: string) {
	try {
		if (url)
			localStorage.setItem(USER_RELAY_STORAGE, url.replace(/\/+$/, ""));
		else localStorage.removeItem(USER_RELAY_STORAGE);
	} catch {
		/* ignore */
	}
}

function relayProxy(relayUrl: string, name: string) {
	// Relay contract: POST <relay>/relay?url=.. forwards method/headers/body
	const base = relayUrl.replace(/\/+$/, "");
	return {
		name,
		fetch: (url: string, init: RequestInit) =>
			fetchWithTimeout(
				`${base}/relay?url=${encodeURIComponent(url)}`,
				{
					method: init.method || "GET",
					headers: init.headers as any,
					body: init.body as any,
				},
				25000
			),
	};
}

function fetchWithTimeout(
	url: string,
	init: RequestInit = {},
	ms = 15000
): Promise<Response> {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), ms);
	return fetch(url, { ...init, signal: ctrl.signal }).finally(() =>
		clearTimeout(timer)
	);
}

class ProxyError extends Error {
	constructor(name: string) {
		super(`proxy ${name} failed`);
		this.name = "ProxyError";
	}
}

const publicProxies = [
	{
		name: "corsproxy.io",
		fetch: (url: string, init: RequestInit) =>
			fetchWithTimeout(
				`https://corsproxy.io/?url=${encodeURIComponent(url)}`,
				{
					method: init.method || "GET",
					headers: init.headers as any,
					body: init.body as any,
				},
				25000
			),
	},
];

let workingProxy: string | null = null; // remember what worked to avoid re-probing

async function proxiedFetch(url: string, init: RequestInit = {}) {
	const attempts: { name: string; fetch: Function }[] = [];
	// 1. user-configured relay (highest priority)
	const workerUrl = getConfiguredWorkerUrl();
	if (workerUrl) attempts.push(relayProxy(workerUrl, "user-relay"));
	// 2. built-in hosted relay (zero setup)
	attempts.push(relayProxy(BUILTIN_RELAY, "hosted-relay"));
	// 3. direct — works for districts that allow CORS (most do not)
	attempts.push({ name: "direct", fetch: (u: string, i: RequestInit) => fetchWithTimeout(u, i, 25000) });
	// 4. public proxies
	attempts.push(...publicProxies);

	// try the last known-good relay first
	if (workingProxy) {
		const idx = attempts.findIndex((a) => a.name === workingProxy);
		if (idx > 0) attempts.unshift(...attempts.splice(idx, 1));
	}

	let lastErr: any = null;
	for (const attempt of attempts) {
		try {
			const res = await attempt.fetch(url, init);
			workingProxy = attempt.name;
			return res;
		} catch (e) {
			if (attempt.name === "direct") {
				lastErr = new Error(
					"The district server blocked the direct browser request (CORS) — retrying through a relay…"
				);
				continue;
			}
			lastErr = e;
		}
	}
	if (workingProxy) workingProxy = null;
	throw lastErr || new Error("No relay could reach the StudentVUE server.");
}

/* ---------- Errors ---------- */
export class ApiError extends Error {
	code: string;
	constructor(message: string, code: string) {
		super(message);
		this.code = code;
	}
}
export class UnauthorizedError extends Error {
	constructor() {
		super("Invalid Username or Password");
	}
}

/* ---------- Session persistence ---------- */
/* Synergy rate-limits logins per account, so the auth token pair is cached
   and reused across reloads instead of signing in every time. */
const SESSION_KEY = "chezburger.session.v2";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function saveSession(client: Client) {
	try {
		localStorage.setItem(
			SESSION_KEY,
			JSON.stringify({
				u: client.username,
				d: client.hostUrl,
				t: client.token,
				r: client.refresh,
				at: Date.now(),
			})
		);
	} catch {
		/* ignore */
	}
}

export function clearSession() {
	try {
		localStorage.removeItem(SESSION_KEY);
	} catch {
		/* ignore */
	}
}

/* ---------- small helpers ---------- */
function num(v: any): number {
	if (v === null || v === undefined || v === "") return NaN;
	const n = Number(v);
	return isNaN(n) ? NaN : n;
}

function pickNum(...vals: any[]): number | null {
	for (const v of vals) {
		if (v !== null && v !== undefined && v !== "") {
			const n = Number(v);
			if (!isNaN(n)) return n;
		}
	}
	return null;
}

function decodeEntities(s: any): string {
	let out = s === null || s === undefined ? "" : String(s);
	if (!out.includes("&")) return out;
	try {
		const el = document.createElement("textarea");
		el.innerHTML = out;
		out = el.value;
	} catch {
		/* not in a browser — leave as-is */
	}
	return out;
}

function dec(s: any): string {
	let out = s === null || s === undefined ? "" : String(s);
	try {
		if (/%[0-9A-Fa-f]{2}/.test(out)) out = decodeURIComponent(out);
	} catch {
		/* leave encoded */
	}
	return out;
}

function normalizeDate(v: any): Date {
	if (v instanceof Date) return v;
	let s = v === null || v === undefined ? "" : String(v).trim();
	if (/^\d{8}$/.test(s))
		s = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
	const d = new Date(s);
	return isNaN(d.getTime()) ? new Date(NaN) : d;
}

function escapeXml(s: any): string {
	return String(s ?? "").replace(/[&<>"]/g, (c) =>
		({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string)
	);
}

function defaultGradingScale() {
	return {
		default: {
			rounding: {
				percent: true,
				percentPlaces: 2,
				mark: false,
				markPlaces: 0,
			},
			letterScale: [
				["A", [89.5, 100]],
				["B", [79.5, 89.49]],
				["C", [69.5, 79.49]],
				["D", [59.5, 69.49]],
				["E", [0, 59.49]],
			] as any[],
		},
		mode: "other" as string | undefined,
	};
}

/* ==========================================================================
   Raw-shape -> old-library-shape converters.
   The JSON API returns {reportingPeriods:[{index,gradePeriod,startDate,
   endDate}], reportingPeriod, courses:[...]}; SOAP responses are first
   converted into that same shape, then normalized here into the exact
   shape the old studentvue package produced (which utils/grades.ts parses).
   ========================================================================== */

function parseSummary(summary: any) {
	const rows = Array.isArray(summary)
		? summary
		: summary?.assignmentGradeCalcs || summary?.AssignmentGradeCalc || [];
	return rows.map((g: any) => ({
		type: decodeEntities(dec(g.type ?? g.Type ?? "")),
		calculatedMark: g.calculatedMark ?? g.CalculatedMark ?? "",
		weight: {
			evaluated: g.weightedPct ?? g.WeightedPct ?? "",
			standard: g.weight ?? g.Weight ?? "",
		},
		points: {
			current: num(g.points ?? g.Points),
			possible: num(g.pointsPossible ?? g.PointsPossible),
		},
	}));
}

function assignmentToOld(a: any) {
	const point = pickNum(a.point, a.scoreCalValue, a.Point);
	const pointPossible = pickNum(
		a.pointPossible,
		a.scoreMaxValue,
		a.PointPossible
	);
	let pointsStr: string;
	if (point !== null && pointPossible !== null)
		pointsStr = `${point}/${pointPossible}`;
	else if (pointPossible !== null)
		pointsStr = `${pointPossible} Points Possible`;
	else pointsStr = String(a.points ?? a.Points ?? "0/0");

	return {
		gradebookId: String(a.gradebookID ?? a.gradebookId ?? a.GradebookID ?? ""),
		name: decodeEntities(dec(a.measure ?? a.Measure ?? "")),
		type: decodeEntities(dec(a.type ?? a.Type ?? "")),
		date: {
			start: normalizeDate(a.date ?? a.Date),
			due: normalizeDate(a.dueDate ?? a.DueDate ?? a.date ?? a.Date),
		},
		score: {
			type: a.scoreType ?? a.ScoreType ?? "Raw Score",
			value: a.score ?? a.Score ?? a.displayScore ?? "Not Graded",
		},
		points: pointsStr,
		notes: decodeEntities(String(a.notes ?? a.Notes ?? "")),
		teacherId: String(a.teacherID ?? a.TeacherID ?? ""),
		description: decodeEntities(dec(a.measureDescription ?? a.MeasureDescription ?? "")),
		hasDropbox: false,
		studentId: String(a.studentID ?? a.StudentID ?? ""),
		dropboxDate: { start: new Date(), end: new Date() },
		resources: [] as any[],
	};
}

function gradebookToOld(raw: any, requestedIndex: number | null): any {
	raw = raw || {};
	const periods = (raw.reportingPeriods || []).map((p: any) => ({
		index: num(p.index),
		name: p.gradePeriod ?? p.name ?? "",
		date: {
			start: normalizeDate(p.startDate ?? p.date?.start),
			end: normalizeDate(p.endDate ?? p.date?.end),
		},
	}));

	let currentIdx: number;
	if (requestedIndex !== null && !isNaN(Number(requestedIndex))) {
		currentIdx = Number(requestedIndex);
	} else {
		const rp = raw.reportingPeriod;
		const match = rp
			? periods.find(
					(p: any) =>
						p.name === rp.gradePeriod || p.index === num(rp.index)
			  )
			: undefined;
		currentIdx = match
			? match.index
			: num(rp?.index) ?? periods[periods.length - 1]?.index ?? 0;
		if (isNaN(currentIdx)) currentIdx = periods[periods.length - 1]?.index ?? 0;
	}
	const currentPeriod =
		periods.find((p: any) => p.index === currentIdx) ||
		(() => {
			const rp = raw.reportingPeriod;
			return {
				index: currentIdx,
				name: rp?.gradePeriod ?? "",
				date: {
					start: normalizeDate(rp?.startDate),
					end: normalizeDate(rp?.endDate),
				},
			};
		})();

	const courses = (raw.courses || []).map((c: any, i: number) => {
		const mark = (c.marks || [])[0] || null;
		const marks = mark
			? [
					{
						name: mark.markName ?? mark.name ?? "",
						calculatedScore: {
							string:
								mark.calculatedScoreString ??
								mark.calculatedScore?.string ??
								"N/A",
							raw: num(
								mark.calculatedScoreRaw ??
									mark.calculatedScore?.raw
							),
						},
						weightedCategories: parseSummary(
							mark.gradeCalculationSummary
						),
						assignments: (mark.assignments || []).map(assignmentToOld),
					},
			  ]
			: [];
		const staff = typeof c.staff === "string" ? { name: c.staff } : c.staff || {};
		return {
			courseID: c.courseID || "",
			period: c.period !== null && c.period !== undefined && c.period !== "" ? num(c.period) : i + 1,
			title: decodeEntities(dec(c.title || c.courseName || "")),
			room: c.room || "",
			staff: {
				name: staff.name ?? "",
				email: c.staffEMail ?? staff.email ?? "",
				staffGu: c.staffGU ?? staff.staffGu ?? "",
			},
			marks,
		};
	});

	return {
		error: raw.errorMessage ?? raw.error ?? "",
		type: raw.gradebookType ?? raw.type ?? "Traditional",
		reportingPeriod: {
			current: currentPeriod,
			available: periods,
		},
		courses,
	};
}

function attendanceToOld(raw: any) {
	raw = raw || {};
	const absences = (raw.absences || []).map((a: any) => ({
		date: normalizeDate(a.date ?? a.absenceDate),
		reason: a.reason ?? "",
		note: a.note ?? "",
		description: a.description ?? a.codeAllDayDescription ?? "",
		periods: (a.periods || []).map((p: any) => ({
			period: num(p.period ?? p.number),
			name: p.name ?? "",
			reason: p.reason ?? "",
			course: p.course ?? "",
			staff: {
				name: p.staff?.name ?? p.staffName ?? (typeof p.staff === "string" ? p.staff : "") ?? "",
				staffGu: p.staff?.staffGu ?? p.staffGU ?? "",
				email: p.staff?.email ?? p.staffEMail ?? "",
			},
			orgYearGu: p.orgYearGU ?? "",
		})),
	}));
	const periodInfos = (raw.periodInfos || []).map((pi: any) => {
		const t = pi.total ?? {};
		return {
			period: num(pi.period ?? pi.number),
			total: {
				excused: num(t.excused ?? pi.excused) || 0,
				tardies: num(t.tardies ?? pi.tardies) || 0,
				unexcused: num(t.unexcused ?? pi.unexcused) || 0,
				activities: num(t.activities ?? pi.activities) || 0,
				unexcusedTardies: num(t.unexcusedTardies ?? pi.unexcusedTardies) || 0,
			},
		};
	});
	return {
		type: raw.type ?? "Period",
		period: {
			total: num(raw.periodCount ?? raw.period?.total) || 0,
			start: num(raw.startPeriod ?? raw.period?.start) || 0,
			end: num(raw.endPeriod ?? raw.period?.end) || 0,
		},
		schoolName: raw.schoolName ?? "",
		absences,
		periodInfos,
	};
}

function scheduleToOld(raw: any, termIndex: number | null) {
	raw = raw || {};
	const termLists = (raw.termLists || []).map((t: any) => ({
		start: t.beginDate ?? t.start ?? "",
		end: t.endDate ?? t.end ?? "",
		termIndex: t.termIndex,
		termName: t.termName,
	}));

	let classLists = raw.classLists || null;
	if (!classLists && Array.isArray(raw.studentClassScheduleForTerms)) {
		const want = termIndex ?? num(raw.termIndex) ?? 0;
		const entry =
			raw.studentClassScheduleForTerms.find(
				(e: any) => Number(e.thisTermIndex) === Number(want) && e.classLists
			) ||
			raw.studentClassScheduleForTerms.find((e: any) => e.classLists) ||
			raw.studentClassScheduleForTerms[0];
		classLists = entry?.classLists || [];
	}
	const currentIdx =
		termIndex !== null && termIndex !== undefined
			? termIndex
			: raw.termIndex ?? termLists[0]?.termIndex ?? 0;
	const currentTerm = termLists.find(
		(t: any) => Number(t.termIndex) === Number(currentIdx)
	);

	const mainClasses = (classLists || []).map((c: any) => ({
		name: c.courseTitle ?? c.courseName ?? c.name ?? "",
		period: c.period ?? "",
		teacher: c.teacher ?? c.teacherName ?? "",
		room: c.roomName ?? c.room ?? "",
	}));

	// "Today" schedule: SOAP responses carry TodayScheduleInfoData; some JSON
	// deployments include a similar block. Extract heuristically, else false
	// (the schedule page gracefully hides the Today option).
	let today: any = false;
	const todayBlock =
		raw.todayScheduleInfoData ??
		raw.todaySchedule ??
		(Array.isArray(raw.studentClassScheduleForTerms) ? undefined : raw.today);
	const todayClasses =
		todayBlock?.schoolInfos?.[0]?.schoolInfo?.[0]?.classes?.[0]?.classInfo ??
		todayBlock?.classes ??
		(Array.isArray(todayBlock?.main) ? todayBlock.main : null);
	if (Array.isArray(todayClasses) && todayClasses.length) {
		today = {
			main: todayClasses.map((c: any) => ({
				name: c.className ?? c.name ?? "",
				start: c.startTime ?? c.start ?? "",
				end: c.endTime ?? c.end ?? "",
				teacher: c.teacherName ?? c.teacher ?? "",
				period: c.period ?? "",
				room: c.roomName ?? c.room ?? "",
			})),
		};
	}

	return {
		termName: currentTerm?.termName ?? raw.termIndexName ?? "",
		termIndex: String(currentIdx),
		terms: termLists,
		mainClasses,
		today,
	};
}

function studentInfoToOld(raw: any) {
	raw = raw || {};
	const photoRaw = String(raw.photo ?? raw.Photo ?? "");
	const photo = photoRaw.replace(/^data:image\/\w+;base64,/, "");
	const info: any = {
		student: {
			name: raw.formattedName ?? raw.FormattedName ?? "",
			lastName: raw.lastNameGoesBy ?? raw.lastName ?? "not available",
			nickname: raw.nickName ?? raw.nickname ?? "not available",
		},
		photo,
		currentSchool: raw.currentSchool ?? raw.CurrentSchool ?? "",
		id: String(raw.permID ?? raw.PermID ?? raw.id ?? ""),
		orgYearGu: raw.orgYearGU ?? raw.orgYearGu ?? "",
		gender: raw.gender ?? raw.Gender ?? "null",
		grade: String(raw.grade ?? raw.Grade ?? ""),
	};
	// concurrent / additional schools (multi-school students)
	const schools = raw.concurrentSchools ?? raw.schools;
	if (Array.isArray(schools) && schools.length) {
		const mapped = schools
			.map((s: any) => {
				const sc = s.concurrentSchool ?? s;
				return {
					name: sc.schoolName ?? sc.conSchoolName ?? sc.name ?? "",
					GU: sc.orgYearGU ?? sc.conOrgYearGU ?? sc.GU ?? sc.gu ?? "",
				};
			})
			.filter((s: any) => s.name && s.GU);
		if (mapped.length) info.schools = mapped;
	}
	return info;
}

/* ==========================================================================
   SOAP fallback — ProcessWebServiceRequestMultiWeb. Responses are converted
   into the same raw shapes the JSON API returns so the converters above are
   the only normalization layer.
   ========================================================================== */

function xmlAttr(el: any, name: string): string {
	return el?.getAttribute?.(name) ?? "";
}

function soapXmlToGradebookRaw(inner: Document) {
	const periods = Array.from(inner.getElementsByTagName("ReportPeriod")).map(
		(p) => ({
			index: xmlAttr(p, "Index"),
			gradePeriod: xmlAttr(p, "GradePeriod"),
			startDate: xmlAttr(p, "StartDate"),
			endDate: xmlAttr(p, "EndDate"),
		})
	);
	const current = inner.getElementsByTagName("ReportingPeriod")[0];
	const courses = Array.from(inner.getElementsByTagName("Course")).map((c) => {
		const markEl = c.getElementsByTagName("Mark")[0];
		let mark: any = null;
		if (markEl) {
			mark = {
				markName: xmlAttr(markEl, "MarkName"),
				calculatedScoreString: xmlAttr(markEl, "CalculatedScoreString"),
				calculatedScoreRaw: xmlAttr(markEl, "CalculatedScoreRaw"),
				gradeCalculationSummary: Array.from(
					markEl.getElementsByTagName("AssignmentGradeCalc")
				).map((g) => ({
					type: xmlAttr(g, "Type"),
					weight: xmlAttr(g, "Weight"),
					points: xmlAttr(g, "Points"),
					pointsPossible: xmlAttr(g, "PointsPossible"),
					weightedPct: xmlAttr(g, "WeightedPct"),
					calculatedMark: xmlAttr(g, "CalculatedMark"),
				})),
				assignments: Array.from(
					markEl.getElementsByTagName("Assignment")
				).map((a) => ({
					gradebookID: xmlAttr(a, "GradebookID"),
					measure: xmlAttr(a, "Measure"),
					type: xmlAttr(a, "Type"),
					date: xmlAttr(a, "Date"),
					dueDate: xmlAttr(a, "DueDate"),
					score: xmlAttr(a, "Score"),
					displayScore: xmlAttr(a, "DisplayScore"),
					scoreType: xmlAttr(a, "ScoreType"),
					points: xmlAttr(a, "Points"),
					point: xmlAttr(a, "Point"),
					pointPossible: xmlAttr(a, "PointPossible"),
					notes: xmlAttr(a, "Notes"),
					measureDescription: xmlAttr(a, "MeasureDescription"),
				})),
			};
		}
		return {
			period: xmlAttr(c, "Period"),
			title: xmlAttr(c, "Title"),
			courseName: xmlAttr(c, "CourseName"),
			courseID: xmlAttr(c, "CourseID"),
			room: xmlAttr(c, "Room"),
			staff: xmlAttr(c, "Staff"),
			staffEMail: xmlAttr(c, "StaffEMail"),
			marks: mark ? [mark] : [],
		};
	});
	return {
		errorMessage: "",
		gradebookType: "Traditional",
		reportingPeriods: periods,
		reportingPeriod: current
			? {
					index: xmlAttr(current, "Index"),
					gradePeriod: xmlAttr(current, "GradePeriod"),
					startDate: xmlAttr(current, "StartDate"),
					endDate: xmlAttr(current, "EndDate"),
			  }
			: null,
		courses,
	};
}

function soapXmlToScheduleRaw(inner: Document) {
	const termLists = Array.from(
		inner.getElementsByTagName("TermListing")
	).map((t) => ({
		termIndex: xmlAttr(t, "TermIndex"),
		termName: xmlAttr(t, "TermName"),
		beginDate: xmlAttr(t, "BeginDate"),
		endDate: xmlAttr(t, "EndDate"),
	}));
	const classLists = Array.from(
		inner.getElementsByTagName("ClassListing")
	).map((c) => ({
		period: xmlAttr(c, "Period"),
		courseTitle: xmlAttr(c, "CourseTitle"),
		roomName: xmlAttr(c, "RoomName"),
		teacher: xmlAttr(c, "Teacher"),
		teacherEmail: xmlAttr(c, "TeacherEmail"),
	}));
	return { termIndex: termLists[0]?.termIndex ?? 0, termLists, classLists };
}

function soapXmlToAttendanceRaw(inner: Document) {
	const absences = Array.from(inner.getElementsByTagName("Absence")).map(
		(abs) => ({
			date: xmlAttr(abs, "AbsenceDate"),
			periods: Array.from(abs.getElementsByTagName("Period"))
				.map((p) => ({
					period: xmlAttr(p, "Number"),
					name: xmlAttr(p, "Name"),
				}))
				.filter((p) => p.name),
		})
	);
	return { type: "Period", absences, periodInfos: [] };
}

function soapXmlToDocumentsRaw(inner: Document) {
	return Array.from(inner.getElementsByTagName("StudentDocumentData")).map(
		(n) => ({
			documentGU: xmlAttr(n, "DocumentGU"),
			documentFileName: xmlAttr(n, "DocumentFileName"),
			documentDate: xmlAttr(n, "DocumentDate"),
			documentType: xmlAttr(n, "DocumentType"),
			documentComment: xmlAttr(n, "DocumentComment"),
		})
	);
}

function soapXmlToStudentInfoRaw(inner: Document) {
	const obj: any = {};
	for (const tag of [
		"FormattedName",
		"PermID",
		"Grade",
		"Gender",
		"BirthDate",
		"EMail",
		"CurrentSchool",
		"HomeRoom",
		"HomeRoomTch",
		"CounselorName",
		"LastNameGoesBy",
		"NickName",
		"Photo",
	]) {
		const el = inner.getElementsByTagName(tag)[0];
		if (el) obj[tag] = el.textContent.trim();
	}
	return {
		formattedName: obj.FormattedName ?? "",
		permID: obj.PermID ?? "",
		grade: obj.Grade ?? "",
		gender: obj.Gender ?? "",
		eMail: obj.EMail ?? "",
		currentSchool: obj.CurrentSchool ?? "",
		lastNameGoesBy: obj.LastNameGoesBy ?? "",
		nickName: obj.NickName ?? "",
		photo: obj.Photo ?? "",
	};
}

function parseSoapResponse(text: string): Document {
	const outer = new DOMParser().parseFromString(text, "text/xml");
	if (outer.querySelector("soap\\:Body > soap\\:Fault")) {
		throw new Error("SOAP fault from district server.");
	}
	const resultNode = outer.getElementsByTagName(
		"ProcessWebServiceRequestMultiWebResult"
	)[0];
	if (!resultNode) throw new Error("Unexpected SOAP response (no result node).");
	const inner = new DOMParser().parseFromString(
		resultNode.textContent,
		"text/xml"
	);
	const rtError = inner.getElementsByTagName("RT_ERROR")[0];
	if (rtError) {
		const msg = rtError.getAttribute("ERROR_MESSAGE") || "Unknown error";
		if (/invalid user|password is incorrect|user name or password/i.test(msg))
			throw new UnauthorizedError();
		throw new Error(msg);
	}
	return inner;
}

/* ---------- wrapper document object (old File/Document surface) ---------- */
class DocumentFile {
	file: { name: string; type: string; date: Date; comment?: string };
	comment: string;
	gu: string;
	client: Client;

	constructor(data: any, client: Client) {
		this.gu = data.gu;
		this.file = {
			name: data.name,
			type: data.type,
			date: data.date,
			comment: data.comment,
		};
		this.comment = data.comment;
		this.client = client;
	}

	async get(): Promise<{ base64: string; name?: string; type?: string }[]> {
		return this.client.documentContent(this.gu);
	}
}

/* ==========================================================================
   Client
   ========================================================================== */
export class Client {
	district: string; // "<base>/Service/PXPCommunication.asmx" (compat with old lib + settings sync keys)
	hostUrl: string; // bare district base URL
	username: string;
	password: string;
	encrypted: boolean;
	token: string | null = null;
	refresh: string | null = null;
	mode: "json" | "soap" = "json";
	restoredFromSession = false;
	loadedAttendance: any = undefined;
	loadedSchedule: any = undefined;
	loadedDocuments: any = undefined;
	loadedStudentInfo: any = undefined;

	constructor(
		credentials: { username?: string; password?: string; encrypted?: boolean },
		districtUrl: string
	) {
		const base = (districtUrl || "https://md-mcps-psv.edupoint.com")
			.replace(/Service\/PXPCommunication\.asmx\/?$/, "")
			.replace(/\/+$/, "");
		this.hostUrl = base;
		this.district = `${base}/Service/PXPCommunication.asmx`;
		this.username = credentials.username ?? "";
		this.password = credentials.password ?? "";
		this.encrypted = credentials.encrypted ?? false;
	}

	async #json(method: string, request: any, auth?: "basic"): Promise<any> {
		const key = await getVersionKey();
		const url = `${this.hostUrl}/api/v1/mobile/PXPWebServices/${method}`;
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			"User-Agent": USER_AGENT,
			AppNameOSAndVersion: APP_NAME_HEADER,
			edupointkeyversion: key,
		};
		if (auth === "basic" && this.username) {
			headers.Authorization =
				"Basic " + btoa(`${this.username}:${this.password}`);
		} else if (this.token) {
			headers.Authorization = "Bearer " + this.token;
		}
		const body =
			method === "RefreshToken"
				? "{}"
				: JSON.stringify({
						arguments: { request: JSON.stringify(request || {}) },
				  });
		const res = await proxiedFetch(url, { method: "POST", headers, body });
		if (res.status === 401) throw new UnauthorizedError();
		const text = await res.text();
		let data: any;
		try {
			data = JSON.parse(text);
		} catch {
			throw new Error(
				"The server or relay returned an invalid response. Check your district URL and try again."
			);
		}
		if (data && data.error) {
			throw new ApiError(
				data.error.message || "Unknown API error",
				String(data.error.code ?? "")
			);
		}
		return data;
	}

	async #refreshToken(): Promise<boolean> {
		if (!this.refresh) throw new UnauthorizedError();
		const key = await getVersionKey();
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			"User-Agent": USER_AGENT,
			AppNameOSAndVersion: APP_NAME_HEADER,
			edupointkeyversion: key,
			Authorization: "Bearer " + this.refresh,
		};
		const res = await proxiedFetch(
			`${this.hostUrl}/api/v1/mobile/PXPWebServices/RefreshToken`,
			{ method: "POST", headers, body: "{}" }
		);
		if (res.status === 401) throw new UnauthorizedError();
		const data = await res.json();
		if (data?.access_token) {
			this.token = data.access_token;
			this.refresh = data.refresh_token || this.refresh;
			saveSession(this);
			return true;
		}
		throw new UnauthorizedError();
	}

	/* JSON first (with token refresh), permanent SOAP fallback when a district
	   has no JSON API (error codes 2100/400). */
	async #data(
		method: string,
		request: any,
		soapFn: () => Promise<any>
	): Promise<any> {
		if (this.mode === "soap") return soapFn();
		try {
			return await this.#json(method, request);
		} catch (e: any) {
			if (e instanceof UnauthorizedError) {
				try {
					await this.#refreshToken();
					return await this.#json(method, request);
				} catch {
					throw new UnauthorizedError();
				}
			}
			if (
				e instanceof ApiError &&
				(e.code === "2100" || e.code === "400")
			) {
				this.mode = "soap";
				return soapFn();
			}
			throw e;
		}
	}

	async #soapRequest(method: string, paramStr: string): Promise<Document> {
		const key = await getVersionKey();
		const xml =
			`<?xml version="1.0" encoding="utf-8"?>` +
			`<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">` +
			`<soap:Body><ProcessWebServiceRequestMultiWeb xmlns="http://edupoint.com/webservices/">` +
			`<userID>${escapeXml(this.username)}</userID>` +
			`<password>${escapeXml(this.password)}</password>` +
			`<skipLoginLog>1</skipLoginLog><parent>0</parent><webDBName></webDBName>` +
			`<webServiceHandleName>PXPWebServices</webServiceHandleName>` +
			`<methodName>${method}</methodName>` +
			`<paramStr>${escapeXml(paramStr)}</paramStr>` +
			`</ProcessWebServiceRequestMultiWeb></soap:Body></soap:Envelope>`;
		const res = await proxiedFetch(
			`${this.hostUrl}/Service/PXPCommunication.asmx`,
			{
				method: "POST",
				headers: {
					"Content-Type": "text/xml; charset=utf-8",
					// Browsers drop Cookie on fetch(); the relay worker adds it
					// server-side from x-ojjy-key.
					Cookie: `AppSupportsSession=1; edupointkey=1; edupointkeyversion=${key}`,
					"x-ojjy-key": key,
				},
				body: xml,
			}
		);
		if (res.status === 401) throw new UnauthorizedError();
		return parseSoapResponse(await res.text());
	}

	/* -- auth -- */

	async attemptLogin(): Promise<void> {
		const data = await this.#json(
			"AttemptLogin",
			{ userID: null, password: null, userType: "Student" },
			"basic"
		);
		if (!data || !data.access_token)
			throw new Error("Login failed — no token returned.");
		this.token = data.access_token;
		this.refresh = data.refresh_token || null;
		this.restoredFromSession = false;
		saveSession(this);
	}

	/* -- data methods (old-library surface) -- */

	async gradebook(
		reportingPeriodIndex: number | null = null,
		orgYearGu: string | null = null,
		fresh: boolean = true
	): Promise<[any, any]> {
		const req = {
			reportPeriod:
				reportingPeriodIndex !== null && reportingPeriodIndex !== undefined
					? String(reportingPeriodIndex)
					: "",
			concurrentSchOrgYearGU: orgYearGu || "",
			childIntID: 0,
			languageCode: "en",
		};
		const soapFn = async () => {
			const parms =
				`<Parms><ChildIntID>0</ChildIntID>` +
				(reportingPeriodIndex !== null && reportingPeriodIndex !== undefined
					? `<ReportPeriod>${Number(reportingPeriodIndex)}</ReportPeriod>`
					: "") +
				(orgYearGu ? `<ConcurrentSchOrgYearGU>${escapeXml(orgYearGu)}</ConcurrentSchOrgYearGU>` : "") +
				`</Parms>`;
			const inner = await this.#soapRequest("Gradebook", parms);
			return soapXmlToGradebookRaw(inner);
		};
		const data = await this.#data("Gradebook", req, soapFn);
		const raw =
			this.mode === "soap"
				? data
				: data?.data?.traditionalGradebook ?? null;
		const gb = gradebookToOld(raw, reportingPeriodIndex as any);
		const extra = { gradingScale: defaultGradingScale(), token: this.token };
		gb.gradingScale = extra.gradingScale;
		return [gb, extra];
	}

	/* Fetch every reporting period's gradebook in parallel and return them as
	   [Gradebook, extra][] — the same array the old login() produced, minus
	   the redundant round-trips. Reuses a cached session when possible. */
	async getAllGradebooks(): Promise<[any, any][]> {
		const session = this.#loadSession();
		if (session) {
			this.token = session.t;
			this.refresh = session.r;
			this.restoredFromSession = true;
		}
		let initial: [any, any];
		try {
			initial = await this.gradebook(null);
		} catch (e: any) {
			if (
				e instanceof UnauthorizedError ||
				/invalid|password|credential|expired/i.test(e?.message || "")
			) {
				await this.attemptLogin();
				initial = await this.gradebook(null);
			} else {
				throw e;
			}
		}
		saveSession(this);
		const currentIdx = initial[0].reportingPeriod.current.index;
		const others = (initial[0].reportingPeriod.available || []).filter(
			(p: any) => p.index !== currentIdx
		);
		const rest = await Promise.all(
			others.map((p: any) => this.gradebook(p.index))
		);
		// prefetch student info in the background so _app's ChildList() hits
		// the cache immediately
		this.ChildList().catch(() => {});
		return [initial, ...rest];
	}

	#loadSession() {
		try {
			const raw = localStorage.getItem(SESSION_KEY);
			if (!raw) return null;
			const s = JSON.parse(raw);
			if (!s.t || !s.u || !s.d) return null;
			if (s.u !== this.username || s.d !== this.hostUrl) return null;
			if (Date.now() - s.at > SESSION_TTL_MS) return null;
			return s;
		} catch {
			return null;
		}
	}

	async attendance(): Promise<[any, any]> {
		if (this.loadedAttendance) return this.loadedAttendance;
		const soapFn = async () => {
			const inner = await this.#soapRequest(
				"Attendance",
				"<Parms><ChildIntID>0</ChildIntID></Parms>"
			);
			return soapXmlToAttendanceRaw(inner);
		};
		const data = await this.#data(
			"GetStudentAttendanceList",
			{ childIntID: 0 },
			soapFn
		);
		const raw =
			this.mode === "soap" ? data : data?.data?.periodAttendance ?? null;
		const result = [attendanceToOld(raw), { token: this.token }] as [any, any];
		this.loadedAttendance = result;
		return result;
	}

	async schedule(
		termIndex: number | null = null
	): Promise<[any, any]> {
		if (this.loadedSchedule && this.loadedSchedule.__term === termIndex)
			return this.loadedSchedule.result;
		const req = {
			childIntID: 0,
			loadAllTerms: true,
			conSchOrgYearGU: "",
			conSchTermIndex: "-1",
			termIndex:
				termIndex !== null && termIndex !== undefined
					? String(termIndex)
					: "-1",
		};
		const soapFn = async () => {
			const parms =
				`<Parms><ChildIntID>0</ChildIntID>` +
				(termIndex !== null && termIndex !== undefined
					? `<TermIndex>${Number(termIndex)}</TermIndex>`
					: "") +
				`</Parms>`;
			const inner = await this.#soapRequest("StudentClassList", parms);
			return soapXmlToScheduleRaw(inner);
		};
		const data = await this.#data("StudentClassList", req, soapFn);
		const raw =
			this.mode === "soap"
				? data
				: data?.data?.studentClassScheduleForAllTerms ??
				  data?.data?.studentClassSchedule ??
				  null;
		const result = [
			scheduleToOld(raw, termIndex as any),
			{ token: this.token },
		] as [any, any];
		this.loadedSchedule = { __term: termIndex, result };
		return result;
	}

	async documents(): Promise<[any[], any]> {
		if (this.loadedDocuments) return this.loadedDocuments;
		const soapFn = async () => {
			const inner = await this.#soapRequest(
				"GetStudentDocumentInitialData",
				"<Parms><ChildIntID>0</ChildIntID></Parms>"
			);
			return soapXmlToDocumentsRaw(inner);
		};
		const data = await this.#data(
			"GetStudentDocuments",
			{ childIntID: 0, languageCode: "en" },
			soapFn
		);
		let list: any[];
		if (this.mode === "soap") {
			list = data || [];
		} else {
			list =
				data?.data?.studentDocuments?.studentDocumentDatas ??
				data?.data?.studentDocumentDatas ??
				[];
		}
		const docs = (list || []).map(
			(d: any) =>
				new DocumentFile(
					{
						gu: d.documentGU ?? d.gu ?? "",
						name: d.documentFileName ?? d.fileName ?? "",
						type: d.documentType ?? d.docType ?? "Document",
						date: normalizeDate(d.documentDate ?? d.date),
						comment: d.documentComment ?? d.name ?? "",
					},
					this
				)
		);
		const result = [docs, { token: this.token }] as [any[], any];
		this.loadedDocuments = result;
		return result;
	}

	async documentContent(
		documentGU: string
	): Promise<{ base64: string; name?: string; type?: string }[]> {
		const soapFn = async () => {
			const inner = await this.#soapRequest(
				"GetContentOfAttachedDoc",
				`<Parms><DocumentGU>${escapeXml(documentGU)}</DocumentGU></Parms>`
			);
			const dd = inner.getElementsByTagName("DocumentData")[0];
			if (!dd) return null;
			return {
				fileName: xmlAttr(dd, "FileName"),
				docType: xmlAttr(dd, "DocType"),
				base64Code:
					inner.getElementsByTagName("Base64Code")[0]?.textContent?.trim() ||
					"",
			};
		};
		const data = await this.#data(
			"GetStudentDocumentContent",
			{ childIntID: 0, documentGU },
			soapFn
		);
		if (this.mode === "soap") {
			return data ? [{ base64: data.base64Code, name: data.fileName, type: data.docType }] : [];
		}
		const docDatas =
			data?.data?.studentAttachedDocumentData?.documentDatas || [];
		const d = docDatas[0];
		return d
			? [
					{
						base64: d.base64Code ?? d.base64 ?? "",
						name: d.fileName ?? "",
						type: d.docType ?? "",
					},
			  ]
			: [];
	}

	async studentInfo(): Promise<[any, any]> {
		if (this.loadedStudentInfo) return this.loadedStudentInfo;
		const soapFn = async () => {
			const inner = await this.#soapRequest(
				"StudentInfo",
				"<Parms><ChildIntID>0</ChildIntID></Parms>"
			);
			return soapXmlToStudentInfoRaw(inner);
		};
		const data = await this.#data(
			"GetStudentInfoData",
			{ childIntID: 0 },
			soapFn
		);
		const raw =
			this.mode === "soap"
				? data
				: data?.data?.studentInfoXML ??
				  data?.data?.studentInfoDetailXML ??
				  null;
		const result = [studentInfoToOld(raw), { token: this.token }] as [
			any,
			any
		];
		this.loadedStudentInfo = result;
		return result;
	}

	/* Parents get a child list; student accounts usually 404 this, in which
	   case it throws and the app's existing studentInfo() fallback kicks in. */
	async ChildList(): Promise<[any, any]> {
		const soapFn = async () => {
			const inner = await this.#soapRequest(
				"ChildList",
				"<Parms><ChildIntID>0</ChildIntID></Parms>"
			);
			const child = inner.getElementsByTagName("Child")[0];
			if (!child) throw new Error("No child data available for this account.");
			return {
				formattedName:
					child.getElementsByTagName("ChildName")[0]?.textContent ?? "",
				permID: xmlAttr(child, "ChildPermID"),
				orgYearGU: xmlAttr(child, "OrgYearGU"),
				grade:
					child.getElementsByTagName("Grade")[0]?.textContent ?? "",
				currentSchool:
					child.getElementsByTagName("OrganizationName")[0]?.textContent ??
					"",
				photo:
					child.getElementsByTagName("photo")[0]?.textContent ?? "",
			};
		};
		const data = await this.#data("ChildList", { childIntID: 0 }, soapFn);
		if (this.mode === "soap") {
			const result = [studentInfoToOld(data), { token: this.token }] as [
				any,
				any
			];
			this.loadedStudentInfo = result;
			return result;
		}
		// JSON shape is deployment-dependent: find the first object that looks
		// like a child record and normalize it through the studentInfo path.
		const child =
			data?.data?.childList?.child?.[0] ??
			data?.data?.childList?.[0] ??
			data?.data?.childList ??
			null;
		const raw =
			typeof child === "object" && child
				? {
						formattedName:
							child.childName ?? child.formattedName ?? "",
						permID: child.childPermID ?? child.permID ?? "",
						orgYearGU: child.orgYearGU ?? "",
						grade: child.grade ?? "",
						currentSchool:
							child.organizationName ?? child.currentSchool ?? "",
						photo: child.photo ?? "",
						concurrentSchools:
							child.concurrentSchools ?? undefined,
				  }
				: null;
		if (!raw || !raw.formattedName) {
			// student accounts: fall through to the StudentInfo payload
			const info = await this.studentInfo();
			return info;
		}
		const result = [studentInfoToOld(raw), { token: this.token }] as [
			any,
			any
		];
		this.loadedStudentInfo = result;
		return result;
	}
}

/* ==========================================================================
   Module-level API (mirrors the old package's default export)
   ========================================================================== */

export async function login(
	districtUrl: string,
	credentials: { username: string; password: string; encrypted?: boolean },
	/* apiUrl is accepted for signature compatibility; unused. */
	apiUrl?: string
): Promise<{ client: Client; responses: [any, any][] }> {
	if (!districtUrl || districtUrl.length === 0) {
		throw new Error("District URL cannot be an empty string");
	}
	const client = new Client(credentials, districtUrl);
	const responses = await client.getAllGradebooks();
	return { client, responses };
}

const SUPPORT_URL =
	"https://support.edupoint.com/Service/HDInfoCommunication.asmx";

export async function findDistricts(zipCode: string) {
	const paramStr = `<Parms><Key>5E4B7859-B805-474B-A833-FDB15D205D40</Key><MatchToDistrictZipCode>${escapeXml(
		zipCode
	)}</MatchToDistrictZipCode></Parms>`;
	const xml =
		`<?xml version="1.0" encoding="utf-8"?>` +
		`<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">` +
		`<soap:Body><ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/">` +
		`<userID>EdupointDistrictInfo</userID><password>Edup01nt</password>` +
		`<skipLoginLog>0</skipLoginLog><parent>0</parent>` +
		`<webServiceHandleName>HDInfoServices</webServiceHandleName>` +
		`<methodName>GetMatchingDistrictList</methodName>` +
		`<paramStr>${escapeXml(paramStr)}</paramStr>` +
		`</ProcessWebServiceRequest></soap:Body></soap:Envelope>`;
	const init: RequestInit = {
		method: "POST",
		headers: { "Content-Type": "text/xml; charset=utf-8" },
		body: xml,
	};
	let text: string;
	try {
		text = await (await fetchWithTimeout(SUPPORT_URL, init, 15000)).text();
	} catch {
		// support.edupoint.com without CORS — fall back to the relay chain
		text = await (
			await proxiedFetch(SUPPORT_URL, {
				...init,
				headers: { ...init.headers, "x-ojjy-key": await getVersionKey() },
			})
		).text();
	}
	const outer = new DOMParser().parseFromString(text, "text/xml");
	const resultNode = outer.getElementsByTagName(
		"ProcessWebServiceRequestResult"
	)[0];
	if (!resultNode) return [];
	const inner = new DOMParser().parseFromString(
		resultNode.textContent,
		"text/xml"
	);
	const infos = inner.getElementsByTagName("DistrictInfo");
	return Array.from(infos).map((d) => ({
		parentVueUrl: xmlAttr(d, "PvueURL"),
		address: xmlAttr(d, "Address"),
		id: xmlAttr(d, "DistrictID"),
		name: xmlAttr(d, "Name"),
	}));
}

/* Type used across the app for the parsed gradebook */
export interface Gradebook {
	error: string;
	type: string;
	gradingScale?: any;
	reportingPeriod: {
		current: { index: number; name: string; date: { start: Date; end: Date } };
		available: { index: number; name: string; date: { start: Date; end: Date } }[];
	};
	courses: any[];
}

const StudentVue = { login, findDistricts, Client };
export default StudentVue;
