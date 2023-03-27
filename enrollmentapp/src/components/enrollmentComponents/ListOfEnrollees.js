import React, {useState, useEffect} from 'react'
import EnrolleeDetails from './EnrolleeDetails';

export default function ListOfEnrollees({enrollmentBatch, DeniedEnrollee_Handler, AcceptEnrollees_Handler}) {
  let [enrolleesID, setEnrolleesID] = useState([]);

  useEffect(()=> {
    setEnrolleesID(enrollmentBatch.members.map(obj => get_id(obj)));
  }, [enrollmentBatch]);

  function get_id(obj){
    return obj.id
  };

  let render_enrollees = enrollmentBatch.members.map((enrollment, index) => (
    <EnrolleeDetails key={index} DeniedEnrollee_Handler={DeniedEnrollee_Handler} enrollment={enrollment}/>
  ));

  return (
    <div>
      <h3> Batch ID #{enrollmentBatch.id}    {enrollmentBatch.number_of_enrollment} Applicant/s   Assign To: {enrollmentBatch.section} </h3>
      <button> Select All </button>
      
      <button> Move To </button>
      <button onClick={() => AcceptEnrollees_Handler(enrolleesID, enrollmentBatch.id)}> Enrolled All </button>
      {render_enrollees}
    </div>
  )
}
