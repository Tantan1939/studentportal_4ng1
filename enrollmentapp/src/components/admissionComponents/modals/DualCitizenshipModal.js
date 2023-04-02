import React from 'react'

export default function DualCitizenshipModal({isHovering, dc}) {
    if (!isHovering) return null

  return (
    <div className='overlay'>
      <div className='modalContainer'>
        <img src={dc} />
      </div>
    </div>
  )
}
