import React, {useState, useEffect} from 'react'
import BatchPagination from '../pages/BatchPagination'
import StudentEnrollmentPage from '../pages/StudentEnrollmentPage'

export default function EnrollmentList() {
    let [applicants, setApplicants] = useState([])
    let [batchPagination, setBatchPagination] = useState([])
    let [applicantsPk, setApplicantsPk] = useState([])
    let [currentBatch, setCurrentBatch] = useState(null)

    useEffect(() => {
        getEnrollees()
    }, [])

    function spreadData(datas) {
        setApplicants(datas.applicants)
        setBatchPagination(datas.batches.map(batch_val => conv_batch_num(batch_val)))
        setApplicantsPk(datas.applicants_pks)
    }

    useEffect(()=>{
        if (currentBatch === null){
            setCurrentBatch(2)
        }
    }, [applicants])


    let getEnrollees = async (batchKey=null) => {
        if (batchKey){
            let response = await fetch(`/Registrar/Enrollment/applicants/${batchKey}`)
            let data = await response.json()
            spreadData(data)
        }else{
            let response = await fetch('/Registrar/Enrollment/applicants/')
            let data = await response.json()
            spreadData(data)
        }
    }

    function moveBatchHandler(pk){
        alert(`Move this ${pk}?`);
    }

    function declineHandler(pk){
        alert(`Decline this ${pk}?`);
    }

    function acceptBatch(){
        alert(`Accept them ${applicantsPk[0].id}?`);
    }

    function batchClickHandler(key){
        setCurrentBatch(key);
        getEnrollees(key);
    }

    function conv_batch_num(num){
        return parseInt(num.id)
    }

    let renderApplicantList = applicants.map((applicant, index) => (
        <StudentEnrollmentPage key={index} applicantDetails={applicant} BatchHandler={moveBatchHandler} DeclineHandler={declineHandler}/>
    ))

    let renderBatchPagination = batchPagination.map((batch, index) => (
        <BatchPagination key={index} visibleNum={index+1} batchDetail={batch} clickHandler={batchClickHandler} />
    ))

  return batchPagination ? (
    <div>
        <h5> Exit </h5>
        <h6> Batch {batchPagination.indexOf(currentBatch)+1} of {batchPagination.length} </h6>
        <button onClick={acceptBatch}> Accept All </button>
        <div> {renderApplicantList} </div>
        <div> {renderBatchPagination} </div>
    </div>
  ) : (
    <div>
        <h5> Exit </h5>
        <h3> No applicants... </h3>
    </div>
  )
}