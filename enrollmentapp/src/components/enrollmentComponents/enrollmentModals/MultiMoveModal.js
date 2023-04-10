import React, {useState, useEffect} from 'react';
import RenderBatchMembersWithSelect from '../ComponentRenderer/RenderBatchMembersWithSelect';

export default function MultiMoveModal({open, closeModalFunc, selectedPKs, batchID, move_multiple_enrollees}) {

    let [isNext, setIsNext] = useState(false);
    let [batchs, setBatchs] = useState([]);
    let [batchMembers, setBatchMembers] = useState(null);

    useEffect(()=>{
        if (open && !isNext){
            getBatches(batchID);
        }
    }, [open, isNext]);

    let getBatches = async (batchID) => {
        try{
          let response = await fetch(`/Registrar/Enrollment/Api/Batchesv2/${batchID}/`);
    
          if (response.status === 200){
            let data = await response.json();
            setBatchs(data);
          } else {
            errorHandler("No batch found. Please refresh your page.");
          }
          
        } catch (error) {
          errorHandler(error);
        };
    };

    let render_batchs = batchs.map((details, index) => (
        <div key={index}>
            <h4 className='hover px-4 py-2' style={{cursor:'pointer',transition:'0.3s ease'}} onClick={() => {
                setBatchMembers(<RenderBatchMembersWithSelect open={open} members={details.members} setIsNextClose={()=> setIsNext(false)} closeModalFunc={closeModalFunc} move_multiple_enrollees={move_multiple_enrollees} targetBatch={details.id} currentBatch={batchID} selectedPKs={selectedPKs} />);
                setIsNext(true);
            }}>
                {details.section}: {details.count_members}/{details.allowed_students} {details.is_full ? <p style={{color: "red"}}> - Full </p> : ""}
            </h4>
        </div>
    ));

    function errorHandler(error){
        closeModalFunc();
        console.error(error);
    };

    if (!open) return null;

  return (
    <div className='overlay' onClick={()=> {
        closeModalFunc();
        setIsNext(false);
    }}>
        <div onClick={(e) => e.stopPropagation()} className='modalContainer'>
            <div className='modalRight'>
                <p onClick={()=> {
                    closeModalFunc();
                    setIsNext(false);
                }} className='closeBtn'> X </p>

                {isNext ? (
                    <div> {batchMembers} </div>
                ) : (
                    <div>
                        <div className='content'>
                            Select a Batch
                        </div>

                        {render_batchs}

                        <div className='btnContainer'>
                            <button className='btnOutline'>
                                <span className='bold' onClick={closeModalFunc}> Exit </span>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    </div>
  )
}
