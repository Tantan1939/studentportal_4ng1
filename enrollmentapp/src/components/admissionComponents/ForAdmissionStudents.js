import React, {useState, useEffect} from 'react'
import StudentsPerBatch from './StudentsPerBatch'

export default function ForAdmissionStudents() {
  let [batchList, setBatchList] = useState([]);

  useEffect(()=>{
    getBatches();
  }, [])

  let getBatches = async () => {
    let response = await fetch('/Registrar/Admission/Api/getadmission/');
    let data = await response.json();
    setBatchList(data);
  }

  let renderBatches = batchList.map((admissionBatch, index) => (
    <StudentsPerBatch key={index} admissionBatch={admissionBatch} AdmitHandler={AdmitAllHandler} DeniedHandler={DeniedHandler}/>
  ))
  
  let CSRF = document.cookie.slice(10)

  function AdmitAllHandler(pks){
    let admit = async (pks) => {
      fetch('/Registrar/Admission/Api/admitApplicants/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": CSRF,
        },
        body: JSON.stringify({keys: pks})
      }).then(response => response.json()).then(json => console.log(json))
    }
    admit(pks);
    getBatches();
  }

  function clickhands(){
    let admit = async (pks) => {
      fetch('/Registrar/Admission/Api/clickhere/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": CSRF,
        },
        body: JSON.stringify({keys: "Nothing here"})
      }).then(response => response.json()).then(json => console.log(json))
    }
    admit();
    getBatches();
  }

  function DeniedHandler(pk){
    let denied = async (pk) => {
      fetch('/Registrar/Admission/Api/deniedAdmission/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": CSRF,
        },
        body: JSON.stringify({key: pk})
      }).then(response => response.json()).then(json => console.log(json))
    }
    denied(pk);
    getBatches();
  }

  return batchList.length ? (
    <div>
      <button> Exit </button>
      {renderBatches}
      <button onClick={clickhands}> Click me baby </button>
    </div>
  ) : (
    <div>
      <button> Exit </button>
      <h3> No Admission... </h3>
      <button onClick={clickhands}> Click me baby </button>
    </div>
  )
}
