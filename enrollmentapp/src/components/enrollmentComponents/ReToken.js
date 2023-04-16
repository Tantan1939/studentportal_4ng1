import React, {useState, useEffect, useReducer} from 'react';
import { INIT_ACTIONS, initReducer } from '../schoolYears/RenderSchoolYears';


export default function ReToken() {
    let [checkBoxes, setCheckBoxes] = useState({});
    let [checkedBoxes, setCheckedBoxes] = useState([]);
    let [admissions, setAdmissions] = useState([]);
    let [token, setToken] = useState('');
    const [initForce, initDispatch] = useReducer(initReducer, {});


    useEffect(()=> {
        get_admissions();
    }, []);

    useEffect(()=> {
        if (admissions.length > 0){
            setCheckedBoxes([]);

            admissions.forEach(admission => {
                setCheckBoxes(prevState => ({ ...prevState, [admission.id]:false }));
            });
        }
    }, [admissions]);

    let get_admissions = async () => {
        initDispatch({ type : INIT_ACTIONS.LOADING });
        try {
            let response = await fetch('/Registrar/Enrollment/Api/Admission_with_pending_enrollment_token_v1/');
            let data = await response.json();
            initDispatch({ type : INIT_ACTIONS.SUCCESS_LOADING })
            spreadDatas(data);
        } catch (error) {
            initDispatch({ type : INIT_ACTIONS.ERROR_AFTER_LOADING, payload : { errorMessage : error } })
            errorHandler(error);
        };
    };

    let re_token = async () => {
        try {
            let re_email_token = await fetch('/Registrar/Enrollment/Api/Admission_with_pending_enrollment_token_v1/', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": token
                },
                body: JSON.stringify({ keys:checkedBoxes })
            });
            let response = await re_email_token.json();
            console.log(response);
            get_admissions();
        } catch (error){
            errorHandler(error);
        }
    };

    function spreadDatas(datas){
        if (datas.length > 0) {
            setToken(datas[0]);
            setAdmissions(datas[1]);
        }
    };

    function errorHandler(error){
        console.error(error);
        setToken('');
        setAdmissions([]);
    };

    const handleCheckboxChanges = (event) => {
        const {name, checked} = event.target;
    
        setCheckBoxes(prevState => ({
          ...prevState,
          [name]:checked
        }));
    
        if (checked) {
          setCheckedBoxes(prevState => [...prevState, name]);
        } else {
          setCheckedBoxes(prevState => prevState.filter(item => item !== name));
        };
    };

    let render_admissions = admissions.map((admission, index) => (
        <div key={index}>
            <input type='checkbox' key={admission.admission_owner} name={admission.id} checked={checkBoxes[admission.id]} onChange={handleCheckboxChanges} />
            <label> {admission.admission_owner} </label>
        </div>
    ));


  return (
    <div>
        <button onClick={() => window.location.href = '/Registrar/Enrollment/'}> Back </button>
      {initForce.is_loading ? (
        <div>
            <h4> Loading... </h4>
        </div>
      ) : (
        <div>
            {initForce.errorMessage ? (
                <div>
                    <h4> Please refresh your page. Error: {initForce.errorMessage} </h4>
                </div>
            ) : (
                <div>
                    {admissions.length ? (
                        <div>
                            {render_admissions}
                            <button onClick={()=> re_token()}> Re_token </button>
                            <button onClick={() => window.location.href = '/Registrar/Enrollment/'}> Back </button>
                        </div>
                    ) : (
                        <div>
                            <h4> No admission found... </h4>
                        </div>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  )
}
