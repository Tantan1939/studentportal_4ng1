import React, {useState} from 'react'
import Modal from './Modal'

export default function ModalHandler() {
    const [openModal, setOpenModal] = useState(false)

  return (
    <div className='container'>
        <div>
            <button className='modalBtn' onMouseOver={() => setOpenModal(false)} onClick={() => setOpenModal(true)}> Modal </button>
            <Modal open={openModal} onClose={() => setOpenModal(false)}/>
        </div>
    </div>
  )
}
