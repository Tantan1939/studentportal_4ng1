import React from 'react'

export default function PsaModal({isHovering, psa}) {
    if (!isHovering) return null

  return (
    <div className='overlay'>
      <div className='modalContainer'>
        <img src={psa} />
      </div>
    </div>
  )
}
