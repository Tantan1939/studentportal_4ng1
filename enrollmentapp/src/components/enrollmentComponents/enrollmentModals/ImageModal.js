import React from 'react'

function ImageModal({isHovering, img}) {
    if (!isHovering) return null

  return (
    <div className='overlay'>
      <div className='modalContainer p-4' style={{display:'grid',placeItems:'center'}}>
        <img style={{height:'auto', width:'100%'}} src={img} />
      </div>
    </div>
  )
}

export default ImageModal
