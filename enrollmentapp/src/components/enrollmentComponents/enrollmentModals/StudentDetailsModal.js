import React from 'react'

function StudentDetailsModal({isHovering, studDetail, studpict}) {
    if (!isHovering) return null

  return (
    <div className='overlaytwo'>
        <div className='modalContainer '>
            <div className='image pt-3 d-flex justify-content-center align-items-start w-100 bg-light'>
                <img src={studpict} alt='' style={{ width: "280px", height: "auto", borderRadius:'6px'}}/>
            </div>
            <div className='modalRight pt-3 pb-2 d-flex align-items-start justify-content-start' style={{paddingRight:'15px'}}>
                <div className='content' style={{textAlign:'left'}}>
                    <div className='details'> <span>Enrollee ID:</span> {studDetail.id} </div>
                    <div className='details'> <span>Email:</span> {studDetail.applicant} </div>
                    <div className='details'> <span>Strand:</span> {studDetail.strand} </div>
                    <div className='details'> <span>Year Level:</span> {studDetail.year_level} </div>
                    <div className='details'> <span>Full Name:</span> {studDetail.full_name} </div>
                    <div className='details'> <span>Age:</span> {studDetail.age} </div>
                    <div className='details'> <span>Address: </span>{studDetail.enrollment_address[0]} </div>
                    <div className='details'> <span>Contact Number:</span> {studDetail.enrollment_contactnumber[0]} </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default StudentDetailsModal
