import React, {useState, useEffect} from 'react'

function MoveToModal({open, closeModalFunc, batchID, enrollmentID, move_function}) {

  let [batchs, setBatchs] = useState([]);
  let [batchMembers, setBatchMembers] = useState([]);
  let [isFull, setIsFull] = useState(false);
  let [warningMsg, setWarningMsg] = useState('');

  // Move parameters
  let [selectedPk, setSelectedPk] = useState(null);
  let [targetBatch, setTargetBatch] = useState(null);

  const [isNext, setIsNext] = useState(false);
  
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
      <h4 onClick={() => {
        setBatchMembers(details.members);
        setIsNext(true);
        setIsFull(() => details.count_members >= details.allowed_students);
        setTargetBatch(details.id);
      }}> #{details.id}: {details.section}   {details.count_members}/{details.allowed_students}   {details.is_full ? <p style={{color: "red"}}> Full </p> : ""} </h4>
    </div>
  ));

  let renderBatchMembers = batchMembers.map((member_details, index) => (
    <div key={index} onClick={() => {
      setSelectedPk(member_details.id);
      setWarningMsg('');
    }}>
      <h4>
        {member_details.full_name} - {member_details.age}
      </h4>
    </div>
  ));

  function onOut_func(){
    setIsNext(false);
    setSelectedPk(null);
    setIsFull(false);
    closeModalFunc();
  }

  function call_move_function(currentID, currentBatch, targetBatch, selectedPk){
    onOut_func();
    setTimeout(() => move_function(currentID, currentBatch, targetBatch, selectedPk), 100);
  }


  if (!open) return null;

  return (
    <div>
      <div onClick={() => onOut_func()} className='overlay'>
        <div onClick={(e) => {
          e.stopPropagation();
        }} className='modalContainer'>
          <div className='modalRight'>
            <p onClick={() => onOut_func()} className='closeBtn'> X </p>

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

                <div className='btnContainer'>
                    <button className='btnOutline'>
                        <span className='bold' onClick={() => {
                          setSelectedPk(null);
                          setIsFull(false);
                          setIsNext(false);
                        }}> Back </span>
                    </button>

                    {batchMembers.length ? (
                      <div>
                        {selectedPk && <div>
                            <button className='btnOutline'>
                                <span className='bold' onClick={() => call_move_function(enrollmentID, batchID, targetBatch, selectedPk)}> Move </span>
                            </button>
                          </div>}

                        {!selectedPk && <div>
                            {!isFull && <div>
                                  <button className='btnOutline'>
                                    <span className='bold' onClick={() => call_move_function(enrollmentID, batchID, targetBatch, selectedPk)}> Move </span>
                                  </button>
                              </div>}
                          </div>}
                      </div>
                    ) : (
                      <div>
                        <button className='btnOutline'>
                            <span className='bold' onClick={() => call_move_function(enrollmentID, batchID, targetBatch, selectedPk)}> Move </span>
                        </button>
                      </div>
                    )}

                    <button className='btnOutline'>
                        <span className='bold' onClick={() => onOut_func()}> Cancel, exit </span>
                    </button>
                </div>
              </div>
            ) : (
              <div>
                <div className='content'>
                    Choose a Batch
                </div>

                {renderBatch}

                <div className='btnContainer'>
                    <button className='btnOutline'>
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
