import React, {useState, useEffect, useReducer} from 'react';
import { INIT_ACTIONS, initReducer } from '../schoolYears/RenderSchoolYears';
import RendererProxy from './RendererProxy';


const LIST_ACTIONS = {
    INIT_DISPLAY : "init-display",
    SELECT_STUDENT : "select-student",
    EXIT : "select-out",
    HAS_ERROR : "with-error",
    SELECT_DETAILS : "select-details",
}

const SEARCH_ACTIONS = {
    POST_SEARCH : 'post-search',
    SUCCESS_SEARCH : 'success-search',
}

export const DATA_TYPES = {
    DOCUMENTS : 'requested-documents',
    ADMISSION : 'admission',
    ENROLLMENT : 'enrollment',
    CLASS_SCHEDULES : 'class-schedules',
    GRADES : 'grades'
}

function search_dispatcher(searchForce, action) {
    switch (action.type) {
        case SEARCH_ACTIONS.POST_SEARCH:
            return {...searchForce, is_searching : true }
        case SEARCH_ACTIONS.SUCCESS_SEARCH:
            return {...searchForce, is_searching : false }
        default:
            return searchForce
    }
}

function stdReducer(students, action) {
    switch (action.type) {
        case LIST_ACTIONS.INIT_DISPLAY:
            return {...students,
                select_a_student : false }
        case LIST_ACTIONS.SELECT_STUDENT:
            return {...students, 
                select_a_student : true,
                selected_details : null,
                selected_type : null,
                user_id : action.payload.data.user_id,
                user_name : action.payload.data.user_name,
                email : action.payload.data.email,
                lrn : action.payload.data.lrn,
                requested_documents : action.payload.data.requested_documents,
                admission : action.payload.data.admission,
                enrollment : action.payload.data.enrollment,
                class_schedules: action.payload.data.class_schedules,
                grades : action.payload.data.grades }
        
        case LIST_ACTIONS.SELECT_DETAILS:
            return {...students, selected_details: action.payload.data, selected_type: action.payload.type}

        case LIST_ACTIONS.EXIT:
            return {...students, select_a_student : false}
            
        case LIST_ACTIONS.HAS_ERROR:
            return {...students, select_a_student : false}

        default:
            return students
    }
}

export default function RenderStudentList() {
    const [searchForce, searchDispatch] = useReducer(search_dispatcher, {})
    const [initForce, initDispatch] = useReducer(initReducer, {});
    const [studentRepositories, stdDispatcher] = useReducer(stdReducer, { select_a_student: false });
    let [studentLists, setStudentList] = useState([]);
    let [CSRFToken, setToken] = useState('');
    let [toSearch, setToSearch] = useState('');

    useEffect(()=>{
        get_students();
    }, []);

    let get_students = async () => {
        initDispatch({ type : INIT_ACTIONS.LOADING });
        try {
            let response = await fetch('/Registrar/Archives/Api/Get/');
            let data = await response.json();
            initDispatch({ type : INIT_ACTIONS.SUCCESS_LOADING });
            spreadDatas(data);
        } catch (error) {
            errorHandler(error);
        };
    };

    function errorHandler(error){
        setToken('');
        setStudentList([]);
        initDispatch({ type : INIT_ACTIONS.ERROR_AFTER_LOADING, payload : { errorMessage : error } });
        console.error(error);
    };

    function spreadDatas(datas){
        if (datas[1].length > 0){
            setToken(datas[0]);
            stdDispatcher({ type : LIST_ACTIONS.INIT_DISPLAY })
            setStudentList(datas[1]);
        } else {
            setToken(datas[0]);
            setStudentList([]);
            stdDispatcher({ type: LIST_ACTIONS.HAS_ERROR });
        }
    }

    const handleSearchInput = (event) => {
        const {value} = event.target;
        setToSearch(value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();

        let search_me = async () => {
            searchDispatch({ type : SEARCH_ACTIONS.POST_SEARCH });
            try {
                let post_search = await fetch('/Registrar/Archives/Api/Get/', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": CSRFToken
                    },
                    body: JSON.stringify({
                        key: toSearch})
                });
                let response = await post_search.json();
                searchDispatch({ type : SEARCH_ACTIONS.SUCCESS_SEARCH });
                spreadDatas(response);
            } catch (error) {
                searchDispatch({ type : SEARCH_ACTIONS.SUCCESS_SEARCH });
                errorHandler(error);
            };
        }
        search_me();
    }

    let render_archives = studentLists.map((studentDetails, index) => (
        <div key={index}>
            <p> {studentDetails.lrn}: {studentDetails.email} </p>
            <button key={index} className='btn btn-primary mb-3' onClick={() => {
                stdDispatcher({ type : LIST_ACTIONS.SELECT_STUDENT, payload: { data : studentDetails } })
            }}>
                View
            </button>
        </div>
    ));

    let render_search_engine = (
        <form onSubmit={handleSearchSubmit}>
            <input type={'text'} style={{width:'100px',textAlign:'center'}} placeholder={"Search"} onChange={handleSearchInput} required/>
            <button className='btn btn-primary mb-3'> Search </button>
        </form>
    )

  return (
    <div>
        <button className='btn btn-danger mb-3' onClick={() => window.location.href = '/Registrar/'}> Exit </button>

      {initForce.is_loading ? (
        <h4> Loading... </h4>
      ) : (
        <div>
            {initForce.errorMessage ? (
                <h4> Please refresh your page {initForce.errorMessage} </h4>
            ) : (
                <div>
                    {studentRepositories.select_a_student ? (
                        <div>
                            <button className='btn btn-danger mb-3' onClick={() => stdDispatcher({ type : LIST_ACTIONS.EXIT })}> Back </button>
                            <p> User ID: {studentRepositories.user_id} </p>
                            <p> User_name: {studentRepositories.user_name} </p>
                            <p> Email: {studentRepositories.email} </p>
                            <p> LRN: {studentRepositories.lrn} </p>

                            <button className='btn btn-info mb-3' onClick={()=> stdDispatcher({ type : LIST_ACTIONS.SELECT_DETAILS, payload : { data:studentRepositories.requested_documents, type : DATA_TYPES.DOCUMENTS } })}> Requested Documents </button>
                            <button className='btn btn-info mb-3' onClick={()=> stdDispatcher({ type : LIST_ACTIONS.SELECT_DETAILS, payload : { data:studentRepositories.admission, type : DATA_TYPES.ADMISSION } })}> Admission </button>
                            <button className='btn btn-info mb-3' onClick={()=> stdDispatcher({ type : LIST_ACTIONS.SELECT_DETAILS, payload : { data:studentRepositories.enrollment, type : DATA_TYPES.ENROLLMENT } })}> Enrollment </button>
                            <button className='btn btn-info mb-3' onClick={()=> stdDispatcher({ type : LIST_ACTIONS.SELECT_DETAILS, payload : { data:studentRepositories.class_schedules, type : DATA_TYPES.CLASS_SCHEDULES } })}> Class Schedules </button>
                            <button className='btn btn-info mb-3' onClick={()=> stdDispatcher({ type : LIST_ACTIONS.SELECT_DETAILS, payload : { data:studentRepositories.grades, type : DATA_TYPES.GRADES } })}> Grades </button>
                            <button className='btn btn-danger mb-3' onClick={() => stdDispatcher({ type : LIST_ACTIONS.EXIT })}> Back </button>
                            <RendererProxy selected_type={studentRepositories.selected_type} selected_details={studentRepositories.selected_details} />
                        </div>
                    ) : (
                        <div>
                            {studentLists.length ? (
                                <div>
                                    {render_search_engine}
                                    {searchForce.is_searching ? (
                                        <div> Searching... </div>
                                    ) : (
                                        <div> {render_archives} </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {toSearch ? (
                                        <div>
                                            {render_search_engine}
                                            {searchForce.is_searching ? (
                                                <div> Searching... </div>
                                            ) : (
                                                <div>
                                                    <h5> No results... </h5>
                                                    <button onClick={()=> get_students()} className='btn btn-info mb-3'> Back </button>
                                                </div>
                                            )}
                                        </div>

                                    ) : (
                                        <h5> No students found... </h5>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
      )}

    </div>
  )
}
