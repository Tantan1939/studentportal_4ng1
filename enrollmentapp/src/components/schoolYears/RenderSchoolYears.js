import React, {useState, useEffect, useReducer} from 'react';
import {Chart} from 'react-google-charts';
import SchoolYearModal from './renderComponents/SchoolYearModal';
import ScheduleModal from './renderComponents/ScheduleModal';


const CHART_ACTIONS = {
  SELECT_SEX : 'select-sex',
  SELECT_STRAND : 'select-strand',
  SELECT_YEARLEVEL : 'select-yearlevel',
  CHANGE_PAGE : 'change-page',
  REFRESH_PAGE : 'refresh-page',
};

export const INIT_ACTIONS = {
  LOADING : 'loading',
  ERROR_AFTER_LOADING : 'error-after-loading',
  SUCCESS_LOADING : 'success-loading',
};

export function initReducer(initForce, action) {
  switch (action.type) {
    case INIT_ACTIONS.LOADING:
      return {...initForce, is_loading : true}
    case INIT_ACTIONS.ERROR_AFTER_LOADING:
      return {...initForce, is_loading : false, errorMessage : action.payload.errorMessage}
    case INIT_ACTIONS.SUCCESS_LOADING:
      return {...initForce, is_loading : false}
    default:
      return initForce
  };
};

function reducer(schoolYear, action){
  switch (action.type) {
    case CHART_ACTIONS.REFRESH_PAGE:
      return {...schoolYear, sy_data : action.payload.data, current_chartData : action.payload.data.sexs, current_chartName : "Sex"}

    case CHART_ACTIONS.CHANGE_PAGE:
      return {...schoolYear, sy_data : action.payload.data, current_chartData : action.payload.data.sexs, current_chartName : "Sex"}

    case CHART_ACTIONS.SELECT_SEX:
      return {...schoolYear, current_chartData : schoolYear.sy_data.sexs, current_chartName : "Sex"}

    case CHART_ACTIONS.SELECT_STRAND:
      return {...schoolYear, current_chartData : schoolYear.sy_data.strands, current_chartName : "Strand"}

    case CHART_ACTIONS.SELECT_YEARLEVEL:
      return {...schoolYear, current_chartData : schoolYear.sy_data.yearLevels, current_chartName : "Year level"}

    default:
      return schoolYear
  };
};


export default function RenderSchoolYears() {
  const [schoolYear, sy_dispatch] = useReducer(reducer, {});
  const [initForce, initDispatch] = useReducer(initReducer, {});
  const [schoolYears, setSchoolYears] = useState([]);
  let [openSyModal, setOpenSyModal] = useState(false);
  let [openSetupModal, setSetupModal] = useState(false);


  useEffect(()=>{
    initDispatch({ type : INIT_ACTIONS.LOADING })
    get_schoolyears();
  }, []);

  useEffect(()=>{
    if (schoolYears.length > 0){
      sy_dispatch({ type : CHART_ACTIONS.REFRESH_PAGE, payload : { data : schoolYears[0] } })
    }
  }, [schoolYears]);

  let get_schoolyears = async () => {
    try {
      let response = await fetch('/Registrar/schoolyear/Api/');
      let data = await response.json();
      setSchoolYears(data);
      initDispatch({ type : INIT_ACTIONS.SUCCESS_LOADING });
    } catch (error) {
      errorHandler(error);
    };
  };

  function errorHandler(error){
    initDispatch({ type : INIT_ACTIONS.ERROR_AFTER_LOADING, payload : { errorMessage : error } });
    console.error(error);
  };

  let render_pages = schoolYears.map((sy, index) => (
    <button key={index} onClick={()=> sy_dispatch({ type : CHART_ACTIONS.CHANGE_PAGE, payload : { data : sy } })}> {index + 1} </button>
  ));

  const options = {
    is3D: true,
    title: schoolYear.current_chartData ? schoolYear.current_chartName : "",
    pieSliceText: 'percentage',
    pieSliceTextStyle: {
      color: 'black',
      fontSize: 14,
      bold: true,
      position: 'outside',
      distance: 100,
    },
    legend: {
      position: 'top',
      alignment: 'center',
      textStyle: {
        color: '233238',
        fontSize: 14,
      },
    },
    chartArea: {
      left: '150px',
      top: '300px',
      width: '100%',
      height: '80%',
    },
  };


  return (
    <div class="main">
      <div class="container"> 
        <div class="w-100 mt-3 d-flex pt-3 justify-content-end">  
          <button class="btn btn-primary btn-md"onClick={() => window.location.href = '/Registrar/'}> 
          <i class="bi bi-box-arrow-left">  </i>
          Exit
          </button> 
        </div>

        
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


              {schoolYear.sy_data ? (
                <div class="year_parent p-3 mt-3 mb-2 bg-white text-dark border rounded border shadow">
                <div class="action d-flex justify-content-end ms-2">
                       {schoolYear.sy_data.can_update && (
                    <div>
                      <button class="btn btn-primary me-2" onClick={()=> {
                        setOpenSyModal(true);
                        setSetupModal(false);
                      }}> Update {schoolYear.sy_data.sy_name} </button>
                      <SchoolYearModal open={openSyModal} close={()=> setOpenSyModal(false)} syname={schoolYear.sy_data.sy_name}/>

                      <button class="btn btn-primary" onClick={()=> {
                        setSetupModal(true);
                        setOpenSyModal(false);
                      }}> Update Period </button>
                      <ScheduleModal open={openSetupModal} close={()=> setSetupModal(false) }/>
                    </div>
                  )}
                  </div>

                  <div class="year d-flex justify-content-center mb-2">
                  <h2> {schoolYear.sy_data.sy_name} </h2>
                  </div>
                  {schoolYear.current_chartData.length ? (
                    <div>
                      <div class="action d-flex justify-content-center">
                        <button class="btn btn-success btn-md me-2" onClick={() => sy_dispatch({ type : CHART_ACTIONS.SELECT_SEX })}> Sex </button>
                        <button class="btn btn-success btn-md me-2" onClick={() => sy_dispatch({ type : CHART_ACTIONS.SELECT_STRAND })}> Strand </button>
                        <button class="btn btn-success btn-md me-2" onClick={() => sy_dispatch({ type : CHART_ACTIONS.SELECT_YEARLEVEL })}> Year level </button>
                      </div>

                   
      
                      <Chart
                        chartType="PieChart"
                        data={schoolYear.current_chartData}
                        options={options}
                        graph_id="PieChart"
                        width={'100%'}
                        height={'500px'}
                      />
      
                    </div>
                  ) : (
                    <div> 
                    <h4>
                    
                    No data to display.
                    </h4> 
                    </div>
                  )}
               
                  {render_pages}
                </div>
              ) : (
                <div>
                <h4>
                
                No school year found.
                
                </h4> 
                 </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  )
}
