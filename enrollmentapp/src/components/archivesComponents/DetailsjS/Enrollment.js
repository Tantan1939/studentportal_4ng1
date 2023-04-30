import React from 'react';
import RenderDocx from '../ImageJs/RenderDocx';

export default function Enrollment({selected_details}) {
  return (
    <div>
      {selected_details.map((enrollment, index) => (
        <div key={index}>
          {enrollment.year_level && (
            <div>
              <RenderDocx image={enrollment.stud_pict[0].user_image} />
              <p> Enrollee: {enrollment.applicant} </p>
              <p> Full Name: {enrollment.full_name} </p>
              <p> Strand: {enrollment.strand} </p>
              <p> Year Level: {enrollment.year_level} </p>
              <p> Age: {enrollment.age} </p>
              <p> Address: {enrollment.enrollment_address[0]} </p>
              <p> Contact Number: {enrollment.enrollment_contactnumber[0]} </p>
              <p> Report Card </p>
              <RenderDocx image={enrollment.report_card[0].report_card} />
              <p> Approved By: {enrollment.audited_by} </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

