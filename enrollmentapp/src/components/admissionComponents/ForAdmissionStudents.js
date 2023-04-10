import React, {useState, useEffect} from 'react'
import StudentsPerBatch from './StudentsPerBatch'

export default function ForAdmissionStudents() {
  let [batchList, setBatchList] = useState([]);
  let [isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
    getBatches();
  }, []);

  let getBatches = async () => {
    try {
      let response = await fetch('/Registrar/Admission/Api/get/');
      let data = await response.json();
      setBatchList(data);
    } catch (error) {
      console.error(error);
      setBatchList([]);
    };
  };

  let renderBatches = batchList.map((admissionBatch, index) => (
    <StudentsPerBatch key={index} admissionBatch={admissionBatch} AdmitHandler={AdmitAllHandler} DeniedHandler={DeniedHandler}/>
  ));
  
  let CSRF = document.cookie.slice(10);

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
        console.log(data);
        getBatches();
      })
      .catch(error => console.error(error));
    }
    admit(pks);
  };

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
        console.log(data);
        getBatches();
      })
      .catch(error => console.log(error));
    }
    denied(pk);
  };

  return batchList.length ? (
    <div class="container pt-3">
    <div class="w-100 mt-3 d-flex pt-3 justify-content-end">
      <button class="btn btn-primary btn-md" onClick={() => window.location.href = '/Registrar/'}> Exit </button>
      </div>
      
      {renderBatches}
  
      </div>
  ) : (

    <div class="container pt-5">




<div class="card text-center">
  <div class="card-header">
    ADMISSION
  </div>
  <div class="card-body">
    <h5 class="card-title">No Admission...</h5>
    <button class="btn btn-primary btn-lg mt-3"onClick={() => window.location.href = '/Registrar/'}> Exit </button>
    <p class="card-text"></p>

  </div>
  <div class="card-footer text-muted">
  </div>
</div>
  </div>
    
  )
}
