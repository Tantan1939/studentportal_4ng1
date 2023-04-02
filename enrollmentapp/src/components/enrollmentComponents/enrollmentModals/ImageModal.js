import React from 'react'

function ImageModal({isHovering, img}) {
    if (!isHovering) return null

  return (
    <div className='overlay'>
      <div className='modalContainer'>
        <img src={img} />
      </div>
    </div>
  )
}

export default ImageModal
