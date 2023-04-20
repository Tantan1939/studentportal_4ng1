import React from 'react'

function ImageModal({isHovering, img}) {
    if (!isHovering) return null

  return (
    <div className='newModal'>
      <div className=' p-4' style={{display:'grid',placeItems:'center'}}>
        <img style={{height:'auto', width:'300px'}} src={img} />
      </div>
    </div>
  )
}

export default ImageModal
