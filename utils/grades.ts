import { Gradebook } from "studentvue";
import Grades from "../pages/grades";

interface Assignment {
	name: string;
	custom?:boolean;
	included:boolean;
	notes:string;
	grade: {
		letter: string;
		raw: number;
		color: string;
	};
	points: {
		earned: number;
		possible: number;
	};
	date: {
		due: Date;
		assigned: Date;
	};
	category: string;
	GradebookID:string;
}



interface Finals{
	show:boolean,
	categories:Category[],
	isSemester:boolean,
	semesters:{show:boolean,categories:Category[]}[]

}


interface Category{
		mp:number,
		courseIndex:number,
		weight:number,
		type:"exam"|"course"
			}




interface CourseSettings{
	rounding:{percent:boolean,percentPlaces:number,mark:boolean,markPlaces:number},letterScale:
	[string,[number,number],string?][],finals?:Finals,categories?:Course["categories"],assignments:MetaAssignments[] // categories is to be implemented
}


interface MetaAssignments{
	name:string,
	included:boolean,
	notes:string,
	category:string,
	GradebookID:string
}


interface GlobalSettings{
	rounding:{percent:boolean,percentPlaces:number,mark:boolean,markPlaces:number},letterScale:
	[string,[number,number],string?][],categories?:undefined // categories is to be implemented
}

type Settings = {
	mode:"automatic" | "manual"
} & {
  default: CourseSettings;
} & {
  [key:string]:CourseSettings
};







interface Course {
	name: string;
	period: number;
	courseID:string;
	layoutID: number;
	room: string;
	weighted: boolean;
	identifier:string;
	settings:CourseSettings
	grade: {
		letter: string;
		raw: number;
		color: string;
	};
	teacher: {
		name: string;
		email: string;
	};
	categories: {
		name: string;
		weight: number;
		grade: {
			letter: string;
			raw: number;
			color: string;
		};
		points: {
			earned: number;
			possible: number;
		};
	}[];
	assignments: Assignment[];
}


//The ONLY case where an index returns undefined should be those such cases where the inital fetch
//returned undefined as to mean that THAT GRADE PERIOD HAS NOT ARRIVED YET

//this could be flawed if Synergy's error rate is too high
type Cache = Grades[]

interface Grades {
	courses: Course[];
	settings:Settings;
	//gpa: number;
	//wgpa: number;
	period: {
		name: string;
		index: number;
	};
	periods: {
		name: string;
		index: number;
		date:{start:Date,end:Date}
	}[];
}


function findCurrentPeriod([cache]:Grades[]){
	console.log(cache)
	let dates=cache.periods.map(period=>period.date)
	console.log(dates,"oh okay I get it now")
	const index = dates.findIndex((date,i)=>{
		if(Date.now()>=(new Date(date.start)).getTime()&&Date.now()<=(new Date(date.end)).getTime()){
			return true
		}
	})
	if(index==-1){return 0}
	else{
		return index
	}
}




function letterGradeColor(letterGrade: string,gradingScale:CourseSettings|false=false){


	


	try{
		if(gradingScale){
	const index=gradingScale.letterScale.findIndex(letter=>letter[0]==letterGrade)
	if(gradingScale.letterScale[index][2]!=undefined){return gradingScale.letterScale[index][2]}
	}


	
	if (letterGrade.includes("A")&&letterGrade!=="N/A") {
		return "green";
	} else if (letterGrade.includes("B")) {
		return "blue";
	} else if (letterGrade.includes("C")) {
		return "yellow";
	} else if (letterGrade.includes("D")) {
		return "orange";
	} else if (letterGrade.includes("E")||letterGrade.includes("F")) {
		return "red";
	} else {
		return "gray";
	}

}catch(error){return "gray"}
};

function letterGrade(grade: number,gradingScale:CourseSettings):string{

	//deprecating rounding unless someone complains chat
	
	const rounding=gradingScale.rounding;
if(rounding.percent){
	grade=Number(grade.toFixed(rounding.percentPlaces))

}
	


if(!gradingScale){
	if (grade >= 89.5) {
		return "A";
	} else if (grade >= 79.5) {
		return "B";
	} else if (grade >= 69.5) {
		return "C";
	} else if (grade >= 59.5) {
		return "D";
	} else if (!isNaN(grade)) {
		return "E";
	} else {
		return "N/A";
	}}
else{
	var highest:any=[null,[-Infinity,-Infinity]]
	for(let letter of gradingScale.letterScale){
		for(let i=0;i<2;i++){
			if(letter[1][i]>highest[1][i]){highest=letter}
		}
	}


	for(let letter of gradingScale.letterScale){
		if(grade>100){return highest[0]}
		if(grade>=letter[1][0]&&grade<=letter[1][1]){
			
			return letter[0]
		}
	}
	return "N/A"

}
};

const letterGPA = (letterGrade: string, weighted: boolean,double=false): number => {
	let gpa = 0;
	if (weighted) {
		gpa++;
	}
	if(letterGrade.includes("A")&&letterGrade!="N/A"){gpa+=4;}
	else if(letterGrade.includes("B")){gpa+=3;}
	else if(letterGrade.includes("C")){gpa+=2;}
	else if(letterGrade.includes("D")){gpa+=1;}
	else if(letterGrade.includes("E")||letterGrade.includes("F")){gpa+=0;}

	if(double){gpa*=2;}
	return(gpa);
};

const isWeighted = (name: string): boolean => {
	if (name.includes("AP")) return true;
	if (name.includes("Hon")) return true;
	if (name.includes("IB")) return true;
	if (name.includes("Mag")) return true;
	if (name.includes("Adv")) return true;
	else return false;
};

const isDouble=(name:string):boolean=>{
	if(name.includes("DP")){return true}else{return false}
}

//function to get rid of everything in parentheses in assignment names
const stripParens = (str: string): string => {
	let regex = /\(([^)]+)\)/g;
	return str.replace(regex, "");
};

const parsePoints = (points: string) => {
	let p = points.split("/").map(num=>parseFloat(num));
	if(p.length==1){
		return{
			grade:NaN,
			earned:NaN,
			possible:p[0]
		}
	}
	else if(p.length==2){
		p[0]=isNaN(p[0]) ? 0 : p[0];
		p[1]=isNaN(p[1]) ? 0 : p[1];
	return{
		grade:(p[0]/p[1])*100,
		earned:p[0],
		possible:p[1]
	}
}
	else throw new Error("Invalid points string")


};

const parseDate = ({ start, end }: { start: Date; end: Date }): string => {
	let startDate = new Date(start);
	let endDate = new Date(end);

	//days left to the due date
	let daysLeft = Math.ceil(
		(endDate.getTime() - new Date().getTime()) / 86400000
	);
	let daysToStart = Math.floor(
		(startDate.getTime() - new Date().getTime()) / 86400000
	);
	let daysAgo = Math.floor(
		(new Date().getTime() - endDate.getTime()) / 86400000
	);

	if (daysLeft > 0 && daysToStart < 0) {
		return `ends in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
	} else if (daysToStart > 0) {
		return `starts in ${daysToStart} day${daysToStart > 1 ? "s" : ""}`;
	} else if (daysAgo > 0) {
		return `ended ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
	} else if (daysAgo === 0) {
		return "ends today";
	}
};

const parseAssignmentName = (name: string): string => {
	return new DOMParser().parseFromString(
		new DOMParser().parseFromString(name, "text/html").documentElement
			.textContent,
		"text/html"
	).documentElement.textContent;
};







function simplifyWeights(categories:Category[]){
	const seen=[]
	const real=[]
	for(let category of categories){
		if(!seen.includes(""+category.mp+category.type)){
			seen.push(""+category.mp+category.type)
			real.push(category)
		}
	}
	categories=real



	let totalWeight:number=categories.reduce((a,b)=>(a+b.weight),0)
	for(let category of categories){
		category.weight=category.weight/totalWeight
	}
	
	return categories

}

function initalizeFinals2(cache:Cache,raw_settings:Settings,identifier:string):CourseSettings{


	const settings=structuredClone(raw_settings)
	console.log("I want a perfect body",settings)


	//@ts-ignore
	if(settings.mode=="manual"){
		//we let them control but also we FORCe them to control all my precious
		const id=Object.keys(settings)[Object.keys(settings).findIndex(key=>key.includes(identifier))]
		//we handle nothing actually. kys.


		return settings[id] || settings.defualt

	}
	else{
//it is KNOWN that categories will not be undefined cuz it'll be either set explicitly right here right now
		if(!settings[identifier]){settings[identifier]=settings.default;}

		const categories=[]
		for(let category of settings[identifier].finals.categories){
			if(Number.isNaN(category.courseIndex)||category.courseIndex==null){
				const index=cache[category.mp].courses.findIndex(c=>c.courseID.substring(0,c.courseID.length-1)==identifier) //the many to one idea would require a custom data structure that would store poorly in json so how about, no.
				category.courseIndex=index!=-1 ? index : NaN //gunna kms fr fr

			}
			categories.push(category)
		}
		settings[identifier].finals.categories=categories

		//mk so there's still the semester shit righhhhhhhht

		//sigh...

		for(let semester of settings[identifier].finals.semesters){
					const categories=[]
			for(let category of semester.categories){
				if(Number.isNaN(category.courseIndex)||category.courseIndex==null){
					const index=cache[category.mp].courses.findIndex(c=>c.courseID.substring(0,c.courseID.length-1)==identifier) //the many to one idea would require a custom data structure that would store poorly in json so how about, no.
					category.courseIndex=index!=-1 ? index : NaN //gunna kms fr fr

				}
				categories.push(category)
			}
			semester.categories=categories
		}

		//that oughta do it I guess. now for el manuel

		return {...settings[identifier]} //over ride manual hell yeah biatch

	}


}












function getRealMarkingPeriods(periods:Grades["periods"]){
	let reals=[]
	for(let i=0;i<periods.length;i++){
		let flag=true
		for(let j=0;j<periods.length;j++){
			if(j==i){continue}
			if(periods[j].date.start<=periods[i].date.start&&periods[j].date.end>periods[i].date.end){
				flag=false
			}
		}
		if(flag){reals.push(periods[i])}
	}
	return reals
}




function templateFinals(mode,periods):Finals{
      if(mode=="automatic"){
			let mps=getRealMarkingPeriods(periods).map(mp=>mp.index)
			let weight=1/mps.length
			let categories:Category[]=mps.map(mp=>({mp:mp,courseIndex:NaN,weight:weight,type:"course"}))
			
			return {show:true,categories:categories,isSemester:false,semesters:[{show:true,categories:mps.slice(0,mps.length/2).map(mp=>({mp:mp,courseIndex:NaN,weight:weight*2,type:"course"}))},{show:true,categories:mps.slice(mps.length/2).map(mp=>({mp:mp,courseIndex:NaN,weight:weight*2,type:"course"}))}]}
		}

	else{
		return {show:false,categories:[],isSemester:false,semesters:[]}
	}
  

}



function getCache(books:Gradebook[]):Cache{
	//pre parsing
	const settings=books[0].gradingScale

	//this is for setting the default entry for finals obj. eventually, this should be moved to the 
	//backend. but for now, since it changes so often in dev, we process it here.
	if(settings.mode==undefined){settings.mode="automatic"}

	const periods=books[0].reportingPeriod.available.map(({ name, index, date }) => ({
			name:name,
			date:date,
			index: index,
		}))

	if(!settings.default.finals){
	settings.default.finals=templateFinals(settings.mode,periods)}
	let gradesCache:any=books.map(book=>parseGrades(book,settings))

		


	/*this is essential. structural dust. unlesss we move away from having unsynced
	settings objects at the cache, grades, and courses level. all seperate. all fucking unsynced.
	like a fucking maniac. get it working first. then we myabe refactor.
	*/


	
		//basically this is the handling for if a course needs to have some settings set explicit but others 
	//remain at the default, it is thus essential whenever we be revamping type shit type shit type shit
	//type shit. 
	for(let key in settings){
		if(key=="default"||key=="mode"){continue}
		else{
			for(let prop in settings[key]){
				if(settings[key][prop]==false){
					settings[key][prop]=settings.default[prop] //fallback to default if a class's settings props are set to false
				}
			}
		}
		settings[key]=initalizeFinals2(gradesCache,settings,key)
	}


//this will ensure every course has a runtime settings obj in course.settings while only leaving 
//real swag players with one's in the top level settings objects
	for(let grades of gradesCache){
		grades.settings=settings
		for(let course of grades.courses as Course[]){
			const id = settings.mode=="automatic" ? course.identifier : Object.keys(settings)[Object.keys(settings).findIndex(key=>key.includes(course.identifier))]
			if(settings[id]==undefined){
				course.settings=initalizeFinals2(gradesCache,settings,course.identifier)
				//this one is finna be special cause categories is unique in that it won't have a global
				//at least not until I look into supporting Gavin-like cases

				if(course.settings.categories){
			//		course.categories=course.settings.categories //maybe. eventually. for now. FUCK NO.
				}
				console.log(course.settings,"electric avenue")
			}
		
		}
	}



	console.log("he's officially lost it chat",settings)
	console.log("genuinely lost his marbles",gradesCache)


return gradesCache as Cache
}


const parseGrades = (grades: Gradebook,override?:Settings): Grades => {
	//@ts-ignore
	const settings:Settings=override ? override : grades.gradingScale;
	const decimalPlaces=settings?.default?.rounding.percent===true ? settings?.default.rounding.percentPlaces : (settings?.default?.rounding.percent===false ? false : 2)
	for (let i = 0; i < grades.courses.length; i++) {
		if (grades.courses[i].marks.length === 0) {
			grades.courses[i].marks = [
				{
					calculatedScore: { raw: NaN, string: "N/A" },
					weightedCategories: [],
					assignments: [],
					name: "",
				},
			];
		}
	}
	let parsedGrades:Grades = {
		settings:settings,
	/*	gpa:
			grades.courses.reduce(
				(a, b) =>
					a +
					letterGPA(letterGrade(b.marks[0].calculatedScore.raw,gradingScale[b.title+b.period] ? gradingScale[b.title + b.period] : gradingScale.default), false),
				0
			) / grades.courses.length,
		wgpa:
			grades.courses.reduce(
				(a, b) =>
					a +
					letterGPA(
						letterGrade(b.marks[0].calculatedScore.raw,gradingScale[b.title+b.period] ? gradingScale[b.title + b.period] : gradingScale.default),
						isWeighted(b.title)
					),
				0
			) / grades.courses.length,
	Deprecating until I remake it this is so useless and calculated so naively 
	
			*/

			courses: grades.courses.map(({ title, period, room, staff, marks,courseID }, i) => {
				const identifier=settings.mode=="manual" ? (ReplaceUnderscores(stripParens(title))+period+staff.name) : courseID.substring(0,courseID.length-1)
				const courseSettings=settings[identifier] ? settings[identifier] : structuredClone(settings.default)
		//this is a dumb hotfix but we ARE not refactoring again. why i let some settings be global and finals not be global and now the default and reset system is fucked to hell. 
			if(!courseSettings.letterScale||!courseSettings.rounding){courseSettings.rounding=settings.default.rounding;courseSettings.letterScale=settings.default.letterScale}
			const places=courseSettings.rounding.percent===true ? courseSettings.rounding.percentPlaces : (courseSettings.rounding.percent===false ? false : 2)
			
	
			
			return({
			name: ReplaceUnderscores(stripParens(title)),
			period: period ? period : i + 1,
			layoutID:null,
			courseID:courseID,
			room: room,
			settings:courseSettings,
			identifier:identifier,
			weighted: isWeighted(title),
			grade: {
				letter: (marks[0].calculatedScore.string!=="N/A" ? letterGrade(marks[0].calculatedScore.raw,courseSettings) : "N/A"),
				raw: marks[0].calculatedScore.string!=="N/A" ? marks[0].calculatedScore.raw : NaN,
				color: marks[0].calculatedScore.string!=="N/A" ? letterGradeColor(letterGrade(marks[0].calculatedScore.raw,courseSettings),courseSettings) : letterGradeColor("N/A"),
			},
			teacher: {
				name: staff.name,
				email: staff.email,
			},
			categories: marks[0].weightedCategories.length
  ? marks[0].weightedCategories
      .map(({ type, weight, points }) => ({
        name: type,
        weight: parseFloat(weight.standard) / 100,
        grade: {
          letter: letterGrade((points.current / points.possible) * 100,courseSettings),
          raw:    places!=false ? parseFloat(
         ((points.current / points.possible) * 100).toFixed(places)
          ) :  ((points.current / points.possible) * 100),
          color: letterGradeColor(
            letterGrade((points.current / points.possible) * 100,courseSettings),courseSettings
          ),
        },
        points: {
          earned: points.current,
          possible: points.possible,
        },
      }))
      .filter((category) => !category.name.toLowerCase().includes("total"))
  : [
      {
        name: "Default5421",
        weight: 1, // assuming 100% weight   
        grade: {
          letter: (()=>{let pointsEarned=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsEarned+=parsePoints(points).earned}});let pointsP=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsP+=parsePoints(points).possible}});return(letterGrade((places!= false ? parseFloat(((pointsEarned/pointsP)*100).toFixed(places)) : (pointsEarned/pointsP)*100),courseSettings))})(), // or whatever default value you'd like
          raw: (()=>{let pointsEarned=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsEarned+=parsePoints(points).earned}});let pointsP=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsP+=parsePoints(points).possible}});return(places!= false ? parseFloat(((pointsEarned/pointsP)*100).toFixed(places)) : (pointsEarned/pointsP)*100)})(),
          color: (()=>{let pointsEarned=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsEarned+=parsePoints(points).earned}});let pointsP=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsP+=parsePoints(points).possible}});return(letterGradeColor(letterGrade((places!= false ? parseFloat(((pointsEarned/pointsP)*100).toFixed(places)) : (pointsEarned/pointsP)*100),courseSettings),courseSettings))})()
        },
        points: {
          earned: (()=>{let pointsE=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsE+=parsePoints(points).earned}});return(pointsE)})(),
          possible: (()=>{let pointsP=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsP+=parsePoints(points).possible}});return(pointsP)})(),
        },
      },
    ],

			assignments: marks[0].assignments.map(({ name, date, points, type,notes,gradebookId }) => ({
				included:notes!="(Not For Grading)",
				notes:notes,
				GradebookID:gradebookId,
				name: parseAssignmentName(name),
				grade: {
					letter:  letterGrade(parsePoints(points).grade,courseSettings), 
					raw: places!=false ? parseFloat(parsePoints(points).grade.toFixed(places)) : parsePoints(points).grade,
					color: notes!="(Not For Grading)" ? letterGradeColor(letterGrade(parsePoints(points).grade,courseSettings),courseSettings) : "mud" ,
				},
				points: {
					earned: parsePoints(points).earned,
					possible: parsePoints(points).possible,
				},
				date: {
					due: date.start,
					assigned: date.due,
				},
				category: marks[0].weightedCategories.length ? type : "Default5421",
			})),
		})}),
		period: {
			name: grades.reportingPeriod.current.name,
			index: grades.reportingPeriod.current.index,
		},
		periods: grades.reportingPeriod.available.map(({ name, index, date }) => ({
			name:name,
			date:date,
			index: index,
		})),
	};

	parsedGrades.courses.forEach((course:Course) => {
		if (course.categories[0].name!=="Default5421") {
			course.categories.forEach((category, i) => {
				course = calculateCategory(course, i);
			});
			calculateGrade(course);
		}
	});
	parsedGrades.courses.forEach((course:Course,index) => {
		course.layoutID=index;
	});


	
	return parsedGrades;
};


function ReplaceUnderscores(name:string){
	return name.replaceAll("_"," ")

}

let solutions = [];
const recur = (
	coeff: Array<number>,
	sols: Array<number>,
	remainingPoints: Array<number>,
	start: number,
	end: number,
	currentPoints: Array<number>,
	currentPossible: Array<number>,
	desired: number
): [number[], number][] => {
	let result = [];
	let newGrade = 0;

	for (let i = 0; i < currentPoints.length; i++) {
		newGrade +=
			((currentPoints[i] + sols[i]) /
				(currentPossible[i] + sols[i] + remainingPoints[i])) *
			coeff[i];
	}

	if (newGrade * 100 >= desired) {
		console.log(sols);
		console.log(newGrade * 100);
		solutions.push([sols, newGrade * 100]);
		return [[sols, newGrade * 100]];
	} else {
		for (let i = start; i <= end; i++) {
			let temp = [...sols];
			temp[i] = temp[i] + 1;
			let temp2 = [...remainingPoints];
			if (temp2[i] >= 1) {
				temp2[i] -= 1;
				result.concat(
					recur(
						coeff,
						temp,
						temp2,
						i,
						end,
						currentPoints,
						currentPossible,
						desired
					)
				);
			}
		}
	}
	return result;
};

const genTable = (
	course: Course,
	desired: number,
	remaining: Array<number>
): [number[], number][] => {
	let n = course.categories.length;
	let current = course.grade.raw;
	let gradeBoost = desired - current;

	let weights: number[] = [];
	for (let i = 0; i < n; i++) {
		weights[i] = course.categories[i].weight;
	}
	solutions = [];

	let sols: number[] = [];
	let cur: number[] = [];
	let possible: number[] = [];

	for (let a = 0; a < n; a++) {
		sols[a] = 0;
		cur[a] = course.categories[a].points.earned;
		possible[a] = course.categories[a].points.possible;
	}

	let result = recur(
		weights,
		sols,
		remaining,
		0,
		n - 1,
		cur,
		possible,
		desired
	);
	console.log(result);

	return [...solutions];
};

const calculateCategory = (course: Course, categoryId: number): Course => {
	const gradingScale=course.settings;
	const places=gradingScale.rounding.percent===true ? gradingScale.rounding.percentPlaces : (gradingScale.rounding.percent===false ? false : 2)
	course.categories[categoryId].points.earned = course.assignments
		.filter(
			(assignment) =>
				assignment.category === course.categories[categoryId].name &&
				!isNaN(assignment.points.possible) &&
				!isNaN(assignment.points.earned) && assignment.included
		)
		.reduce((a, b) => a + b.points.earned, 0);


	course.categories[categoryId].points.possible = course.assignments
		.filter(
			(assignment) =>
				assignment.category === course.categories[categoryId].name &&
				!isNaN(assignment.points.possible) &&
				!isNaN(assignment.points.earned) &&
				assignment.included
		)
		.reduce((a, b) => a + b.points.possible, 0);
	course.categories[categoryId].grade.raw = places!=false ? parseFloat(
		(
			(course.categories[categoryId].points.earned /
				course.categories[categoryId].points.possible) *
			100
		).toFixed(places) 
	) : 	(
			(course.categories[categoryId].points.earned /
				course.categories[categoryId].points.possible) *
			100
		);
	course.categories[categoryId].grade.letter = letterGrade(
		course.categories[categoryId].grade.raw,gradingScale
	);
	course.categories[categoryId].grade.color = letterGradeColor(
		course.categories[categoryId].grade.letter,gradingScale
	);
	return course;
};



function reCalculateAll(grades:Grades,settings:Settings){
	grades.settings=settings;
	const copy=structuredClone(grades)
	
	return copy
	


}

function calculateGrade(course: Course): Course{
	const gradingScale=course.settings;
	const places=gradingScale.rounding.percent===true ? gradingScale.rounding.percentPlaces : (gradingScale.rounding.percent===false ? false : 2)
	let currWeight = 0;
	let trueCategories = course.categories.filter((c) => {
		if (!isNaN(c.grade.raw)) {
			currWeight += c.weight;
			return true;
		}
		return false;
	});
	course.grade.raw = places!=false ? parseFloat(
		trueCategories
			.reduce((a, b) => {
				return a + b.grade.raw * (b.weight / currWeight);
			}, 0)
			.toFixed(places)
	) :trueCategories
			.reduce((a, b) => {
				return a + b.grade.raw * (b.weight / currWeight);
			}, 0) ;

	if (trueCategories.length === 0) {
		course.grade.raw = NaN;
	}
	course.grade.letter = letterGrade(course.grade.raw,gradingScale);
	course.grade.color = letterGradeColor(course.grade.letter,gradingScale);
	return course;
};

const addAssignment = (course: Course): Course => {
	course.assignments.unshift({
		name: "New Assignment",
		included:true,
		notes:"",
		custom:true,
		GradebookID:crypto.randomUUID(),
		grade: {
			letter: "N/A",
			raw: NaN,
			color: "gray",
		},
		points: {
			earned: 0,
			possible: 0,
		},
		date: {
			due: new Date(),
			assigned: new Date(),
		},
		category: course.categories.length ? course.categories[0].name : "N/A",
	});
	return course;
};

/*
const calculateGPA = (grades: Grades): Grades => {
	grades.gpa =
		grades.courses.reduce(
			(a, b) => a + letterGPA(letterGrade(b.grade.raw,b.gradingScale), false),
			0
		) / grades.courses.length;
	grades.wgpa =
		grades.courses.reduce(
			(a, b) => a + letterGPA(letterGrade(b.grade.raw,b.gradingScale), b.weighted),
			0
		) / grades.courses.length;

	return { ...grades };
};

const updateGPA = (grades: Grades, i: number, val: boolean): Grades => {
	grades.courses[i].weighted = val;
	grades = calculateGPA(grades);

	return { ...grades };
};

*/

const delAssignment = (course: Course, assignmentId: number): Course => {
	course.assignments.splice(assignmentId, 1);
	course.categories.forEach((category, i) => {
		course = calculateCategory(course, i);
	});
	course = calculateGrade(course);
	return course;
};

const updateCategory = (
	course: Course,
	assignmentId: number,
	val: string
): Course => {
	course.assignments[assignmentId].category = course.categories[val].name;
	course.categories.forEach((category, i) => {
		course = calculateCategory(course, i);
	});
	course = calculateGrade(course);
	return course;
};

const updateCourse = (
	course: Course,
	assignmentId: number,
	update: string,
	val: number
): Course => {
	if(!course.assignments[assignmentId].included){return course;}
	if (update === "earned") {
		if (val < 0) val = 0;
		course.assignments[assignmentId].points.earned = val;
	} else if (update === "possible") {
		if (val < 0) val = 0;
		course.assignments[assignmentId].points.possible = val;
	}
	let categoryId = course.categories.findIndex(
		(category) => category.name === course.assignments[assignmentId].category
	);

		const gradingScale=course.settings;
	const places=gradingScale.rounding.percent===true ? gradingScale.rounding.percentPlaces : (gradingScale.rounding.percent===false ? false : 2)
	//update assignment grade
	course.assignments[assignmentId].grade.raw = places!=false ? parseFloat(
		(
			(course.assignments[assignmentId].points.earned /
				course.assignments[assignmentId].points.possible) *
			100
		).toFixed(places)
	) : (
			(course.assignments[assignmentId].points.earned /
				course.assignments[assignmentId].points.possible) *
			100
		);
	course.assignments[assignmentId].grade.letter = letterGrade(
		course.assignments[assignmentId].grade.raw,course.settings
	);
	course.assignments[assignmentId].grade.color = letterGradeColor(
		course.assignments[assignmentId].grade.letter,course.settings
	);

	//update category grade
	course = calculateCategory(course, categoryId);

	//update whole course grade
	course = calculateGrade(course);
	return course;
};


function reCalculateCourse(course:Course){
 
	for(let assignment of course.assignments){
		assignment.grade.letter=letterGrade(assignment.grade.raw,course.settings)
		assignment.grade.color=letterGradeColor(assignment.grade.letter,course.settings)
	}
	for(let i=0;i<course.categories.length;i++){
		course=calculateCategory(course,i)
	}

	course=calculateGrade(course)
	return course
}

function abbreviate(category) {
    category = category.toUpperCase();
    var separator;

    if (category.includes(" ")) {
        separator = " ";
    } else if (category.includes("/")) {
        separator = "/";
    } else {
        // Remove vowels only if they are not the first character in the string
        ["A", "E", "I", "O", "U"].forEach((vowel) => {
            category = category.replaceAll(
                new RegExp(`(?<!^)${vowel}`, 'g'),
                ""
            );
        });
        return category;
    }
    const words = category.split(separator).filter((word) => word !== "/" && word !== " ");
    return (words[0].trim()[0] + words[1].trim()[0]);
}


		     function calcFinal(categories:Category[],cache:Cache):{letter:string,color:string,raw:number}{


                let realCat=[]
				let currPoints=0
				let currWeight=0
				//console.log(categories,"calc final type shit")
                for(let category of categories){
					if(category.type=="exam"){
						//idk yet chat. synergy might actually have this tracked/trackable so
						//yeah...

					}
					else{
						//@ts-ignore
					if((isNaN(category.courseIndex)||category.courseIndex==null)&&!category.grade){
						continue
					}
					//@ts-ignore
					const grade=category.grade ? category.grade : cache[category.mp].courses[category.courseIndex].grade
                    //@ts-ignore
					if(!Number.isNaN(grade.raw)){
                    realCat.push(category);
					currPoints+=grade.raw*category.weight
					currWeight+=category.weight
 
                    }}
                }
					if(realCat.length==0){return {raw:NaN,letter:"N/A",color:"gray"}}
                console.log("I'm gunna fucking kill myself", currPoints/currWeight,cache[realCat[0].mp].courses[realCat[0].courseIndex].settings)
					const grade ={raw:cache[realCat[0].mp].courses[realCat[0].courseIndex].settings.rounding.percent ? parseFloat((currPoints/currWeight).toFixed(cache[realCat[0].mp].courses[realCat[0].courseIndex].settings.rounding.percentPlaces)) : currPoints/currWeight,
					letter:letterGrade(currPoints/currWeight,cache[realCat[0].mp].courses[realCat[0].courseIndex].settings),
					color:letterGradeColor(letterGrade(currPoints/currWeight,cache[realCat[0].mp].courses[realCat[0].courseIndex].settings),cache[realCat[0].mp].courses[realCat[0].courseIndex].settings)}
			//	console.log(grade)
				return grade
            }





export {
	parseGrades,
	updateCourse,
	addAssignment,
	delAssignment,
	updateCategory,
	parseDate,
	templateFinals,
	genTable,
	calcFinal,
	findCurrentPeriod,
//	calculateGPA,
//	updateGPA,
	abbreviate,
	reCalculateCourse,reCalculateAll,letterGradeColor,letterGrade,getCache,simplifyWeights,initalizeFinals2
};
export type { Grades, Assignment, Course,Settings,Cache,CourseSettings,GlobalSettings,Finals };
