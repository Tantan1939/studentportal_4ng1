import React, {useState, useEffect} from 'react';
import RenderStudentImage from './RenderStudentImage';

export default function RenderBatchMembersWithSelect({open, members, setIsNextClose, closeModalFunc, move_multiple_enrollees, targetBatch, currentBatch, selectedPKs}) {
    let [checkBoxes, setCheckBoxes] = useState({});
    let [checkedBoxes, setCheckedBoxes] = useState([]);

    useEffect(()=> {
        if (open){
            setCheckedBoxes([]);

            members.forEach(member => {
                setCheckBoxes(prevState => ({ ...prevState, [member.id]:false }));
            });
        }
    }, [open]);

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

    function closeThisModal(){
        setIsNextClose();
        closeModalFunc();
    };

    function exchange_swap_this(selectedPKs, currentBatch, targetBatch, checkedBoxes){
        closeThisModal();
        setTimeout(() => {
            move_multiple_enrollees(selectedPKs, currentBatch, targetBatch, checkedBoxes);
        }, 100);
    };

    let render_members = members.map((member, index) => (
        <div className='px-4 d-flex align-items-center' key={index}>
            <input type={'checkbox'} name={member.id} checked={checkBoxes[member.id]} onChange={handleCheckboxChanges} />
            <RenderStudentImage key={index} image={member.stud_pict[0].user_image}/> {member.full_name} - {member.age}
        </div>
    ));


  return (
    <div>
        <div className='content'>
            {members.length ? (
                <div>
                    <p> Select Enrollee/s </p>
                </div>
            ) : (
                <div>
                    <p> You can simply click the Move button down here to move enrollees to this batch. </p>
                </div>
            )}
        </div>

        {render_members}

        <div className='btnContainer moveone'>
            <button className='btn btn-dark' onClick={setIsNextClose}>
                <span className='bold'> Back </span>
            </button>

            <button className='btn btn-success mx-2'>
                <span className='bold' onClick={()=> exchange_swap_this(selectedPKs, currentBatch, targetBatch, checkedBoxes)}> Move </span>
            </button>

            <button className='btn btn-danger' onClick={() => closeThisModal()}>
                <span className='bold'> Cancel, exit </span>
            </button>
        </div>
    </div>
  )
}
