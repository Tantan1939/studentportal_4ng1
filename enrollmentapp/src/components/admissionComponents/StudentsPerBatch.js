import React, {useState, useEffect} from 'react'
import StudentLists from './StudentLists'

export default function StudentsPerBatch({admissionBatch, AdmitHandler, DeniedHandler}) {

  let [admitAllPks, setAdmitAllPks] = useState([])

  useEffect(()=> {
    setAdmitAllPks(admissionBatch.members.map(obj => get_id(obj)))
  }, [admissionBatch])

  let renderAdmissionApplicants = admissionBatch.members.map((admission, index) => (
    <StudentLists key={index} admission={admission} DeniedHandler={DeniedHandler}/>
  ))

  function get_id(obj){
    return obj.id
  }


 
 const fontSize = {
  fontSize:'20px', 
  fontWeight: '600'

 }

  return admitAllPks.length ? (

<div className='container p-3 mt-3 border rounded border shadow'>
      
        <div className="accordion border rounded border shadow" id="accordionExample">
          <div className="accordion-item transition">
              <div className="accordion-header" id="headingOne">
                <button btn className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${admissionBatch.id}`} aria-expanded="true" aria-controls={`collapse${admissionBatch.id}`}>
                <span className='me-4'style={fontSize}>Batch ID #{admissionBatch.id}</span>
                <span className='me-4'style={fontSize}>{admissionBatch.number_of_applicants} Applicant/s</span>
            
                </button>
           
           

                </div>

        <div style={{transition:"0.5s ease"}} id={`collapse${admissionBatch.id}`} class="  accordion-collapse pt-4 px-2 pb-2 collapse" 
        aria-labelledby="headingOne" data-bs-parent="#accordionExample">
        <div class="action d-flex justify-content-end align-items-start me-4">
         <button class="btn btn-success" onClick={() => AdmitHandler(admitAllPks)}> Admit All </button>
         </div>
                <div class="accordion-body">
                {renderAdmissionApplicants}
                  
                  </div>          
          </div>
    </div>
</div>
</div>

) : (
  <div>
    <h3> No Applicants... </h3>
  </div>
)
}


