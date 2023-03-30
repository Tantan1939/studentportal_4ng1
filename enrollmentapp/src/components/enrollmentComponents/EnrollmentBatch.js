import React, {useState, useEffect} from 'react'
import ListOfEnrollees from './ListOfEnrollees';

export default function EnrollmentBatch() {
  let [enrollees, setEnrollees] = useState([]);
  let [CSRFToken, setCSRFToken] = useState('');
  let [loading, setLoading] = useState(true);
  let [hasError, setHasError] = useState(false);

  useEffect(()=> {
    getEnrollees();
  }, []);

  let getEnrollees = async () => {
    try {
      let response = await fetch('/Registrar/Enrollment/Api/Get/');
      let data = await response.json();
      setLoading(false);
      spreadDatas(data);
    } catch (error) {
      errorHandler(error);
    };
  };

  function spreadDatas(datas){
    setCSRFToken(datas.X_CSRFToken);
    setEnrollees(datas.batch_lists);
  };

  function DeniedEnrollee_Handler(pk){
    let me = async (pk)=> {
      try {
        let denied = await fetch('/Registrar/Enrollment/Api/Denied/', {
          method: "POST",
          headers : {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRFToken,
          },
          body: JSON.stringify({key: pk})
        })
        let response = await denied.json();
        console.log(response);
        getEnrollees();
      } catch (error) {
        errorHandler(error);
      };
    };
    setLoading(true);
    me(pk);
  };

  function AcceptEnrollees_Handler(pks, batchID){
    let me = async (pks, batchID) => {
      try{
        let accepts = await fetch('/Registrar/Enrollment/Api/Accept/', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRFToken,
          },
          body: JSON.stringify({keys : pks, batchID: batchID})
        });
        let response = await accepts.json();
        console.log(response);
        getEnrollees();
      } catch (error) {
        errorHandler(error);
      };
    };
    
    setLoading(true);
    me(pks, batchID);
  };

  function move_enrollee_to_another_batch(currentID, currentBatch, targetBatch, exchangeID = null){
    let me_move = async (currentID, currentBatch, targetBatch, exchangeID) => {
      try{
        let move_now = await fetch('/Registrar/Enrollment/Api/Swap_v1/', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRFToken
          },
          body: JSON.stringify({
            currentID: currentID,
            currentBatch: currentBatch,
            targetBatch: targetBatch,
            exchangeID: exchangeID})
        });
        let response = await move_now.json();
        console.log(response);
        getEnrollees();
      } catch (error) {
        errorHandler(error);
      };
    };

    setLoading(true);
    me_move(currentID, currentBatch, targetBatch, exchangeID);
  };

  function errorHandler(error){
    setLoading(false);
    console.error(error);
    setEnrollees([]);
    setCSRFToken('');
    setHasError(true);
  };

  let renderEnrolleeBatches = enrollees.map((enrollmentBatch, index) => (
    <ListOfEnrollees key={index} enrollmentBatch={enrollmentBatch} DeniedEnrollee_Handler={DeniedEnrollee_Handler} AcceptEnrollees_Handler={AcceptEnrollees_Handler} move_function={move_enrollee_to_another_batch}/>
  ));

  return (
    <div>
      <div> <button onClick={() => window.location.href = '/Registrar/'}> Exit </button> </div>

      <div>
        {loading && <h4> Loading... </h4>}
      </div>

      {enrollees.length ? (
        <div>
          {renderEnrolleeBatches}
        </div>
      ) : (
        <div>
          {hasError && <p> An error occurred. Please click F5 to refresh the page. </p>}
          {!hasError && <p> No enrollees. </p>}
        </div>
      )}

    </div>
  )
}
