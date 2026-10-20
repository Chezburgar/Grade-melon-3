import { Gradebook } from "../lib/studentvue";

/* Fetch the gradebook for every reporting period. The client itself does the
   heavy lifting (JSON API + relay chain); this just fans out the period
   requests in parallel, same as the old library's login flow did. */
export async function getGradebooks(
	client: any,
	lock?: any,
	setLock?: any
): Promise<Gradebook[]> {
	const result = await client.gradebook();
	const current = result[0].reportingPeriod.current.index;
	const periods = result[0].reportingPeriod.available.map(
		({ name, index, date }: any) => ({ name, date, index })
	);
	const remainder: [any, any][] = await Promise.all(
		periods.map((mp: any) =>
			mp.index === current
				? Promise.resolve(result)
				: client.gradebook(mp.index)
		)
	);
	return [result[0], ...remainder.map((r) => r[0])];
}
