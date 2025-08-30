import React, { useState, useEffect } from "react";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { TbRefresh, TbMathSymbols } from "react-icons/tb";
import {
	parseGrades,
	Grades as GradesType,parseDate,findCurrentPeriod,getCache,Cache,calcFinal,
	initalizeFinals2,
	ordinalSuffix
	//calculateGPA,
	//updateGPA,
} from "../../utils/grades";
import { Modal } from "flowbite-react";
import { motion } from "framer-motion";
import CustomAd from "../../components/customAd";
import { BsGearWideConnected } from "react-icons/bs";
import SettingsModal from "../../components/settingsModal"
import StudentVue from "studentvue";
import {getGradebooks} from "../../utils/soap"

interface GradesProps {
	client: Awaited<ReturnType<typeof StudentVue.login>>["client"];
	grades: Cache;
	setGrades: (grades: Cache) => void;
	mp: number;
	setMP: (period: number) => void;
	createError:(message:string)=>void;
	ad:any;
	setAd:(ad:any)=>void;
	setTime:(time:number)=>void;
	timestamp:number;
	width:any;
	gradesCache:GradesType[]
	setGradesCache:(grades:GradesType[])=>void;
	markingPeriod:number;
	setMarkingPeriod:(p:number)=>void;
	modalBg:boolean;
	setModalBg:(b:boolean)=>void;
}

export default function Grades({
	client,
	grades,
	setGrades,
	mp,
	setMP,
	createError,
	ad,
	setAd,
	setTime,
	timestamp,
	width,
	gradesCache,setGradesCache,markingPeriod,setMarkingPeriod,modalBg,setModalBg
}: GradesProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(grades ? false : true);	
	const [defaultView, setDefaultView] = useState("card");
	//const [period, setMP] = useState<number>();
	const [gpaModal, setGpaModal] = useState(false);
	const view = (router.query.view as string) || defaultView;
	const [settingsModal,setSettingsModal]=useState<boolean>(false);
	//@ts-ignore
	const mcps=client?.district=="https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx"
	const isMediumOrLarger = width >= 768;

	useEffect(() => {
		if (localStorage.getItem("defaultView") !== null) {
			setDefaultView(localStorage.getItem("defaultView"));
		}
	}, []);

	useEffect(() => {
		if (router.query.view !== undefined) {
			setDefaultView(router.query.view as string);
			localStorage.setItem("defaultView", router.query.view as string);
		}
	}, [router.query.view]);



	useEffect(() => {
		try {
			if (!grades && client) {
				//setLoading(true);
				try {
					getGradebooks(client,null,null).then(raws=>{
						
						setGrades(getCache(raws))
						setMP(findCurrentPeriod(getCache(raws)))
						setLoading(false)
					})				










					/*
					client.gradebook().then(([res,extra]) => {
						res.gradingScale=extra?.gradingScale
						let parsedGrades = parseGrades(res);
						//once again, let there be bullshit. temp.
						//let g = parseAllGrades(res) or smthn idfk
						console.log("checker",parsedGrades)
						console.log(res);
						//setGrades(g);
						//@ts-ignore
						setGrades(getCache(killMe))
						console.log(parsedGrades)
						setMP(findCurrentPeriod(getCache(killMe)));
						setLoading(false);
						
					});
					*/
				} catch (err) {
					console.log(err);
					createError(err.message);
					setLoading(false);
				}
			}
		} catch {
			if (localStorage.getItem("remember") === "false") {
				console.log("womp womp")
			}
		}
	}, [client]);

	function update(p: number,getFresh=false){
		console.log(p);
		setLoading(true);

		if(getFresh){
			if(grades[0].periods[p].name.toLowerCase().includes("interim")&&mcps){
				var second;
				var secondIndex;
				client.gradebook(p+1).then(([res,extra])=>{
					res.gradingScale=extra?.gradingScale
					const parsed=parseGrades(res,grades[0].settings)
					second=parsed;
					secondIndex=p+1;
				})
				
			}else{
				client.gradebook(p-1).then(([res,extra])=>{
					res.gradingScale=extra?.gradingScale
					const parsed=parseGrades(res,grades[0].settings)
					second=parsed;
					secondIndex=p-1;
				})
	
			}


		client
			.gradebook(p)
			.then(([res,extra]) => {
				res.gradingScale=extra?.gradingScale
				console.log(res);
				const parsed=parseGrades(res,grades[0].settings)
				const temp=structuredClone(grades)
				temp[p]=parsed;
				//not rlly done, are we...
				for(let i=0;i<temp[p].courses.length;i++){
					temp[p].courses[i].settings=grades[p].courses[i].settings
				}

				if(second){
					temp[secondIndex]=second
						for(let i=0;i<temp[secondIndex].courses.length;i++){
					temp[secondIndex].courses[i].settings=grades[secondIndex].courses[i].settings
				}
				}
				setGrades(temp)
				setMP(p);
				setLoading(false);
			
			})
			.catch((err) => {
				console.log(err);
				createError(err.message);
				setLoading(false);
			});

		}else{
			setMP(p)
			setLoading(false)
		}


	};

	/*
	useEffect(() => {
		if (gpaModal) {
			setGrades(calculateGPA(grades));
		}
	}, [gpaModal]);

	const changeWeights = (e, i: number) => {
		setGrades(updateGPA(grades, i, e.target.checked));
	};
	*/


	useEffect(()=>{
	//	console.log("surely there is a better way to force re-renders on changes to ad")

	},[ad])



	return (
		<motion.div 
		style={settingsModal ? {overflowY:"hidden",maxHeight:500} : {}}
		className="p-5 md:p-10 md:flex-1">
			<Head>
				<title>Gradebook - Grade Melon</title>
			</Head>
			{/*
			<Modal show={gpaModal} onClose={() => setGpaModal(false)}>
				<Modal.Header>GPA Calculator</Modal.Header>
				<Modal.Body>
					<p className="dark:text-white font-bold text-xl">
						GPA: {grades?.gpa.toFixed(2)}
					</p>
					<p className="dark:text-white font-bold text-xl pb-5">
						WGPA: {grades?.wgpa.toFixed(2)}
					</p>

					<p className="dark:text-white font-bold text-xl">Weighted?</p>
					{grades?.courses.map((course, i) => (
						<div className="flex gap-2 items-center pt-2" key={i}>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={course?.weighted}
									className="sr-only peer"
									onChange={(e) => changeWeights(e, i)}
								/>
								<div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
							</label>
							<p className="dark:text-white text-md md:text-lg">
								{course?.name}
							</p>
						</div>
					))}
				</Modal.Body>
				<Modal.Footer>
					<div className="flex gap-2">
						<button
							onClick={() => setGpaModal(false)}
							className="rounded-lg bg-gray-500 px-2.5 py-2.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
						>
							Close
						</button>
					</div>
				</Modal.Footer>
			</Modal>
			*/}

			

			{loading ? (
				<div className="flex justify-center">
					<Spinner size="xl" color="pink" />
				</div>
			) : (
				<div className="md:max-w-max">
					<SettingsModal
				client={client}
				index={-1}
				showModal={settingsModal}
				setShowModal={(bool)=>{setSettingsModal(bool);setModalBg(bool)}}
				grades={grades}
				setGrades={setGrades}
				mp={mp}
				createError={createError}
				isMediumOrLarger={isMediumOrLarger}
			
			/>
					<div className="flex gap-2 mb-5">
						<button
							type="button"
							onClick={() => update(mp,true)}
							className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm p-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
						>
							<TbRefresh size={"1.3rem"} />
						</button>
						<select
							id="periods"
							onChange={(e) => update(parseInt(e.target.value))}
							value={mp}
							className="block w-full p-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
						>
							{grades[mp]?.periods.map((period) => {
								console.log("wtf",period)
								return(
								<option value={period.index} key={period.index}//
								>
									{`${period.name} (${parseDate(period.date)})`}
								</option>
							)})}
						</select>

						<button
							type="button"
							onClick={() => setGpaModal(true)}
							className="hidden bg-primary-500 border border-primary-500 focus:outline-none hover:bg-primary-600 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm p-2.5 dark:bg-primary-600 text-white dark:hover:bg-primary-700 dark:focus:ring-primary-400"
						>
							<TbMathSymbols size={"1.3rem"} />
						</button>

						
						<button
							onClick={()=>{setSettingsModal(true);setModalBg(true)}}

							>
							<BsGearWideConnected
							className="text-2xl md:text-3xl hover:text-gray-400 dark:text-gray-200 text-gray-600"
							
							/>
						</button>
					</div>
					{view === "card" && (
						<div
							className="grid gap-5 2col:grid-cols-2 3col:grid-cols-3 4col:grid-cols-4 justify-items-center mx-1" //so if u decide the margin is fugly, just get rid of mx-1 and put back items-stretch and w-full
							//style={{ gridTemplateColumns: "repeat(auto-fit, 384px)" }}
						>
							{(()=>{
								const temp=structuredClone(grades);
								if(temp?.[mp]?.courses&&ad&&client.username!="10016976"&&!isMediumOrLarger){ //disalbe for [name redacted] cuz i aint buildin a subscription service rn gang
									console.log("is my life real?")
									//@ts-ignore
									temp.courses.splice(Math.floor(temp.courses.length/2),0,{ name:"ad goes here"})

								}
							
								return (temp?.[mp]?.courses.map(({ name, period, grade, teacher, settings,layoutID}, i) => {
								if(name=="ad goes here"){return (<div key={i} className="flex shrink justify-center max-h-64"><CustomAd timestamp={timestamp} setTime={setTime} ad={ad} setAd={setAd}/></div>)}	
								var semesterGrade
								if(!settings?.finals?.isSemester){
								var finalGrade=settings?.finals?.show ? calcFinal(settings.finals.categories,grades) : undefined
								const semesters=settings?.finals?.semesters
								const semCats=semesters.map(semester=>semester.categories)
								var indexX=semCats.findIndex(categories=>categories.some(category=>category.mp==mp))
								semesterGrade=indexX!=-1 ? (settings?.finals?.semesters[indexX].show ? (calcFinal(settings?.finals?.semesters[indexX].categories,grades)) : undefined):undefined
						
							}else{
								finalGrade=undefined
								indexX=settings.finals.semesters.findIndex(semester=>semester!=undefined)
								const semester=settings?.finals?.semesters[indexX]     
								const interimWiseComparison = (cat1,cat2) => {
									cat1=structuredClone(cat1)
									cat2=structuredClone(cat2)
									if(grades[0].periods[cat1.mp].name.toLowerCase().includes("interim")){
										cat1.mp+=1
									}
									if(grades[0].periods[cat2.mp].name.toLowerCase().includes("interim")){
										cat2.mp+=1
									}
									return cat1.mp==cat2.mp
								}
								const isNow=semester.categories.some(category=>interimWiseComparison(category,{mp:mp}))
								semesterGrade=isNow ? calcFinal(semester.categories,grades) : undefined
						
								}

				
							return(
								<div className="mx-2 flex justify-center w-full md:w-96" key={i}>
									<motion.div
										layout="preserve-aspect"
										layoutId={`card-${layoutID}`}
										className="h-full flex flex-col justify-between w-full gap-2 md:gap-5 p-4 sm:p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
									>
										<div className="">
											<Link href={`/grades/${layoutID}`} legacyBehavior>
												<div className="hover:cursor-pointer">
													<h5 className="md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
														<p className="font-bold">
															{period} -{" "}
															<motion.span
																layout
																layoutId={`name-${layoutID}`}
																className="font-semibold"
															>
																{name}
															</motion.span>
														</p>
													</h5>
													<motion.p
														layoutId={`teacher-${layoutID}`}
														layout
														className="text-md tracking-tight text-gray-900 dark:text-white"
													>
														{teacher.name}
													</motion.p>
												</div>
											</Link>
										</div>
										<div className="">
											<div className="flex items-center justify-between">
												<div
												className="flex-col"
												>
												<motion.span
													layoutId={`grade-${layoutID}`}
													layout="preserve-aspect"
													style={{color:grade.color.includes("#") && grade.color}}
													className={`text-xl md:text-3xl font-bold text-${grade.color}-400`}
												>
													{grade.letter}
													{settings ? (!isNaN(grade.raw) && ` (${grade.raw}%)`) : (!isNaN(grade.raw) ? `${grade.raw}%`:"")}
												</motion.span>
												{(settings.finals?.show && finalGrade) &&
												<motion.div
													layoutId={`final-${layoutID}`}
													layout="preserve-aspect"
													style={{color:finalGrade.color.includes("#") && finalGrade.color}}
													className={`text-md md:text-xl font-bold text-${finalGrade.color}-400`}
												>
													Final, {finalGrade.letter} {!isNaN(finalGrade.raw) ? (`(${settings.rounding.percent ? (finalGrade.raw).toFixed(settings.rounding.percentPlaces) : finalGrade.raw}%)`) : ""}
												</motion.div>}
													{semesterGrade &&
												<motion.div
													layoutId={`semester-${layoutID}`}
													layout="preserve-aspect"
													style={{color:semesterGrade.color.includes("#") && semesterGrade.color}}
													className={`text-md md:text-xl font-bold text-${semesterGrade.color}-400`}
												>
													{!settings?.finals?.isSemester && ordinalSuffix(indexX+1)} Semester, {semesterGrade.letter} {!isNaN(semesterGrade.raw) ? (`(${settings.rounding.percent ? (semesterGrade.raw).toFixed(settings.rounding.percentPlaces) : semesterGrade.raw}%)`) : ""}
												</motion.div>}
												</div>

												<Link href={`/grades/${layoutID}`} legacyBehavior>
													<button className="rounded-lg bg-primary-500 px-5 py-2.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
														View
													</button>
												</Link>
											</div>
										</div>
									</motion.div>
								</div>
							)}
							))})()}
						</div>
					)}
					{view === "table" && (
						<div className="overflow-x-auto max-w-max -md rounded-lg border border-gray-200 dark:border-gray-700">
							<table className="text-sm text-left text-gray-500 dark:text-gray-400">
								<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
									<tr>
										<th scope="col" className="py-3 pl-6">
											Period
										</th>
										<th scope="col" className="py-3 px-6">
											Course Name
										</th>
										<th scope="col" className="py-3 px-6">
											Teacher
										</th>
										<th scope="col" className="py-3 px-6">
											Grade
										</th>
									</tr>
								</thead>
								<tbody>
									{grades?.[mp]?.courses.map(
										({ name, period, grade, teacher }, i) => (
											<tr
												className={`bg-${
													i % 2 == 0 ? "white" : "gray-50"
												} border-b dark:bg-gray-${
													i % 2 == 0 ? 900 : 800
												} dark:border-gray-700`}
												key={i}
											>
												<td
													scope="row"
													className="py-4 pl-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
												>
													{period}
												</td>
												<td className="py-4 px-6">
													<Link href={`/grades/${i}`} legacyBehavior>
														{name}
													</Link>
												</td>
												<td className="py-4 px-6">{teacher.name}</td>
												<td className="py-4 px-6">
													<span 
													style={{color:grade.color.includes("#") && grade.color}}
													className={`font-bold text-${grade.color}-400`}>
														{grade.letter}
														{!isNaN(grade.raw) && ` (${grade.raw}%)`}
													</span>
												</td>
											</tr>
										)
									)}
								</tbody>
							</table>
						</div>
					)}
					{isMediumOrLarger && <div className="mt-6"><CustomAd timestamp={timestamp} setTime={setTime} ad={ad} setAd={setAd}/></div>}
				</div>
			)}
		</motion.div>
	);
}
