import React from 'react'

export default function ClassSchedules({selected_details}) {

  return (
    <div>
      <h4 className='mb-4'> Class Schedules </h4>

      {selected_details.map((detail, index) => (
        <div key={index}>
          <h5> {detail.section_name} </h5>
          <div className='row'>
            <div className='col-md-6'>
              <div className=' bg-white border rounded p-3 mb-3'>
                <h6> First Semester: </h6>
                {Object.keys(detail.First_sem_subjects).map((key, index) => (
                  <div className='mt-3' key={index}>
                    <span style={{fontSize:'18px',fontWeight:'600',padding: '8px 10px'}}> {key}: {detail.First_sem_subjects[key]} </span>
                  </div>
                ))}

              </div>
            </div>
            <div className='col-md-6'>
              <div className='bg-white border rounded p-3 mb-3'>
                <h6> Second Semester: </h6>
                {Object.keys(detail.Second_sem_subjects).map((key, index) => (
                  <div className='mt-3' key={index}>
                    <span style={{fontSize:'18px',fontWeight:'600',padding: '8px 10px'}}> {key}: {detail.Second_sem_subjects[key]} </span>
                  </div>
                ))}

              </div>

            </div>

          </div>
        </div>
      ))}
    </div>
  )
}

