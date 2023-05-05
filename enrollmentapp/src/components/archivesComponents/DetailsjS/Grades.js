import React from 'react'

export default function Grades({selected_details}) {
  return (
    <div>
      <h4> Grades </h4>
      {Object.keys(selected_details).map((key, index) => (
        <div key={index}>
          <h5> {key} </h5>
          <div className='mt-3' style={{display:'grid', gridTemplateColumns:'1fr 1fr',gridGap:'20px'}}>
          {Object.keys(selected_details[key]).map((quarter, index_q) => (

              <div className='' key={index_q}>
                  <table class="table bg-white table-bordered table-striped">
                    <thead>
                      <tr>
                        <th scope="col">{quarter}</th>
                        <th scope="col">Subjects</th>
                        <th scope="col">Grades</th>
                      </tr>
                    </thead>
                    <tbody>
                    {Object.keys(selected_details[key][quarter]).map((subject, index_sub) => (
                      <tr>
                        <th scope="row"></th>
                          <td key={index_sub}>
                            <p style={{fontSize:'18px',fontWeight:'600'}}> {subject}:</p>
                          </td>
                          <td key={index_sub}>
                            <p style={{fontSize:'18px',fontWeight:'600'}}>{selected_details[key][quarter][subject]} </p>
                          </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
              
              </div>


          ))}
          </div>
        </div>
      ))}
    </div>
  )
}

