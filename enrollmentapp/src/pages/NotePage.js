import React, {useState, useEffect} from 'react'
import { ReactComponent as ArrowLeft } from '../assets/arrow-left.svg'

const imgurl = '/Media/user_images/default_male.png'
const NotePage = ({match, history}) => {
    const [img, setImg] = useState();
    let noteId = match.params.id
    let [note, setNote] = useState(null)
    let [isExit, setIsExit] = useState(null)

    const fetchImage = async () => {
        const res = await fetch(imgurl);
        const imageBlob = await res.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setImg(imageObjectURL);
      };
    
    useEffect(() => {
        fetchImage();
    }, []);

    useEffect(() => {
        getNote()
    }, [noteId])

    useEffect(() => {
        if (note !== null && isExit !== null){
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

        <img src={img}/>
    </div>
  )
}

export default NotePage
