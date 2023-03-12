import React from 'react'
import {Link} from "react-router-dom"

const ListItems = ({note}) => {
  return (
    <Link to={`/Registrar/Enrollment/Note/${note.id}/`}>
      <div className='notes-list-item'>
        <h3> {note.id} - {note.body} </h3>
      </div>
    </Link>
  )
}

export default ListItems
