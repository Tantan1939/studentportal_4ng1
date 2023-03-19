import React from 'react'

export default function AlienCertModal({isHovering, acr}) {
    if (!isHovering) return null

  return (
    <div className='overlay'>
      <div className='modalContainer'>
        <img src={acr} />
      </div>
    </div>
  )
}
