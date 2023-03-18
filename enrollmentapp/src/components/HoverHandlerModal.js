import React from 'react'
import akainu from '../akainu.jpg'

export default function HoverHandlerModal({hover, onOut}) {
    if (!hover) return null
  return (
    <div onMouseOver={onOut} className='overlay'>
      <div onMouseOver={(e) => {
        e.stopPropagation();
      }} className='modalContainer'>
        <img src={akainu} alt="" />

        <div className='modalRight'>
            <p onClick={onOut} className='closeBtn'> X </p>
            <div className='content'>
                <p> Do you want a donut? </p>
                <h1> Hot Magma for Free </h1>
            </div>

            <div className='btnContainer'>
                <button className='btnPrimary'>
                    <span className='bold'>YES</span>, I love it.
                </button>
                <button className='btnOutline'>
                    <span className='bold'>NO</span>, thanks
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}
