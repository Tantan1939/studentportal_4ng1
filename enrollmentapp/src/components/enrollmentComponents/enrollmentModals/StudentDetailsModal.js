import React from 'react'

function StudentDetailsModal({isHovering, studDetail, studpict}) {
    if (!isHovering) return null

  return (
    <div className='overlay'>
        <div className='modalContainer'>
            <img src={studpict} alt='' style={{ width: "20%", height: "20%" }}/>
            <div className='modalRight'>
                <div className='content'>
                    <p> Enrollee ID: {studDetail.id} </p>
                    <p> Email: {studDetail.applicant} </p>
                    <p> Strand: {studDetail.strand} </p>
                    <p> Year Level: {studDetail.year_level} </p>
                    <p> Full Name: {studDetail.full_name} </p>
                    <p> Age: {studDetail.age} </p>
                    <p> Address: {studDetail.enrollment_address[0]} </p>
                    <p> Contact Number: {studDetail.enrollment_contactnumber[0]} </p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default StudentDetailsModal
