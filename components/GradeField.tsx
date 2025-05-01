import React, { useState, useRef } from "react";

interface GradeFieldProps {
	value: number;
	onChange: any;
}

export default function GradeField({ value, onChange }: GradeFieldProps) {
	const [focus, setFocus] = useState(false);
	const [valasString, setValasString] = useState(value.toString());
	const ref = useRef(null);

	const onFocus = async () => {
		console.log("am I even being clicked gang?")
		setValasString(value.toString());
		await setFocus(true);
		await ref.current.focus();
	};

	const onUpdate = async (e) => {
		await setValasString(e.target.value);
		await onChange(e);
	};



	return (
		<div
			onClick={onFocus}
			onBlur={() => {
				setTimeout(()=>{
					setFocus(false)
				},10);
				
			}}
			className="cursor-pointer"
		>
			{!focus ? (
				<p className="p-2 w-auto">
				{!isNaN(value) ? value : "NG"}
				</p>
			) : (
				<input
					ref={ref}
					type="number"
					value={valasString}
					onChange={onUpdate}
					className="w-12 inline-block bg-gray-50 border-none bg-transparent p-2 md:p-1 text-gray-900 sm:text-xs rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
				/>
			)}
		</div>
	);
}
