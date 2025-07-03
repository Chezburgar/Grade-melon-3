//exclusively for testing purposes b4 i write the fetch logic
import {Grades,} from "./grades"


interface gradesCache{
    grades:Grades[],
    gradingScales:Grades["gradingScales"],
    finalGrades:any[]
}


interface final{ //this will probably be baked into gradingScale which may be refactored to just be "settings" soon
    //shouldn't need a class identifier cause it would be exclusive to the class-specific ones wouldn't it..., unless, it's to be said they all have one..., Ah. I see...
    //so, it would remain the same system. a global exists, but the courses always reference their own settings obj, it's just that, their own settings obj will always
    //match exactly the global unless set explicitly otherwise. makes sense

    //waiiiiiiiiit, but shiii twin. we need to make the settings semester-locked instead of quarter locked GRah. I mean. For NOW, 
    //since the name scheme derives from like teacher+course name + period, 4 most schools thats probably indeed semester-wise, but still, we ought to uhhhh, make 
    //some adjustments I reckon. 
    name:"final" | string,
    periods:{period:Grades["period"],weight:number,courseIndex?:number}[] //
    exam?:{period:Grades["period"],weight:number}


}


const gradesCache:gradesCache={
    grades:grades,
    gradingScales:grades[0].gradingScales,
    finalGrades:()=>{
        let m = structuredClone(grades[0].gradingScales)
        //WE SHALL CHANGE SETTINGS NAME SCHEME TO USE COURSE ID prop, we shall ASSUME that if within a course's SETTINGS, including the GLOBAL if none are set,
        //that if a final is referenced derived from mp's x-y, than the course DOES exist in Mp's x-y, and we will ATTEMPT to locate it via the CourseID, failing that,
        //THE NAME, failing that, the UNDEFINED CASE
        //we WILL create an option in settings to set NOT JUST THE MP's from which the FINAL is derived, but to also select MANUALLY the COURSE. this will then kick in an AUTOMATIC
        //inclusion for whatever different COURSE-ID is included there. this will be HIDDEN in ADVANCED. because one character difference between COURSE ID's should be ENOUGH
        //to account for MOST THINGS, like SEMESTER changes. 
        //in parsedGrades, those courses for whom their is an entry dedicated in gradingScales global for that class/CourseID will be processed FIRST and 
        ///SEPERATELY from those heathenous ones using the GLOBAL. those who use the GLOBAL will attempt to find 4 mp's and AVERAGE them. 
        //the above mentioned modabiltiy features enabling correction as needed
        //MAKE these changes CLEAR in the settings modal MOCK UP
        //those MP's for which there is no cache and/or it is marked UNDEFINED, will be then IGNORED in the final calculation, as they are from the ftuure, but will be INCLUDED
        //for the Optimization modal

        /*
        So. to be clear.

        global gradingScales:
            stores indivudal course settings via the CourseID prop with indeterminate leniency [likely a single char] to account for semeseter diff's in ID. this makes sense and is reasonable. mostly. 
            this lenient CourseID setting will also store a list of finals
            any Mp for the course refernced in the final will be identified via the course ID, obv
            if result undefined / not found for a given MP, this will be shown but ignored in the calc for Final Grade,
            but obviously included for the Optimization. it will be treated like a future grade, not a non-existant one

            obv the process here is that the ones with unique settings get processed first and seperate and the CoureID is given not inferred
            Obv for the rest, cuz finals are global, we will iterate over the OH DEAR GOD. 

            WE will HAVE to create a global list of allllllllll the courses and try to group by lenient CourseID

            cuz otehrwise what r we doing for knowing how many we need to calculate final exam grades for chat...


            like we'd need to make a global list

            in this obj 
            

            call it Courses:{ENG101*:} * is wildcard type shit. we iterate over THIS.
            
            if a match exists in settings we use that, then proceed from there with usual logic,

            if it must use the global, well, then god help us,


            we'd go the usual route for how we'd define it i guess, we'd in such cases be setting and populating a final exam grade and all,
            but from where will be derived the settings as shown b4 any changes were indedd made good friend and colleague that you are? 

            from runtime. it'll be derived live every time using the same lenient CourseID logic to find the courseIndex and that's what will be displayed.

            Even for those explictly set, unless courseIndex is set explicitly, it'll be derived every time at run-time cuz that makes the most sense


            so. uh. what. UNRESOLVED; 
                                where is this info being derived from for settings modal? we have global finals that align with the global course-list.
                                if the course. uh. okay.
                                each course will do like 

                                <div> fucking bs ass final exam shit {gradesCache.finals[myLenientCourseID] } and if it exists, we show, if it no exist, we show not
                                    the settings will be derived from the fucking gradeScale shit which ahs only chagned to use the lenitientID system but the processing
                                    of what makes it in will ahve already happened in the parseGrades function where that was assigned , but this will not cause any issues
                                    since the same lienince system is appleid for both the moniker that identifies couress that have a final, and couresses for whom a given
                                    gradeScale should apply, as they are, in fact, the same moniker, even if the indivudal course moniker differs

            SO. THE million dolalr question to answer first. Let's sort out by lenient courseID which grade scales apply to who, a list of all courses sorted 
            by lenient courseID, then, we go from there

            //in the modal, the default cuz mcps will be that the final is the average of four marking periods, indexed specifically form what it is I know, each wit weight 25%.
            //also in modal when describnig FINAL grade, there will be an option to describe the existence of a FINAL exam, which will NOT be treated as a seperate course or 
            anytihng, it will be treated like a CATEGORY, stored tho in the final settings shi. only even really used for the gyat damn optimization modal
            //for literally everyone else the default will be there is no default. there is no final in ba-sing-se.
            //too variable...
            //

            this allows it to not be incredibly stupid and also highly dumb. 
            
            like when i say "ignored", i mean, if mp1 = 87, mp2=76, mp3=undefined, mp4=undefined

            we'd do like

            function calcFinal(mps:[score,weight][] type shit){
                let currWeight=0;
                let realMp=[]
                for(let mp of mps){
                    if(Number(mp.score)!=NaN){
                    currWeight+=mp.weight
                    realMp.push(mp);
                    }
                }

                return realMp.reduce((a,b)=>a+b.score*(b.weight / currWeight))
            
            }

            which is essentially the same shi as the existing CalculateGrade function in grades.ts that's used to course updates type shit
            same Shi diff day ykwim. 

            optimization modal will do most of its work BEHIND the scenes. undefined grades will be presumed to EXIST but have not yet TRANSPIRED.





            In Cases of Custom Final Grade Situations:


                Case1 | semester-long course in MCPS
                    problems: final grade col will be fine, optimization modal will be malformed cuz duh
                    fixes: in settings, allow the deletion of final grade col outright, the deletion of weighted thingies, (their weights shall redistribute evenly), 
                    and also, make it autoFill the courseID or course name or something it detects when u choose the MP, but, let it be clickable, so thet it can be 
                    manually set if so desired


        
                Case2 | you dropped a course!
                    prolbems: who gaf! you dropped it! 

                Case3 | not from mcps
                    problems: duh
                    fix: u can mnually enable final grade col, add mp's and weights, each mp as added will attempt to figure out da courseID / name and show u, so u can
                    see in the IMMEDIATE moment if it got it wrong and u can correct it there


                Case 4 | inexplicable MCPS course non-detection / mis-identification
                    problems: :( i think, like, would break opti modal, and porbably also would break other things also.
        */
        
        }
}

var grades:Grades[]=[{
  "gradingScales": {
    "default": {
      "rounding": {
        "percent": true,
        "percentPlaces": 2,
        "mark": false,
        "markPlaces": 0
      },
      "letterScale": [
        [
          "A",
          [
            89.5,
            100
          ]
        ],
        [
          "B",
          [
            79.5,
            89.49
          ]
        ],
        [
          "C",
          [
            69.5,
            79.49
          ]
        ],
        [
          "D",
          [
            59.5,
            69.49
          ]
        ],
        [
          "E",
          [
            0,
            59.49
          ]
        ]
      ]
    }
  },
  "courses": [
    {
      "name": "FOOTBALL IV ",
      "period": 1,
      "layoutID": 0,
      "room": "G111 AUXILIARY GYM",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 100,
        "color": "green"
      },
      "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "teacher": {
        "name": "Charles Dotson",
        "email": "dotson_c@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 400,
            "possible": 400
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 75,
            "possible": 75
          },
          "date": {
            "due": "2024-10-06T04:00:00.000Z",
            "assigned": "2024-10-06T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "GradeCheck",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2024-09-19T04:00:00.000Z",
            "assigned": "2024-09-19T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 75,
            "possible": 75
          },
          "date": {
            "due": "2024-09-13T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-06T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 75,
            "possible": 75
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-08-30T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 75,
            "possible": 75
          },
          "date": {
            "due": "2024-08-23T04:00:00.000Z",
            "assigned": "2024-08-23T04:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "ENGLISH 12 ",
      "period": 2,
      "layoutID": 1,
      "room": "H319 CLASSROOM",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 101,
        "color": "green"
      },
      "teacher": {
        "name": "Kelly Tobeler-Price",
        "email": "price_k@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 101.04,
            "color": "green"
          },
          "points": {
            "earned": 485,
            "possible": 480
          },
          
        }
      ],
      "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Grammar 7: Parts of a sentence",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-26T04:00:00.000Z",
            "assigned": "2024-09-26T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "L' Morte d\" Arthur",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-30T04:00:00.000Z",
            "assigned": "2024-09-26T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Independent Reading Survey",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-24T04:00:00.000Z",
            "assigned": "2024-09-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading Log 5",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-24T04:00:00.000Z",
            "assigned": "2024-09-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Sir Gawain and the Green Knight",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-19T04:00:00.000Z",
            "assigned": "2024-09-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Canterbury Tales Projects ",
          "grade": {
            "letter": "A",
            "raw": 110,
            "color": "green"
          },
          "points": {
            "earned": 55,
            "possible": 50
          },
          "date": {
            "due": "2024-09-05T04:00:00.000Z",
            "assigned": "2024-09-23T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 6: Page 750 Capitalization",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-17T04:00:00.000Z",
            "assigned": "2024-09-19T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "The Canterbury Tales: Wife of Bath",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-17T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Week 4 Reading Log ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-17T04:00:00.000Z",
            "assigned": "2024-09-17T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 5: Absolute Phrases, Appositives, Adjective and Adverb Clauses",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-11T04:00:00.000Z",
            "assigned": "2024-09-12T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "The Canterbury Tales: Pardoner's Tale",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-12T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "The Canterbury Tales Prologue",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-10T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Week 3 Reading Log",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-10T04:00:00.000Z",
            "assigned": "2024-09-10T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Student Resume and Cover Letter",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 30,
            "possible": 30
          },
          "date": {
            "due": "2024-09-03T04:00:00.000Z",
            "assigned": "2024-09-09T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 4",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-29T04:00:00.000Z",
            "assigned": "2024-09-05T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf's Cover Letter",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-09-03T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf's Resume'",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-09-03T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Week 2 Reading Log",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-03T04:00:00.000Z",
            "assigned": "2024-09-03T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Completion Grade PSAT/SAT Reading BOY",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": 10
          },
          "date": {
            "due": "2024-08-27T04:00:00.000Z",
            "assigned": "2024-08-30T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Completion Grade PSAT/SAT Writing BOY",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": 10
          },
          "date": {
            "due": "2024-08-27T04:00:00.000Z",
            "assigned": "2024-08-30T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 3: Writing Clear Sentences",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-27T04:00:00.000Z",
            "assigned": "2024-08-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading Log and Reflection Week 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-27T04:00:00.000Z",
            "assigned": "2024-08-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf Sections 31-43 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-22T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf 21-30",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-20T04:00:00.000Z",
            "assigned": "2024-08-22T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 2 Homonyms Exercise 10, Review E",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-15T04:00:00.000Z",
            "assigned": "2024-08-22T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf Sections 11-20",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-08-15T04:00:00.000Z",
            "assigned": "2024-08-20T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf Quiz Prologue, Sections 1-10",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-08-08T04:00:00.000Z",
            "assigned": "2024-08-19T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 1 Homonyms Exercise 7, 8, 9",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-15T04:00:00.000Z",
            "assigned": "2024-08-15T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Classroom Rules and Contract",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-13T04:00:00.000Z",
            "assigned": "2024-08-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Student Goal",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-13T04:00:00.000Z",
            "assigned": "2024-08-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Student Introduction ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-13T04:00:00.000Z",
            "assigned": "2024-08-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Student Survey",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-08T04:00:00.000Z",
            "assigned": "2024-08-07T04:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "AP ECON SEM ",
      "period": 3,
      "layoutID": 2,
      "room": "H320 CLASSROOM",
      "weighted": true,
      "grade": {
        "letter": "A",
        "raw": 100.32,
        "color": "green"
      },
      "teacher": {
        "name": "Kenneth Ortega",
        "email": "Kenneth.Ortega@aps.edu"
      },
      "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 100.32,
            "color": "green"
          },
          "points": {
            "earned": 321.02000000000004,
            "possible": 320
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Election Monday: The Gig Economy",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-23T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Monetary Policy Assessment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-25T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Test 2",
          "grade": {
            "letter": "A",
            "raw": 107.84,
            "color": "green"
          },
          "points": {
            "earned": 53.92,
            "possible": 50
          },
          "date": {
            "due": "2024-09-27T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Inflation Assignment #2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-20T04:00:00.000Z",
            "assigned": "2024-09-22T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Inflation Assignment 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-20T04:00:00.000Z",
            "assigned": "2024-09-22T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Economic Systems Assessment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-13T04:00:00.000Z",
            "assigned": "2024-09-15T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Election Monday: Campaign Financing",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-11T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Test 1",
          "grade": {
            "letter": "A",
            "raw": 97,
            "color": "green"
          },
          "points": {
            "earned": 48.5,
            "possible": 50
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-09T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "AD/AS Assessment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-04T04:00:00.000Z",
            "assigned": "2024-09-05T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "NPR Podcast: Bandwidth Poverty",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-09-04T04:00:00.000Z",
            "assigned": "2024-09-04T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Election Monday: Donald Trump's Tax Plan",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "GDP Assignment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-23T04:00:00.000Z",
            "assigned": "2024-08-25T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "PPC Assignment 2",
          "grade": {
            "letter": "A",
            "raw": 95,
            "color": "green"
          },
          "points": {
            "earned": 19,
            "possible": 20
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "PPC Assignment 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-20T04:00:00.000Z",
            "assigned": "2024-08-20T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Election Monday: Kamala Harris' Tax Plan",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-19T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 2 Assessment",
          "grade": {
            "letter": "A",
            "raw": 96,
            "color": "green"
          },
          "points": {
            "earned": 9.6,
            "possible": 10
          },
          "date": {
            "due": "2024-08-16T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 1 Assessment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Partner Introduction",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "ENGR DESIGN 3 ",
      "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "period": 4,
      "layoutID": 3,
      "room": "C7 COMPUTER LAB",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 100,
        "color": "green"
      },
      "teacher": {
        "name": "Don Gonzales",
        "email": "gonzales_don@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 185,
            "possible": 185
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-09-19T04:00:00.000Z",
            "assigned": "2024-09-19T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Two Person Game Design",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 100,
            "possible": 100
          },
          "date": {
            "due": "2024-09-04T04:00:00.000Z",
            "assigned": "2024-09-05T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Two person game design",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-20T04:00:00.000Z",
            "assigned": "2024-08-20T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "End Cap",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-19T04:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "AP CALC BC ",
      "period": 5,
      "layoutID": 4,
      "room": "Z109 CLASSROOM",
      "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "weighted": true,
      "grade": {
        "letter": "A",
        "raw": 97.63,
        "color": "green"
      },
      "teacher": {
        "name": "Anthony Orton",
        "email": "orton@aps.edu"
      },
      "categories": [
        {
          "name": "Classwork",
          "weight": 0.1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 31,
            "possible": 31
          }
        },
        {
          "name": "Homework",
          "weight": 0.1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 23,
            "possible": 23
          }
        },
        {
          "name": "Quiz",
          "weight": 0.3,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 9,
            "possible": 9
          }
        },
        {
          "name": "Tests",
          "weight": 0.4,
          "grade": {
            "letter": "A",
            "raw": 94.67,
            "color": "green"
          },
          "points": {
            "earned": 2.84,
            "possible": 3
          }
        },
        {
          "name": "Final",
          "weight": 0.1,
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": 0,
            "possible": 0
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "KA Review",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-27T04:00:00.000Z",
            "assigned": "2024-09-30T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 3 Test",
          "grade": {
            "letter": "A",
            "raw": 95,
            "color": "green"
          },
          "points": {
            "earned": 0.95,
            "possible": 1
          },
          "date": {
            "due": "2024-09-27T04:00:00.000Z",
            "assigned": "2024-09-30T04:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "3.6 Calculating Higher-Order Derivatives  Download 3.6 Calculating Higher-Order Derivatives",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-25T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Calculus - Round Table Activity)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-25T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson 3-7 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-25T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(3.5 Selecting Procedures for Determining Derivatives)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-23T04:00:00.000Z",
            "assigned": "2024-09-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Project Calculus Unit 3 - Day 8: Differentiating Inverse Trigonometric Functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-20T04:00:00.000Z",
            "assigned": "2024-09-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calculus BC Vocabulary Quiz 2 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-23T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Differentiating Inverse Functions)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (How is Lindt Chocolate Made?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Implicit Differentiation)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA ap-calculus-bc/bc-differentiation-2-new/bc-3-1a/e/differentiate-composite-functions-intro ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA ap-calculus-bc/bc-differentiation-2-new/bc-3-1a/e/identify-composite-functions ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Homework ap-calculus-bc/bc-differentiation-2-new/bc-3-1a/a/chain-rule-review ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calculus-Unit 2 Review – Differentiation: Definition & Fundamental Properties)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-13T04:00:00.000Z",
            "assigned": "2024-09-16T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Differentiation: definition and basic derivative rules Quiz 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-13T04:00:00.000Z",
            "assigned": "2024-09-16T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 2 - Test ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-16T04:00:00.000Z",
            "assigned": "2024-09-16T04:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calculus - How Fast is Snapchat?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calculus-Divide and Conquer)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calculus-Tangents for Trig Functions)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Differentiation: definition and basic derivative rules Quiz 3",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 10 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 11 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Packet 2.10",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Packet 2.7",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calc_2.5 and 2.6 packet",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-11T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 5  KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-11T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 6 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-11T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 7 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-11T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 1 Test",
          "grade": {
            "letter": "B",
            "raw": 89,
            "color": "blue"
          },
          "points": {
            "earned": 0.89,
            "possible": 1
          },
          "date": {
            "due": "2024-09-04T04:00:00.000Z",
            "assigned": "2024-09-09T04:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calc BC-Unit 1 Review Part 1:Desmos Project",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-06T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 1 Practice: Level 2 AP Classroom",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-04T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 1 Practice: Level 3 AP Classroom",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-04T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 1 Progress Check MCQ Part A",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-16T04:00:00.000Z",
            "assigned": "2024-08-30T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Project (How Much Do We Remember from School?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-08-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 14: Connecting infinite limits and vertical asymptotes",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-28T04:00:00.000Z",
            "assigned": "2024-08-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 15: Connecting limits at infinity and horizontal asymptotes",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-08-28T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz:Limits and Continuity",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-08-28T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 1 - Intermediate Value Theorem (IVT) Desmos Project:Are You A 5 Star Uber Driver?",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-08-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Project(Calculus Introduction to Squeeze Theorem) ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 10",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 11",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 12",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 13",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits and Continuity review",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "ap-calculus-bc/bc-limits-new/bc-1-8/e/squeeze-theorem ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "conditions-for-using-direct-substitution ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Project: Calculus_Contestants, can you solve this limit?",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "find-limits-using-trig-identities ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "limit-strategies-flow-chart ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "selecting-procedures-for-calculating-limits-2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "selecting-procedures-for-calculating-limits-3  ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "two-sided-limits-using-algebra ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Conclusions from direct substitution (finding limits)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Projects: IVT, Graphical Limits, Limits and continuity",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits by direct substitution",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Next steps after indeterminate form (finding limits)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Strategy in finding limits",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Direct substitution with limits that don't exist",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits and continuity: Quiz 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits by direct substitution",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits of combined functions: sums and differences",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits of piecewise functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits of trigonometric functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "APSI Limits and Continuity",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-09T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Estimating limit values from graphs",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-09T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Estimating limit values from graphs",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-09T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits intro",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-09T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "One-sided limits from tables",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-09T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Review Unit Circle ",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-07T04:00:00.000Z",
            "assigned": "2024-08-09T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit Circle and Radian Introduction edited)",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-08T04:00:00.000Z",
            "assigned": "2024-08-09T04:00:00.000Z"
          },
          "category": "Classwork"
        }
      ]
    }
  ],
  "period": {
    "name": "1st Quarter",
    "index": 0
  },
  "periods": [
    {
      "name": "1st Quarter (ended 275 days ago)",
      "index": 0
    },
    {
      "name": "2nd Quarter (ended 194 days ago)",
      "index": 1
    },
    {
      "name": "3rd Quarter (ended 111 days ago)",
      "index": 2
    },
    {
      "name": "4th Quarter (ended 35 days ago)",
      "index": 3
    }
  ]
},{
  "gradingScales": {
    "default": {
      "rounding": {
        "percent": true,
        "percentPlaces": 2,
        "mark": false,
        "markPlaces": 0
      },
      "letterScale": [
        [
          "A",
          [
            89.5,
            100
          ]
        ],
        [
          "B",
          [
            79.5,
            89.49
          ]
        ],
        [
          "C",
          [
            69.5,
            79.49
          ]
        ],
        [
          "D",
          [
            59.5,
            69.49
          ]
        ],
        [
          "E",
          [
            0,
            59.49
          ]
        ]
      ]
    }
  },
  "courses": [
    {
      "name": "FOOTBALL IV ",
      "period": 1,
      "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 0,
      "room": "G111 AUXILIARY GYM",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 98.5,
        "color": "green"
      },
      "teacher": {
        "name": "Charles Dotson",
        "email": "dotson_c@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 98.5,
            "color": "green"
          },
          "points": {
            "earned": 985,
            "possible": 1000
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 150,
            "possible": 150
          },
          "date": {
            "due": "2024-12-17T05:00:00.000Z",
            "assigned": "2024-12-17T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "B",
            "raw": 85,
            "color": "blue"
          },
          "points": {
            "earned": 85,
            "possible": 100
          },
          "date": {
            "due": "2024-11-26T05:00:00.000Z",
            "assigned": "2024-11-26T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2024-11-15T05:00:00.000Z",
            "assigned": "2024-11-15T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 100,
            "possible": 100
          },
          "date": {
            "due": "2024-11-13T05:00:00.000Z",
            "assigned": "2024-11-13T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 125,
            "possible": 125
          },
          "date": {
            "due": "2024-10-25T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 75,
            "possible": 75
          },
          "date": {
            "due": "2024-10-08T04:00:00.000Z",
            "assigned": "2024-10-08T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 75,
            "possible": 75
          },
          "date": {
            "due": "2024-10-06T04:00:00.000Z",
            "assigned": "2024-10-06T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "GradeCheck",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2024-09-19T04:00:00.000Z",
            "assigned": "2024-09-19T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 75,
            "possible": 75
          },
          "date": {
            "due": "2024-09-13T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-06T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 75,
            "possible": 75
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-08-30T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Participation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 75,
            "possible": 75
          },
          "date": {
            "due": "2024-08-23T04:00:00.000Z",
            "assigned": "2024-08-23T04:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "ENGLISH 12 ",
      "period": 2,
            "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 1,
      "room": "H319 CLASSROOM",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 95.8,
        "color": "green"
      },
      "teacher": {
        "name": "Kelly Tobeler-Price",
        "email": "price_k@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 95.75,
            "color": "green"
          },
          "points": {
            "earned": 1082,
            "possible": 1130
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Satire Enlightenment Project",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-12-03T05:00:00.000Z",
            "assigned": "2024-12-16T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Candide Chapters 23-30",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-11-14T05:00:00.000Z",
            "assigned": "2024-12-12T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Mary Wollstonecraft Vindication of the Rights of Women",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-11-25T05:00:00.000Z",
            "assigned": "2024-12-11T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Candide Chapter 14-22",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-11-14T05:00:00.000Z",
            "assigned": "2024-12-10T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Candide Chapters 1-13",
          "grade": {
            "letter": "D",
            "raw": 65,
            "color": "orange"
          },
          "points": {
            "earned": 13,
            "possible": 20
          },
          "date": {
            "due": "2024-11-14T05:00:00.000Z",
            "assigned": "2024-12-09T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Satire Jonathan Swift  Gulliver's Travels",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-11-25T05:00:00.000Z",
            "assigned": "2024-12-05T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Satire Jonathan Swift \"A Modest Proposal\"",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-11-25T05:00:00.000Z",
            "assigned": "2024-12-03T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Renaissance Humanism",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-10-31T04:00:00.000Z",
            "assigned": "2024-11-26T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Metaphysical Poetry",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-11-14T05:00:00.000Z",
            "assigned": "2024-11-25T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Milton: Paradise Lost ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-11-08T05:00:00.000Z",
            "assigned": "2024-11-21T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Test: Hamlet",
          "grade": {
            "letter": "B",
            "raw": 87,
            "color": "blue"
          },
          "points": {
            "earned": 87,
            "possible": 100
          },
          "date": {
            "due": "2024-11-12T05:00:00.000Z",
            "assigned": "2024-11-14T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Essay: Hamlet (In class only)",
          "grade": {
            "letter": "B",
            "raw": 86.67,
            "color": "blue"
          },
          "points": {
            "earned": 26,
            "possible": 30
          },
          "date": {
            "due": "2024-11-06T05:00:00.000Z",
            "assigned": "2024-11-12T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Act 5 Hamlet",
          "grade": {
            "letter": "A",
            "raw": 90,
            "color": "green"
          },
          "points": {
            "earned": 9,
            "possible": 10
          },
          "date": {
            "due": "2024-10-31T04:00:00.000Z",
            "assigned": "2024-11-04T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Hamlet Act 4 Questions for Act and soliloquy translation",
          "grade": {
            "letter": "A",
            "raw": 90,
            "color": "green"
          },
          "points": {
            "earned": 18,
            "possible": 20
          },
          "date": {
            "due": "2024-10-28T04:00:00.000Z",
            "assigned": "2024-10-31T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz Act 4 Hamlet",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-10-28T04:00:00.000Z",
            "assigned": "2024-10-31T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Hamlet Act 3 Questions and Soliloquy",
          "grade": {
            "letter": "C",
            "raw": 75,
            "color": "yellow"
          },
          "points": {
            "earned": 15,
            "possible": 20
          },
          "date": {
            "due": "2024-10-29T04:00:00.000Z",
            "assigned": "2024-10-29T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz: Act 3  Hamlet",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-10-24T04:00:00.000Z",
            "assigned": "2024-10-29T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Hamlet Act 1 Questions and Soliloquy translation/explanations",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 35,
            "possible": 35
          },
          "date": {
            "due": "2024-10-22T04:00:00.000Z",
            "assigned": "2024-10-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Hamlet Act 2 Questions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-10-24T04:00:00.000Z",
            "assigned": "2024-10-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz Hamlet Act 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-10-22T04:00:00.000Z",
            "assigned": "2024-10-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz  Hamlet Act 1",
          "grade": {
            "letter": "B",
            "raw": 85,
            "color": "blue"
          },
          "points": {
            "earned": 17,
            "possible": 20
          },
          "date": {
            "due": "2024-10-15T04:00:00.000Z",
            "assigned": "2024-10-22T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Shakespeare Biography Notes",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-22T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Student Sonnets",
          "grade": {
            "letter": "A",
            "raw": 133.33,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 15
          },
          "date": {
            "due": "2024-10-17T04:00:00.000Z",
            "assigned": "2024-10-21T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 8:  Page 538â€¦What is a phrase? Exercises 1, 2 and Review A together ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-10-04T04:00:00.000Z",
            "assigned": "2024-10-17T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Sonnets: Spencer, Shakespeare, Petrach",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-10-17T04:00:00.000Z",
            "assigned": "2024-10-17T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading Log 7",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-10-15T04:00:00.000Z",
            "assigned": "2024-10-15T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Sonnets: Christopher Marlowe and Sir Walter Raleigh",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-10-03T04:00:00.000Z",
            "assigned": "2024-10-08T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading Log 6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-10-02T04:00:00.000Z",
            "assigned": "2024-10-07T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Test: Medieval Literature",
          "grade": {
            "letter": "C",
            "raw": 77,
            "color": "yellow"
          },
          "points": {
            "earned": 77,
            "possible": 100
          },
          "date": {
            "due": "2024-09-24T04:00:00.000Z",
            "assigned": "2024-10-03T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 7: Parts of a sentence",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-26T04:00:00.000Z",
            "assigned": "2024-09-26T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "L' Morte d\" Arthur",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-30T04:00:00.000Z",
            "assigned": "2024-09-26T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Independent Reading Survey",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-24T04:00:00.000Z",
            "assigned": "2024-09-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading Log 5",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-24T04:00:00.000Z",
            "assigned": "2024-09-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Sir Gawain and the Green Knight",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-19T04:00:00.000Z",
            "assigned": "2024-09-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Canterbury Tales Projects ",
          "grade": {
            "letter": "A",
            "raw": 110,
            "color": "green"
          },
          "points": {
            "earned": 55,
            "possible": 50
          },
          "date": {
            "due": "2024-09-05T04:00:00.000Z",
            "assigned": "2024-09-23T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 6: Page 750 Capitalization",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-17T04:00:00.000Z",
            "assigned": "2024-09-19T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "The Canterbury Tales: Wife of Bath",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-17T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Week 4 Reading Log ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-17T04:00:00.000Z",
            "assigned": "2024-09-17T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 5: Absolute Phrases, Appositives, Adjective and Adverb Clauses",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-11T04:00:00.000Z",
            "assigned": "2024-09-12T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "The Canterbury Tales: Pardoner's Tale",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-12T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "The Canterbury Tales Prologue",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-10T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Week 3 Reading Log",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-10T04:00:00.000Z",
            "assigned": "2024-09-10T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Student Resume and Cover Letter",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 30,
            "possible": 30
          },
          "date": {
            "due": "2024-09-03T04:00:00.000Z",
            "assigned": "2024-09-09T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 4",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-29T04:00:00.000Z",
            "assigned": "2024-09-05T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf's Cover Letter",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-09-03T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf's Resume'",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-09-03T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Week 2 Reading Log",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-03T04:00:00.000Z",
            "assigned": "2024-09-03T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Completion Grade PSAT/SAT Reading BOY",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": 10
          },
          "date": {
            "due": "2024-08-27T04:00:00.000Z",
            "assigned": "2024-08-30T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Completion Grade PSAT/SAT Writing BOY",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": 10
          },
          "date": {
            "due": "2024-08-27T04:00:00.000Z",
            "assigned": "2024-08-30T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 3: Writing Clear Sentences",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-27T04:00:00.000Z",
            "assigned": "2024-08-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading Log and Reflection Week 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-27T04:00:00.000Z",
            "assigned": "2024-08-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf Sections 31-43 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-22T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf 21-30",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-20T04:00:00.000Z",
            "assigned": "2024-08-22T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 2 Homonyms Exercise 10, Review E",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-15T04:00:00.000Z",
            "assigned": "2024-08-22T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf Sections 11-20",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-08-15T04:00:00.000Z",
            "assigned": "2024-08-20T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Beowulf Quiz Prologue, Sections 1-10",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-08-08T04:00:00.000Z",
            "assigned": "2024-08-19T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 1 Homonyms Exercise 7, 8, 9",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-15T04:00:00.000Z",
            "assigned": "2024-08-15T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Classroom Rules and Contract",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-13T04:00:00.000Z",
            "assigned": "2024-08-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Student Goal",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-13T04:00:00.000Z",
            "assigned": "2024-08-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Student Introduction ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-08-13T04:00:00.000Z",
            "assigned": "2024-08-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Student Survey",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-08T04:00:00.000Z",
            "assigned": "2024-08-07T04:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "AP ECON SEM ",
      "period": 3,
            "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 2,
      "room": "H320 CLASSROOM",
      "weighted": true,
      "grade": {
        "letter": "A",
        "raw": 99.39,
        "color": "green"
      },
      "teacher": {
        "name": "Kenneth Ortega",
        "email": "Kenneth.Ortega@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 99.39,
            "color": "green"
          },
          "points": {
            "earned": 849.8199999999999,
            "possible": 855
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Final Review Upload",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2024-12-13T05:00:00.000Z",
            "assigned": "2024-12-19T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "College Board",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 100,
            "possible": 100
          },
          "date": {
            "due": "2024-12-16T05:00:00.000Z",
            "assigned": "2024-12-15T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Stocks Final Calculation",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 40,
            "possible": 40
          },
          "date": {
            "due": "2024-12-09T05:00:00.000Z",
            "assigned": "2024-12-11T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Monopolies Assignment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-12-06T05:00:00.000Z",
            "assigned": "2024-12-08T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Foreign Exchange Market Assignment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-12-04T05:00:00.000Z",
            "assigned": "2024-12-04T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Untitled Assignment",
          "grade": {
            "letter": "A",
            "raw": null,
            "color": "green"
          },
          "points": {
            "earned": 5,
            "possible": 0
          },
          "date": {
            "due": "2024-12-01T05:00:00.000Z",
            "assigned": "2024-12-02T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "National Deficit Assessment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-11-25T05:00:00.000Z",
            "assigned": "2024-11-25T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Test 4",
          "grade": {
            "letter": "A",
            "raw": 97,
            "color": "green"
          },
          "points": {
            "earned": 48.5,
            "possible": 50
          },
          "date": {
            "due": "2024-11-22T05:00:00.000Z",
            "assigned": "2024-11-22T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Macro Group Presentation Rubric",
          "grade": {
            "letter": "A",
            "raw": 94,
            "color": "green"
          },
          "points": {
            "earned": 56.4,
            "possible": 60
          },
          "date": {
            "due": "2024-08-09T04:00:00.000Z",
            "assigned": "2024-11-20T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Economic Policies in Action Project",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 40,
            "possible": 40
          },
          "date": {
            "due": "2024-11-13T05:00:00.000Z",
            "assigned": "2024-11-20T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Absolute and Comparative Advantage Assessment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-11-13T05:00:00.000Z",
            "assigned": "2024-11-13T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Phillips Curve Assignment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-11-08T05:00:00.000Z",
            "assigned": "2024-11-10T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Written Debate",
          "grade": {
            "letter": "A",
            "raw": 92,
            "color": "green"
          },
          "points": {
            "earned": 46,
            "possible": 50
          },
          "date": {
            "due": "2024-10-28T04:00:00.000Z",
            "assigned": "2024-11-01T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Test 3",
          "grade": {
            "letter": "A",
            "raw": 97,
            "color": "green"
          },
          "points": {
            "earned": 58.2,
            "possible": 60
          },
          "date": {
            "due": "2024-10-25T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Stocks Assignment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-10-23T04:00:00.000Z",
            "assigned": "2024-10-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Banking Today & Investment Assessment",
          "grade": {
            "letter": "A",
            "raw": 97,
            "color": "green"
          },
          "points": {
            "earned": 9.7,
            "possible": 10
          },
          "date": {
            "due": "2024-10-18T04:00:00.000Z",
            "assigned": "2024-10-20T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Labor and Wages Assessment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-30T04:00:00.000Z",
            "assigned": "2024-10-03T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Election Monday: The Gig Economy",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-23T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Monetary Policy Assessment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-25T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Test 2",
          "grade": {
            "letter": "A",
            "raw": 107.84,
            "color": "green"
          },
          "points": {
            "earned": 53.92,
            "possible": 50
          },
          "date": {
            "due": "2024-09-27T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Inflation Assignment #2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-20T04:00:00.000Z",
            "assigned": "2024-09-22T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Inflation Assignment 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-20T04:00:00.000Z",
            "assigned": "2024-09-22T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Economic Systems Assessment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-09-13T04:00:00.000Z",
            "assigned": "2024-09-15T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Election Monday: Campaign Financing",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-11T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Test 1",
          "grade": {
            "letter": "A",
            "raw": 97,
            "color": "green"
          },
          "points": {
            "earned": 48.5,
            "possible": 50
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-09T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "AD/AS Assessment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-09-04T04:00:00.000Z",
            "assigned": "2024-09-05T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "NPR Podcast: Bandwidth Poverty",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2024-09-04T04:00:00.000Z",
            "assigned": "2024-09-04T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Election Monday: Donald Trump's Tax Plan",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "GDP Assignment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-23T04:00:00.000Z",
            "assigned": "2024-08-25T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "PPC Assignment 2",
          "grade": {
            "letter": "A",
            "raw": 95,
            "color": "green"
          },
          "points": {
            "earned": 19,
            "possible": 20
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "PPC Assignment 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-20T04:00:00.000Z",
            "assigned": "2024-08-20T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Election Monday: Kamala Harris' Tax Plan",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-19T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 2 Assessment",
          "grade": {
            "letter": "A",
            "raw": 96,
            "color": "green"
          },
          "points": {
            "earned": 9.6,
            "possible": 10
          },
          "date": {
            "due": "2024-08-16T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 1 Assessment",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Partner Introduction",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "ENGR DESIGN 3 ",
      "period": 4,
            "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 3,
      "room": "C7 COMPUTER LAB",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 100,
        "color": "green"
      },
      "teacher": {
        "name": "Don Gonzales",
        "email": "gonzales_don@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 510,
            "possible": 510
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-12-10T05:00:00.000Z",
            "assigned": "2024-12-10T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-12-09T05:00:00.000Z",
            "assigned": "2024-12-09T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Walking/Tightrope Robot Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-12-05T05:00:00.000Z",
            "assigned": "2024-12-05T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Walking Robot",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-12-03T05:00:00.000Z",
            "assigned": "2024-12-03T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Final 2 Person Game Project",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2024-11-21T05:00:00.000Z",
            "assigned": "2024-11-21T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-11-18T05:00:00.000Z",
            "assigned": "2024-11-18T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Two Person Game Design",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 100,
            "possible": 100
          },
          "date": {
            "due": "2024-11-12T05:00:00.000Z",
            "assigned": "2024-11-12T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "2 Person Game Design",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2024-10-29T04:00:00.000Z",
            "assigned": "2024-10-31T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2024-09-19T04:00:00.000Z",
            "assigned": "2024-09-19T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Two Person Game Design",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 100,
            "possible": 100
          },
          "date": {
            "due": "2024-09-04T04:00:00.000Z",
            "assigned": "2024-09-05T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Two person game design",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2024-08-20T04:00:00.000Z",
            "assigned": "2024-08-20T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "End Cap",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-19T04:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "AP CALC BC ",
      "period": 5,
            "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 4,
      "room": "Z109 CLASSROOM",
      "weighted": true,
      "grade": {
        "letter": "A",
        "raw": 97.68,
        "color": "green"
      },
      "teacher": {
        "name": "Anthony Orton",
        "email": "orton@aps.edu"
      },
      "categories": [
        {
          "name": "Classwork",
          "weight": 0.1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 75,
            "possible": 75
          }
        },
        {
          "name": "Homework",
          "weight": 0.1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 54,
            "possible": 54
          }
        },
        {
          "name": "Quiz",
          "weight": 0.3,
          "grade": {
            "letter": "A",
            "raw": 99.28,
            "color": "green"
          },
          "points": {
            "earned": 17.87,
            "possible": 18
          }
        },
        {
          "name": "Tests",
          "weight": 0.4,
          "grade": {
            "letter": "A",
            "raw": 95.33,
            "color": "green"
          },
          "points": {
            "earned": 5.72,
            "possible": 6
          }
        },
        {
          "name": "Final",
          "weight": 0.1,
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": 0,
            "possible": 0
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Fall Final Review (Desmos)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-12-11T05:00:00.000Z",
            "assigned": "2024-12-16T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom Review for Fall Final",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-12-09T05:00:00.000Z",
            "assigned": "2024-12-13T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 6 - Test ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-12-04T05:00:00.000Z",
            "assigned": "2024-12-04T05:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 6 Review ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-12-02T05:00:00.000Z",
            "assigned": "2024-12-04T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Asymptote Review(PC_m3_Lesson 14 Classwork)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-22T05:00:00.000Z",
            "assigned": "2024-11-25T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Homework 6-13",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-22T05:00:00.000Z",
            "assigned": "2024-11-25T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Lesson (Can We Find Infinite Areas)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-22T05:00:00.000Z",
            "assigned": "2024-11-25T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Khan Academy Quick 5 Question Quiz(please Login For Credit)  Integration and Accumulation of Change",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-22T05:00:00.000Z",
            "assigned": "2024-11-25T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 6-14",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-22T05:00:00.000Z",
            "assigned": "2024-11-25T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Practice on 6-13",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-22T05:00:00.000Z",
            "assigned": "2024-11-25T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-11 Practice",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-20T05:00:00.000Z",
            "assigned": "2024-11-22T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-12 Desmos Project - Linear Partial Fraction Decomposition",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-20T05:00:00.000Z",
            "assigned": "2024-11-22T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-12 Partial Fraction Decomposition Desmos Project",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-20T05:00:00.000Z",
            "assigned": "2024-11-22T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_6-11 HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-20T05:00:00.000Z",
            "assigned": "2024-11-22T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6.10 Integrating with Long Division and Completing the Square Desmos Project",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-18T05:00:00.000Z",
            "assigned": "2024-11-20T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-10 Practice",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-18T05:00:00.000Z",
            "assigned": "2024-11-20T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_6-10 HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-18T05:00:00.000Z",
            "assigned": "2024-11-20T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-8 KA Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-15T05:00:00.000Z",
            "assigned": "2024-11-18T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-9 Desmos Lesson (Which One Doesn't Belong?) ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-15T05:00:00.000Z",
            "assigned": "2024-11-18T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-9 KA Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-15T05:00:00.000Z",
            "assigned": "2024-11-18T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-9 Lesson Practice",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-15T05:00:00.000Z",
            "assigned": "2024-11-18T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 6-8 Practice",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-15T05:00:00.000Z",
            "assigned": "2024-11-18T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz Lessons 6-8 to 6-10",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-15T05:00:00.000Z",
            "assigned": "2024-11-18T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-6 Desmos Lesson (#2024 Goals) ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-13T05:00:00.000Z",
            "assigned": "2024-11-15T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-6 KA Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-15T05:00:00.000Z",
            "assigned": "2024-11-15T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-6 Lesson Practice",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-13T05:00:00.000Z",
            "assigned": "2024-11-15T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-7 Desmos Lesson (Go Figure)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-13T05:00:00.000Z",
            "assigned": "2024-11-15T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-7 KA Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-13T05:00:00.000Z",
            "assigned": "2024-11-15T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-7 Lesson Practice",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-13T05:00:00.000Z",
            "assigned": "2024-11-15T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz - 6-1 to 6-6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-13T05:00:00.000Z",
            "assigned": "2024-11-15T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 6 AP Classroom Progress Check MCQ Part A",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-11-13T05:00:00.000Z",
            "assigned": "2024-11-15T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-4 Desmos Lesson(Under Cover)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-08T05:00:00.000Z",
            "assigned": "2024-11-13T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-4 KA Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-08T05:00:00.000Z",
            "assigned": "2024-11-13T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-4 Lesson Practice",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-08T05:00:00.000Z",
            "assigned": "2024-11-13T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-5  Lesson Practice",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-08T05:00:00.000Z",
            "assigned": "2024-11-13T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-5 KA Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-08T05:00:00.000Z",
            "assigned": "2024-11-13T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-1 Desmos Activity(How much Snow Is On Janet's Driveway)?",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-06T05:00:00.000Z",
            "assigned": "2024-11-08T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-1 KA Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-06T05:00:00.000Z",
            "assigned": "2024-11-08T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-2 Desmos Activity (Fast and Curious)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-06T05:00:00.000Z",
            "assigned": "2024-11-08T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-2 KA Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-06T05:00:00.000Z",
            "assigned": "2024-11-08T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-3 KA Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-06T05:00:00.000Z",
            "assigned": "2024-11-08T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "6-3 The Desmos Activity(How Confident Are You?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-11-06T05:00:00.000Z",
            "assigned": "2024-11-08T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 Test",
          "grade": {
            "letter": "A",
            "raw": 93,
            "color": "green"
          },
          "points": {
            "earned": 0.93,
            "possible": 1
          },
          "date": {
            "due": "2024-11-04T05:00:00.000Z",
            "assigned": "2024-11-04T05:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-30T04:00:00.000Z",
            "assigned": "2024-10-30T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Canalysis - 5.10-5.11)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-25T04:00:00.000Z",
            "assigned": "2024-10-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 10 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-25T04:00:00.000Z",
            "assigned": "2024-10-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 10 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-25T04:00:00.000Z",
            "assigned": "2024-10-28T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 11 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-25T04:00:00.000Z",
            "assigned": "2024-10-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 11 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-25T04:00:00.000Z",
            "assigned": "2024-10-28T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 8 classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-25T04:00:00.000Z",
            "assigned": "2024-10-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 8 homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-25T04:00:00.000Z",
            "assigned": "2024-10-28T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 9 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-25T04:00:00.000Z",
            "assigned": "2024-10-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 9 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-25T04:00:00.000Z",
            "assigned": "2024-10-28T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (5-2 What’s the Value of Apple Stock?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (5-5 Are You a Stock Market Master?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (5-6 and 5-7 How Fast does the Flu Spread?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 2 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 2 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 3 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 3 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 4 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 4 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 Lesson 5 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 Lesson 5 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 Lesson 6 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 Lesson 6 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 Lesson 7 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 Lesson 7 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-21T04:00:00.000Z",
            "assigned": "2024-10-25T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 4 Test ",
          "grade": {
            "letter": "A",
            "raw": 95,
            "color": "green"
          },
          "points": {
            "earned": 0.95,
            "possible": 1
          },
          "date": {
            "due": "2024-10-18T04:00:00.000Z",
            "assigned": "2024-10-21T04:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 1 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-18T04:00:00.000Z",
            "assigned": "2024-10-21T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 5 - Lesson 1 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-18T04:00:00.000Z",
            "assigned": "2024-10-21T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Lesson (Big 10 Particle Motion)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-07T04:00:00.000Z",
            "assigned": "2024-10-16T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Lesson 4-5 (Coney Island)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-07T04:00:00.000Z",
            "assigned": "2024-10-16T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 4-5 (Close Enough Is Good Enough)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-07T04:00:00.000Z",
            "assigned": "2024-10-16T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 4-5 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-07T04:00:00.000Z",
            "assigned": "2024-10-16T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 4-6 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-07T04:00:00.000Z",
            "assigned": "2024-10-16T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Crack The Code)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-04T04:00:00.000Z",
            "assigned": "2024-10-09T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Project (Calculus - How Many Shoppers on Black Friday?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-04T04:00:00.000Z",
            "assigned": "2024-10-09T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA 4-3 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-04T04:00:00.000Z",
            "assigned": "2024-10-09T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Homework 4-4",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-04T04:00:00.000Z",
            "assigned": "2024-10-09T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Review Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-04T04:00:00.000Z",
            "assigned": "2024-10-09T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Related Rates vs Optimization",
          "grade": {
            "letter": "A",
            "raw": 93,
            "color": "green"
          },
          "points": {
            "earned": 0.93,
            "possible": 1
          },
          "date": {
            "due": "2024-10-04T04:00:00.000Z",
            "assigned": "2024-10-09T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "The Desmos Project (4-4 Birthday Balloons)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-04T04:00:00.000Z",
            "assigned": "2024-10-09T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Project (A Summer Day Of Calculus)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-02T04:00:00.000Z",
            "assigned": "2024-10-04T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Project (The Lovely Ladybug)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-02T04:00:00.000Z",
            "assigned": "2024-10-04T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Homework 4-1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-02T04:00:00.000Z",
            "assigned": "2024-10-04T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Homework 4-2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-10-02T04:00:00.000Z",
            "assigned": "2024-10-04T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Review",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-27T04:00:00.000Z",
            "assigned": "2024-09-30T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 3 Test",
          "grade": {
            "letter": "A",
            "raw": 95,
            "color": "green"
          },
          "points": {
            "earned": 0.95,
            "possible": 1
          },
          "date": {
            "due": "2024-09-27T04:00:00.000Z",
            "assigned": "2024-09-30T04:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "3.6 Calculating Higher-Order Derivatives  Download 3.6 Calculating Higher-Order Derivatives",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-25T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Calculus - Round Table Activity)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-25T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson 3-7 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-25T04:00:00.000Z",
            "assigned": "2024-09-27T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(3.5 Selecting Procedures for Determining Derivatives)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-23T04:00:00.000Z",
            "assigned": "2024-09-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Project Calculus Unit 3 - Day 8: Differentiating Inverse Trigonometric Functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-20T04:00:00.000Z",
            "assigned": "2024-09-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calculus BC Vocabulary Quiz 2 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-23T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Differentiating Inverse Functions)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (How is Lindt Chocolate Made?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Implicit Differentiation)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA ap-calculus-bc/bc-differentiation-2-new/bc-3-1a/e/differentiate-composite-functions-intro ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA ap-calculus-bc/bc-differentiation-2-new/bc-3-1a/e/identify-composite-functions ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Homework ap-calculus-bc/bc-differentiation-2-new/bc-3-1a/a/chain-rule-review ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-18T04:00:00.000Z",
            "assigned": "2024-09-20T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calculus-Unit 2 Review – Differentiation: Definition & Fundamental Properties)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-13T04:00:00.000Z",
            "assigned": "2024-09-16T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Differentiation: definition and basic derivative rules Quiz 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-13T04:00:00.000Z",
            "assigned": "2024-09-16T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 2 - Test ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-16T04:00:00.000Z",
            "assigned": "2024-09-16T04:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calculus - How Fast is Snapchat?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calculus-Divide and Conquer)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calculus-Tangents for Trig Functions)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Differentiation: definition and basic derivative rules Quiz 3",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 10 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 11 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Packet 2.10",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Packet 2.7",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-09T04:00:00.000Z",
            "assigned": "2024-09-13T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calc_2.5 and 2.6 packet",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-11T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 5  KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-11T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 6 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-11T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 7 KA",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-09-06T04:00:00.000Z",
            "assigned": "2024-09-11T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 1 Test",
          "grade": {
            "letter": "B",
            "raw": 89,
            "color": "blue"
          },
          "points": {
            "earned": 0.89,
            "possible": 1
          },
          "date": {
            "due": "2024-09-04T04:00:00.000Z",
            "assigned": "2024-09-09T04:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calc BC-Unit 1 Review Part 1:Desmos Project",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-06T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 1 Practice: Level 2 AP Classroom",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-04T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 1 Practice: Level 3 AP Classroom",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-30T04:00:00.000Z",
            "assigned": "2024-09-04T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 1 Progress Check MCQ Part A",
          "grade": {
            "letter": "A",
            "raw": 94,
            "color": "green"
          },
          "points": {
            "earned": 0.94,
            "possible": 1
          },
          "date": {
            "due": "2024-08-16T04:00:00.000Z",
            "assigned": "2024-08-30T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Project (How Much Do We Remember from School?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-08-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 14: Connecting infinite limits and vertical asymptotes",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-28T04:00:00.000Z",
            "assigned": "2024-08-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 15: Connecting limits at infinity and horizontal asymptotes",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-08-28T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz:Limits and Continuity",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-08-28T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 1 - Intermediate Value Theorem (IVT) Desmos Project:Are You A 5 Star Uber Driver?",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-26T04:00:00.000Z",
            "assigned": "2024-08-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Project(Calculus Introduction to Squeeze Theorem) ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 10",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 11",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 12",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 13",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits and Continuity review",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-21T04:00:00.000Z",
            "assigned": "2024-08-26T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "ap-calculus-bc/bc-limits-new/bc-1-8/e/squeeze-theorem ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "conditions-for-using-direct-substitution ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Project: Calculus_Contestants, can you solve this limit?",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "find-limits-using-trig-identities ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "limit-strategies-flow-chart ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "selecting-procedures-for-calculating-limits-2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "selecting-procedures-for-calculating-limits-3  ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "two-sided-limits-using-algebra ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-19T04:00:00.000Z",
            "assigned": "2024-08-21T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Conclusions from direct substitution (finding limits)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Projects: IVT, Graphical Limits, Limits and continuity",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits by direct substitution",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Next steps after indeterminate form (finding limits)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Strategy in finding limits",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-14T04:00:00.000Z",
            "assigned": "2024-08-16T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Direct substitution with limits that don't exist",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits and continuity: Quiz 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits by direct substitution",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits of combined functions: sums and differences",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits of piecewise functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits of trigonometric functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-12T04:00:00.000Z",
            "assigned": "2024-08-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "APSI Limits and Continuity",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-09T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Estimating limit values from graphs",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-09T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Estimating limit values from graphs",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-09T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Limits intro",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-09T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "One-sided limits from tables",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2024-08-09T04:00:00.000Z",
            "assigned": "2024-08-12T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Review Unit Circle ",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-07T04:00:00.000Z",
            "assigned": "2024-08-09T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit Circle and Radian Introduction edited)",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2024-08-08T04:00:00.000Z",
            "assigned": "2024-08-09T04:00:00.000Z"
          },
          "category": "Classwork"
        }
      ]
    }
  ],
  "period": {
    "name": "2nd Quarter",
    "index": 1
  },
  "periods": [
    {
      "name": "1st Quarter (ended 275 days ago)",
      "index": 0
    },
    {
      "name": "2nd Quarter (ended 194 days ago)",
      "index": 1
    },
    {
      "name": "3rd Quarter (ended 111 days ago)",
      "index": 2
    },
    {
      "name": "4th Quarter (ended 35 days ago)",
      "index": 3
    }
  ]
},{
  "gradingScales": {
    "default": {
      "rounding": {
        "percent": true,
        "percentPlaces": 2,
        "mark": false,
        "markPlaces": 0
      },
      "letterScale": [
        [
          "A",
          [
            89.5,
            100
          ]
        ],
        [
          "B",
          [
            79.5,
            89.49
          ]
        ],
        [
          "C",
          [
            69.5,
            79.49
          ]
        ],
        [
          "D",
          [
            59.5,
            69.49
          ]
        ],
        [
          "E",
          [
            0,
            59.49
          ]
        ]
      ]
    }
  },
  "courses": [
    {
      "name": "ENGLISH 12 ",
      "period": 2,
      "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 0,
      "room": "H319 CLASSROOM",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 96.9,
        "color": "green"
      },
      "teacher": {
        "name": "Kelly Tobeler-Price",
        "email": "price_k@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 96.92,
            "color": "green"
          },
          "points": {
            "earned": 567,
            "possible": 585
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Grammar 13 Pronouns Page 604: Preview, Exercise 1, Exercise 3 Review A",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-03-07T05:00:00.000Z",
            "assigned": "2025-03-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein 18, 19 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-11T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading Log 4 Semester 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-03-11T04:00:00.000Z",
            "assigned": "2025-03-11T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Chapters 16 and 17 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-03-06T05:00:00.000Z",
            "assigned": "2025-03-10T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein 14 and 15 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-03-04T05:00:00.000Z",
            "assigned": "2025-03-06T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 12 Subject Verb Agreement page 582 Review A, Exercise 3 and 4 Review B",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-02-28T05:00:00.000Z",
            "assigned": "2025-03-06T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "IR Survey",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-03-04T05:00:00.000Z",
            "assigned": "2025-03-05T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Chapters 12 and 13 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-03-03T05:00:00.000Z",
            "assigned": "2025-03-04T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading Log 3 Semester 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-03-04T05:00:00.000Z",
            "assigned": "2025-03-04T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein 10 and 11 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2025-02-27T05:00:00.000Z",
            "assigned": "2025-03-03T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Chapters 8, 9 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-02-25T05:00:00.000Z",
            "assigned": "2025-02-27T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 11 Agreement page 576-582  Diagnostic Preview, Exercises 1 and 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-02-27T05:00:00.000Z",
            "assigned": "2025-02-27T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein 6, 7 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-02-24T05:00:00.000Z",
            "assigned": "2025-02-25T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading log 2 S2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-25T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Chapters 4 and 5 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-02-18T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Extra Credit Tissues",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "English 12 Research Paper",
          "grade": {
            "letter": "A",
            "raw": 91.33,
            "color": "green"
          },
          "points": {
            "earned": 137,
            "possible": 150
          },
          "date": {
            "due": "2025-01-31T05:00:00.000Z",
            "assigned": "2025-02-20T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Chapters 1, 2, 3 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-02-10T05:00:00.000Z",
            "assigned": "2025-02-18T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein: Preface, Letters",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-02-06T05:00:00.000Z",
            "assigned": "2025-02-11T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Romantic Poets: Coleridge, Lord Byron, Shelley, Keats",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-02-10T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading Log  1 S2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-01-23T05:00:00.000Z",
            "assigned": "2025-01-23T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Romanticism: Nature Project",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2025-01-16T05:00:00.000Z",
            "assigned": "2025-01-23T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Samuel Taylor Coleridge Rime of the Ancient Mariner",
          "grade": {
            "letter": "C",
            "raw": 75,
            "color": "yellow"
          },
          "points": {
            "earned": 15,
            "possible": 20
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "William Wordsworth",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-21T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robert Burns: To a Mouse; To a Louse",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-15T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 10: Clauses Exercises 1-4; Review A",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Student Letter (Seniors)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "William Blake",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "NM HISTORY ",
      "period": 3,
            "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 1,
      "room": "H312 CLASSROOM",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 100,
        "color": "green"
      },
      "teacher": {
        "name": "Connor Garcia",
        "email": "Connor.Garcia@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "International Women's Day/Month",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-10T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Notebook Check 2 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-07T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-07T05:00:00.000Z",
            "assigned": "2025-03-07T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Short Answer: Primary Sources",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-26T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Creating an Original Primary Source",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-18T05:00:00.000Z",
            "assigned": "2025-02-18T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "The Long Walk (Scribe Only)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-14T05:00:00.000Z",
            "assigned": "2025-02-14T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Short Answer: Treaty of G.H.",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-12T05:00:00.000Z",
            "assigned": "2025-02-12T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Notebook Check 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-31T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "James K. Polk speech to Congress",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Short Answer: Immigration",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-27T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Texas Revolution DBQ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "8 Stages Worksheet",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-22T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Short answer: Genocide ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "NM Map",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-15T05:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "ENGR DESIGN 3 ",
      "period": 4,
            "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 2,
      "room": "C7 COMPUTER LAB",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 100,
        "color": "green"
      },
      "teacher": {
        "name": "Don Gonzales",
        "email": "gonzales_don@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 335,
            "possible": 335
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Candy Bar Activity Graph",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-03-06T05:00:00.000Z",
            "assigned": "2025-03-06T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-03-04T05:00:00.000Z",
            "assigned": "2025-03-04T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-26T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Candy Bar Design",
          "grade": {
            "letter": "A",
            "raw": 120,
            "color": "green"
          },
          "points": {
            "earned": 30,
            "possible": 25
          },
          "date": {
            "due": "2025-02-24T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Solid Edge Crossword Puzzle",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-02-17T05:00:00.000Z",
            "assigned": "2025-02-18T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Final Robot Presentation",
          "grade": {
            "letter": "A",
            "raw": 95,
            "color": "green"
          },
          "points": {
            "earned": 95,
            "possible": 100
          },
          "date": {
            "due": "2025-02-13T05:00:00.000Z",
            "assigned": "2025-02-13T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robot Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-06T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robot Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-30T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robot Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-01-23T05:00:00.000Z",
            "assigned": "2025-01-23T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robot Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-16T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robot Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-01-07T05:00:00.000Z",
            "assigned": "2025-01-09T05:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "AP CALC BC ",
      "period": 5,
            "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 3,
      "room": "Z109 CLASSROOM",
      "weighted": true,
      "grade": {
        "letter": "A",
        "raw": 97.76,
        "color": "green"
      },
      "teacher": {
        "name": "Anthony Orton",
        "email": "orton@aps.edu"
      },
      "categories": [
        {
          "name": "Homework",
          "weight": 0.1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 48,
            "possible": 48
          }
        },
        {
          "name": "Classwork",
          "weight": 0.1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 46,
            "possible": 46
          }
        },
        {
          "name": "Quiz",
          "weight": 0.3,
          "grade": {
            "letter": "A",
            "raw": 99.5,
            "color": "green"
          },
          "points": {
            "earned": 11.94,
            "possible": 12
          }
        },
        {
          "name": "Tests",
          "weight": 0.4,
          "grade": {
            "letter": "A",
            "raw": 95.33,
            "color": "green"
          },
          "points": {
            "earned": 2.86,
            "possible": 3
          }
        },
        {
          "name": "Final",
          "weight": 0.1,
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": 0,
            "possible": 0
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 - AP Classroom Lessons 1 and 2 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-12T04:00:00.000Z",
            "assigned": "2025-03-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 10-1 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-12T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 10-2 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-12T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-12T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-12T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 9 Test - Parametric Equations, Polar Coordinates, and Vector-Valued Functions",
          "grade": {
            "letter": "A",
            "raw": 94,
            "color": "green"
          },
          "points": {
            "earned": 0.94,
            "possible": 1
          },
          "date": {
            "due": "2025-03-05T05:00:00.000Z",
            "assigned": "2025-03-07T05:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Unit 9- Review 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-03T05:00:00.000Z",
            "assigned": "2025-03-05T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Unit 9- Review 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-03T05:00:00.000Z",
            "assigned": "2025-03-05T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 9 Progress Check: MCQ Part A",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-03T05:00:00.000Z",
            "assigned": "2025-03-05T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 9 Progress Check: MCQ Part B",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-03T05:00:00.000Z",
            "assigned": "2025-03-05T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.9",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-28T05:00:00.000Z",
            "assigned": "2025-03-03T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9.9 ->area-between-two-polar-curves",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-28T05:00:00.000Z",
            "assigned": "2025-03-03T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9.9 ->area-polar-calculator-active",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-28T05:00:00.000Z",
            "assigned": "2025-03-03T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.8 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Calc 9-8 Artic Regions)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson  9-8 ->area-bounded-by-polar-curves-intro",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson  9-8 ->area-enclosed-by-polar-graphs",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-7 ->/tangents-to-polar-curves ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-7 differentiate-polar-functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.7 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calc_PC_m1_Lesson 13 (polar coordinates) ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-24T05:00:00.000Z",
            "assigned": "2025-02-26T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.5",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom - (BC ONLY) Integrating Vector-Valued Functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom - (BC ONLY) Solving Motion Problems Using Parametric and Vector-Valued Functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Calc_9-6 The Lovely Ladybug (Part 2))",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW 3 Lesson 9-6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-27T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW Lesson 9-6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW Lesson 9-6 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Review/Quiz -> https://www.khanacademy.org/math/ap-calculus-bc/bc-advanced-functions-new/bc-9-6/quiz/bc-advanced-functions-new-quiz-2?referrer=upsell ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom - 9.3 (BC ONLY) Defining and Differentiating Vector-Valued Functions Quiz - 3 questions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom - 9.4(BC ONLY) Finding Arc Lengths of Curves Given by Parametric Equations ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Having a Ball)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-3 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-4 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-4 KA HW part 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.3 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.4 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Review/Quiz 9-1 to 9-3",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-1 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-14T05:00:00.000Z",
            "assigned": "2025-02-19T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-2 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-14T05:00:00.000Z",
            "assigned": "2025-02-19T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-2 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-14T05:00:00.000Z",
            "assigned": "2025-02-19T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 9 - Lesson 1 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-14T05:00:00.000Z",
            "assigned": "2025-02-19T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 8 - Test ",
          "grade": {
            "letter": "A",
            "raw": 97,
            "color": "green"
          },
          "points": {
            "earned": 0.97,
            "possible": 1
          },
          "date": {
            "due": "2025-02-12T05:00:00.000Z",
            "assigned": "2025-02-14T05:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 8 - Review",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-10T05:00:00.000Z",
            "assigned": "2025-02-12T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-13 classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-07T05:00:00.000Z",
            "assigned": "2025-02-10T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-13 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-07T05:00:00.000Z",
            "assigned": "2025-02-10T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calc 8-10: Volume using the Washer Method Day 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-10 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-10 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-11 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-12 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.11 classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.12 classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "8-9 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Best Thing Since Sliced Bread)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA - HW 8-8",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_HW Lesson 8-7- volumes-of-solids-of-known-cross-section ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_HW Lesson 8-7_volumes-with-square-and-rectangle-cross-sections ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.7 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 8 - Lessons 8-8 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 8 - Lessons 8-9 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz In AP Classroom (Due Monday 2/3/25) ",
          "grade": {
            "letter": "A",
            "raw": 94,
            "color": "green"
          },
          "points": {
            "earned": 0.94,
            "possible": 1
          },
          "date": {
            "due": "2025-01-31T05:00:00.000Z",
            "assigned": "2025-02-03T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calc_8-5 and 8_6 How do You Build a Deck?",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW - Lesson 8.4 area between a curve and an axis",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW - Lesson 8-5 - area between a curve and the y axis",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW - Lesson 8-6 - area between curves that intersect at more than two points",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW Lesson 8-4 area between two curves and given end points",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.4",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.5 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.6 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.2 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA 8-2 Homework analyzing motion problems",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson  8-3 Homework interpreting-definite-integrals-in-context ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson 8-3 Homework net-change-algebraic ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_8-2 Homework particle motion",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_8-3 Homework analyzing-problems-involving-definite-integrals",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-2 Desmos Activity(Connecting Position, Velocity, and Acceleration using Integrals)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-3 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-3 Desmos Activity (How Many People are at the Met?) ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson 8-1 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-01-27T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-1 Desmos Activity(Finding the Perfect Rectangle)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-01-27T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 8 - Lesson 1 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-01-27T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "C - KA Lesson 7 Quiz 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-22T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "C- KA Lesson 7 Quiz 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-22T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "C- KA Lesson 7 Unit Review",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-22T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 7 Progress Check: MCQ Part b in AP Classroom",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-22T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 7 Test ",
          "grade": {
            "letter": "A",
            "raw": 95,
            "color": "green"
          },
          "points": {
            "earned": 0.95,
            "possible": 1
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": " Lesson_7.8 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (How Fast Is The Corona Virus Spreading)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson  7.9 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson 7.8",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson 7.8 word problems",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_7.9 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(AP Calculus BC 7.5 Getting Closer)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Review Topics 7.6-7.7)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA - Lesson 7-6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA - Lesson 7-6 find the error",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA-Lesson 7-6 identify separable equations",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 7-7 - indefinite integrals",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 7-7 - seperable differental equations",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_7.6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_7.7 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 7.5 HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-13T05:00:00.000Z",
            "assigned": "2025-01-15T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_7.5",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-13T05:00:00.000Z",
            "assigned": "2025-01-15T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 7 Progress Check A In AP Classroom",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-01-13T05:00:00.000Z",
            "assigned": "2025-01-15T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "7-4 Practice ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-10T05:00:00.000Z",
            "assigned": "2025-01-13T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calc_7-3_Sketching Slope Fields)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-10T05:00:00.000Z",
            "assigned": "2025-01-13T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Seeing is Believing)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-10T05:00:00.000Z",
            "assigned": "2025-01-13T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson  7-4 HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-10T05:00:00.000Z",
            "assigned": "2025-01-13T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 7-3 HW ",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-01-10T05:00:00.000Z",
            "assigned": "2025-01-13T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "7.1_Modeling with Differential Equations",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (How Long Does Coffee Stay Hot)",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_HW 7-1",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_HW_7-2",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Verifying Solutions for Differential Equations_7.2",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Classwork"
        }
      ]
    }
  ],
  "period": {
    "name": "3rd Quarter",
    "index": 2
  },
  "periods": [
    {
      "name": "1st Quarter (ended 275 days ago)",
      "index": 0
    },
    {
      "name": "2nd Quarter (ended 194 days ago)",
      "index": 1
    },
    {
      "name": "3rd Quarter (ended 111 days ago)",
      "index": 2
    },
    {
      "name": "4th Quarter (ended 35 days ago)",
      "index": 3
    }
  ]
},{
  "gradingScales": {
    "default": {
      "rounding": {
        "percent": true,
        "percentPlaces": 2,
        "mark": false,
        "markPlaces": 0
      },
      "letterScale": [
        [
          "A",
          [
            89.5,
            100
          ]
        ],
        [
          "B",
          [
            79.5,
            89.49
          ]
        ],
        [
          "C",
          [
            69.5,
            79.49
          ]
        ],
        [
          "D",
          [
            59.5,
            69.49
          ]
        ],
        [
          "E",
          [
            0,
            59.49
          ]
        ]
      ]
    }
  },
  "courses": [
    {
      "name": "ENGLISH 12 ",
      "period": 2,
      "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 0,
      "room": "H319 CLASSROOM",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 96.1,
        "color": "green"
      },
      "teacher": {
        "name": "Kelly Tobeler-Price",
        "email": "price_k@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 96.07,
            "color": "green"
          },
          "points": {
            "earned": 1076,
            "possible": 1120
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Science Fiction Project",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2025-03-11T04:00:00.000Z",
            "assigned": "2025-05-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Modern Poetry: W.B. Yeats, Dylan Thomas, W. H. Auden",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-05-06T04:00:00.000Z",
            "assigned": "2025-05-08T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Modern Poetry: T.S. Eliot",
          "grade": {
            "letter": "C",
            "raw": 73.33,
            "color": "yellow"
          },
          "points": {
            "earned": 11,
            "possible": 15
          },
          "date": {
            "due": "2025-05-06T04:00:00.000Z",
            "assigned": "2025-05-06T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "1984 Conclusion Groups and Text Analysis",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2025-05-06T04:00:00.000Z",
            "assigned": "2025-05-05T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Extra Credit: \"O. Henry's Guide to the Present\"",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-04-28T04:00:00.000Z",
            "assigned": "2025-05-05T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "EOY SSR/IR Survey ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-04-30T04:00:00.000Z",
            "assigned": "2025-05-02T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "1984 Part 3 Chapters 5 and 6 Conclusion",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-04-22T04:00:00.000Z",
            "assigned": "2025-05-01T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "1984 Part 3 Chapters 1-4",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 30,
            "possible": 30
          },
          "date": {
            "due": "2025-04-22T04:00:00.000Z",
            "assigned": "2025-04-28T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "1984 Part 2 Chapters 8, 9, 10",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-04-21T04:00:00.000Z",
            "assigned": "2025-04-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 14: Using Verbs Correctly page 642 Preview,  Exercise 1, 2, 3",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-03-07T05:00:00.000Z",
            "assigned": "2025-04-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "1984 Part 2 Chapters 5, 6, 7",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-04-21T04:00:00.000Z",
            "assigned": "2025-04-22T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "1984 Part 2 Chapters 1-4 Quiz/Questions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-04-10T04:00:00.000Z",
            "assigned": "2025-04-21T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "1984 Part 1 Chapters 4-8",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2025-04-07T04:00:00.000Z",
            "assigned": "2025-04-14T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "1984 Part 1 Chapters 1, 2, 3",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 40,
            "possible": 40
          },
          "date": {
            "due": "2025-04-01T04:00:00.000Z",
            "assigned": "2025-04-10T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Colonialism \"Shooting an Elephant\" Colonialism George Orwell \"White Man's Burden\" Rudyard Kipling",
          "grade": {
            "letter": "A",
            "raw": 90,
            "color": "green"
          },
          "points": {
            "earned": 18,
            "possible": 20
          },
          "date": {
            "due": "2025-02-28T05:00:00.000Z",
            "assigned": "2025-04-08T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Victorian Poets",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-03-07T05:00:00.000Z",
            "assigned": "2025-04-03T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Romanticism Frankenstein Test",
          "grade": {
            "letter": "B",
            "raw": 84,
            "color": "blue"
          },
          "points": {
            "earned": 84,
            "possible": 100
          },
          "date": {
            "due": "2025-03-26T04:00:00.000Z",
            "assigned": "2025-03-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Essay (In class)",
          "grade": {
            "letter": "B",
            "raw": 86.67,
            "color": "blue"
          },
          "points": {
            "earned": 26,
            "possible": 30
          },
          "date": {
            "due": "2025-04-02T04:00:00.000Z",
            "assigned": "2025-03-25T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein 22-The end...  Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 35,
            "possible": 35
          },
          "date": {
            "due": "2025-03-13T04:00:00.000Z",
            "assigned": "2025-03-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Chapters 20 and 21Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-03-11T04:00:00.000Z",
            "assigned": "2025-03-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 13 Pronouns Page 604: Preview, Exercise 1, Exercise 3 Review A",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-03-07T05:00:00.000Z",
            "assigned": "2025-03-13T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Chapters 16 and 17 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-03-06T05:00:00.000Z",
            "assigned": "2025-03-10T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein 14 and 15 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-03-04T05:00:00.000Z",
            "assigned": "2025-03-06T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 12 Subject Verb Agreement page 582 Review A, Exercise 3 and 4 Review B",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-02-28T05:00:00.000Z",
            "assigned": "2025-03-06T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "IR Survey",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-03-04T05:00:00.000Z",
            "assigned": "2025-03-05T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Chapters 12 and 13 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-03-03T05:00:00.000Z",
            "assigned": "2025-03-04T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading Log 3 Semester 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-03-04T05:00:00.000Z",
            "assigned": "2025-03-04T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein 10 and 11 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2025-02-27T05:00:00.000Z",
            "assigned": "2025-03-03T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Chapters 8, 9 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-02-25T05:00:00.000Z",
            "assigned": "2025-02-27T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 11 Agreement page 576-582  Diagnostic Preview, Exercises 1 and 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-02-27T05:00:00.000Z",
            "assigned": "2025-02-27T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein 6, 7 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-02-24T05:00:00.000Z",
            "assigned": "2025-02-25T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading log 2 S2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-25T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Chapters 4 and 5 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-02-18T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Extra Credit Tissues",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "English 12 Research Paper",
          "grade": {
            "letter": "A",
            "raw": 91.33,
            "color": "green"
          },
          "points": {
            "earned": 137,
            "possible": 150
          },
          "date": {
            "due": "2025-01-31T05:00:00.000Z",
            "assigned": "2025-02-20T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein Chapters 1, 2, 3 Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-02-10T05:00:00.000Z",
            "assigned": "2025-02-18T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Frankenstein: Preface, Letters",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-02-06T05:00:00.000Z",
            "assigned": "2025-02-11T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Romantic Poets: Coleridge, Lord Byron, Shelley, Keats",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-02-10T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Reading Log  1 S2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-01-23T05:00:00.000Z",
            "assigned": "2025-01-23T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Romanticism: Nature Project",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2025-01-16T05:00:00.000Z",
            "assigned": "2025-01-23T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Samuel Taylor Coleridge Rime of the Ancient Mariner",
          "grade": {
            "letter": "C",
            "raw": 75,
            "color": "yellow"
          },
          "points": {
            "earned": 15,
            "possible": 20
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "William Wordsworth",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-21T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robert Burns: To a Mouse; To a Louse",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 15,
            "possible": 15
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-15T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Grammar 10: Clauses Exercises 1-4; Review A",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Student Letter (Seniors)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 20,
            "possible": 20
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "William Blake",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "NM HISTORY ",
      "period": 3,
            "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 1,
      "room": "H312 CLASSROOM",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 100.2,
        "color": "green"
      },
      "teacher": {
        "name": "Connor Garcia",
        "email": "Connor.Garcia@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 100.15,
            "color": "green"
          },
          "points": {
            "earned": 26.04,
            "possible": 26
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Extra Credit/Late Passes",
          "grade": {
            "letter": "A",
            "raw": null,
            "color": "green"
          },
          "points": {
            "earned": 0.1,
            "possible": 0
          },
          "date": {
            "due": "2025-05-23T04:00:00.000Z",
            "assigned": "2025-05-23T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Sub Day Assignment â€\" New Mexico History (After Map Test) ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-05-11T04:00:00.000Z",
            "assigned": "2025-05-12T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Western USA Map Quiz",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": 1
          },
          "date": {
            "due": "2025-05-19T04:00:00.000Z",
            "assigned": "2025-05-12T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "WWII Discussion (Scribe only!)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-05-09T04:00:00.000Z",
            "assigned": "2025-05-09T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "New Deal Scavenger Hunt",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-05-09T04:00:00.000Z",
            "assigned": "2025-05-07T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Submit Slides HERE!",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-05-02T04:00:00.000Z",
            "assigned": "2025-05-02T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Research Worksheet",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-30T04:00:00.000Z",
            "assigned": "2025-04-30T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Dust Bowl Lyrics Analysis",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-25T04:00:00.000Z",
            "assigned": "2025-04-27T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Art Reflection: Honoring Memory and Resistance",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-11T04:00:00.000Z",
            "assigned": "2025-04-14T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "S. America Map Quiz",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-16T04:00:00.000Z",
            "assigned": "2025-04-07T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Documentary 4/4",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-04T04:00:00.000Z",
            "assigned": "2025-04-04T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "In-class Essay: Road to Statehood",
          "grade": {
            "letter": "A",
            "raw": 94,
            "color": "green"
          },
          "points": {
            "earned": 0.94,
            "possible": 1
          },
          "date": {
            "due": "2025-03-28T04:00:00.000Z",
            "assigned": "2025-03-28T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Struggle For Statehood Graphic Organizer",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-10T04:00:00.000Z",
            "assigned": "2025-03-28T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "International Women's Day/Month",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-10T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Notebook Check 2 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-07T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-07T05:00:00.000Z",
            "assigned": "2025-03-07T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Short Answer: Primary Sources",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-26T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Creating an Original Primary Source",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-18T05:00:00.000Z",
            "assigned": "2025-02-18T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "The Long Walk (Scribe Only)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-14T05:00:00.000Z",
            "assigned": "2025-02-14T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Short Answer: Treaty of G.H.",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-12T05:00:00.000Z",
            "assigned": "2025-02-12T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Notebook Check 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-31T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "James K. Polk speech to Congress",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Short Answer: Immigration",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-27T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Texas Revolution DBQ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "8 Stages Worksheet",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-22T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Short answer: Genocide ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "NM Map",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-15T05:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "ENGR DESIGN 3 ",
      "period": 4,
            "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 2,
      "room": "C7 COMPUTER LAB",
      "weighted": false,
      "grade": {
        "letter": "A",
        "raw": 104.1,
        "color": "green"
      },
      "teacher": {
        "name": "Don Gonzales",
        "email": "gonzales_don@aps.edu"
      },
      "categories": [
        {
          "name": "Default5421",
          "weight": 1,
          "grade": {
            "letter": "A",
            "raw": 104.1,
            "color": "green"
          },
          "points": {
            "earned": 635,
            "possible": 610
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-05-08T04:00:00.000Z",
            "assigned": "2025-05-08T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-04-24T04:00:00.000Z",
            "assigned": "2025-04-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-04-21T04:00:00.000Z",
            "assigned": "2025-04-21T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Print-in-place ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 50,
            "possible": 50
          },
          "date": {
            "due": "2025-04-06T04:00:00.000Z",
            "assigned": "2025-04-07T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-04-03T04:00:00.000Z",
            "assigned": "2025-04-03T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Print in Place Design",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-04-01T04:00:00.000Z",
            "assigned": "2025-04-01T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Candy Bar",
          "grade": {
            "letter": "A",
            "raw": 125,
            "color": "green"
          },
          "points": {
            "earned": 125,
            "possible": 100
          },
          "date": {
            "due": "2025-03-13T04:00:00.000Z",
            "assigned": "2025-03-24T04:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Candy Bar Activity Graph",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 10,
            "possible": 10
          },
          "date": {
            "due": "2025-03-06T05:00:00.000Z",
            "assigned": "2025-03-06T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-03-04T05:00:00.000Z",
            "assigned": "2025-03-04T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-26T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Candy Bar Design",
          "grade": {
            "letter": "A",
            "raw": 120,
            "color": "green"
          },
          "points": {
            "earned": 30,
            "possible": 25
          },
          "date": {
            "due": "2025-02-24T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Solid Edge Crossword Puzzle",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-02-17T05:00:00.000Z",
            "assigned": "2025-02-18T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Final Robot Presentation",
          "grade": {
            "letter": "A",
            "raw": 95,
            "color": "green"
          },
          "points": {
            "earned": 95,
            "possible": 100
          },
          "date": {
            "due": "2025-02-13T05:00:00.000Z",
            "assigned": "2025-02-13T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robot Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-06T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robot Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-30T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robot Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-01-23T05:00:00.000Z",
            "assigned": "2025-01-23T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robot Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-16T05:00:00.000Z"
          },
          "category": "Default5421"
        },
        {
          "included": true,
          "notes": "",
          "name": "Robot Progress Check",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 25,
            "possible": 25
          },
          "date": {
            "due": "2025-01-07T05:00:00.000Z",
            "assigned": "2025-01-09T05:00:00.000Z"
          },
          "category": "Default5421"
        }
      ]
    },
    {
      "name": "AP CALC BC ",
      "period": 5,
            "gradingScale":{
  "rounding": {
    "percent": true,
    "percentPlaces": 2,
    "mark": false,
    "markPlaces": 0
  },
  "letterScale": [
    [
      "A",
      [
        89.5,
        100
      ]
    ],
    [
      "B",
      [
        79.5,
        89.49
      ]
    ],
    [
      "C",
      [
        69.5,
        79.49
      ]
    ],
    [
      "D",
      [
        59.5,
        69.49
      ]
    ],
    [
      "E",
      [
        0,
        59.49
      ]
    ]
  ]
},
      "layoutID": 3,
      "room": "Z109 CLASSROOM",
      "weighted": true,
      "grade": {
        "letter": "A",
        "raw": 97.34,
        "color": "green"
      },
      "teacher": {
        "name": "Anthony Orton",
        "email": "orton@aps.edu"
      },
      "categories": [
        {
          "name": "Homework",
          "weight": 0.1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 63,
            "possible": 63
          }
        },
        {
          "name": "Classwork",
          "weight": 0.1,
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 66,
            "possible": 66
          }
        },
        {
          "name": "Quiz",
          "weight": 0.3,
          "grade": {
            "letter": "A",
            "raw": 98.25,
            "color": "green"
          },
          "points": {
            "earned": 15.719999999999999,
            "possible": 16
          }
        },
        {
          "name": "Tests",
          "weight": 0.4,
          "grade": {
            "letter": "A",
            "raw": 95.33,
            "color": "green"
          },
          "points": {
            "earned": 2.86,
            "possible": 3
          }
        },
        {
          "name": "Final",
          "weight": 0.1,
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": 0,
            "possible": 0
          }
        }
      ],
      "assignments": [
        {
          "included": true,
          "notes": "",
          "name": "Calculus BC Spring Final Review",
          "grade": {
            "letter": "A",
            "raw": 93,
            "color": "green"
          },
          "points": {
            "earned": 0.93,
            "possible": 1
          },
          "date": {
            "due": "2025-05-05T04:00:00.000Z",
            "assigned": "2025-05-07T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "2017 International Practice Exam",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-05-02T04:00:00.000Z",
            "assigned": "2025-05-05T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "2018 International Practice Exam",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-04-23T04:00:00.000Z",
            "assigned": "2025-04-30T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "2019 International Practice Exam BC",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-04-21T04:00:00.000Z",
            "assigned": "2025-04-25T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom Unit 10 Progress Check: MCQ Part A",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-04T04:00:00.000Z",
            "assigned": "2025-04-21T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom Unit 10 Progress Check: MCQ Part B",
          "grade": {
            "letter": "A",
            "raw": 93,
            "color": "green"
          },
          "points": {
            "earned": 0.93,
            "possible": 1
          },
          "date": {
            "due": "2025-04-04T04:00:00.000Z",
            "assigned": "2025-04-21T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom Unit 10 Progress Check: MCQ Part C",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-04-14T04:00:00.000Z",
            "assigned": "2025-04-21T04:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 - Lesson 14 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-11T04:00:00.000Z",
            "assigned": "2025-04-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 - Lesson 14 KA HW1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-11T04:00:00.000Z",
            "assigned": "2025-04-14T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 - Lesson 14 KA HW2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-11T04:00:00.000Z",
            "assigned": "2025-04-14T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 - Lesson 15 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-11T04:00:00.000Z",
            "assigned": "2025-04-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 - Lesson 15 KA HW1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-11T04:00:00.000Z",
            "assigned": "2025-04-14T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 - Lessons 15 KA HW2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-04-11T04:00:00.000Z",
            "assigned": "2025-04-14T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calc_10-13 Under the Right Conditions)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-31T04:00:00.000Z",
            "assigned": "2025-04-04T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-12 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-31T04:00:00.000Z",
            "assigned": "2025-04-04T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-12 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-31T04:00:00.000Z",
            "assigned": "2025-04-04T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-13 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-31T04:00:00.000Z",
            "assigned": "2025-04-04T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-13 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-31T04:00:00.000Z",
            "assigned": "2025-04-04T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Calc_10-11_Can We Get a Better Approximation?)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-28T04:00:00.000Z",
            "assigned": "2025-03-31T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 10 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-28T04:00:00.000Z",
            "assigned": "2025-03-31T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 10 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-28T04:00:00.000Z",
            "assigned": "2025-03-31T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-11 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-28T04:00:00.000Z",
            "assigned": "2025-03-31T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-11 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-28T04:00:00.000Z",
            "assigned": "2025-03-31T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calc_10.8 Uncommon Ratios)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-26T04:00:00.000Z",
            "assigned": "2025-03-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 8 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-26T04:00:00.000Z",
            "assigned": "2025-03-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 8 HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-26T04:00:00.000Z",
            "assigned": "2025-03-28T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 9 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-26T04:00:00.000Z",
            "assigned": "2025-03-28T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-9 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-26T04:00:00.000Z",
            "assigned": "2025-03-28T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calc_10.1-10.5_How to Share a Pizza)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-14T04:00:00.000Z",
            "assigned": "2025-03-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 6 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-24T04:00:00.000Z",
            "assigned": "2025-03-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 6 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-24T04:00:00.000Z",
            "assigned": "2025-03-26T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 7 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-24T04:00:00.000Z",
            "assigned": "2025-03-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 7 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-24T04:00:00.000Z",
            "assigned": "2025-03-26T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-3 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-14T04:00:00.000Z",
            "assigned": "2025-03-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-3 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-14T04:00:00.000Z",
            "assigned": "2025-03-26T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-4 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-14T04:00:00.000Z",
            "assigned": "2025-03-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-4 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-14T04:00:00.000Z",
            "assigned": "2025-03-26T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-5 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-14T04:00:00.000Z",
            "assigned": "2025-03-26T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10-5 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-14T04:00:00.000Z",
            "assigned": "2025-03-26T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 - AP Classroom Lessons 1 and 2 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-12T04:00:00.000Z",
            "assigned": "2025-03-14T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 10-1 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-12T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 10-2 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-12T04:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-12T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 10 Lesson 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-10T04:00:00.000Z",
            "assigned": "2025-03-12T04:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 9 Test - Parametric Equations, Polar Coordinates, and Vector-Valued Functions",
          "grade": {
            "letter": "A",
            "raw": 94,
            "color": "green"
          },
          "points": {
            "earned": 0.94,
            "possible": 1
          },
          "date": {
            "due": "2025-03-05T05:00:00.000Z",
            "assigned": "2025-03-07T05:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Unit 9- Review 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-03T05:00:00.000Z",
            "assigned": "2025-03-05T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Unit 9- Review 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-03T05:00:00.000Z",
            "assigned": "2025-03-05T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 9 Progress Check: MCQ Part A",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-03T05:00:00.000Z",
            "assigned": "2025-03-05T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 9 Progress Check: MCQ Part B",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-03-03T05:00:00.000Z",
            "assigned": "2025-03-05T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.9",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-28T05:00:00.000Z",
            "assigned": "2025-03-03T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9.9 ->area-between-two-polar-curves",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-28T05:00:00.000Z",
            "assigned": "2025-03-03T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9.9 ->area-polar-calculator-active",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-28T05:00:00.000Z",
            "assigned": "2025-03-03T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.8 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Calc 9-8 Artic Regions)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson  9-8 ->area-bounded-by-polar-curves-intro",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson  9-8 ->area-enclosed-by-polar-graphs",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-7 ->/tangents-to-polar-curves ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-7 differentiate-polar-functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.7 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-26T05:00:00.000Z",
            "assigned": "2025-02-28T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calc_PC_m1_Lesson 13 (polar coordinates) ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-24T05:00:00.000Z",
            "assigned": "2025-02-26T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.5",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom - (BC ONLY) Integrating Vector-Valued Functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom - (BC ONLY) Solving Motion Problems Using Parametric and Vector-Valued Functions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Calc_9-6 The Lovely Ladybug (Part 2))",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW 3 Lesson 9-6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-27T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW Lesson 9-6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW Lesson 9-6 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Review/Quiz -> https://www.khanacademy.org/math/ap-calculus-bc/bc-advanced-functions-new/bc-9-6/quiz/bc-advanced-functions-new-quiz-2?referrer=upsell ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-21T05:00:00.000Z",
            "assigned": "2025-02-24T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom - 9.3 (BC ONLY) Defining and Differentiating Vector-Valued Functions Quiz - 3 questions",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "AP Classroom - 9.4(BC ONLY) Finding Arc Lengths of Curves Given by Parametric Equations ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Having a Ball)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-3 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-4 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-4 KA HW part 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.3 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_9.4 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Review/Quiz 9-1 to 9-3",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-19T05:00:00.000Z",
            "assigned": "2025-02-21T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-1 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-14T05:00:00.000Z",
            "assigned": "2025-02-19T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-2 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-14T05:00:00.000Z",
            "assigned": "2025-02-19T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 9-2 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-14T05:00:00.000Z",
            "assigned": "2025-02-19T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 9 - Lesson 1 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-14T05:00:00.000Z",
            "assigned": "2025-02-19T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 8 - Test ",
          "grade": {
            "letter": "A",
            "raw": 97,
            "color": "green"
          },
          "points": {
            "earned": 0.97,
            "possible": 1
          },
          "date": {
            "due": "2025-02-12T05:00:00.000Z",
            "assigned": "2025-02-14T05:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 8 - Review",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-10T05:00:00.000Z",
            "assigned": "2025-02-12T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-13 classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-07T05:00:00.000Z",
            "assigned": "2025-02-10T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-13 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-07T05:00:00.000Z",
            "assigned": "2025-02-10T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calc 8-10: Volume using the Washer Method Day 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-10 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-10 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-11 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-12 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.11 classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.12 classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-05T05:00:00.000Z",
            "assigned": "2025-02-07T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "8-9 KA HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (Best Thing Since Sliced Bread)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA - HW 8-8",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_HW Lesson 8-7- volumes-of-solids-of-known-cross-section ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_HW Lesson 8-7_volumes-with-square-and-rectangle-cross-sections ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.7 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 8 - Lessons 8-8 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 8 - Lessons 8-9 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-02-03T05:00:00.000Z",
            "assigned": "2025-02-05T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Quiz In AP Classroom (Due Monday 2/3/25) ",
          "grade": {
            "letter": "A",
            "raw": 94,
            "color": "green"
          },
          "points": {
            "earned": 0.94,
            "possible": 1
          },
          "date": {
            "due": "2025-01-31T05:00:00.000Z",
            "assigned": "2025-02-03T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Calc_8-5 and 8_6 How do You Build a Deck?",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW - Lesson 8.4 area between a curve and an axis",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW - Lesson 8-5 - area between a curve and the y axis",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW - Lesson 8-6 - area between curves that intersect at more than two points",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA HW Lesson 8-4 area between two curves and given end points",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.4",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.5 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.6 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-29T05:00:00.000Z",
            "assigned": "2025-01-31T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_8.2 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA 8-2 Homework analyzing motion problems",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson  8-3 Homework interpreting-definite-integrals-in-context ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson 8-3 Homework net-change-algebraic ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_8-2 Homework particle motion",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_8-3 Homework analyzing-problems-involving-definite-integrals",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-2 Desmos Activity(Connecting Position, Velocity, and Acceleration using Integrals)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-3 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-3 Desmos Activity (How Many People are at the Met?) ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-27T05:00:00.000Z",
            "assigned": "2025-01-29T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson 8-1 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-01-27T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 8-1 Desmos Activity(Finding the Perfect Rectangle)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-01-27T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 8 - Lesson 1 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-01-27T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "C - KA Lesson 7 Quiz 2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-22T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "C- KA Lesson 7 Quiz 1",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-22T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "C- KA Lesson 7 Unit Review",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-22T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 7 Progress Check: MCQ Part b in AP Classroom",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-22T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 7 Test ",
          "grade": {
            "letter": "A",
            "raw": 95,
            "color": "green"
          },
          "points": {
            "earned": 0.95,
            "possible": 1
          },
          "date": {
            "due": "2025-01-24T05:00:00.000Z",
            "assigned": "2025-01-24T05:00:00.000Z"
          },
          "category": "Tests"
        },
        {
          "included": true,
          "notes": "",
          "name": " Lesson_7.8 Classwork",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (How Fast Is The Corona Virus Spreading)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson  7.9 Homework",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson 7.8",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA Lesson 7.8 word problems",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_7.9 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-17T05:00:00.000Z",
            "assigned": "2025-01-22T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(AP Calculus BC 7.5 Getting Closer)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Review Topics 7.6-7.7)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA - Lesson 7-6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA - Lesson 7-6 find the error",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA-Lesson 7-6 identify separable equations",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 7-7 - indefinite integrals",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 7-7 - seperable differental equations",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_7.6",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_7.7 ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-15T05:00:00.000Z",
            "assigned": "2025-01-17T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 7.5 HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-13T05:00:00.000Z",
            "assigned": "2025-01-15T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson_7.5",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-13T05:00:00.000Z",
            "assigned": "2025-01-15T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Unit 7 Progress Check A In AP Classroom",
          "grade": {
            "letter": "A",
            "raw": 92,
            "color": "green"
          },
          "points": {
            "earned": 0.92,
            "possible": 1
          },
          "date": {
            "due": "2025-01-13T05:00:00.000Z",
            "assigned": "2025-01-15T05:00:00.000Z"
          },
          "category": "Quiz"
        },
        {
          "included": true,
          "notes": "",
          "name": "7-4 Practice ",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-10T05:00:00.000Z",
            "assigned": "2025-01-13T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Calc_7-3_Sketching Slope Fields)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-10T05:00:00.000Z",
            "assigned": "2025-01-13T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity(Seeing is Believing)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-10T05:00:00.000Z",
            "assigned": "2025-01-13T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson  7-4 HW",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-10T05:00:00.000Z",
            "assigned": "2025-01-13T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Lesson 7-3 HW ",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-01-10T05:00:00.000Z",
            "assigned": "2025-01-13T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "7.1_Modeling with Differential Equations",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "Desmos Activity (How Long Does Coffee Stay Hot)",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Classwork"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_HW 7-1",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "KA_HW_7-2",
          "grade": {
            "letter": "N/A",
            "raw": null,
            "color": "gray"
          },
          "points": {
            "earned": null,
            "possible": null
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Homework"
        },
        {
          "included": true,
          "notes": "",
          "name": "Verifying Solutions for Differential Equations_7.2",
          "grade": {
            "letter": "A",
            "raw": 100,
            "color": "green"
          },
          "points": {
            "earned": 1,
            "possible": 1
          },
          "date": {
            "due": "2025-01-08T05:00:00.000Z",
            "assigned": "2025-01-10T05:00:00.000Z"
          },
          "category": "Classwork"
        }
      ]
    }
  ],
  "period": {
    "name": "4th Quarter",
    "index": 3
  },
  "periods": [
    {
      "name": "1st Quarter (ended 275 days ago)",
      "index": 0
    },
    {
      "name": "2nd Quarter (ended 194 days ago)",
      "index": 1
    },
    {
      "name": "3rd Quarter (ended 111 days ago)",
      "index": 2
    },
    {
      "name": "4th Quarter (ended 35 days ago)",
      "index": 3
    }
  ]
}]


export {gradesCache}