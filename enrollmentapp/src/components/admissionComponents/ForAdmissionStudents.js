import React, {useState, useEffect} from 'react'
import StudentsPerBatch from './StudentsPerBatch'

export default function ForAdmissionStudents() {
  let [batchList, setBatchList] = useState([]);
  let [isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
    getBatches();
  }, [])

  let getBatches = async () => {
    let response = await fetch('/Registrar/Admission/Api/get/');
    let data = await response.json();
    setBatchList(data);
  }

  let renderBatches = batchList.map((admissionBatch, index) => (
    <StudentsPerBatch key={index} admissionBatch={admissionBatch} AdmitHandler={AdmitAllHandler} DeniedHandler={DeniedHandler}/>
  ))
  
  let CSRF = document.cookie.slice(10)

  function AdmitAllHandler(pks){
    let admit = async (pks) => {
      fetch('/Registrar/Admission/Api/admit/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": CSRF,
        },
        body: JSON.stringify({keys: pks})
      })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        getBatches();
      })
      .catch(error => {
        console.log(error)
      });
    }
    admit(pks);
  }

  function DeniedHandler(pk){
    let denied = async (pk) => {
      fetch('/Registrar/Admission/Api/denied/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": CSRF,
        },
        body: JSON.stringify({key: pk})
      })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        getBatches();
      })
      .catch(error => {
        console.log(error)
      });
    }
    denied(pk);
  }

  function exitHere(){
    window.location.href = '/Registrar/';
  }

  return batchList.length ? (
    <div>
      <button> Exit </button>
      {renderBatches}
    </div>
  ) : (
    <div>
      <button onClick={exitHere}> Exit </button>
      <h3> No Admission... </h3>
    </div>
  )
}
