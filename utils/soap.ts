import {Grades,gradingScale,parseGrades} from "./grades"
import {Client as C} from "studentvue"




class Client extends C{

    
    constructor(credentials: any, proxyUrl:string,hostUrl: string) {
    super(credentials,proxyUrl,hostUrl);
  }
        cache={gradebooks:undefined}
    


//function for that intial fetch at the beninging. 
public async getGradebooks(reportPeriods:[[number,string]]=[[null,undefined]]){ //error at this level will not be caught. Callers should be prepared to use .catch
    //client.gradebook reworked to just return the xml for the requests
    const xmls=reportPeriods.map(reportPeriod_OrgYear=>this.gradebook(reportPeriod_OrgYear[0][0],reportPeriod_OrgYear[1] != undefined ? reportPeriod_OrgYear[1] : null))

    //@ts-ignore
    const results=await this.gradebookFetch(xmls,true)
    const responses=results.responses
    const gradingScales=results.extraData.gradingScales
    const grades=responses.map((raw,i)=>this.gradebook.parse(raw,reportPeriods[i][0])) //gunna wanna rework the parsing logic in addition the actual restructuring. needs to be more robust. remove any chacne of runtime errors. use zod to attempt type coercsion. pray.
    grades.map(grade=>{grade.gradingScales=gradingScales;return grade})

    const parsedGrades:Grades[]=grades.map(grade=>parseGrades(grade))
    let cache={}
    for(let parsed of parsedGrades){
        cache[String(parsed.period.index)]=parsed;
    }
    this.cache.gradebooks=cache
    return parsedGrades;
}




 public async gradebookFetch(xmls:string[],getGradeScale=false){
    try{
    //@ts-ignore
    const results= await( await fetch(this.url+"/fulfillAxios",{
            headers:{"content-type":"application/json"},
            method:"POST",
            //@ts-ignore
            body:JSON.stringify({xmls:xmls,encrypted:this.encrypted,getGradeScale:getGradeScale,url:this.url})
        
        })).json()

    if(!results.status){throw new Error(results.message)}
    delete results.status;
    return results



    }catch(e){
        console.log("error in fetch to proxy",e.message)
        throw new Error("proxy error")
    }
}
}


async function login(districtURL,credentials,proxyUrl){
    const client=new Client(credentials,proxyUrl,districtURL)
    let t = await client.getGradebooks()
    return [client,t]
}



export {Client,login}