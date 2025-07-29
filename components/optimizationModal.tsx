import React, {useState,useEffect} from "react";
import {genTable} from "../utils/grades"
import {Modal} from "flowbite-react"


interface OptimizeProps {
	[key: string]: number;
	
}

export default function OptimizationModal({showModal,setShowModal,course,cache}){
    const [optimizeProps, setOptimizeProps] = useState<OptimizeProps>({});
    const [solutions, setSolutions] = useState<[number[], number][]>([]);   





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
	

	const optimizeGrades = () => {
		let points = Object.values(optimizeProps);
		points.splice(0, 1);
		let results = genTable(course, optimizeProps.desiredGrade, points);
		setSolutions(results);
	};

    return(
        <Modal show={showModal} onClose={()=>{setShowModal(false)}}>
                <Modal.Header className="text-xl font-medium text-gray-900 dark:text-white">
                    Optimize Grade
                </Modal.Header>
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