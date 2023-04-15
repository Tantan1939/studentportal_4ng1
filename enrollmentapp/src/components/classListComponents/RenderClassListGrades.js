import React, {useState, useEffect, useReducer} from 'react';
import { Link } from 'react-router-dom';
import { INIT_ACTIONS, initReducer } from '../schoolYears/RenderSchoolYears';


const CLASS_SHEET_ACTIONS = {
    FRESH_DISPLAY : 'fresh-display',
    SAVE_GRADES : 'save-grades',
    SELECT_Q : 'select-quarter',
    HAS_ERROR : 'has-error',
};

function class_reducer(classSheet, action) {
    switch (action.type) {
        case CLASS_SHEET_ACTIONS.FRESH_DISPLAY:
            return {...classSheet, 
                student_datas : action.payload.data, 
                quarter_id : action.payload.quarter_id, 
                quarter_name : action.payload.quarter_name, 
                quarter_details : extract_quarter_data(action.payload.data, action.payload.quarter_id),
                year_level : action.payload.data[0].Year_level }

        case CLASS_SHEET_ACTIONS.SELECT_Q:
            return {...classSheet, 
                quarter_id : action.payload.quarter_id, 
                quarter_name : action.payload.quarter_name,
                quarter_details : extract_quarter_data(classSheet.student_datas, action.payload.quarter_id) }

        case CLASS_SHEET_ACTIONS.HAS_ERROR:
            return {...classSheet, student_datas : []}

        default:
            return classSheet
    }
};

function extract_quarter_data(q_datas, qrtr){
    return q_datas.map((item) => item[qrtr])
};

export default function RenderClassListGrades({match}) {
    const [classSheet, setClassSheet] = useReducer(class_reducer, { student_datas : [] });
    const [formData, setFormData] = useState([]);
    const [initForce, initDispatch] = useReducer(initReducer, {});
    const [quarters, setQuarters] = useState([]);
    let [CSRFToken, setToken] = useState('');

    useEffect(()=> {
        get_classgrades();
    }, []);

    useEffect(()=> {
        setFormData(prevFormData => prevFormData.filter(data => data.subjects.length > 0));
    }, [formData]);

    let get_classgrades = async () => {
        initDispatch({ type : INIT_ACTIONS.LOADING });
        try {
            let response = await fetch(`/Registrar/Classlist/Api/Grades/Get/${match.params.section_id}/`);
            let data = await response.json();
            initDispatch({ type : INIT_ACTIONS.SUCCESS_LOADING });
            spreadDatas(data);
        } catch (error) {
            errorHandler(error);
        };
    };

    function spreadDatas(datas){
        if (datas.length > 0){
            setToken(datas[0]);
            setQuarters(datas[1]);

            if (classSheet.student_datas.length > 0) {
                setClassSheet({ type : CLASS_SHEET_ACTIONS.FRESH_DISPLAY, payload : { data : datas[2], quarter_id : classSheet.quarter_id, quarter_name : classSheet.quarter_name } });
            } else {
                setClassSheet({ type : CLASS_SHEET_ACTIONS.FRESH_DISPLAY, payload : { data : datas[2], quarter_id : datas[1][0][0], quarter_name : datas[1][0][1] } });
            }
            
        } else {
            setToken('');
            setClassSheet({ type : CLASS_SHEET_ACTIONS.HAS_ERROR });
        };
    };

    function errorHandler(error){
        initDispatch({ type : INIT_ACTIONS.ERROR_AFTER_LOADING, payload : { errorMessage : error } });
        setClassSheet({ type : CLASS_SHEET_ACTIONS.HAS_ERROR });
        setToken('');
        setFormData([]);
        console.error(error);
    };

    const handleFieldChanges = (event, index, index_1) => {
        const {name, id, value} = event.target;
        
        setFormData(prevList => {
            const prevSubjects = prevList[index] ? [...prevList[index].subjects] : []
            const updatedSubjects = [name, value];

            if (!prevSubjects[index_1]) {
                prevSubjects[index_1] = []
            }

            prevSubjects[index_1] = updatedSubjects;

            prevList[index] = {
                student_id : id,
                kwarter : classSheet.quarter_id,
                ylvl : classSheet.year_level,
                subjects : prevSubjects
            }
            return prevList;

        });
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        save_grades();
    };

    let render_classlists = classSheet.student_datas.map((std, index) => (
        <div key={index}>
            {std.Name}

            { Object.entries(classSheet.quarter_details[index]).map(([subject, grade], index_1)=> (
                <div>
                    <p> {subject}: </p>
                    <input type='number' key={`${index}-${index_1}-${classSheet.quarter_id}`} name={subject} id={std.id} placeholder={grade} onChange={event => handleFieldChanges(event, index, index_1)}/>
                </div>

            )) }

        </div>
    ));

    let render_quarter_buttons = quarters.map((quarter, index) => (
        <button key={index} onClick={()=> {
            setClassSheet({ type : CLASS_SHEET_ACTIONS.SELECT_Q, payload : { quarter_id : quarter[0], quarter_name : quarter[1] } });
            setFormData([]);
        }}>
            {quarter[1]}
        </button>
    ));

    function save_grades (){
        let save_me = async () => {
            initDispatch({ type : INIT_ACTIONS.LOADING });
            try {
                let post_grades = await fetch('/Registrar/Classlist/Api/Grades/Post/', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": CSRFToken
                    },
                    body: JSON.stringify({
                        grades: formData})
                });
                let response = await post_grades.json();
                console.log(response);
                get_classgrades();                
            } catch (error) {
                errorHandler(error);
            };
        }
        save_me();
    };

  return (
    <div>
        <Link to={`/Registrar/Classlist/`}> <button> Back </button> </Link>

        {initForce.is_loading ? (
            <h4> Loading... </h4>
        ) : (
            <div>
                {initForce.errorMessage ? (
                    <h4> Please refresh your page. {initForce.errorMessage} </h4>
                ) : (
                    <div>
                        {classSheet.student_datas.length ? (
                            <div>
                                <h4> {classSheet.quarter_name} </h4>
                                {render_quarter_buttons}

                                <form onSubmit={handleFormSubmit}>
                                    {render_classlists}
                                    <button type='submit' className='btnPrimary'> Save </button>
                                </form>
                            </div>
                        ) : (
                            <div>
                                <h5> No students found... </h5>
                            </div>
                        )}
                    </div>
                )}
            </div>
)}
    </div>
  )
}
