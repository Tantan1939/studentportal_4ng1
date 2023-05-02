import React, {useState, useEffect} from 'react';
import RenderDocx from '../ImageJs/RenderDocx';

export default function Admission({selected_details}) {

  let [docType, setDocType] = useState('');
  useEffect(()=> {
    setDocType(()=> {
      if (selected_details.type === "Philippine Born" ){
        return "softCopy_admissionRequirements_phBorn"
      } else if (selected_details.type === "Foreign Citizen" ){
        return "softCopy_admissionRequirements_foreigner"
      } else {
        return "softCopy_admissionRequirements_dualCitizen"
      }
    });
  }, [selected_details]);
  const pStyle = {
    color: '#202020',
    fontWeight: '600',
    marginTop: '0',
    marginbottom: '1rem'
    }
  return (
    <div>
      <h4 className='border-bottom py-3' style={{fontSize:'27px',marginBottom:'15px'}}> Admission </h4>

        <p style={pStyle}> Email: {selected_details.admission_owner} </p>
        <p style={pStyle}> First Name: {selected_details.first_name} </p>
        <p style={pStyle}> Middle Name: {selected_details.middle_name} </p>
        <p style={pStyle}> Last Name: {selected_details.last_name} </p>
        <p style={pStyle}> Sex: {selected_details.sex} </p>
        <p style={pStyle}> Birthdate: {selected_details.date_of_birth} </p>
        <p style={pStyle}> Birthplace: {selected_details.birthplace} </p>
        <p style={pStyle}> Nationality: {selected_details.nationality} </p>
        <p style={pStyle}> Elementary School: {selected_details.elem_name} </p>
        <p style={pStyle}> Address: {selected_details.elem_address} </p>
        <p style={pStyle}> Region: {selected_details.elem_region} </p>
        <p style={pStyle}> Year Completed: {selected_details.elem_year_completed} </p>
        <p style={pStyle}> Junior High School: {selected_details.jhs_name} </p>
        <p style={pStyle}> Address: {selected_details.jhs_address} </p>
        <p style={pStyle}> Region: {selected_details.jhs_region} </p>
        <p style={pStyle}> Year Completed: {selected_details.jhs_year_completed} </p>
        <p style={pStyle}> First Strand: {selected_details.first_chosen_strand} </p>
        <p style={pStyle}> Second Strand: {selected_details.second_chosen_strand} </p>
        <p style={pStyle}> Application Type: {selected_details.type} </p>

        {docType && (
          <div>
            {Object.keys(selected_details[docType][0]).map((key, index) => (
              <div className='py-4 border-bottom' key={index}>
                    <div style={{fontSize:'20px',fontWeight:'600'}} class="alert alert-dark" role="alert">
                    {key}
                </div>
                <RenderDocx  image={selected_details[docType][0][key]} />
              </div>
            ))}
          </div>
        )}


        <p> Approved By: {selected_details.audited_by} </p>

    </div>
  )
}
