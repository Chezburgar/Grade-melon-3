import React, {useState,useEffect} from "react";
import {calcFinal, genTable,Course, Finals, Cache,simplifyWeights, letterGrade, letterGradeColor} from "../utils/grades"
import {Modal} from "flowbite-react"
import QuarterField from "./QuarterField";


interface OptimizeProps {
	[key: string]: number;
	
}


interface ModalProps{
    showModal:boolean;
    setShowModal:any;
    mp:number;
    index:number;
    cache:Cache;
}



/*
i still wanna make it try to navigate to same course on mp change

still need to think how exams will feed in

and need to think how semesters should be modeled. deletable? (cuz it gets in the way)

To DO: 7/30

  - make it so it tries to navigate to same course on mp change
  - how do exams feed in to everything
  - how should semesters be modeled. they be getting in the way dont they. divorce showing from existing.
  - finish optimization modal, include og functionality and make it work for this too

*/

interface Score{
    raw:number,
    letter:string,
    color:string
}

export default function OptimizationModal({showModal,setShowModal,mp,index,cache}:ModalProps){
    const [cacheCopy,setCacheCopy] = useState(structuredClone(cache));
    const course=cacheCopy[mp].courses[index]
    const [optimizeProps, setOptimizeProps] = useState<OptimizeProps>({});
    const [solutions, setSolutions] = useState<[number[], number][]>([]);   


//what should this even do if finals is disabled chat lmoa


    const finalGrade:Score=course != undefined ? calcFinal(course?.settings.finals.categories,cacheCopy) : undefined
    const semesterGrades:Score[] = course?.settings.finals.semesters.map(semester=>calcFinal(semester.categories,cacheCopy))
    const all=(course?.settings.finals.show ? course?.settings.finals.categories : []).concat(course?.settings.finals.semesters.map((semester)=>semester.show ? semester.categories : []).flat())
    
    //not actually using this for the weights, but it will return the unique marking periods. so. swag.
    const uniqueCats=simplifyWeights(all)   

 

    function ordinalSuffix(n: number): string {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    	function optimize(){
		let tempProps = {};
		tempProps["desiredGrade"] = course.settings.letterScale[0][1][0]
;
		course.categories.forEach((cat) => {
			tempProps[cat.name] = cat.weight * 100;
		});
		setOptimizeProps(tempProps);
        setShowModal(true)
	};





	function updateOptimize(val: string, field: string){
		setOptimizeProps((prev) => {
			return { ...prev, [field]: parseFloat(val) };
		});
	};
	

	function optimizeGrades(){
		let points = Object.values(optimizeProps);
		points.splice(0, 1);
		let results = genTable(course, optimizeProps.desiredGrade, points);
		setSolutions(results);
	};



    return(
        <Modal show={showModal} onClose={()=>{
            
        }}>
                <Modal.Header className="text-xl font-medium text-gray-900 dark:text-white">
                    Optimize Grade
                </Modal.Header>
                <Modal.Body>
                <div>
                <div
                className="flex justify-between mx-4"
                >
                    {uniqueCats.map((category,i)=>{
                        //fuck me is it ever null? that's dumb

                        const grade=!Number.isNaN(category.courseIndex) ? cacheCopy[category.mp].courses[category.courseIndex].grade : {letter:"N/A",color:"gray",raw:NaN}


                        return(
                            <div key={i} className="flex flex-col items-center justify-top">
                             <p className="dark:text-white">{cacheCopy[0].periods[category.mp].name}</p>
                             
                            <QuarterField onChange={(e)=>{
                                const val=parseFloat(e.target.value)

                                const newGrade={raw:val,letter:letterGrade(val,course?.settings),color:letterGradeColor(letterGrade(val,course?.settings))}
                                const temp=structuredClone(cacheCopy)
                                if(!Number.isNaN(category.courseIndex)){
                                temp[category.mp].courses[category.courseIndex].grade=newGrade
                                }else{

                                    //virtual course
                                    temp[category.mp].courses[99+i]={grade:newGrade,name:"",period:NaN,courseID:course.courseID,layoutID:NaN,room:"",weighted:course.weighted,identifier:course.identifier,settings:course.settings,teacher:{name:"",email:""},categories:course.categories,assignments:[]}
                                    
                                    //insert virtual course into copy's runtime settings
                                    const dex=course.settings.finals.categories.findIndex(cat=>(isNaN(cat.courseIndex)&&cat.mp==category.mp&&category.type==cat.type))
                                    if(dex!=-1){
                                    course.settings.finals.categories[dex].courseIndex=99+i}
                                    for(let semester of course.settings.finals.semesters){
                                        const dex=semester.categories.findIndex(cat=>Number.isNaN(cat.courseIndex)&&cat.mp==category.mp&&cat.type==category.type)
                                        if(dex==-1){continue}
                                        semester.categories[dex].courseIndex=99+i
                                    }
                                    temp[mp].courses[index]=course
                                }
                                
                                setCacheCopy(temp)
                            }} cache={cacheCopy}
                                mp={category.mp}    
                                courseIndex={category.courseIndex}                        
                            />

                            </div>
                        )
                    })}
                </div>

                <div className="mx-4 flex justify-center items-center flex-col">
               {course?.settings.finals.show && <div className="mt-7 w-full bg-gray-300 rounded-full dark:bg-gray-800">
                        <div
                            className={ `bg-${finalGrade.color}-400 text-xs md:text-sm font-semibold text-left pl-2 p-0.5 leading-none rounded-full h-6`}
                            style={{
                                width: `${finalGrade.raw < 100 ? finalGrade.raw : 100}%`,backgroundColor:(finalGrade.color.includes("#") && `${finalGrade.color}`)
                            }}
                        >
                            <p className="text-sm">Final {!Number.isNaN(finalGrade.raw) && ` (${finalGrade.raw})%`}</p>
                        </div>
                    </div>}

                    {semesterGrades.map((grade,i)=>(
                    <>
                      {course?.settings.finals.semesters[i].show && <div className="mt-5 w-full bg-gray-300 rounded-full dark:bg-gray-800">
                            <div
                                className={ `bg-${grade.color}-400 text-xs md:text-sm font-semibold text-left pl-2 p-0.5 leading-none rounded-full h-6`}
                                style={{
                                    width: `${grade.raw < 100 ? grade.raw : 100}%`,backgroundColor:(grade.color.includes("#") && `${grade.color}`)
                                }}
                            >
                            <p className="text-sm">{ordinalSuffix(i+1)} Semester {!Number.isNaN(grade.raw) && ` (${grade.raw})%`}</p>
                            </div>
                        </div>
                    }
                    </>
                    ))}

                </div>

                </div>
                </Modal.Body>
                <Modal.Footer>
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
                </Modal.Footer>
            </Modal>

    )
}




/*
  <Modal.Body>
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
                </Modal.Body>
*/