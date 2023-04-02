import React, {useState, useEffect} from 'react'
import EnrolleeDetails from './EnrolleeDetails';
import EnrollAllConfirmationModal from './enrollmentModals/EnrollAllConfirmationModal';
import MultiMoveModal from './enrollmentModals/MultiMoveModal';

export default function ListOfEnrollees({enrollmentBatch, DeniedEnrollee_Handler, AcceptEnrollees_Handler, move_function, move_multiple_enrollees}) {
  let [enrolleesID, setEnrolleesID] = useState([]);
  let [batchID, setBatchID] = useState(enrollmentBatch.id);
  let [checkBoxes, setCheckBoxes] = useState({});
  let [checkedBoxes, setCheckedBoxes] = useState([]);

  let [openMultiMoveModal, setOpenMultiMoveModal] = useState(false);
  let [enrollAllModal, setEnrollAllModal] = useState(false);
  let [isSelectAll, setSelectAll] = useState(false);

  useEffect(()=> {
    setEnrolleesID(enrollmentBatch.members.map(obj => get_id(obj)));
    setBatchID(enrollmentBatch.id);
    setSelectAll(false);

    enrollmentBatch.members.forEach(enrollment => {
      setCheckBoxes(prevState => ({ ...prevState, [enrollment.id]: false}));
    });
    setCheckedBoxes([]);
  }, [enrollmentBatch]);
  
  function get_id(obj){
    return obj.id
  };

  useEffect(()=> {
    if (checkedBoxes.length < 1){
      setSelectAll(false);
    }
  }, [checkedBoxes]);

  const handleCheckboxChanges = (event) => {
    const {name, checked} = event.target;

    setCheckBoxes(prevState => ({
      ...prevState,
      [name]:checked
    }));

    if (checked) {
      setCheckedBoxes(prevState => [...prevState, name]);
    } else {
      setCheckedBoxes(prevState => prevState.filter(item => item !== name));
    };
  };

  function check_all(){
    enrollmentBatch.members.forEach(enrollment => {
      setCheckBoxes(prevState => ({ ...prevState, [enrollment.id]: true}));
    });

    setCheckedBoxes(enrolleesID.map((enrolleeID) => enrolleeID.toString()));
    setSelectAll(true);
  }

  function clear_checks(){
    enrollmentBatch.members.forEach(enrollment => {
      setCheckBoxes(prevState => ({ ...prevState, [enrollment.id]: false}));
    });
    setCheckedBoxes([]);
    setSelectAll(false);
  }

  let render_enrollees = enrollmentBatch.members.map((enrollment, index) => (
    <div>
      <input type={'checkbox'} name={enrollment.id} checked={checkBoxes[enrollment.id]} onChange={handleCheckboxChanges} />
      <EnrolleeDetails key={index} DeniedEnrollee_Handler={DeniedEnrollee_Handler} enrollment={enrollment} batchID={batchID} move_function={move_function} />
    </div>
  ));

  return (
    <div>

      <h3> Batch ID #{batchID}  {enrollmentBatch.number_of_enrollment} Applicant/s   Assign To: {enrollmentBatch.section} </h3>
      <button onClick={()=> isSelectAll ? clear_checks() : check_all()}> {isSelectAll ? (<p>Deselect All</p>) : (<p> Select All </p>)} </button>
      
      <button onClick={() => {
        if (checkedBoxes.length > 0){
          setOpenMultiMoveModal(true);
        } else {
          alert('Select an enrollee.');
        }
      }}> Move To </button>
      <MultiMoveModal open={openMultiMoveModal} closeModalFunc={()=> setOpenMultiMoveModal(false)} selectedPKs={checkedBoxes} batchID={batchID} move_multiple_enrollees={move_multiple_enrollees}/>

      <button onClick={() => setEnrollAllModal(true)}> Enrolled All </button>
      <EnrollAllConfirmationModal open={enrollAllModal} closeModalFunc={() => setEnrollAllModal(false)} AcceptEnrollees_Handler={AcceptEnrollees_Handler} enrolleesID={enrolleesID} batchID={batchID} section={enrollmentBatch.section} number_of_enrollment={enrollmentBatch.number_of_enrollment}/>

      {render_enrollees}
    </div>
  )
}
