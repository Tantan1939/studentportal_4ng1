import React from 'react'

const studStyle = {
  marginBottom: '11px',
  padding: '20px'
}
export default function RenderStudents({students}) {
    let render_students = students.map((student, index) => (
        <h5 className='border' style={studStyle} key={index}> {student.full_name} - {student.age} - {student.admission} </h5>
    ));

  return (
    <div className=''>
      {render_students}
    </div>
  )
}
