import React, {useState, useEffect} from 'react'

export default function FbornDocx(props) {
  let [good_moral, setGood_moral] = useState('')
  let [report_card, setReport_card] = useState('')
  let [psa, setPsa] = useState('')
  let [alien_certificate_of_registration, setAlien_certificate_of_registration] = useState('')
  let [study_permit, setStudy_permit] = useState('')
  let [f137, setF137] = useState('')

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
    <div>
      <p> Good Moral </p> <img src={good_moral} />
      <p> Report Card </p> <img src={report_card} />
      <p> PSA </p> <img src={psa} />
      <p> Alien Certificate of Registration </p> <img src={alien_certificate_of_registration} />
      <p> Study Permit </p> <img src={study_permit} />
      <p> F137 </p> <img src={f137} />
    </div>
  )
}
