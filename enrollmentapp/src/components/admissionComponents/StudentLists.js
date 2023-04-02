import React, {useState, useEffect} from 'react'
import DcDocx from './docxComponents/DcDocx'
import FbornDocx from './docxComponents/FbornDocx'
import PhbornDocx from './docxComponents/PhbornDocx'
import AdmissionDetailsModal from './modals/AdmissionDetailsModal'

export default function StudentLists({admission, DeniedHandler}) {
  let [docx, setDocx] = useState(null)
  const [openModal, setOpenModal] = useState(false)

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
    <div className='container'>
      <div>
        <h5 onMouseMove={() => setOpenModal(true)} onMouseOut={() => setOpenModal(false)}> {admission.first_name} {admission.middle_name} {admission.last_name} - {admission.sex} </h5>
        <AdmissionDetailsModal isHovering={openModal} admission={admission}/>
        {docx}
      </div>
      <button onClick={() => DeniedHandler(admission.id)}> Decline </button>
    </div>
  )
}