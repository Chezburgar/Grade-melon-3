import React,{useState,useEffect} from "react";
import {Modal} from "flowbite-react"
import { HiOutlineTrash,HiArrowCircleRight, HiArrowCircleDown } from "react-icons/hi";
import { reCalculateAll,parseGrades,letterGradeColor, reCalculateCourse} from "../utils/grades";
import {colorShit} from "./colors"
import {Settings,Grades,parseDate,Cache,CourseSettings,templateFinals,GlobalSettings,simplifyWeights,initalizeFinals2} from "../utils/grades"
import { count } from "console";
import GradeField from "./GradeField";
import StudentVue from "studentvue";



/*
//if we still have semester grades that will complicate things. 
/*
I think I'd just make it so that each courseID is strictly correspondant to its own settings
then people can manually input other shit I guess. type shit. 
I'd still use loose courseID's for marking period change mapping u to the same course though I guess


like it very much depends on whether or not we're still gunna have semester grades. I'm gunna 
assume we're not. i'll change it if i'm wrong ig.


We'll presume for now that semester grades are no more

*/



interface props{
  client:Awaited<ReturnType<typeof StudentVue.login>>["client"]
  index:string|-1;
  showModal:boolean;
  setShowModal:(boolean:boolean)=>void;
  grades:Cache;
  setGrades:(grades:Cache)=>void;
  createError:(message:string)=>void;
  period:number
  finals?:any;
  setFinals?:any;

}






export default function SettingsModal({client,index,showModal,setShowModal,grades,setGrades,createError,period}:props){
          const settings= grades?.[0]?.settings
  const course = index==-1 ? {courseID:"default",settings:{finals:undefined},name:"",identifier:""} : grades?.[period]?.courses[parseInt(index)];
        const courseSettings=course.settings
  const [letterScale,setLetterScale]=useState<CourseSettings["letterScale"]>(index!=-1 ? (grades?.[period]?.courses[parseInt(index)].settings?.letterScale || undefined) : settings.default.letterScale)
        const [rounding,setRounding]=useState<CourseSettings["rounding"]>(index!=-1 ? (grades?.[period]?.courses[parseInt(index)].settings?.rounding || undefined) : settings.default.rounding)
        const [active,setActive]=useState<[string,string]>(['',''])
        const [advancedOpen,setAdvancedOpen]=useState(false)
        const [decimalPlaces,setDecimalPlaces]=useState(undefined)
        const [finals,setFinals]=useState(course.settings.finals)
        const [accordion,setAccordion]=useState([index==-1,index!=-1])


      console.log("quick output",finals)


useEffect(()=>{console.log("where's your head at?")
  setLetterScale(index!=-1 ? (grades?.[period]?.courses[parseInt(index)].settings?.letterScale || undefined) : settings.default.letterScale)
  setRounding(index!=-1 ? (grades?.[period]?.courses[parseInt(index)].settings?.rounding || undefined) : settings.default.rounding)
  setFinals(course.settings.finals)    



},[period])


function mutate(e,letter,bound){
    setLetterScale((prev)=>{
        let temp=structuredClone(prev)
        temp[letter][bound]=(e.target.value)
        return temp
    })
}

//lazy
function mutate2(e,letter,bound){
    console.log(e,letter,bound,letterScale)
    setLetterScale((prev)=>{
        let temp=structuredClone(prev)
        temp[letter][1][bound]=parseFloat(e.target.value)
        console.log("i hate u",temp)
        return temp
    })
}

function deleteLetter(letter){
    let temp=structuredClone(letterScale)
    temp=temp.slice(0,letter).concat(temp.slice(letter+1))
    setLetterScale(temp)

}

function addLetter(){
    let temp=structuredClone(letterScale)
    temp=temp.concat([["X",[0,0]]])
    setLetterScale(temp)

}

function addFinalCategory(){
  let temp=structuredClone(finals);

  temp.categories.unshift({mp:grades?.[period]?.period.index,courseIndex:index,weight:0,type:"exam"})
  setFinals(temp)
}


function deleteFinalCategory(index){
  let temp = structuredClone(finals)
  temp.categories.splice(index,1)
  setFinals(temp)

}


//endpoints
const endpointUrl="https://studentvuelib.up.railway.app"

async function getSettings(url,userHash){
   const result= await (await fetch(endpointUrl+"/getSettings",
    {'method':'POST',
      'headers':{'Content-Type':'application/json'},
      'body':JSON.stringify({url:url,userHash:userHash})}
  )).json()

  return result
}


async function setSettings(url, userHash,encrypted,passHash,settings){
      const result = await (await fetch(endpointUrl+"/setSettings",{
            'method':'POST',
            'headers':{'Content-Type':'application/json'},
            'body':JSON.stringify({url:url,userHash:userHash,encrypted:encrypted,passHash:passHash,settings:settings})
        })).json()
    return result
}


async function saveNew(){
  
    if(validate()){
        
        const newScale:CourseSettings | any = {
  finals:{...finals,categories:simplifyWeights(finals.categories).sort((a,b)=>a.mp-b.mp)},
  rounding: rounding,
  letterScale: [...letterScale].sort((a, b) => a[1][1] - b[1][1]).reverse() //need to ad shi for the new shi type shi
};
        const tempGrades=structuredClone(grades)
        const tempSettings=structuredClone(settings)

        //now we examine, did shi really change? is shi rlly diff?
      


        if(index!=-1){
            //finals
          let flag=true
        for(let key in tempSettings.default.finals){
            if(JSON.stringify(tempSettings.default.finals[key])!=JSON.stringify(finals[key])){
              flag=false;
            }
          }
          if(flag){
            newScale.finals=false;
          }
        





        //letterScale
        if(JSON.stringify(tempSettings.default.letterScale)==JSON.stringify(newScale.letterScale)){
          newScale.letterScale=false; //fuck off mate
        }
      
        //rounding
        if(JSON.stringify(rounding)==JSON.stringify(tempSettings.default.rounding)){
          newScale.rounding=false
        }



}






        tempSettings[course.identifier]=newScale //cause fuck ur manual mode

    const result=await setSettings(client.district,client.username,client.encrypted,client.password,tempSettings)
    if(result.status){
        console.log("success")
       

        //oh boy. new runtime settings!!! basically need to recalculate and parse everything.


        	for(let key in tempSettings){
		        if(key=="default"||key=="mode"){continue}
		        else{
			    for(let prop in tempSettings[key]){
				    if(tempSettings[key][prop]==false){
					    tempSettings[key][prop]=tempSettings.default[prop] //fallback to default if a class's settings props are set to false
				}
			}
		}
		tempSettings[key]=initalizeFinals2(grades,tempSettings,key)
	}
       console.log(tempSettings,"sigh a million sighs")
        for(let grade of tempGrades){
            grade.settings=tempSettings
            for(let ncourse of grade.courses){
              //our settings obj isn't raw here so we actually have much less processing to do
              if(!tempSettings[ncourse.identifier]){ //fuck your manual mode, for now
                ncourse.settings=initalizeFinals2(grades,tempSettings,ncourse.identifier)
              }
              else{ncourse.settings=tempSettings[ncourse.identifier]} //fuck ur manual mode
              
              ncourse=reCalculateCourse(ncourse)
            }
        }

      const ham=index!=-1 ? tempGrades[period].courses[index].settings : tempSettings.default
      setLetterScale(ham.letterScale)
      setRounding(ham.rounding)
      setFinals(ham.finals)
      setGrades(tempGrades)
      setShowModal(false)


    }
    else{
        console.log(result)
        createError("Failed to sync settings with server, try again?")
    }


    }
    else{
       
        createError("Malformed Grading Scale")
    }


}



function resetFinals(){
  setFinals(grades[period].courses[index].settings.finals);


}




/*
async function reset(allClasses=false,field="letter"){ //god I should really spereate this out into different functions jesus christ
  if(index==-1&&!allClasses){
  const result=await getSettings(client.district,"pleaseGodLetNobodySomehowMagicallyHashToThisHashOrItBreaks")
  if(result.status){
    const countyDefault=result.settings.default;
    console.log("success")
    let temp=structuredClone(grades)
    temp.settings.default=countyDefault
    if(field=="letter"){
    setLetterScale(countyDefault.letterScale)
    }
    else if(field=="rounding"){
    setRounding(countyDefault.rounding)
    setDecimalPlaces(undefined)
    }

  }
  else{
    createError("Failed to retrieve default settings")
  }





  }
  else{
    let temp=structuredClone(grades)
    if(allClasses){
      for(let key in temp.settings){
        if(key=="default"){continue} //this is NOT scalable. could at least ad a "global" flag or something oh my god
        temp.settings[key].rounding=undefined
        temp.settings[key].letterScale=undefined
      }


 
    }
    else{
      //this is a dumb ah solution to globals. dumb ah. u can feel the pain in his 
    temp.settings[course.courseID.substring(0,course.courseID.length-1)] = {...temp.settings[course.courseID.substring(0,course.courseID.length-1)],letterScale:undefined,rounding:undefined}
    }

    if(allClasses){
    const result = await setSettings(client.district,client.username,client.encrypted,client.password,temp.settings)
    if(result.status){
        console.log("success")
       
    setLetterScale(grades.settings.default.letterScale)
    let m:any=temp.map(grades=>reCalculateAll(grades,temp.settings))
    m.settings=temp.settings

    setGrades(m)
    setShowModal(false)
  }
  else{
    createError("Failed to set settings")
  }
    }
    else{
      if(field=="letter"){
      setLetterScale(grades.settings.default.letterScale)}
      else{
        setRounding(grades.settings.default.rounding)
      }
    }
}
}


*/










function showDefaults(field){
  if(index!=-1){
    //@ts-ignore
    let hoopDreams=initalizeFinals2(grades,{mode:settings.mode,"default":settings.default},course.identifier).finals
 const template={...settings.default,finals:hoopDreams}
    if(field=="finals"){
      console.log(template["finals"],"rock lobster")
      setFinals(template["finals"])
    }
    else if(field=="letter"){
      setLetterScale(template["letterScale"])

    }
    else if(field=="rounding"){
      setRounding(template["rounding"])
    }
  }
  else{

  }


}



function validate(){
    console.log("spongebob my boy what the fuck is up")
    let temp=structuredClone(letterScale)
    for(var i=0;i<temp.length;i++){
        temp[i][1].sort()

    }

    //consisteny of order
    const raw=temp.map(letter=>letter[1]).flat().sort((a, b) => a - b)
    for(var i=raw.length-1;i>1;i-=2){
        if(temp.findIndex(letter=>letter[1].includes(raw[i]))!=temp.findIndex(letter=>letter[1].includes(raw[i-1]))){
            console.log("failed consitency of order",i,raw,temp.findIndex(letter=>letter[1].includes(raw[i])),temp.findIndex(letter=>letter[1].includes(raw[i-1])))
 
            return false
        }

    }

    //duplicate check
    if(hasDuplicatesSorted(raw)){console.log("failed duplicate check");return false}

 

    return true;
}

//helper function, most efficient
function hasDuplicatesSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) return true;
  }
  return false;





}




 

return(
<div>
{letterScale!=undefined ? (
<Modal 
show={showModal}
onClose={()=>setShowModal(false)}
>

<Modal.Header
className="dark:bg-gray-700"

>

<h1 className="text-2xl">Grade Calculation Settings <span style={{textOverflow:"ellipsis"}}  className="text-sm">{course.name}</span></h1>
{index==-1 && <p className="text-sm">Changes here will be the default for all your classes!</p>}
</Modal.Header>


<Modal.Body
style={{maxHeight:500,minHeight:500}}
className="overflow-y-auto"
>
  {
    //Letter Scale
  }
  <details
  open={accordion[0]}
  >
  <summary 
  className="mb-4 text-xl font-bold text-white"
    onClick={(e)=>{
    e.preventDefault()
    let temp=structuredClone(accordion)
    temp[0]=!accordion[0]
    setAccordion(temp)
  }}
  >Letter Scale</summary>

  <div className="w-full flex justify-center overflow-x-auto rounded-lg border border-gray-600">
    <table className="flex-1 mx-auto min-w-max text-left">
      {/* ── header ─────────────────────────────────────────── */}
      <thead>
        <tr className="text-white md:text-xl dark:bg-slate-700">
          <th className="px-4 py-2 font-semibold text-black dark:text-white">Letter</th>
          <th className="px-4 py-2 font-semibold text-black dark:text-white">Lower</th>
          <th className="px-4 py-2 font-semibold text-black dark:text-white">Upper</th>
          {/* empty heading to keep the delete column aligned */}
          <th className="px-4 py-2" />
        </tr>
      </thead>

      {/* ── body ───────────────────────────────────────────── */}
      <tbody>
        {letterScale.map((letter,i) => (
          <tr
            key={`${i}--23`}
            className={i % 2 === 0 ? "bg-neutral-100 dark:bg-gray-900" : "dark:bg-gray-800"}
          >
            {/* letter cell */}
            <td className="px-4 py-2">
              <div style={{alignItems:"center"}} className="flex">
              <input 
              type="text"
               key={`${i}-0`}
              value ={active[0]==`${i}-0` ? active[1] : letter[0]}
              onChange={(e)=>{
                    setActive([`${i}-0`,e.target.value])



              }}    


              onBlur={
                (e)=>{
                    setActive(['',''])
                    mutate(e,i,0)}
              }
              style={{borderWidth:0,textOverflow:"ellipsis"}}
              className="w-12 text-center font-bold bg-transparent dark:text-white md:text-lg  ">
                
              </input>
              <input
              className="w-6 bg-transparent"
              type="color"
              key={`${i}-0.5`}
              value={active[0]==`${i}-0.5` ? active[1] : (letter[2] || colorShit[letterGradeColor(letter[0])])}
                    onChange={(e)=>{
                    setActive([`${i}-0.5`,e.target.value])



              }}    

              onBlur={(e)=>{
                setActive(['',''])
                mutate(e,i,2)
              }}
              >
              
              </input>
              </div>
            </td>

            {/* upper‑bound input */}
            <td className="px-4 py-2">
              <input
                type="number"
                key={`${i}-1`}
                value={   active[0]==`${i}-1` ? active[1] : letter[1][0]}
                onBlur={(e) => {
                               setActive(['',''])
                  mutate2(e,i,0)
                }}

                 onChange={(e)=>{
                        setActive([`${i}-1`,e.target.value])



              }}    
                className="
                  w-16 md:w-24
                  rounded-lg
                  bg-transparent
                  p-1.5
                  font-bold
                  dark:text-white
                  text-right
                  outline-none
                  border border-gray-300  focus:ring-primary-600 focus:border-primary-600   dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500
                "
              />
            </td>

            {/* lower‑bound input */}
            <td className="px-4 py-2">
              <input
                type="number"
                value={   active[0]==`${i}-2` ? active[1] : letter[1][1]}
                 key={`${i}-2`}
                onBlur={(e) => {
                               setActive(['',''])
                    mutate2(e,i,1)
                }}

                 onChange={(e)=>{
                        setActive([`${i}-2`,e.target.value])



              }}    
                className="
                  w-16 md:w-24
                  rounded-lg
                  bg-transparent
                  p-1.5
                  font-bold
                  dark:text-white
                  text-right
                  outline-none
                  border border-gray-300  focus:ring-primary-600 focus:border-primary-600   dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500
                "
              />
            </td>

            {/* delete button */}
            <td className="px-4 py-2">
              <button
                onClick={() => {
                  deleteLetter(i)
                }}
                className="
                  flex items-center gap-1
                  rounded-lg bg-primary-500
                  px-2.5 py-2.5
                  text-xs font-medium text-white
                  hover:bg-primary-600
                  focus:outline-none focus:ring-4 focus:ring-primary-300
                  dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800
                  sm:text-sm
                "
              >
                <HiOutlineTrash size="1.2rem" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
 <div className="flex   mt-2 justify-between">
    <button className="p-2 px-2 md:text-base bg-primary-500 dark:bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={addLetter}>Add+</button>
      <button
        type="button"
        className="text-white md:p-2 md:text-base bg-primary-600 hover:bg-primary-800 active:bg-primary-500 px-3 py-1 rounded-lg text-sm"
        style={{}}
        onClick={()=>{showDefaults("letter")}}
      >
        {"Show Defaults"} 
      </button>

      </div> 

    
{
  //advanced letter scale
}
<details
className="hideCarat"
onToggle={()=>setAdvancedOpen(!advancedOpen)}
>
  <summary
  className="mt-2 dark:text-white flex items-center"
  >{advancedOpen ? <HiArrowCircleDown size={20}/>: <HiArrowCircleRight size={20}/>}<p className="dark:text-white text-lg">Advanced</p></summary>

  <div className="ml-7 flex-col md:flex-row"> 
    <div style={{alignItems:"center"}} className="flex gap-2">
        <p className="dark:text-white">Rounding Enabled</p>
        <input type="checkbox" onChange={(e)=>{setRounding((prev)=>{
          let temp=structuredClone(prev)
          temp.percent=!temp.percent;
          return temp

        })}} checked={rounding.percent}></input>
    </div>
    <div style={{alignItems:"center"}} className="mt-3 flex gap-2">
        <p className="dark:text-white">Round up to:</p>
        <input className="hide-spinner w-10 h-5 rounded-lg bg-neutral-100 dark:bg-gray-600 dark:text-white"  step="1" type="number" 
        onBlur={(e)=>setRounding((prev)=>{
          let temp=structuredClone(prev);temp.percentPlaces=decimalPlaces;return temp})} 
          onChange={(e)=>setDecimalPlaces(parseInt(e.target.value))} value={decimalPlaces ?? rounding.percentPlaces}/>
        <p className="dark:text-white">decimal places</p>
    </div>
    {
  /*  <div style={{alignItems:"center"}} className="mt-3 flex gap-3  justify-center -ml-7">
        <div  style={{alignItems:"center"}} className="flex gap-2"> <p className="dark:text-white text-sm">Round Up</p> <input   type="radio"></input></div>
        <div style={{alignItems:"center"}} className="flex gap-2"> <p className="dark:text-white text-sm">Round Down</p> <input   type="radio"></input></div>
    </div> */
}

        <button
        type="button"
        className=" mt-2 py-1 text-white px-2 bg-primary-600 hover:bg-primary-800 active:bg-primary-500 rounded-lg text-sm"
        style={{}}
        onClick={()=>{showDefaults("rounding")}}
      >
       Reset
      </button>
  </div>

</details>
</details>


{
 //Final Grade
}

{ index!=-1 &&
<details
  open={accordion[1]}
>
  <summary 
  className="dark:text-white font-bold mt-4  mb-2 text-xl"
    onClick={(e)=>{
    e.preventDefault()
    let temp=structuredClone(accordion)
    temp[1]=!accordion[1]
    setAccordion(temp)
  }}
  >Final Grade</summary>
    <div className="ml-2">
    <div style={{alignItems:"center"}} className="flex gap-2">
        <p className="dark:text-white">Show Final Grade</p>
        <input type="checkbox" onChange={(e)=>{
          let temp=structuredClone(finals)
          temp.show=!temp.show
          setFinals(temp)

        }} checked={finals.show}></input>
    </div>
{
  /*
    <div style={{alignItems:"center"}} className="mt-2 flex gap-2">
        <p className="dark:text-white">Single Semester Class?</p>
        <input type="checkbox" onChange={(e)=>{
          let temp=structuredClone(finals)
          temp.isSemester=!temp.isSemester
          setFinals(temp)

        }} checked={finals.isSemester}></input>
    </div>
    */
}
    

    <p className="-ml-2 dark:text-white text-lg mt-4">Final Grade Categories</p>



    <div
      className="border-gray-600 rounded-lg border mt-2 overflow-x-auto -ml-2"
    >
    <table 
    className="w-full">
      <thead>
        <tr className="dark:bg-slate-700">
          <th          style={{textAlign:"center"}} className="py-2 dark:text-white">Type</th>
          <th          style={{textAlign:"center"}} className="py-2 dark:text-white">Marking Period</th>
          <th          style={{textAlign:"center"}} className="py-2 dark:text-white">Course</th>
          <th          style={{textAlign:"center"}} className="py-2 pr-4 dark:text-white">Weight</th>
        </tr>
      </thead>
      
  
      <tbody>
       

       {finals.categories.map((f,i)=>(
        <>
        <tr className={`bg-gray-${i%2==0 ? "800" : 
          "900"
        }`}>
          <td 
          style={{textAlign:"center"}}
          >

                {
            //temporarily doing this really stupidly
           }
            <select 
           value={f.type}
           onChange={(e)=>{
            let temp=structuredClone(finals)
            temp.categories[i].type==e.target.value
            setFinals(temp)

           }}
           className="bg-transparent dark:text-white border-0 focus:outline-none focus:ring-0"
            >
              <option className="bg-gray-600" value={"course"}>Course</option>
              <option className="bg-gray-600" value="exam">Exam</option>
            </select>

                

          </td>

          <td
            style={{textAlign:"center"}}
          >
            <select value={f.mp} onChange={(e)=>{
              let temp=structuredClone(finals)
              temp.categories[i].mp=parseInt(e.target.value)
              const index=grades[parseInt(e.target.value)].courses.findIndex(c=>c.identifier==course.identifier)
              temp.categories[i].courseIndex=index!=-1 ? index : NaN
              let t=temp.categories[i]
              setFinals(temp)

            }}
              className="bg-transparent dark:text-white border-0 focus:outline-none focus:ring-0"
            >
              {grades?.[period]?.periods.map(p=>(<option className="bg-gray-600" value={p.index}>{p.name}</option>))}
            </select>
          </td>

          <td
            style={{textAlign:"center"}}
          >
         
            <select value={f.courseIndex}
            disabled={settings.mode=="automatic"}
              className="bg-transparent dark:text-white border-0 focus:outline-none focus:ring-0"
              onChange={(e)=>{
                let temp=structuredClone(finals)
                temp.categories[i].courseIndex=parseInt(e.target.value)
                let t=temp.categories[i]
                setFinals(temp)

              }}
            >
        <option className="bg-gray-600" value={NaN}>Auto/Unknown</option>
        {grades[f.mp].courses.map((c,j)=>(
          <option className="bg-gray-600" value={j}>{c.name.trim()}</option>

        ))}
            
            </select>
            
            
          </td>

          <td
            style={{textAlign:"center"}}
          >
            <div
              className="text-center dark:text-white flex items-center"
            >
            <GradeField
            onChange={(e)=>{}}
            onBlur={(e)=>{
              let temp=structuredClone(finals)
              temp.categories[i].weight=parseFloat(e.target.value)/100
              setFinals(temp)
            }}
            value={Number((f.weight*100).toFixed(4))}
            />
            <p>%</p>
            </div>
   
          </td>
        </tr>


        <tr className={`bg-gray-${i%2==0 ? "800" : "900"}`}>
        <td colSpan={4}>
           <button
                onClick={() => {deleteFinalCategory(i)}}
                className="
                  flex items-center gap-1 ml-2 -mt-1 mb-1
                  rounded-lg bg-primary-500
                  text-xs font-medium text-white
                  hover:bg-primary-600
                  px-1
                  focus:outline-none focus:ring-4 focus:ring-primary-300
                  dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800
                  sm:text-sm
                "
              >
                <p className="dark:text-white">Delete</p>
              </button>
        </td>

        </tr>
        </>
))}

      </tbody>
    </table>
    </div>
    <div className="flex justify-between">
     <button className="-ml-2 mt-2 p-2 px-2 bg-primary-500 dark:bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
     onClick={()=>{addFinalCategory()}}>Add+</button>
   
       <button className="-ml-2 mt-2 p-2 px-2 bg-primary-500 dark:bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
     onClick={()=>{showDefaults("finals")}}>Show Defaults</button>
   


   </div>
    </div>

</details>}

</Modal.Body>



<Modal.Footer>
<div className="-ml-2 w-full flex justify-start gap-5">
      <button 
      className="text-white text-sm md:text-base hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 bg-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 p-2 px-3 rounded-lg"
      onClick={()=>{saveNew();}}
      
      >
        Save
      </button>

     <button className="text-white  md:text-base bg-gray-500 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-900 p-2 px-3 rounded-lg text-sm"
      type="button"
      style={{userSelect:"none"}}
      onClick={()=>{
//not yet cuz the structure doesn't match yet, but, setLetterGrade(course.gradingScale)
        setShowModal(false)

      }}
      >Cancel</button>


    

      {index ==-1 &&
          <button
        type="button"
        className="ml-auto -mr-2  md:text-base text-white bg-primary-600 hover:bg-primary-800 active:bg-primary-500 px-2  rounded-lg text-sm"
        style={{}}
        onClick={()=>{setShowModal(false)}}
      >
        Reset Classes
      </button>


      }



</div>


</Modal.Footer>


</Modal>)
: <></>}



</div>


)

}



/*
  
    <table 
    className="w-full">
      <thead>
        <tr className="dark:bg-slate-700">
          <th className="py-2 dark:text-white">Type</th>
          <th className="py-2 dark:text-white">Marking Period</th>
          <th className="py-2 dark:text-white">Name</th>
          <th className="py-2 dark:text-white">Weight</th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-gray-900">
          <td>
           <select 
           value="course"
           className="bg-transparent dark:text-white"
           >
              <option value={"course"}>Course</option>
              <option value="exam">Exam</option>
           </select>
          </td>

          <td>
             <select value={grades.period.index}
              className="bg-transparent dark:text-white"
             >
              {grades.periods.map(p=>(<option value={p.index}>{p.rawName}</option>))}
            </select>
          </td>

          <td>
            <input
              className="bg-transparent text-elipses w-12 dark:text-white"
              value={"my course"}
            />
            
          </td>

          <td>
            <input
            className="bg-transparent text-elipses w-5 border-0 dark:text-white"
            type="number"
            value={25}

            />

          </td>


        </tr>
      </tbody>
    </table>
    */