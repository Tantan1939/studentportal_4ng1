import React, {useState, useEffect} from 'react'
import GoodMoralModal from '../modals/GoodMoralModal'
import PsaModal from '../modals/PsaModal'
import ReportCardModal from '../modals/ReportCardModal'
import DualCitizenshipModal from '../modals/DualCitizenshipModal'
import F137Modal from '../modals/F137Modal'
import PhilippinePassportModal from '../modals/PhilippinePassportModal'

export default function DcDocx(props) {
  let [good_moral, setGood_moral] = useState('')
  let [report_card, setReport_card] = useState('')
  let [psa, setPsa] = useState('')
  let [dual_citizenship, setDual_citizenship] = useState('')
  let [philippine_passport, setPhilippine_passport] = useState('')
  let [f137, setF137] = useState('')

  const [openGoodMoralModal, setOpenGoodMoralModal] = useState(false);
  const [openReportCardModal, setOpenReportCardModal] = useState(false);
  const [openPsaModal, setOpenPsaModal] = useState(false);
  const [openDCModal, setOpenDCModal] = useState(false);
  const [openPPModal, setOpenPPModal] = useState(false);
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

  const fetch_dualcitizenship = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setDual_citizenship(imageObjectURL);
  }

  const fetch_phpassport = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setPhilippine_passport(imageObjectURL);
  }

  const fetch_f137 = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setF137(imageObjectURL);
  }

  useEffect(() => {
    fetch_goodmoral(props.softCopy_admissionRequirements_dualCitizen.good_moral)
    fetch_reportcard(props.softCopy_admissionRequirements_dualCitizen.report_card)
    fetch_psa(props.softCopy_admissionRequirements_dualCitizen.psa)
    fetch_dualcitizenship(props.softCopy_admissionRequirements_dualCitizen.dual_citizenship)
    fetch_phpassport(props.softCopy_admissionRequirements_dualCitizen.philippine_passport)
    fetch_f137(props.softCopy_admissionRequirements_dualCitizen.f137)
  }, [props])

  return (
    <div>
      <p onMouseMove={() => setOpenGoodMoralModal(true)} onMouseOut={() => setOpenGoodMoralModal(false)}> Good Moral </p>
      <GoodMoralModal isHovering={openGoodMoralModal} goodmoral={good_moral}/>

      <p onMouseMove={() => setOpenReportCardModal(true)} onMouseOut={() => setOpenReportCardModal(false)}> Report Card </p>
      <ReportCardModal isHovering={openReportCardModal} reportcard={report_card}/>

      <p onMouseOver={() => setOpenPsaModal(true)} onMouseOut={() => setOpenPsaModal(false)}> PSA </p>
      <PsaModal isHovering={openPsaModal} psa={psa}/>

      <p onMouseMove={() => setOpenDCModal(true)} onMouseOut={() => setOpenDCModal(false)}> Dual Citizenship </p>
      <DualCitizenshipModal isHovering={openDCModal} dc={dual_citizenship}/>

      <p onMouseMove={() => setOpenPPModal(true)} onMouseOut={() => setOpenPPModal(false)}> Philippine Passport </p>
      <PhilippinePassportModal isHovering={openPPModal} ppm={philippine_passport}/>

      <p onMouseMove={() => setOpenF137Modal(true)} onMouseOut={() => setOpenF137Modal(false)}> F137 </p>
      <F137Modal isHovering={openF137} f137={f137}/>

    </div>
  )
}
