import React, {useState, useEffect, useReducer} from 'react';
import { INIT_ACTIONS, initReducer } from '../schoolYears/RenderSchoolYears';
import RenderStudents from './RenderStudents';
import { Link } from 'react-router-dom';


const CLASS_ACTIONS = {
    SELECT_SY : 'select-sy',
    SY_SELECTION : 'sy-selection',
};

function sy_Reducer(class_lists, action) {
    switch (action.type) {
        case CLASS_ACTIONS.SELECT_SY:
            return {...class_lists, view_sy : true, id : action.payload.data.id, display_sy : action.payload.data.display_sy, sy_sections : action.payload.data.sy_section}
        
        case CLASS_ACTIONS.SY_SELECTION:
            return {...class_lists, view_sy : false}
        
        default:
            return class_lists
    }
};

export default function ClassLists() {
    const [class_lists, sy_dispatcher] = useReducer(sy_Reducer, { sy_sections : [] });
    const [schoolYears, set_Sy] = useState([]);
    const [initForce, initDispatch] = useReducer(initReducer, {});

    useEffect(()=> {
        initDispatch({ type : INIT_ACTIONS.LOADING });
        get_schoolyears();
    }, []);


    let get_schoolyears = async () => {
        try {
            let response = await fetch('/Registrar/Classlist/Api/Get/');
            let data = await response.json();
            set_Sy(data);
            initDispatch({ type : INIT_ACTIONS.SUCCESS_LOADING });
        } catch (error) {
            errorHandler(error);
        };
    };

    function errorHandler(error){
        initDispatch({ type : INIT_ACTIONS.ERROR_AFTER_LOADING, payload : { errorMessage : error } });
        console.error(error);
    };

    let render_classlists = class_lists.sy_sections.map((section, index) => (
        <div className='accordion mb-3'>
            <div class="accordion-item">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${index}`} aria-expanded="true" aria-controls="collapseOne">
                    <h4 className='m-0'> {section.name} - {section.count_students} Student/s </h4>
                    <button className='btn btn-dark ms-5' onClick={()=> window.location.href = `/Registrar/Classlist/Grades/${section.id}/`}> Grades </button>
                </button>
                <div id={`collapse-${index}`} class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                    <div class="accordion-body bg-light">
                        <RenderStudents key={index} students={section.students} />
                    </div>
                </div>
            </div>
        </div>
    ));

    let render_schoolyears = schoolYears.map((sy, index) => (
        <button className='btn btn-primary' key={index} onClick={()=> sy_dispatcher({ type : CLASS_ACTIONS.SELECT_SY, payload : { data : sy } })}> S.Y. {sy.display_sy} </button>
    ));

  return (
    <div>
        <button className='btn btn-danger mb-3' onClick={() => window.location.href = '/Registrar/'}> Exit </button>
      {initForce.is_loading ? (
        <div>
            <h4> Loading... </h4>
        </div>
      ) : (
        <div>
            {initForce.errorMessage ? (
                <div>
                    <h4> {initForce.errorMessage} </h4>
                </div>
            ) : (
                <div>
                    {class_lists.view_sy ? (
                        <div>
                            <div className='alert alert-dark mb-4'>
                                <h4 className='m-0'> {class_lists.display_sy} </h4>
                            </div>
                            {class_lists.sy_sections.length ? (
                                <div>
                                    <button onClick={() => window.location.href = `/Registrar/Classlist/Print/${class_lists.id}`} className='btn btn-dark mb-4'> Print </button>
                                    <div className='accordion_wrapper py-2 mb-3'>
                                        {render_classlists}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h4> No sections found. </h4>
                                </div>
                            )}
                            <button className='btn btn-secondary' onClick={()=> sy_dispatcher({ type : CLASS_ACTIONS.SY_SELECTION })}> Back </button>
                        </div>
                    ) : (
                        <div >
                            {schoolYears.length ? (
                                <div>
                                    {render_schoolyears}
                                </div>
                            ) : (
                                <div>
                                    <h4> No school year found... </h4>
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
