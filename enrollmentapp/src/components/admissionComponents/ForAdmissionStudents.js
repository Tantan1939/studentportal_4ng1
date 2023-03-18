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

  function AdmitAllHandler(pks){
    alert(pks);
    getBatches();
  }

  function DeniedHandler(pk){
    alert(pk);
    getBatches();
  }

  return batchList.length ? (
    <div>
      <button> Exit </button>
      {renderBatches}
    </div>
  ) : (
    <div>
      <button> Exit </button>
      <h3> No Admission... </h3>
    </div>
  )
}
