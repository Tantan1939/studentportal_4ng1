import React, {useState, useEffect} from 'react'

export default function PhbornDocx(props) {
  let [good_moral, setGood_moral] = useState('')
  let [report_card, setReport_card] = useState('')
  let [psa, setPsa] = useState('')

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

  useEffect(() => {
    fetch_goodmoral(props.softCopy_admissionRequirements_phBorn.good_moral)
    fetch_reportcard(props.softCopy_admissionRequirements_phBorn.report_card)
    fetch_psa(props.softCopy_admissionRequirements_phBorn.psa)
  }, [props])

  return (
    <div>
      <p> Good Moral </p> <img src={good_moral}/>
      <p> Report Card </p> <img src={report_card}/>
      <p> PSA </p> <img src={psa}/>
    </div>
  )
}
