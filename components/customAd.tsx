import React, { useState, useEffect,useRef } from "react";
import {useInView} from "../hooks/isVisible";

/*
if i wanted to be cheeky and fast, i could get the images of the ads and their names as getStaticProps (use revalidate so it updates every hour) so that only the quick textual data needs be fetched
from the ads server at load time, is that worthwhile? the cost is that advertisers seeking to upload their ads wouldn't see them on demand

orrrrrr, if i wanted to be reallly cheek, i could have it so that I don't go for exact perfect $5 cpm, and instead, just get the ads and all the metadata with 
getStaticProps once an hour or so, that way, 0 fetches need to occur to load the ad for the user...


*/

const adServer="ads.grademelon.org" //idk


export default function CustomAd(){
    const adRef=useRef(null);
    const visbility=useInView(adRef,{threshold:0.1})
    const [timestamp,setTime]=useState(0)
    const [ad,setAd]=useState(undefined);




function handleClick(){
    console.log("i handle clicks")
}
//should i use oicd or just do sum custom auth tokens via the synergyProxy. validate credenetials. only send ads to logged in people. idk. i mean yeah i guess. why not.

async function increment(){
    //intentionally obtuse and slow.
    const result=await (await fetch("/api/getToken")).json()
    const token=result.token;
    fetch(adServer+"/increment",{
        'method':"POST",
        'headers':{Authorization: `Bearer ${token}`},
        'body':JSON.stringify({type:ad.type,adId:ad.adId,advertiserId:ad.advertiserId})

    })

}




useEffect(()=>{
    if(ad==undefined){
        fetch(adServer+"/serve",{
            method:"GET"

        })
    }


},[])



useEffect(()=>{
    if(visbility&&Infinity>=timestamp+1000*60){
        increment();
    }
    else{console.log("smthn hinky goin on",timestamp,visbility)}

},[visbility])


    return(
        <div className="flex justify-center mb-2 mx-4">
            <img ref={adRef} className="border-2 max-h-96" src={} onClick={handleClick}/>
        </div>

    )
}