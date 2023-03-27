import React, {useState, useEffect} from 'react'

export default function EnrolleeDetails({DeniedEnrollee_Handler, enrollment}) {
  let [reportCard, setReportCard] = useState('');
  let [studentPicture, setStudentPicture] = useState('');

  const fetch_reportCard = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setReportCard(imageObjectURL);
  };

  const fetch_studentPicture = async (imgurl) => {
    const res = await fetch(imgurl);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setStudentPicture(imageObjectURL);
  };

  useEffect(()=> {
    fetch_reportCard(enrollment.report_card[0].report_card);
    fetch_studentPicture(enrollment.stud_pict[0].user_image);
  }, [enrollment]);

  return (
    <div className='container'>
      <img src={studentPicture} style={{ width: "20%", height: "20%" }} />
      <h5> {enrollment.applicant}: {enrollment.full_name} - {enrollment.age} </h5>
      <h5> Report Card </h5>
      <button onClick={() => DeniedEnrollee_Handler(enrollment.id)}> Denied </button>
      <button> Move To </button>
    </div>
  )
}
