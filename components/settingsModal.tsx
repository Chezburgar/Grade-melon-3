import React,{useState} from "react";
import {Modal} from "flowbite-react"


/*

I'm thinkin:

Letter grade bounds / grades   (mayyybe colors, but I'd rather infer)

Category names and weights (sawwy can't auto detect this...)

Rounding rules (checkbox system)

gpa and final exam stuff can happen laterrrrrrrr
*/
 


//TODO: finish modal, determine means of retroactive application, determine if it's necessarry to await the settings fetch at the very beginning, decide a format for storage of 
//this shi

export default function SettingsModal({client,index,courseSettings,setCourseSettings,showModal,setShowModal,grades,setGrades}){
    	const course = grades?.courses[parseInt(index)];
        const [letterScale,setLetterScale]=useState({})
        if(courseSettings[course.name]===undefined){
            setLetterScale({"A": [89.5,100],"B": [ 79.5,89.49],"C": [69.5, 79.49],"D": [ 59.5, 69.49],"E": [  0, 59.49 ]})
        }
        else{
//not sure how exactly they'd be stored.... but obv, install from there



        }



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




</Modal>






)

}