import React,{useState,useEffect} from "react";
import {Modal} from "flowbite-react"
import { HiOutlineTrash,HiArrowCircleRight, HiArrowCircleDown } from "react-icons/hi";
import { reCalculateAll,parseGrades,letterGradeColor} from "../utils/grades";
import {colorShit} from "./colors"
import {gradingScale} from "../utils/grades"
import { count } from "console";
import {gradesCache} from "../utils/tempCache"
import GradeField from "./GradeField";

/*

I'm thinkin:

Letter grade bounds / grades   (mayyybe colors, but I'd rather infer)

Category names and weights (sawwy can't auto detect this...)

Rounding rules (checkbox system)

gpa and final exam stuff can happen laterrrrrrrr
*/
 


//TODO: finish modal, determine means of retroactive application, determine if it's necessarry to await the settings fetch at the very beginning, decide a format for storage of 
//this shi


/*
Okay, at this point, what's up is thus:
need to add rounding part of modal,
need to add the checks and shit for the save function

need to unify the format and pick a primary one for the gradingScale object

unify accross: on courses attribute, in grades.ts, and on backend,

need to implement settings fetch in initial gradebook fetch via extraData

need to implement fallback if gradebook settings fetch fails

need to implement save-settings fetch


*/

export default function SettingsModal({client,index,showModal,setShowModal,grades,setGrades,createError}){
    	  const course = index==-1 ? {name:"default",teacher:{name:""},period:""} : grades?.courses[parseInt(index)];
        const [letterScale,setLetterScale]=useState<gradingScale["letterScale"]>(index!=-1 ? (grades?.courses[parseInt(index)].gradingScale?.letterScale || undefined) : grades?.gradingScales.default.letterScale)
        const [rounding,setRounding]=useState<gradingScale["rounding"]>(index!=-1 ? (grades?.courses[parseInt(index)].gradingScale?.rounding || undefined) : grades?.gradingScales.default.rounding)
        const [active,setActive]=useState<[string,string]>(['',''])
        const [advancedOpen,setAdvancedOpen]=useState(false)
        const [decimalPlaces,setDecimalPlaces]=useState(undefined)

        //these next several will get folded into settings object or smthn later, just testin
        const [showFinal,setShowFinal]=useState(true) //this will become a part of the settings object or smthn
        const [type,setType]=useState("course") //
        const [period,setPeriod]=useState(0)

      console.log("quick output",gradesCache)


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
        
        const newScale = {
  rounding: rounding,
  letterScale: [...letterScale].sort((a, b) => a[1][1] - b[1][1]).reverse()
};
        const augmentedGrades=structuredClone(grades)
        augmentedGrades.gradingScales[course.name+course.period+course.teacher.name]=newScale

    const result=await setSettings(client.district,client.username,client.encrypted,client.password,augmentedGrades.gradingScales)
    if(result.status){
        console.log("success")
        
    


        setGrades(reCalculateAll(augmentedGrades))
        setShowModal(false)


    }
    else{
        console.log(result)
        createError("Failed to sync settings with server, try again?")
    }


    }
    else{
       
        createError("Malformed Scale")
    }


}



async function reset(allClasses=false,field="letter"){
  if(index==-1&&!allClasses){
  const result=await getSettings(client.district,"pleaseGodLetNobodySomehowMagicallyHashToThisHashOrItBreaks")
  if(result.status){
    const countyDefault=result.settings.default;
    console.log("success")
    let temp=structuredClone(grades)
    temp.gradingScales.default=countyDefault
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
     
      temp.gradingScales={default:grades.gradingScales.default}
 
    }
    else{
    delete temp.gradingScales[course.name+course.period+course.teacher.name]
    }

    if(allClasses){
    const result = await setSettings(client.district,client.username,client.encrypted,client.password,temp.gradingScales)
    if(result.status){
        console.log("success")
       
    setLetterScale(grades.gradingScales.default.letterScale)
    setGrades(reCalculateAll(temp))
    setShowModal(false)
  }
  else{
    createError("Failed to set settings")
  }
    }
    else{
      if(field=="letter"){
      setLetterScale(grades.gradingScales.default.letterScale)}
      else{
        setRounding(grades.gradingScales.default.rounding)
      }
    }
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
style={{maxHeight:500}}
className="overflow-y-auto"
>
  <h1 className="mb-4 text-xl font-bold text-white">Letter Scale</h1>

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
        onClick={()=>{reset()}}
      >
        {index==-1 ? "Show Defaults" : "Show Defaults"} 
      </button>

      </div> 

    

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
        onClick={()=>{reset(false,"rounding")}}
      >
       Reset
      </button>
  </div>

</details>


{
  //i think i might make it an accordion component now that I'm setting more and more settings
}


<div>
  <p className="dark:text-white font-bold mt-4  mb-2 text-xl">Final Grade</p>
    <div className="ml-2">
    <div style={{alignItems:"center"}} className="flex gap-2">
        <p className="dark:text-white">Show Final Grade</p>
        <input type="checkbox" onChange={(e)=>setShowFinal(!showFinal)} checked={showFinal}></input>
    </div>

    <p className="-ml-2 dark:text-white text-lg mt-4">Final Grade Calculation</p>

    {
      //i wanna try doin it with a grid, cuz tables get kinda ass if u need to set width on a text-input
      //like. idk. u can do what the assignments table does and sub in text elements for input elements on click
      //which means layout shift

      //or u can just try to massage the padding till it works like the letter scale table
      //but i think maybe grid would work better
    }

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
        <tr className="bg-gray-900">
          <td 
          style={{textAlign:"center"}}
          >
            <select 
           value={type}
           onChange={(e)=>setType(e.target.value)}
           className="bg-transparent dark:text-white border-0 focus:outline-none focus:ring-0"
            >
              <option className="bg-gray-600" value={"course"}>Course</option>
              <option className="bg-gray-600" value="exam">Exam</option>
            </select>
          </td>

          <td
            style={{textAlign:"center"}}
          >
            <select value={period} onChange={(e)=>{setPeriod(parseInt(e.target.value))}}
              className="bg-transparent dark:text-white border-0 focus:outline-none focus:ring-0"
            >
              {grades.periods.map(p=>(<option className="bg-gray-600" value={p.index}>{p.rawName}</option>))}
            </select>
          </td>

          <td
            style={{textAlign:"center"}}
          >
         
            <select value={0}
              className="bg-transparent dark:text-white border-0 focus:outline-none focus:ring-0"
            >
        {gradesCache[period].courses.map((c,i)=>(
          <option className="bg-gray-600" value={i}>{c.name.trim()}</option>

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
            onChange={()=>{}}
            value={25}
            />
            <p>%</p>
            </div>
   
          </td>
        </tr>

      </tbody>
    </table>
    </div>
     <button className="-ml-2 mt-2 p-2 px-2 bg-primary-500 dark:bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
     onClick={()=>{}}>Add+</button>
   
    </div>
</div>

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
        onClick={()=>{reset(true);setShowModal(false)}}
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