import React from 'react'
import StudentsPerBatch from './StudentsPerBatch'

export default function ForAdmissionStudents() {

  function clickHandler(details){
    alert(`${details.id} - ${details.name} - ${details.age} - ${details.skill}`);
  }

  const students =[
      {
          id: 1,
          name: 'Bruce',
          age: 30,
          skill: 'ReactJS'
      },
      {
          id: 2,
          name: 'Clark',
          age: 30,
          skill: 'ReactJS'
      },
      {
          id: 3,
          name: 'Diane',
          age: 30,
          skill: 'ReactJS'
      }
  ]

  let renderStudents = students.map((stud, index) => (
    <StudentsPerBatch key={index} stud={stud} clickHandler={clickHandler}/>
  ))

  return (
    <div>
      {renderStudents}
    </div>
  )
}
