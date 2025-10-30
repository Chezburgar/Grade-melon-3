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
	ordinalSuffix,
	calculateGPA,
	updateGPA,
} from "../../utils/grades";
import { Modal } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import CustomAd from "../../components/customAd";
import { BsGearWideConnected } from "react-icons/bs";
import SettingsModal from "../../components/settingsModal"
import StudentVue from "studentvue";
import {getGradebooks} from "../../utils/soap"
import Grades from "../../components/GradesPage"
import { HiArrowCircleLeft, HiArrowCircleRight } from "react-icons/hi";


interface SchoolsListType{
		mp:number,
		cache:Cache,
		name?:string
	}


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
    modalBg:boolean;
    setModalBg:(b:boolean)=>void;
    settingsModal:boolean;
    setSettingsModal:(b:boolean)=>void;
    schoolsList:SchoolsListType[],
    setSchoolsList:any
    schoolIndex:number,
    setSchoolIndex:any
}



export default function GradesWrapper({
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
    width,modalBg,setModalBg,setSettingsModal,settingsModal,schoolsList,setSchoolsList,schoolIndex,setSchoolIndex
}: GradesProps) {
    const router = useRouter();
    const [viewStack,setViewStack]=useState() //wait no they can't exist in unison lmao. they're all tied to these global states.


function switchSchool(increment){
    if((schoolIndex==0&&increment<0)||(schoolIndex==schoolsList.length-1&&increment>0)){return}
    else{
    const index=schoolIndex+increment
    const school=schoolsList[index]
    setGrades(school.cache)
    setMP(school.mp)
    setSchoolIndex(index)
    }
}

    if(schoolsList){
        return(

            <div className="">
                <div className="flex justify-between flex-shrink px-5 md:px-11">
                    <button className="dark:text-white text-lg" onClick={()=>switchSchool(-1)}><HiArrowCircleLeft size={25}/></button>
                    <p className="dark:text-white font-semibold">{schoolsList[schoolIndex].name}</p>
                    <button className="dark:text-white text-lg" onClick={()=>switchSchool(1)}><HiArrowCircleRight size={25}/></button>
                </div>

    
                <Grades client={client} grades={grades} setGrades={setGrades} mp={mp} setMP={setMP} createError={createError} ad={ad} setAd={setAd} setTime={setTime} timestamp={timestamp} width={width} modalBg={modalBg} setModalBg={setModalBg} settingsModal={settingsModal} setSettingsModal={setSettingsModal}/>
    
         

            </div>
        )




    }else{
        return <Grades client={client} grades={grades} setGrades={setGrades} mp={mp} setMP={setMP} createError={createError} ad={ad} setAd={setAd} setTime={setTime} timestamp={timestamp} width={width} modalBg={modalBg} setModalBg={setModalBg} settingsModal={settingsModal} setSettingsModal={setSettingsModal}/>
    }

}