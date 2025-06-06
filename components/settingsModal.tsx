import React,{useState,useEffect} from "react";
import {Modal} from "flowbite-react"
import { HiOutlineTrash } from "react-icons/hi";


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
What you almost deffinitely wanna do, is rewrite the grades.ts utiltiy to 
accept the final options json we use for the grades settings and to react accordingly 

But then jesus how many places are we storing all this stuff?
Well, we can absolutely fetch and send the settings with the intial gradebook send, just tag it on
to the extraData attribute,

instead of returning empty settings, for empty settings return the defaults from the 
existing system we have now


if we do that, then we have no need for the unified useState object to store the grading scales
we could entirely use the gradingScale attribute attatched to each individual course, and also 
one attatched the the client, also recieved by the intial gradebook fetch or mutated in 
the settings modal 



But, none of this realy has implications on the front end design 


*/

export default function SettingsModal({client,index,showModal,setShowModal,grades,setGrades}){
    	const course = grades?.courses[parseInt(index)];
        const courseSettings=undefined
        const [letterScale,setLetterScale]=useState<any>({"A": [89.5,100],"B": [ 79.5,89.49],"C": [69.5, 79.49],"D": [ 59.5, 69.49],"E": [  0, 59.49 ]})
       
       








useEffect(()=>{
    if(letterScale==undefined&&courseSettings&&false){
            //blah
            return
        }
    
    setLetterScale({"A": [89.5,100],"B": [ 79.5,89.49],"C": [69.5, 79.49],"D": [ 59.5, 69.49],"E": [  0, 59.49 ]})
       


    
},[])

return(
<Modal 
show={showModal}
onClose={()=>setShowModal(false)}
>

<Modal.Header
className="bg-gray-700"

>

Grade Calculation Settings
</Modal.Header>


<Modal.Body>
  <h1 className="mb-4 text-xl font-bold text-white">Letter Scale</h1>

  {/* Grade‑scale table */}
  <div className="overflow-x-auto rounded-lg border border-gray-600">
    {/* 4‑column grid: Letter | Upper | Lower | Delete */}
    <div
      className="
        grid
        grid-cols-[4rem_repeat(2,6rem)_min-content]
        md:grid-cols-[5rem_repeat(2,8rem)_min-content]
        gap-x-4 gap-y-3
        p-3
        mx-auto
        w-fit
      "
    >
      {/* header row */}
      <p className="font-semibold text-white md:text-xl">Letter</p>
      <p className="font-semibold text-white md:text-xl">Upper Bound</p>
      <p className="font-semibold text-white md:text-xl">Lower Bound</p>
      {/* empty cell to align header row with delete column */}
      <span />

      {/* data rows */}
      {Object.keys(letterScale).map((letter) => (
        <React.Fragment key={letter}>
          {/* letter cell */}
          <p className="w-12 rounded-lg bg-gray-800 p-1.5 text-center font-bold text-white md:text-lg">
            {letter}
          </p>

          {/* upper‑bound input */}
          <input
            type="number"
            value={letterScale[letter][0]}
            className="w-16 rounded-lg bg-gray-800 p-1.5 font-bold text-white md:w-24 md:text-lg"
          />

          {/* lower‑bound input */}
          <input
            type="number"
            value={letterScale[letter][1]}
            className="w-16 rounded-lg bg-gray-800 p-1.5 font-bold text-white md:w-24 md:text-lg"
          />

          {/* delete button */}
          <button
            onClick={() => {/* delete logic here */}}
            className="
              flex
              items-center
              gap-1
              rounded-lg
              bg-primary-500
              px-2.5
              py-2.5
              text-xs
              font-medium
              text-white
              hover:bg-primary-600
              focus:outline-none
              focus:ring-4
              focus:ring-primary-300
              dark:bg-primary-600
              dark:hover:bg-primary-700
              dark:focus:ring-primary-800
              sm:text-sm
            "
          >
            <HiOutlineTrash size="1.2rem" />
          </button>
        </React.Fragment>
      ))}
    </div>
  </div>
</Modal.Body>





</Modal>






)

}