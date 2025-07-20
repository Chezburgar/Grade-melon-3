import React, { useState, useEffect,useRef } from "react";
import { Spinner, Modal } from "flowbite-react";
import { useRouter } from "next/router";
import {
	parseGrades,
	parseDate,
	updateCourse,
	addAssignment,
	delAssignment,
	updateCategory,
	Grades as GradesType,calcFinal,
	Course,getCache,
	genTable,
	abbreviate,
	letterGradeColor,letterGrade,Cache,
	findCurrentPeriod
} from "../../utils/grades";
import GradeField from "../../components/GradeField";
import CategoryField from "../../components/CategoryField";
import Head from "next/head";
import { motion } from "framer-motion";

//icons
import { TbRefresh } from "react-icons/tb";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { HiOutlineTrash } from "react-icons/hi";
import { BsGearWideConnected } from "react-icons/bs";
import { BsGraphUp } from "react-icons/bs";
import CustomAd from "../../components/customAd";
import SettingsModal from "../../components/settingsModal"
import {getGradebooks} from "../../utils/soap"



interface GradesProps {
	client: any;
	grades: Cache;
	setGrades: React.Dispatch<React.SetStateAction<Cache | undefined>>;
	period: number;
	setPeriod: (period: number) => void;
	isMediumOrLarger:boolean;
	createError:(message:string)=>void;
	ad:any;
	setAd:(ad:any)=>void;
	setTime:(time:number)=>void;
	timestamp:number;
	width:any;
	courseSettings:any;
	setCourseSettings:any;
	gradesCache:GradesType[]
	setGradesCache:(grades:GradesType[])=>void;
	markingPeriod:number;
	setMarkingPeriod:(p:number)=>void;
}

interface OptimizeProps {
	[key: string]: number;
	
}




/*
Inconsistencies:
the finals settings update live but the gradeScale settings only change after u hit save

the grades type shit should prob just also be stored in gradesCache, or at least moved into gradesCache when changes
are made


*/



export default function Grades({
	client,
	grades,
	setGrades,
	period,
	setPeriod,
	isMediumOrLarger,
	createError,
	ad,
	setAd,
	setTime,
	timestamp,
	width,gradesCache,setGradesCache,markingPeriod,setMarkingPeriod
	
}: GradesProps) {
	const router = useRouter();
	const index = parseInt(String(router.query.index)); //you could've just parseInt'd it here but u didnt' and now i'm too lazy to refactor i hate u
	const course = grades?.[period]?.courses[index];
	const [loading, setLoading] = useState(grades ? false : true);
	const [showModal, setShowModal] = useState(false);
	const [modalDetails, setModalDetails] = useState(0);
	const [modalType, setModalType] = useState("assignment");
	const [optimizeProps, setOptimizeProps] = useState<OptimizeProps>({});
	const [solutions, setSolution] = useState<[number[], number][]>([]);
	const [isEditing, setIsEditing]=useState(false);
	const [title,setTitle]=useState(undefined);
	const [showSettingsModal,setShowSettingsModal]=useState(false);
	const assignmentTitle = useRef(null);
	//right so if it's not mcps the default will be off, but this is other default case


		
		
	const finalGrade=course != undefined ? calcFinal(course?.settings.finals.categories,grades) : undefined
	

	
	useEffect(() => {
		try {
			if (!grades&&client&&ad!==undefined) {
				//oh my fucking god just fucking stop for fucks sake

									getGradebooks(client,null,null).then(raws=>{
										setGrades(getCache(raws))
										setPeriod(findCurrentPeriod(getCache(raws)))
										setLoading(false)
									})				
				
				
				


/*
				client.gradebook().then(([res,extras]) => {
					res.gradingScale=extras?.gradingScale
					console.log(typeof index);
					let parsedGrades = parseGrades(res);

					//@ts-ignore
					let realShi=getCache(killMe) //this sucks so much. it would almost be easier to just actually finish the backend. so many fucking tmep layers.
					setGrades(realShi);
					setPeriod(findCurrentPeriod(realShi));
					setLoading(false);
				});
				*/
			}
		} catch {
			if (localStorage.getItem("remember") === "false") {
				console.log("womp womp")
			}
		}
	}, [client]);


	useEffect(()=>{
		const deleteLast=(event)=>{
			if (event.ctrlKey && event.key === "z") {
				event.preventDefault(); // Prevent default undo behavior if needed
				let temp=grades?.[period]?.courses[index];
		

			if(temp.assignments[0].custom==true){
				del(0);
			}
		}
		}
		
		if(grades?.[period]?.courses[index]?.assignments?.length>1){
			window.addEventListener("keydown", deleteLast);
		}
		return () => {
			window.removeEventListener("keydown", deleteLast);
		};

	},[grades])

	const updateGrade = (val: string, assignmentId: number, update: string) => {
		let tempCache=structuredClone(grades)
		let temp=tempCache?.[period]
		temp.courses[index] = updateCourse(
			temp.courses[index],
			assignmentId,
			update,
			parseFloat(val)
		);

		setGrades(tempCache);
		
	};

	const handleChange = (e) => setTitle(e.target.value);
	
	const handleTitleChange = () => {
		const newTitle =assignmentTitle.current.value=='' ? "New Assignment" : assignmentTitle.current.value
		let tempCache = structuredClone(grades);
		let temp = tempCache?.[period]
		temp.courses[index].assignments[modalDetails].name=newTitle;
		setGrades(tempCache);
		
		setIsEditing(false);
	  };

	const add = () => {
		let tempCache = grades;
		let temp=tempCache?.[period]
		temp.courses[index] = addAssignment(
			temp.courses[index]
		);
		setGrades({ ...tempCache }); //yeah that works too I guess. I like structuredClone better though. that way no mutations.
		
	};

	const del = (id: number) => {
		let tempCache = structuredClone(grades);
		let temp = tempCache?.[period]
		temp.courses[index] = delAssignment(
			temp.courses[index],
			id
		);
		setGrades(tempCache);
		
	};

	const updateCat = (val: string, assignmentId: number) => {
		let tempCache = structuredClone(grades)
		let temp = tempCache?.[period]
		temp.courses[index] = updateCategory(
			temp.courses[index],
			assignmentId,
			val
		);
		setGrades(tempCache);
		
	};

	const OpenModal = (assignmnetId: number) => {
		setModalType("assignment");
		setModalDetails(assignmnetId);
		setTitle(course?.assignments[assignmnetId]?.name)
		setShowModal(true);
	};

	function update(p: number,getFresh=false){
		console.log(p);
		setLoading(true);
		if(getFresh){
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
			
							setGrades(temp)
							setPeriod(p);
							setLoading(false);
						})
			.catch((err) => {
				createError(err.message);
				setLoading(false);
			});
		}else{
			console.log(gradesCache[p],"astroworld")
			setPeriod(p)
			setLoading(false)
		}
		//this could prob be a useEffect. the temp Cache sets could also be a useEffect tbh

		
	};

	const editTitle=()=>{
		setIsEditing(true);
	}

	const optimize = () => {
		setModalType("optimize");
		let tempProps = {};
		tempProps["desiredGrade"] = course.settings.letterScale[0][1][0]
;
		course.categories.forEach((cat) => {
			tempProps[cat.name] = cat.weight * 100;
		});
		setOptimizeProps(tempProps);
		setShowModal(true);
	};

	const updateOptimize = (val: string, field: string) => {
		setOptimizeProps((prev) => {
			return { ...prev, [field]: parseFloat(val) };
		});
	};
	const handleFocus = () => {
		if(title=="New Assignment"){setTitle("")}}

	const optimizeGrades = () => {
		let points = Object.values(optimizeProps);
		points.splice(0, 1);
		let results = genTable(course, optimizeProps.desiredGrade, points);
		setSolution(results);
	};

	return (
		<motion.div className="p-5 md:p-10 flex-1">
			<Head>
				<title>
					{course ? `${course?.name} - Grade Melon` : "Grade Melon"}
				</title>
			</Head>
			{!loading &&
			<Modal show={showModal} onClose={() => setShowModal(false)}>
				<Modal.Header className="text-xl font-medium text-gray-900 dark:text-white">
					{modalType === "assignment"
						? (isEditing ? (<input onFocus={handleFocus} className="border-none bg-transparent focus:outline-none focus:ring-0 p-0 text-xl font-medium" type="text" onChange={handleChange} ref={assignmentTitle} autoFocus onBlur={handleTitleChange} value={title}></input>) : (<p onClick={course?.assignments[modalDetails]?.custom ? editTitle : ()=>{}}>{title}</p>))
						: "Optimize Grade"}
				</Modal.Header>
				<Modal.Body>
					{modalType === "assignment" && (
						<div id="assignment-details">
							<p className="font-bold text-black dark:text-white">Grade</p>
							<p
							style={{color:course?.assignments[modalDetails]?.grade.color.includes('#') && course?.assignments[modalDetails]?.grade.color}}
								className={`text-base leading-relaxed` +  `text-${course?.assignments[modalDetails]?.grade.color}-400`}
							>
								{course?.assignments[modalDetails]?.grade.letter}
								{!isNaN(course?.assignments[modalDetails]?.grade.raw) &&
									` (${course?.assignments[modalDetails]?.grade.raw}%)`}
							</p>
							<p className="font-bold text-black dark:text-white">Points</p>
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								{!isNaN(course?.assignments[modalDetails]?.points.earned)
									? course?.assignments[modalDetails]?.points.earned
									: "NG"}
								/{course?.assignments[modalDetails]?.points.possible}
							</p>
							<p className="font-bold text-black dark:text-white">Date Due</p>
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								{course?.assignments[
									modalDetails
								]?.date.due.toLocaleDateString()}							</p>
								{Boolean(course?.assignments[
									modalDetails
								]?.notes) && <>
								<p className="font-bold text-black dark:text-white">Notes</p>
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								{course?.assignments[
									modalDetails
								]?.notes}							</p></>}
							<p className="font-bold text-black dark:text-white">Category</p>
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								{course?.assignments[modalDetails]?.category}
							</p>
						</div>
					)}
					{modalType === "optimize" && (
						<div>
							<div className="flex flex-col gap-3">
								<div>
									<label
										htmlFor="email"
										className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>
										Desired Grade (1-100)
									</label>
									<div className="flex gap-2">
										<input
											type="number"
											min={1}
											max={100}           
											value={optimizeProps?.desiredGrade}
											onChange={(e) =>
												updateOptimize(e.target.value, "desiredGrade")
											}
											className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
											placeholder={String(course.settings.letterScale[0][1][0])}
										/>
									</div>
								</div>
								{course?.categories.map(({ name }, i) => (
									<div key={i}>
										<label
											htmlFor="email"
											className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
										>
											Points Left ({name})
										</label>
										<div className="flex gap-2">
											<input
												type="number"
												min={1}
												max={100}
												value={optimizeProps[name]}
												onChange={(e) => updateOptimize(e.target.value, name)}
												className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
												placeholder="50"
											/>
										</div>
									</div>
								))}
							</div>
							<div className="overflow-x-auto shadow-md rounded-lg mt-5 border border-gray-300 dark:border-gray-600">
								<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
									<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
										<tr>
											{course?.categories.map(({ name }, i) => (
												<th scope="col" className="py-3 pl-6" key={i}>
													{name}
												</th>
											))}
											<th scope="col" className="py-3 px-6">
												Grade
											</th>
										</tr>
									</thead>
									<tbody>
										{solutions.map((sol, i) => (
											<tr
												className={`bg-${
													i % 2 == 0 ? "white" : "gray-50"
												} border-b dark:bg-gray-${
													i % 2 == 0 ? 900 : 800
												} dark:border-gray-700`}
												key={i}
											>
												{course?.categories.map((cat, i) => (
													<td scope="col" className="py-3 pl-6" key={i}>
														{sol[0][i]} / {optimizeProps[cat.name]}
													</td>
												))}
												<td
													scope="row"
													className="py-4 pl-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
												>
													{sol[1].toFixed(2)}%
												</td>
											</tr>
										))}
										{!solutions.length && (
											<tr className="text-red-600 font-bold">
												<td
													className="text-center align-center py-3"
													colSpan={course?.categories.length + 1}
												>
													No Solutions Found!
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</Modal.Body>
				<SettingsModal
					client={client}
					grades={grades}
					period={period}
					setGrades={setGrades}
					index={index}
					createError={createError}
					showModal={showSettingsModal}
					setShowModal={setShowSettingsModal}
					isMediumOrLarger={isMediumOrLarger}
				
				/>
				<Modal.Footer>
					{modalType === "assignment" && (
						<div className="flex gap-2">
							<button
								onClick={() => setShowModal(false)}
								className="rounded-lg bg-gray-500 px-2.5 py-2.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
							>
								Close
							</button>
							<button
								onClick={() => {
									del(modalDetails);
									setShowModal(false);
								}}
								className="rounded-lg bg-primary-500 px-2.5 py-2.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
							>
								<div className="flex gap-1 items-center">
									<HiOutlineTrash size={"1.2rem"} />
									Delete
								</div>
							</button>
						</div>
					)}
					{modalType === "optimize" && (
						<div className="flex gap-2">
							<button
								onClick={() => setShowModal(false)}
								className="rounded-lg bg-gray-500 px-2.5 py-2.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
							>
								Close
							</button>
							<button
								onClick={optimizeGrades}
								className="rounded-lg bg-primary-500 px-2.5 py-2.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
							>
								Optimize
							</button>
						</div>
					)}
				</Modal.Footer>
			</Modal>
}
			{loading ? (
				<div className="flex justify-center">
					<Spinner size="xl" color="pink" />
				</div>
			) : (
				<motion.div
					className="max-w-max"
					layout
					layoutId={`card-${course?.layoutID}`}
				>
					<motion.h1
						layoutId={`name-${course?.layoutID}`}
						layout
						className="flex flex-wrap justify-between text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1"
					>
						{course?.name}
							<BsGearWideConnected
								className="text-2xl md:text-3xl hover:text-gray-600 text-black dark:text-white"
								style={{alignSelf:"end"}}
								onClick={()=>setShowSettingsModal(true)}
					
					/>
					</motion.h1>
					<div
					className=""
			 
					>
				

						</div>


					<motion.p
						layoutId={`teacher-${course?.layoutID}`}
						layout
						className="text-md tracking-tight mb-2.5 text-gray-900 dark:text-white"
					>
						{course?.teacher.name}
					</motion.p>
					<motion.div
						layoutId={`grade-${course.layoutID}`}
						layout="preserve-aspect"
						className="text-xl md:text-xl mb-2.5 dark:text-white"
					>
						{course?.grade.letter}{" "}
						{!isNaN(course?.grade.raw) && `(${course?.grade.raw}%)`}
					</motion.div>
					<div className="mt-2.5 w-full bg-gray-200 rounded-full dark:bg-gray-700">
						<div
							className={ `bg-${course?.grade.color}-400 text-xs md:text-sm font-semibold text-left pl-2 p-0.5 leading-none rounded-full h-5 md:h-6`}
							style={{
								width: `${course?.grade.raw < 100 ? course?.grade.raw : 100}%`,backgroundColor:(course?.grade.color.includes("#") && `${course?.grade.color}`)
							}}
						>
							<p>Total</p>
						</div>
					</div>
					
												{
						course.settings.finals.show &&
						<div className="mt-2.5 mb-2.5 w-full bg-gray-200 rounded-full dark:bg-gray-700 relative">
						<div
							className={ `bg-${finalGrade.color}-400 text-xs md:text-sm font-semibold text-left pl-2 p-0.5 leading-none rounded-full h-5 md:h-6`}
							style={{
								width: `${finalGrade.raw < 100 ? finalGrade.raw  : 100}%`,backgroundColor:(finalGrade.color.includes("#") && `${finalGrade.color}`)
							}}
						>
									<p className="absolute">
									Final Calc ({!isNaN(finalGrade.raw) ? `${course.settings.rounding.percent ? (finalGrade.raw.toFixed(course.settings.rounding.percentPlaces)) : finalGrade.raw}%` : "N/A"})
								</p>
						</div>
					</div>}

			
					{course?.categories.map(({ name, grade, points }, i) => (
						<div
							key={i}
							className="mt-2 md:mt-3 w-full bg-gray-200 rounded-full dark:bg-gray-700 relative"
						>
							<div

								className={`bg-${grade.color}-400` +  ` text-xs md:text-sm font-medium text-left pl-2 p-0.5 leading-none rounded-full h-4 md:h-6`}
								style={{ width: `${grade.raw < 100 ? grade.raw : 100}%`,backgroundColor:(grade.color.includes("#") && grade.color)}}
							>
								<p className="absolute">
									{name} ({!isNaN(grade.raw) ? `${grade.raw}%` : "N/A"}) -{" "}
									{Math.floor(points.earned*100)/100}/{Math.floor(points.possible*100)/100}
								</p>
							</div>
						</div>
					))}

					<div className="flex gap-2 mt-5 w-full">
						<button
							type="button"
							onClick={() => update(period,true)}
							className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm p-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
						>
							<TbRefresh size={"1.3rem"} />
						</button>
						<select
							id="periods"
							value={period}
							onChange={(e) => update(parseInt(e.target.value))}
							className="block w-full p-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
						>
							{grades?.[period]?.periods.map((period) => (
								<option value={period.index} key={period.index}>
									{`${period.name} (${parseDate(period.date)})`}
								</option>
							))}
						</select>
						<button
							type="button"
							onClick={optimize}
							className=" bg-primary-500 border border-primary-500 focus:outline-none hover:bg-primary-600 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm p-2.5 dark:bg-primary-600 text-white dark:hover:bg-primary-700 dark:focus:ring-primary-400"
						>
							<BsGraphUp size={"1.3rem"} />
						</button>
						<button
							type="button"
							onClick={add}
							className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm p-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
						>
							<HiOutlineDocumentAdd size={"1.3rem"} />
						</button>
					</div>
					<div className="m-5" />
					<div className="flex">
					<div className="mx-auto overflow-x-auto shadow-md rounded-lg border max-w-max border-gray-200 dark:border-gray-700">
						<table className="text-sm text-left text-gray-500 dark:text-gray-400">
							<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
								<tr>
									<th scope="col" className="py-3 md:pl-6 text-center md:text-left">
										Date
									</th>
									<th scope="col" className="py-3 md:px-6 text-center md:text-left">
										Assignment
									</th>
									<th scope="col" className="py-3 md:px-6 pr-3 text-center md:text-left">
										Score
									</th>
									<th scope="col" className="py-3 md:px-6 pr-3">
										Category
									</th>
								</tr>
							</thead>
							<tbody>
								{(()=>{
									var stopBreakingTheIndexSystems;
									let temp=structuredClone(grades?.[period].courses[index]);	
									if(temp?.assignments&&ad&&client.username!="10016976"&&width<1280&&false){
										stopBreakingTheIndexSystems=true; //disabled for [name-redacted]
										temp.assignments.splice(Math.floor(temp.assignments.length/2),0,{name:"this is where the ad should go",date:{due:new Date(),assigned:new Date()},category:course.categories[0].name,points:{earned:0,possible:0},grade:{letter:"",color:"",raw:NaN},custom:false,included:false,notes:""})
									}
									else{
										stopBreakingTheIndexSystems=false
									}

									
									return(temp?.assignments.map(
									({ name, date, grade, category, points, custom,included}, i) => {
										var trueIndex:number;
										if(i>Math.floor(course.assignments.length/2)&&ad&&client.username!="10016976"&&width<1280&&stopBreakingTheIndexSystems){trueIndex=i-1}
										else{trueIndex=i};
										if(name=="this is where the ad should go"){return <tr className={`bg-${
											i % 2 == 0 ? "white" : "gray-50"
										} border-b dark:bg-gray-${
											i % 2 == 0 ? 900 : 800
										} dark:border-gray-700`} key={i}><td className="p-3 " colSpan={4}><div className="flex shrink justify-center max-h-64"><CustomAd timestamp={timestamp} setTime={setTime} ad={ad} setAd={setAd}/></div></td></tr>}

										return(
										<tr
											className={`bg-${
												i % 2 == 0 ? "white" : "gray-50"
											} border-b dark:bg-gray-${
												i % 2 == 0 ? 900 : 800
											} dark:border-gray-700`}
											key={i}
										>
											<td className="py-4 md:pl-6 pl-2 text-center md:text-left">
												{date.due.toLocaleDateString()}
											</td>
											<td
												className={`py-4 md:px-6 px-3 text-center ${Boolean(custom) && "text-primary-500"} ${!included && "text-[#4d462d]"} md:text-left hover:text-${included ? 'black' : 'gray'} dark:hover:text-${included ? "white" : "gray"} cursor-pointer`}
												onClick={() => OpenModal(trueIndex)}
											>
												{name}
											</td>
											<td className="py-4 md:px-6 pl-3 pr-2 text-center md:text-left">
												<div
													style={{color:included && (grade.color.includes('#') && grade.color)}}
													className={`flex items-center gap-2 ${included ? `text-${grade.color}-400` : 'text-[#4d462d]'}`}
												>
													<GradeField
														onChange={(e) =>
															updateGrade(e.target.value, trueIndex, "earned")
														}
														value={points.earned}
													/>
													<p className="">/</p>
													<GradeField
														onChange={(e) =>
															updateGrade(e.target.value, trueIndex, "possible")
														}
														value={points.possible}
													/>
												</div>
											</td>
											<td className="py-4 md:px-6 pr-1 text-center md:text-left">
												<CategoryField
													value={course?.categories.findIndex(
														(c) => category === c.name
													)}
													onChange={(e) => updateCat(e.target.value, trueIndex)}
													name={isMediumOrLarger ? category : abbreviate(category)}
												>
													{course?.categories.map((category, x) => (
														<option value={x} key={x}>
															{category.name}
														</option>
													))}
												</CategoryField>
											</td>
										</tr>
									)}
			))})()}
							</tbody>
						</table>
					</div>
					{false && <div className="hidden lg:block shrink"><CustomAd timestamp={timestamp} setTime={setTime} ad={ad} setAd={setAd}/> </div>
					}
					</div>
				</motion.div>
			)}
		</motion.div>
	);
}
