import React, {useState, useEffect} from 'react'

export default function DcDocx(props) {
  let [good_moral, setGood_moral] = useState('')
  let [report_card, setReport_card] = useState('')
  let [psa, setPsa] = useState('')
  let [dual_citizenship, setDual_citizenship] = useState('')
  let [philippine_passport, setPhilippine_passport] = useState('')
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
      <p> Good Moral </p> <img src={good_moral} />
      <p> Report Card </p> <img src={report_card} />
      <p> PSA </p> <img src={psa} />
      <p> Dual Citizenship </p> <img src={dual_citizenship} />
      <p> Philippine Passport </p> <img src={philippine_passport} />
      <p> F137 </p> <img src={f137} />
    </div>
  )
}
