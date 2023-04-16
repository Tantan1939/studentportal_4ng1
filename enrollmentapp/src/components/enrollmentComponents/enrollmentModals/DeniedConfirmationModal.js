import React from 'react'

function DeniedConfirmationModal({open, closeModalFunc, DeniedEnrollee_Handler, enrollment, studentPicture}) {
    if (!open) return null;

    return (
        <div onClick={closeModalFunc} className='overlay'>
          <div onClick={(e) => {
            e.stopPropagation();
          }} className='modalContainer'>
            <img style={{padding:'20px',borderRadius:'100px'}} src={studentPicture} alt="" />
    
            <div className='modalRight' style={{display:'flex', flexDirection:'column',justifyContent:'space-between'}}>
                <p onClick={closeModalFunc} className='closeBtn' style={{fontSize:'32px',fontWeight:'700'}}> &times; </p>
                <div className='content'>
                    Do you want to deny {enrollment.full_name}?
                </div>
    
                <div className='btnContainer moveone d-flex justify-content-center'>
                    <button className='btn btn-success mx-2'>
                        <span className='bold' onClick={() => {
                            closeModalFunc();
                            const delay_handler = setTimeout(() => DeniedEnrollee_Handler(enrollment.id), 100);
                            return () => clearTimeout(delay_handler);
                        }}> Yes </span>
                    </button>
                    <button className='btn btn-danger'>
                        <span className='bold' onClick={closeModalFunc}> No, exit </span>
                    </button>
                </div>
            </div>
          </div>
        </div>
    )
}

export default DeniedConfirmationModal
