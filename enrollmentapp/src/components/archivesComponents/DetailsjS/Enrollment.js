import React from 'react';
import RenderDocx from '../ImageJs/RenderDocx';


export default function Enrollment({selected_details}) {

  const pStyle = {
    color: '#202020',
    fontWeight: '600',
    marginTop: '0',
    marginbottom: '1rem'
    }
  return (
    <div>
      {selected_details.map((enrollment, index) => (
        <div key={index}>
          {enrollment.year_level && (
            <div>
              <div className='py-4 mb-2'>
              <RenderDocx image={enrollment.stud_pict[0].user_image} />
              </div>
              <p style={pStyle}> Enrollee: {enrollment.applicant} </p>
              <p style={pStyle}> Full Name: {enrollment.full_name} </p>
              <p style={pStyle}> Strand: {enrollment.strand} </p>
              <p style={pStyle}> Year Level: {enrollment.year_level} </p>
              <p style={pStyle}> Age: {enrollment.age} </p>
              <p style={pStyle}> Address: {enrollment.enrollment_address[0]} </p>
              <p style={pStyle}> Contact Number: {enrollment.enrollment_contactnumber[0]} </p>
              <div className='py-3 border-bottom'>
                  <div style={{fontSize:'20px',fontWeight:'600'}} class="alert alert-dark" role="alert">
                  Report Card
                </div>
                <RenderDocx image={enrollment.report_card[0].report_card} />

              </div>
              <p> Approved By: {enrollment.audited_by} </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

