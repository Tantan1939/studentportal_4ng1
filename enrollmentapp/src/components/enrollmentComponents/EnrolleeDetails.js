import React, {useState, useEffect} from 'react'
import StudentDetailsModal from './enrollmentModals/StudentDetailsModal'
import ImageModal from './enrollmentModals/ImageModal'
import DeniedConfirmationModal from './enrollmentModals/DeniedConfirmationModal';
import MoveToModal from './enrollmentModals/MoveToModal';
import './enrollment.css'

export default function EnrolleeDetails({DeniedEnrollee_Handler, enrollment, batchID, move_function}) {
  let [reportCard, setReportCard] = useState('');
  let [studentPicture, setStudentPicture] = useState('');
  let [enrollmentID, setEnrollmentID] = useState(enrollment.id);

  const [studPictModal, setStudPictModal] = useState(false);
  const [studDetailModal, setStudDetailModal] = useState(false);
  const [studCardModal, setReportCardModal] = useState(false);
  const [deniedConfirmationModal, setDeniedConfirmationModal] = useState(false);
  const [moveToModal, setMoveToModal] = useState(false);

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

  useEffect(()=> {
    setEnrollmentID(enrollment.id);
  }, [enrollment]);

  const imgStyle = {
    height: '60px',
    width: '60px',
    borderRadius: '100px'
  }
  const span ={
    fontSize:'17px',
    fontWeight:'500'
    
  }
  return (
    <div className='student w-100'>
      <img src={studentPicture} style={imgStyle} onMouseEnter={() => setStudPictModal(true)} onMouseLeave={() => setStudPictModal(false)}/>
      {setStudPictModal && (
        <div>
            <ImageModal isHovering={studPictModal} img={studentPicture}/>
        </div>
      )}


      
      <div className='namestud d-flex align-items-center' style={span} onMouseEnter={() => setStudDetailModal(true)} onMouseLeave={() => setStudDetailModal(false)}><p className='m-0'> <span style={{color:'#999'}}>#{enrollmentID} - {enrollment.applicant}: </span>  {enrollment.full_name} - {enrollment.age}</p> </div>
      {setStudDetailModal && (
        <div>
          <StudentDetailsModal isHovering={studDetailModal} studDetail={enrollment} studpict={studentPicture}/>
        </div>
      )}

      
      <span style={span} className='d-flex align-items-center' onMouseEnter={() => setReportCardModal(true)} onMouseLeave={() => setReportCardModal(false)}> Report Card </span>
      {setReportCardModal && (
          <div>
        <ImageModal isHovering={studCardModal} img={reportCard}/>
        </div>
      )}

      <div className='stud_btn d-flex align-items-center justify-content-center ms-auto'>
        <button className='btn btn-danger me-2' onClick={() => setDeniedConfirmationModal(true)}> Denied </button>
        <DeniedConfirmationModal open={deniedConfirmationModal} closeModalFunc={() => setDeniedConfirmationModal(false)}  DeniedEnrollee_Handler={DeniedEnrollee_Handler} enrollment={enrollment} studentPicture={studentPicture}/>

        <button className='btn btn-success' onClick={() => setMoveToModal(true)}> Move To </button>
        <MoveToModal open={moveToModal} closeModalFunc={() => setMoveToModal(false)} batchID={batchID} enrollmentID={enrollmentID} move_function={move_function}/>

      </div>
    </div>
  )
}
