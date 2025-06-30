import {Grades,gradingScale,parseGrades} from "./grades"
import StudentVue from "studentvue"

//public class Client extends StudentVue.Soap.Client  | work on making this an actual tie in later
var Client:any;
var endpointUrl:string;


//function for that intial fetch at the beninging. 
async function getGradebooks(reportPeriods:string[][]=[[null,undefined]]){ //error at this level will not be caught. Callers should be prepared to use .catch
    //client.gradebook reworked to just return the xml for the requests
    const xmls=reportPeriods.map(reportPeriod_OrgYear=>Client.gradebook.soap(reportPeriod_OrgYear[0],reportPeriod_OrgYear[1] != undefined ? reportPeriod_OrgYear[1] : null))

    const results=await gradebookFetch(xmls,true)
    const responses=results.responses
    const gradingScales=results.extraData.gradingScales
    const grades=responses.map(raw=>Client.gradebook.parse(raw)) //gunna wanna rework the parsing logic in addition the actual restructuring. needs to be more robust. remove any chacne of runtime errors. use zod to attempt type coercsion. pray.
    grades.map(grade=>{grade.gradingScales=gradingScales;return grade})

    const parsedGrades:Grades[]=grades.map(grade=>parseGrades(grade))
    let cache={}
    for(let parsed of parsedGrades){
        cache[String(parsed.period.index)]=parsed;
    }
    Client.gradebook.cache=cache
    return parsedGrades;
}




async function gradebookFetch(xmls,getGradeScale=false){
    try{
    const results= await( await fetch(endpointUrl+"/fulfillAxios",{
            headers:{"content-type":"application/json"},
            method:"POST",
            body:JSON.stringify({xmls:xmls,encrypted:Client.encrypted,getGradeScale:getGradeScale,url:Client.url})
        
        })).json()

    if(!results.status){throw new Error(results.message)}
    delete results.status;
    return results



    }catch(e){
        console.log("error in fetch to proxy",e.message)
        throw new Error("proxy error")
    }
}