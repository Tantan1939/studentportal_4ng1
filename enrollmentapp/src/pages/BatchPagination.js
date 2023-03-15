import React from 'react'

export default function BatchPagination(props) {
  return (
    <div>
      <button onClick={() => props.clickHandler(props.batchDetail)}> {props.visibleNum} </button>
    </div>
  )
}
