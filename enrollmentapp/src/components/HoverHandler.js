import React, {useState} from 'react'
import HoverHandlerModal from './HoverHandlerModal'

export default function HoverHandler() {
    const [openModal, setOpenModal] = useState(false)

  return (
    <div className='container'>
      <div>
        <button className='modalBtn' onMouseOver={() => setOpenModal(true)}> Hover me </button>
        <HoverHandlerModal hover={openModal} onOut={() => setOpenModal(false)}/>
      </div>
    </div>
  )
}
