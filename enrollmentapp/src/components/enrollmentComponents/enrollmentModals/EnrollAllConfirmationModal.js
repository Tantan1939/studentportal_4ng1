import React from 'react'

function EnrollAllConfirmationModal({open, closeModalFunc, AcceptEnrollees_Handler, enrolleesID, batchID, section, number_of_enrollment}) {
  if (!open) return null;

  return (
      <div onClick={closeModalFunc} className='overlay'>
        <div onClick={(e) => {
          e.stopPropagation();
        }} className='modalContainer d-flex flex-column'>
            <p onClick={closeModalFunc} className='closeBtn' style={{fontSize:'32px',fontWeight:'700'}}> &times; </p>
            <div className='content'>
                Do you want to enroll {number_of_enrollment} applicant/s and assign them to {section}?
            </div>

            <div className='btnContainer moveone'>
                <button className='btn btn-success me-2'>
                    <span className='bold' onClick={() => {
                        closeModalFunc();
                        const delay_handler = setTimeout(() => AcceptEnrollees_Handler(enrolleesID, batchID), 100);
                        return () => clearTimeout(delay_handler);
                    }}> Yes </span>
                </button>
                <button className='btn btn-danger'>
                    <span className='bold' onClick={closeModalFunc}> No, exit </span>
                </button>
            </div>
        </div>
      </div>
  )
}

export default EnrollAllConfirmationModal
