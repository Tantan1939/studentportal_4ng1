import React, {useState, useEffect} from 'react';
import RenderStudentImage from './RenderStudentImage';

export default function RenderBatchMembersWithSelect({open, members, setIsNextClose, targetBatch, closeModalFunc, selectedPKs, freeSpace}) {
    let [checkBoxes, setCheckBoxes] = useState({});
    let [checkedBoxes, setCheckedBoxes] = useState([]);
    let [warningMessage, setWarningMessage] = useState('');

    useEffect(()=> {
        if (open){
            setCheckedBoxes([]);

            members.forEach(member => {
                setCheckBoxes(prevState => ({ ...prevState, [member.id]:false }));
            });
        }
    }, [open]);

    useEffect(()=>{

    }, []);

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

    let render_members = members.map((member, index) => (
        <div>
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

        <div className='btnContainer'>
            <button className='btnOutline' onClick={setIsNextClose}>
                <span className='bold'> Back </span>
            </button>

            <button className='btnOutline' onClick={() => closeThisModal()}>
                <span className='bold'> Cancel, exit </span>
            </button>

        </div>
    </div>
  )
}
