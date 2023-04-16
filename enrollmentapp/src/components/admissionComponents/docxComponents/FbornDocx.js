import React, {useState, useEffect} from 'react'
import GoodMoralModal from '../modals/GoodMoralModal'
import PsaModal from '../modals/PsaModal'
import ReportCardModal from '../modals/ReportCardModal'
import AlienCertModal from '../modals/AlienCertModal'
import F137Modal from '../modals/F137Modal'
import StudyPermitModal from '../modals/StudyPermitModal'

export default function FbornDocx(props) {
  let [good_moral, setGood_moral] = useState('')
  let [report_card, setReport_card] = useState('')
  let [psa, setPsa] = useState('')
  let [alien_certificate_of_registration, setAlien_certificate_of_registration] = useState('')
  let [study_permit, setStudy_permit] = useState('')
  let [f137, setF137] = useState('')

  const [openGoodMoralModal, setOpenGoodMoralModal] = useState(false);
  const [openReportCardModal, setOpenReportCardModal] = useState(false);
  const [openPsaModal, setOpenPsaModal] = useState(false);
  const [openCor, setOpenCorModal] = useState(false);
  const [openStudyPermit, setOpenStudyPermitModal] = useState(false);
  const [openF137, setOpenF137Modal] = useState(false);

  const fetch_goodmoral = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setGood_moral(imageObjectURL);
  }

  const fetch_reportcard = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setReport_card(imageObjectURL);
  }

  const fetch_psa = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setPsa(imageObjectURL);
  }

  const fetch_acr = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setAlien_certificate_of_registration(imageObjectURL);
  }

  const fetch_studypermit = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setStudy_permit(imageObjectURL);
  }

  const fetch_f137 = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setF137(imageObjectURL);
  }

  useEffect(() => {
    fetch_goodmoral(props.softCopy_admissionRequirements_foreigner.good_moral)
    fetch_reportcard(props.softCopy_admissionRequirements_foreigner.report_card)
    fetch_psa(props.softCopy_admissionRequirements_foreigner.psa)
    fetch_acr(props.softCopy_admissionRequirements_foreigner.alien_certificate_of_registration)
    fetch_studypermit(props.softCopy_admissionRequirements_foreigner.study_permit)
    fetch_f137(props.softCopy_admissionRequirements_foreigner.f137)
  }, [props])

  return (
    <div class="d-flex">
       <h6 class="px-2" onMouseEnter={() => setOpenGoodMoralModal(true)} onMouseLeave={() => setOpenGoodMoralModal(false)}> Good Moral </h6>
      <GoodMoralModal isHovering={openGoodMoralModal} goodmoral={good_moral}/> 

      {setOpenGoodMoralModal && (
    <div>
    <GoodMoralModal isHovering={openGoodMoralModal} goodmoral={good_moral}/> 
    </div>
  )}

      <h6 class="px-2"onMouseMove={() => setOpenReportCardModal(true)} onMouseOut={() => setOpenReportCardModal(false)}> Report Card </h6>
      <ReportCardModal isHovering={openReportCardModal} reportcard={report_card}/>

      {setOpenReportCardModal && (
    <div>
    <ReportCardModal isHovering={openReportCardModal} reportcard={report_card}/>
    </div>
  )}


      <h6 class="px-2" onMouseOver={() => setOpenPsaModal(true)} onMouseOut={() => setOpenPsaModal(false)}> PSA </h6>
      <PsaModal isHovering={openPsaModal} psa={psa}/>

        
      {setOpenPsaModal && (
    <div>
    <PsaModal isHovering={openPsaModal} psa={psa}/>
    </div>
  )}

      <h6 class="px-2" onMouseMove={() => setOpenCorModal(true)} onMouseOut={() => setOpenCorModal(false)}> Alien Certificate of Registration </h6>
      <AlienCertModal isHovering={openCor} acr={alien_certificate_of_registration}/>

      {setOpenCorModal && (
    <div>
    <AlienCertModal isHovering={openCor} acr={alien_certificate_of_registration}/>
    </div>
  )}

      <h6 class="px-2" onMouseMove={() => setOpenStudyPermitModal(true)} onMouseOut={() => setOpenStudyPermitModal(false)}> Study Permit </h6>
      <StudyPermitModal isHovering={openStudyPermit} studypermit={study_permit}/>

      {setOpenStudyPermitModal && (
    <div>
    <StudyPermitModal isHovering={openStudyPermit} studypermit={study_permit}/>
    </div>
  )}


      <h6 class="px-2" onMouseMove={() => setOpenF137Modal(true)} onMouseOut={() => setOpenF137Modal(false)}> F137 </h6>
      <F137Modal isHovering={openF137} f137={f137}/>
      
      {setOpenF137Modal && (
    <div>
    <F137Modal isHovering={openF137} f137={f137}/>
    </div>
  )}



    </div>
  )
}
