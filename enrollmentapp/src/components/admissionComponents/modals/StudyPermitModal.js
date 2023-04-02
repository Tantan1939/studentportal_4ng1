import React from 'react'

export default function StudyPermitModal({isHovering, studypermit}) {
    if (!isHovering) return null

  return (
    <div className='overlay'>
      <div className='modalContainer'>
        <img src={studypermit} />
      </div>
    </div>
  )
}
