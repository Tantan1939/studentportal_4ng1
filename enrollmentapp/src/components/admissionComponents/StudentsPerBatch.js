import React, {useState, useEffect} from 'react'

export default function StudentsPerBatch(props) {
    let [studDetails, setStudDetails] = useState(null)

    useEffect(() => {
        setStudDetails(props.stud)
    }, [])

  return (
    <div>
      <h5> {props.stud.id} - {props.stud.name} - {props.stud.age} - {props.stud.skill} </h5>
      <button onClick={() => props.clickHandler(studDetails)}> Click Me </button>
    </div>
  )
}
