import React, {useState, useEffect} from 'react'
import StudentLists from './StudentLists'

export default function StudentsPerBatch({admissionBatch, AdmitHandler, DeniedHandler}) {

  let [admitAllPks, setAdmitAllPks] = useState([])

  useEffect(()=> {
    setAdmitAllPks(admissionBatch.members.map(obj => get_id(obj)))
  }, [admissionBatch])

  let renderAdmissionApplicants = admissionBatch.members.map((admission, index) => (
    <StudentLists key={index} admission={admission} DeniedHandler={DeniedHandler}/>
  ))

  function get_id(obj){
    return obj.id
  }

  return admitAllPks.length ? (
    <div>
      <h3> Batch ID #{admissionBatch.id} - {admissionBatch.number_of_applicants} Applicant/s </h3>
      <button onClick={() => AdmitHandler(admitAllPks)}> Admit All </button>
      {renderAdmissionApplicants}
    </div>
  ) : (
    <div>
      <h3> No Applicants... </h3>
    </div>
  )
}
