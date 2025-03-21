import React, { useState, useEffect,useRef } from "react";
import {useInView} from "../hooks/isVisible";
import Cookies from "js-cookie";

/*


if i wanted to be cheeky and fast, i could get the images of the ads and their names as getStaticProps (use revalidate so it updates every hour) so that only the quick textual data needs be fetched
from the ads server at load time, is that worthwhile? the cost is that advertisers seeking to upload their ads wouldn't see them on demand

orrrrrr, if i wanted to be reallly cheek, i could have it so that I don't go for exact perfect $5 cpm, and instead, just get the ads and all the metadata with 
getStaticProps once an hour or so, that way, 0 fetches need to occur to load the ad for the user...


*/

    const adServer="https://adverts.grademelon.org"


interface props{
    ad:any;
    timestamp:number;
    setAd:(ad:any)=>void;
    setTime:(time:number)=>void;
}

export default function CustomAd({ad,timestamp,setAd,setTime}:props){
    const adRef=useRef(null);
    const visbility=useInView(adRef,{threshold:0.1})
    /*
    const [timestamp,setTime]=useState(0);
    const [ad,setAd]=useState(undefined);
    */




function handleClick(){
    if(ad.url){
    increment("click");
    window.open(ad?.url)};
}
//should i use oicd or just do sum custom auth tokens via the synergyProxy. validate credenetials. only send ads to logged in people. idk. i mean yeah i guess. why not.

function increment(type){
    const token=Cookies.get("token");
    fetch(adServer+"/increment",{
        'method':"POST",
        'headers':{'content-type':'application/json'},
        'body':JSON.stringify({type:type,adId:ad.adId,advertiserId:ad.advertiserId,token:token})

    }).catch(error=>console.log(error))

}

async function getAd(){
    if(localStorage.getItem("infoCache")!=undefined){
        var schoolName:string=JSON.parse(localStorage.getItem("infoCache")).info.currentSchool;
    }
    else{
        var schoolName="default/ALL";
    }

    const response=await fetch(adServer+"/serve?school="+encodeURIComponent(schoolName),{
        method:"GET"
    });
    return await response.json()


}


useEffect(()=>{
    if(ad==undefined){
        getAd().then(res=>{
            setAd(res.ad);
        }).catch(error=>console.log(error))

    }


},[])



useEffect(()=>{
    if(visbility&&Date.now()>=0){ //decided to disable the timestamp thing. it was greedy.
        if(localStorage.getItem("dayViews")==null){localStorage.setItem('dayViews','{time:0,views:0}')} //using localStorage cuz I'm pretty sure chromebooks aren't preserving my cookies
        else if(Math.floor(Date.now()-(1000*60*60*new Date().getTimezoneOffset()))!=JSON.parse(localStorage.getItem("dayViews")).time){localStorage.setItem('dayViews','{time:0,views:0}')}
        if(JSON.parse(localStorage.getItem('dayViews')).views<=5){ //cap each device at 5 views
        increment("view");
        setTime(Date.now());
        let temp=JSON.parse(localStorage.getItem('dayViews'));temp.views++;
        localStorage.setItem('dayViews',JSON.stringify(temp))
        }
    }
    else{console.log(timestamp,visbility)}

},[visbility])


    return(
        <>
        {ad ? (
        <div className="flex justify-center mx-4">
            <img ref={adRef} className="border-2 max-h-96" src={ad.image} onClick={handleClick}/>
        </div>) : (<></>)}
        </>

    )
}