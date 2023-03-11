import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { ReactComponent as ArrowLeft } from '../assets/arrow-left.svg'

const NotePage = ({match}) => {
    let noteId = match.params.id
    let [note, setNote] = useState(null)

    useEffect(() => {
        getNote()
    }, [note])

    let getNote = async ()=>{
        let response = await fetch(`/Registrar/getNotes/note/${noteId}/`)
        let data = await response.json()
        setNote(data)
    }

  return (
    <div className='note'>
        <div className='note-header'>
            <h3> 
                <Link to={'/Registrar/Enrollment/'}>
                    <ArrowLeft /> 
                </Link> 
            </h3> 
        </div>
        <textarea defaultValue={note?.body}></textarea>
    </div>
  )
}

export default NotePage
