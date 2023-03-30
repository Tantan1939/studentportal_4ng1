import React, {useState, useEffect} from 'react'
import EnrolleeDetails from './EnrolleeDetails';
import EnrollAllConfirmationModal from './enrollmentModals/EnrollAllConfirmationModal';

export default function ListOfEnrollees({enrollmentBatch, DeniedEnrollee_Handler, AcceptEnrollees_Handler, move_function}) {
  let [enrolleesID, setEnrolleesID] = useState([]);
  let [batchID, setBatchID] = useState(enrollmentBatch.id);

  const [enrollAllModal, setEnrollAllModal] = useState(false);

  useEffect(()=> {
    setEnrolleesID(enrollmentBatch.members.map(obj => get_id(obj)));
    setBatchID(enrollmentBatch.id);
  }, [enrollmentBatch]);

  function get_id(obj){
    return obj.id
  };

  let render_enrollees = enrollmentBatch.members.map((enrollment, index) => (
    <EnrolleeDetails key={index} DeniedEnrollee_Handler={DeniedEnrollee_Handler} enrollment={enrollment} batchID={batchID} move_function={move_function} />
  ));

  return (
    <div>
      <h3> Batch ID #{batchID}    {enrollmentBatch.number_of_enrollment} Applicant/s   Assign To: {enrollmentBatch.section} </h3>
      <button> Select All </button>
      
      <button> Move To </button>
      <button onClick={() => setEnrollAllModal(true)}> Enrolled All </button>
      <EnrollAllConfirmationModal open={enrollAllModal} closeModalFunc={() => setEnrollAllModal(false)} AcceptEnrollees_Handler={AcceptEnrollees_Handler} enrolleesID={enrolleesID} batchID={batchID} section={enrollmentBatch.section} number_of_enrollment={enrollmentBatch.number_of_enrollment}/>

      {render_enrollees}
    </div>
  )
}
