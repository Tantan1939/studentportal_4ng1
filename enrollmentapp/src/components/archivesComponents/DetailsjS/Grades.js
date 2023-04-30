import React from 'react'

export default function Grades({selected_details}) {
  return (
    <div>
      <h4> Grades </h4>

      {Object.keys(selected_details).map((key, index) => (
        <div key={index}>
          <h5> {key} </h5>
          {Object.keys(selected_details[key]).map((quarter, index_q) => (
            <div key={index_q}>
              <h6> {quarter} </h6>
              {Object.keys(selected_details[key][quarter]).map((subject, index_sub) => (
                <div key={index_sub}>
                  <p> {subject}: {selected_details[key][quarter][subject]} </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

