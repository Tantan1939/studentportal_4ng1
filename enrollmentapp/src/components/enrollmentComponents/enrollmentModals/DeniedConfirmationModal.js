import React from 'react'

function DeniedConfirmationModal({open, closeModalFunc, DeniedEnrollee_Handler, enrollment, studentPicture}) {
    if (!open) return null;

    return (
        <div onClick={closeModalFunc} className='overlay'>
          <div onClick={(e) => {
            e.stopPropagation();
          }} className='modalContainer'>
            <img src={studentPicture} alt="" />
    
            <div className='modalRight'>
                <p onClick={closeModalFunc} className='closeBtn'> X </p>
                <div className='content'>
                    Do you want to deny {enrollment.full_name}?
                </div>
    
                <div className='btnContainer'>
                    <button className='btnPrimary'>
                        <span className='bold' onClick={() => {
                            closeModalFunc();
                            const delay_handler = setTimeout(() => DeniedEnrollee_Handler(enrollment.id), 100);
                            return () => clearTimeout(delay_handler);
                        }}> Yes </span>
                    </button>
                    <button className='btnOutline'>
                        <span className='bold' onClick={closeModalFunc}> No, exit </span>
                    </button>
                </div>
            </div>
          </div>
        </div>
    )
}

export default DeniedConfirmationModal
