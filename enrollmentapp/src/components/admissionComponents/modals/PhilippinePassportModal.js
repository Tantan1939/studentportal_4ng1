import React from 'react'

export default function PhilippinePassportModal({isHovering, ppm}) {
    if (!isHovering) return null

  return (
    <div className='overlay'>
      <div className='modalContainer'>
        <img src={ppm} />
      </div>
    </div>
  )
}
