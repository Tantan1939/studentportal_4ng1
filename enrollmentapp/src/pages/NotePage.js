import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { ReactComponent as ArrowLeft } from '../assets/arrow-left.svg'

const NotePage = ({match, history}) => {
    let noteId = match.params.id
    let [note, setNote] = useState(null)
    let [isExit, setIsExit] = useState(null)

    useEffect(() => {
        getNote()
    }, [noteId])

    useEffect(() => {
        if (note != null && isExit != null){
            updateNote()
        }
    }, [isExit])

    let getNote = async ()=>{
        let response = await fetch(`/Registrar/Notes/Details/${noteId}/`)
        let data = await response.json()
        setNote(data)
    }

    let CSRF = document.cookie.slice(10)
    let updateNote = async ()=> {
        fetch(`/Registrar/Notes/Details/${noteId}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": CSRF,
            },
            body: JSON.stringify({body : note.body})
        }).then(response => response.json()).then(json => console.log(json))
        history.push('/Registrar/Enrollment/')
    }

  return (
    <div className='note'>
        <div className='note-header'>
            <h3>
                <ArrowLeft onClick={(e) => setIsExit(true)}/>
            </h3>
        </div>
        <textarea onChange={(e) => {
            setNote({...note, 'body':e.target.value})
        }} defaultValue={note?.body}></textarea>
    </div>
  )
}

export default NotePage
