import React, {useState, useEffect} from 'react'
import DcDocx from './docxComponents/DcDocx'
import FbornDocx from './docxComponents/FbornDocx'
import PhbornDocx from './docxComponents/PhbornDocx'

export default function StudentLists({admission, DeniedHandler}) {
  let [docx, setDocx] = useState(null)

  useEffect(()=>{
    setDocx(()=> renderDocx())
  }, [admission])

  let renderDocx = () => {
    if (admission.type === 'Philippine Born'){
      return <PhbornDocx softCopy_admissionRequirements_phBorn={admission.softCopy_admissionRequirements_phBorn[0]}/>
    } else if (admission.type === 'Foreign Citizen'){
      return <FbornDocx softCopy_admissionRequirements_foreigner={admission.softCopy_admissionRequirements_foreigner[0]}/>
    } else {
      return <DcDocx softCopy_admissionRequirements_dualCitizen={admission.softCopy_admissionRequirements_dualCitizen[0]}/>
    }
  }

  return (
    <div>
      <h5> {admission.admission_owner} </h5>
      <h5> {admission.first_name} {admission.middle_name} {admission.last_name} - {admission.sex} </h5>
      <h5> {admission.date_of_birth} </h5>
      <h5> {admission.birthplace} </h5>
      <h5> {admission.nationality} </h5>
      <h5> {admission.type} </h5>
      <h5> {admission.first_chosen_strand} </h5>
      <h5> {admission.second_chosen_strand} </h5>
      {docx}

      <button onClick={() => DeniedHandler(admission.id)}> Decline </button>
    </div>
  )
}