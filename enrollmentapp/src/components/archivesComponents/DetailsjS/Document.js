import React from 'react'

export default function Document({selected_details}) {
  return (
    <div>
      <h4> Requested Documents </h4>
      
      {selected_details.map((detail, index) => (
        <div key={index}>
          <p> Document: {detail.document} </p>
          <p> Schedule Date: {detail.scheduled_date} </p>
          <p> Is_cancelled: {detail.is_cancelledByRegistrar ? "Yes" : "No"} </p>
        </div>
      ))}
    </div>
  )
}