import React from 'react'

export default function F137Modal({isHovering, f137}) {
    if (!isHovering) return null

    return (
        <div className='overlay'>
          <div className='modalContainer'>
            <img src={f137} />
          </div>
        </div>
    )
}
