import React, {useState, useEffect} from 'react'
import RenderStudentImage from '../ComponentRenderer/RenderStudentImage';

function MoveToModal({open, closeModalFunc, batchID, enrollmentID, move_function}) {

  let [batchs, setBatchs] = useState([]);
  let [batchMembers, setBatchMembers] = useState([]);
  let [isFull, setIsFull] = useState(false);
  let [warningMsg, setWarningMsg] = useState('');

  // Move parameters
  let [selectedPk, setSelectedPk] = useState(null);
  let [targetBatch, setTargetBatch] = useState(null);

  const [isNext, setIsNext] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  useEffect(()=>{
    getBatches(batchID, enrollmentID);
  }, [isNext, open]);

  useEffect(()=>{
    if (isFull === true) setWarningMsg('Batch is Full. Select an enrollee to swap (required).');
  }, [isFull]);

  let getBatches = async (batchID, enrollmentID) => {
    try{
      let response = await fetch(`/Registrar/Enrollment/Api/Batches/${batchID}/${enrollmentID}/`);

      if (response.status === 200){
        let data = await response.json();
        setBatchs(data);
      } else {
        errorHandler("No batch found. Please refresh your page.");
      }
      
    } catch (error) {
      console.error(error);
    };
  };

  function errorHandler(error){
    setBatchs([]);
    console.error(error);
  };

  let renderBatch = batchs.map((details, index) => (
    <div key={index}>
      <h4 className='hover px-4 py-2' style={{cursor:'pointer',transition:'0.3s ease'}} onClick={() => {
        setBatchMembers(details.members);
        setIsNext(true);
        setIsFull(() => details.count_members >= details.allowed_students);
        setTargetBatch(details.id);
      }}> {details.section}   {details.count_members}/{details.allowed_students}   {details.is_full ? <p style={{color: "red"}}> Full </p> : ""} </h4>
    </div>
  ));

  let renderBatchMembers = batchMembers.map((member_details, index) => (
    <div key={index} className={isHovered ? 'hover-bg' : isClicked ? 'clicked-bg' : ''} onMouseEnter={()=> setIsHovered(!isHovered)} onMouseLeave={()=> setIsHovered(!isHovered)} onClick={() => {
      setSelectedPk(selectedPk ? null : member_details.id);
      setWarningMsg('');
      setIsClicked(!isClicked);
    }}>
      <h4>
        <RenderStudentImage key={index} image={member_details.stud_pict[0].user_image}/> {member_details.full_name} - {member_details.age}
      </h4>
    </div>
  ));

  function onOut_func(){
    setIsNext(false);
    setSelectedPk(null);
    setIsFull(false);
    reset_hover_effects();
    closeModalFunc();
  };

  function reset_hover_effects(){
    setIsHovered(false);
    setIsClicked(false);
  };

  function call_move_function(currentID, currentBatch, targetBatch, selectedPk){
    onOut_func();
    setTimeout(() => move_function(currentID, currentBatch, targetBatch, selectedPk), 100);
  };


  if (!open) return null;

  return (
    <div>
      <div onClick={() => onOut_func()} className='overlay'>
        <div onClick={(e) => {
          e.stopPropagation();
        }} className='modalContainer'>
          <div className='modalRight'>
            <p onClick={() => onOut_func()} className='closeBtn ms-2' style={{fontSize:'32px',fontWeight:'700'}}> &times; </p>

            {isNext ? (
              <div>
                <div className='content'>
                    {batchMembers.length ? (
                      <div>
                        <p> Select an Enrollee </p>
                        {warningMsg}
                      </div>
                    ) : (
                      <div>
                        You can simply click the Change button down here to move an enrollee to this batch.
                      </div>
                    )}
                </div>

                {renderBatchMembers}

                <div className='btnContainer moveone'>
                    <button className='btn btn-dark m-0'>
                        <span className='bold' onClick={() => {
                          setSelectedPk(null);
                          setIsFull(false);
                          reset_hover_effects();
                          setIsNext(false);
                        }}> Back </span>
                    </button>

                    {batchMembers.length ? (
                      <div className='mx-2 btn p-0'>
                        {selectedPk && <div>
                            <button className='btn btn-success mx-2'>
                                <span className='bold' onClick={() => call_move_function(enrollmentID, batchID, targetBatch, selectedPk)}> Move </span>
                            </button>
                          </div>}

                        {!selectedPk && <div>
                            {!isFull && <div>
                                  <button className='btn btn-success mx-2'>
                                    <span className='bold' onClick={() => call_move_function(enrollmentID, batchID, targetBatch, selectedPk)}> Move </span>
                                  </button>
                              </div>}
                          </div>}
                      </div>
                    ) : (
                      <div className='mx-2 btn p-0'>
                        <button className='btn btn-success m-0'>
                            <span className='bold' onClick={() => call_move_function(enrollmentID, batchID, targetBatch, selectedPk)}> Move </span>
                        </button>
                      </div>
                    )}

                    <button className='btn btn-danger m-0'>
                        <span className='bold' onClick={() => onOut_func()}> Cancel, exit </span>
                    </button>
                </div>
              </div>
            ) : (
              <div>
                <div className='content'>
                    Choose a Batch
                </div>
                <div style={{maxHeight:'280px',overflowY:'auto'}}>
                  {renderBatch}
                </div>

                <div className='px-3 py-3'>
                    <button className='btn btn-danger w-100 py-2'>
                        <span className='bold' onClick={() => {
                          closeModalFunc();
                        }}> Cancel, exit </span>
                    </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default MoveToModal
