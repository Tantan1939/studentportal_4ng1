import React from 'react'

export default function ClassSchedules({selected_details}) {

  return (
    <div>
      <h4> Class Schedules </h4>

      {selected_details.map((detail, index) => (
        <div key={index}>
          <h5> {detail.section_name} </h5>
          <h6> First Semester: </h6>
          {Object.keys(detail.First_sem_subjects).map((key, index) => (
            <div key={index}>
              <span> {key}: {detail.First_sem_subjects[key]} </span>
            </div>
          ))}

          <h6> Second Semester: </h6>
          {Object.keys(detail.Second_sem_subjects).map((key, index) => (
            <div key={index}>
              <span> {key}: {detail.Second_sem_subjects[key]} </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

