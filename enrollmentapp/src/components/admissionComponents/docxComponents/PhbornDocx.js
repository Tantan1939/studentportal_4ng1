import React, {useState, useEffect} from 'react'
import GoodMoralModal from '../modals/GoodMoralModal'
import PsaModal from '../modals/PsaModal'
import ReportCardModal from '../modals/ReportCardModal'

export default function PhbornDocx(props) {
  let [good_moral, setGood_moral] = useState('');
  let [report_card, setReport_card] = useState('');
  let [psa, setPsa] = useState('');

  const [openGoodMoralModal, setOpenGoodMoralModal] = useState(false);
  const [openReportCardModal, setOpenReportCardModal] = useState(false);
  const [openPsaModal, setOpenPsaModal] = useState(false);

  const fetch_goodmoral = async (imgurl) => {
      const res = await fetch(imgurl);
      const imageBlob = await res.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setGood_moral(imageObjectURL);
  };

  const fetch_reportcard = async (imgurl) => {
      const res = await fetch(imgurl);
      const imageBlob = await res.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setReport_card(imageObjectURL);
  };

  const fetch_psa = async (imgurl) => {
      const res = await fetch(imgurl);
      const imageBlob = await res.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setPsa(imageObjectURL);
  };

  useEffect(() => {
    fetch_goodmoral(props.softCopy_admissionRequirements_phBorn.good_moral);
    fetch_reportcard(props.softCopy_admissionRequirements_phBorn.report_card);
    fetch_psa(props.softCopy_admissionRequirements_phBorn.psa)
  }, [props]);




  
  return (
    <div class="d-flex justify-content-center">
      <h6 class="px-3" onMouseEnter={() => setOpenGoodMoralModal(true)} onMouseLeave={() => setOpenGoodMoralModal(false)}> Good Moral </h6>
     
      {setOpenGoodMoralModal && (
    <div>
        <GoodMoralModal isHovering={openGoodMoralModal} goodmoral={good_moral}/>
    </div>
  )}

      <h6 class="px-3" onMouseEnter={() => setOpenReportCardModal(true)} onMouseLeave={() => setOpenReportCardModal(false)}> Report Card </h6>
    
      {setOpenReportCardModal && (
    <div>
        <ReportCardModal isHovering={openReportCardModal} reportcard={report_card}/>
    </div>
  )}
      
      

      <h6 class="px-3" onMouseEnter={() => setOpenPsaModal(true)} onMouseLeave={() => setOpenPsaModal(false)}> PSA </h6>
      {setOpenReportCardModal && (
    <div>
    <PsaModal isHovering={openPsaModal} psa={psa}/>
    </div>
  )}


    </div>
  )
}
