import React from 'react'

export default function GoodMoralModal({isHovering, goodmoral}) {
    if (!isHovering) return null

  return (
    <div className='overlay'>
      <div className='modalContainer'>
        <img src={goodmoral} />
      </div>
    </div>
  )
}
