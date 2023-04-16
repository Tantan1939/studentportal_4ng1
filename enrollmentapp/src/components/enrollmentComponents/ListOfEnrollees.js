import React, {useState, useEffect} from 'react'
import EnrolleeDetails from './EnrolleeDetails';
import EnrollAllConfirmationModal from './enrollmentModals/EnrollAllConfirmationModal';
import MultiMoveModal from './enrollmentModals/MultiMoveModal';
import './enrollment.css';

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
    <div className='d-flex  border rounded p-2 px-3 mb-3'>
      <div className='inputBox align-self-center'>
      <input style={{height:'15px',width:'15px'}} className='me-3' type={'checkbox'} name={enrollment.id} checked={checkBoxes[enrollment.id]} onChange={handleCheckboxChanges} />
      </div>
      <EnrolleeDetails key={index} DeniedEnrollee_Handler={DeniedEnrollee_Handler} enrollment={enrollment} batchID={batchID} move_function={move_function} />
   
    </div>
  ));
 
  const fontSize = {
    fontSize:'19px',
    fontWeight:'600'
  }
  


  return (
    <div className='mt-3'>
        <div className="accordion" id="accordionExample">
          <div className="accordion-item transition">
              <div className="accordion-header" id="headingOne">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${batchID}`} aria-expanded="false" aria-controls={`collapse${batchID}`}>
                <span className='me-4' style={fontSize}>Batch ID #{batchID}</span>
                <span className='me-4' style={fontSize}>{enrollmentBatch.number_of_enrollment} Applicant/s</span>
                <span className='me-4' style={fontSize}>Assign To: {enrollmentBatch.section}</span> 
                </button>
              </div>
          </div>
        </div>
        <div  style={{transition:"0.5s ease"}} id={`collapse${batchID}`} class={`border border-top-0 bg-light accordion-collapse pt-4 px-2 pb-2 collapse accord`} aria-labelledby="headingOne" data-bs-parent={`collapse${batchID}`}
        >
                <div class="accordion-body" >
                      <div className='buttons mb-3'>
                        <button className='btn btn-dark me-2' onClick={()=> isSelectAll ? clear_checks() : check_all()}> {isSelectAll ? (<div>Deselect All</div>) : (<div> Select All </div>)} </button>
                        
                        <button className='btn btn-dark me-2' onClick={() => {
                          if (checkedBoxes.length > 0){
                            setOpenMultiMoveModal(true);
                          } else {
                            alert('Select an enrollee.');
                          }
                        }}> Move To </button>
                        <MultiMoveModal open={openMultiMoveModal} closeModalFunc={()=> setOpenMultiMoveModal(false)} selectedPKs={checkedBoxes} batchID={batchID} move_multiple_enrollees={move_multiple_enrollees}/>

                        <button className='btn btn-dark me-2' onClick={() => setEnrollAllModal(true)}> Enrolled All </button>
                        <EnrollAllConfirmationModal open={enrollAllModal} closeModalFunc={() => setEnrollAllModal(false)} AcceptEnrollees_Handler={AcceptEnrollees_Handler} enrolleesID={enrolleesID} batchID={batchID} section={enrollmentBatch.section} number_of_enrollment={enrollmentBatch.number_of_enrollment}/>
                      </div>
                      {render_enrollees}
                  </div>          
          </div>
    </div>
  )
}
