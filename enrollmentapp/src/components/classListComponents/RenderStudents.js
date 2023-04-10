import React from 'react'

export default function RenderStudents({students}) {
    let render_students = students.map((student, index) => (
        <h5 key={index}> {student.full_name} - {student.age} - {student.admission} </h5>
    ));

  return (
    <div>
      {render_students}
    </div>
  )
}
