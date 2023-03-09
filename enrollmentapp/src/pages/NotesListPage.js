import React, {useState, useEffect} from 'react'

const NotesListPage = () => {

    let [notes, setNotes] = useState([])

    useEffect(() => {
        getNotes()
    }, [])

    let getNotes = async () => {
        let response = await fetch('http://127.0.0.1:8000/Registrar/getNotes/')
        let data = await response.json()
        setNotes(data)
    }

  return (
    <div>
      Notes
    </div>
  )
}

export default NotesListPage
