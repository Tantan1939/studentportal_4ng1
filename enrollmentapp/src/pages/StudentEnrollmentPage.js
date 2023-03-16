import React, {useState, useEffect} from 'react'

export default function StudentEnrollmentPage(props) {
  const [img, setImg] = useState('');
  const [rpc, setRpc] = useState('');

  const fetchImg = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setImg(imageObjectURL);
  }

  const fetchRpc = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setRpc(imageObjectURL);
  }

  useEffect(() => {
    fetchImg(props.applicantDetails.stud_pict[0].user_image)
    fetchRpc(props.applicantDetails.report_card[0].report_card)
  }, [props])

  return (
    <div>
      <img src={img}/>
      <h5> Applicant Email: {props.applicantDetails.applicant} </h5>
      <h5> Full Name: {props.applicantDetails.full_name} </h5>
      <h5> Age: {props.applicantDetails.age} </h5>
      <h5> Address: {props.applicantDetails.enrollment_address[0]} </h5>
      <h5> Contact: {props.applicantDetails.enrollment_contactnumber[0]} </h5>
      <img src={rpc}/>
      <button onClick={() => props.BatchHandler(props.applicantDetails.id)}> Move To </button>
      <button onClick={() => props.DeclineHandler(props.applicantDetails.id)}> Denied </button>
    </div>
  )
}
