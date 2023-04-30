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

  return (
    <div>
      <h4> Admission </h4>

        <p> Email: {selected_details.admission_owner} </p>
        <p> First Name: {selected_details.first_name} </p>
        <p> Middle Name: {selected_details.middle_name} </p>
        <p> Last Name: {selected_details.last_name} </p>
        <p> Sex: {selected_details.sex} </p>
        <p> Birthdate: {selected_details.date_of_birth} </p>
        <p> Birthplace: {selected_details.birthplace} </p>
        <p> Nationality: {selected_details.nationality} </p>
        <p> Elementary School: {selected_details.elem_name} </p>
        <p> Address: {selected_details.elem_address} </p>
        <p> Region: {selected_details.elem_region} </p>
        <p> Year Completed: {selected_details.elem_year_completed} </p>
        <p> Junior High School: {selected_details.jhs_name} </p>
        <p> Address: {selected_details.jhs_address} </p>
        <p> Region: {selected_details.jhs_region} </p>
        <p> Year Completed: {selected_details.jhs_year_completed} </p>
        <p> First Strand: {selected_details.first_chosen_strand} </p>
        <p> Second Strand: {selected_details.second_chosen_strand} </p>
        <p> Application Type: {selected_details.type} </p>

        {docType && (
          <div>
            {Object.keys(selected_details[docType][0]).map((key, index) => (
              <div key={index}>
                <p> {key} </p>
                <RenderDocx image={selected_details[docType][0][key]} />
              </div>
            ))}
          </div>
        )}


        <p> Approved By: {selected_details.audited_by} </p>

    </div>
  )
}
