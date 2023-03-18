import React from 'react';

export default function ReportCardModal({isHovering, reportcard}) {
    if (!isHovering) return null

  return (
    <div className='overlay'>
      <div className='modalContainer'>
        <img src={reportcard} />
      </div>
    </div>
  )
}
