import React, {useState, useEffect, useReducer} from 'react';
import {Chart} from 'react-google-charts';


const CHART_ACTIONS = {
  SELECT_SEX : 'select-sex',
  SELECT_STRAND : 'select-strand',
  SELECT_YEARLEVEL : 'select-yearlevel',
  CHANGE_PAGE : 'change-page',
  REFRESH_PAGE : 'refresh-page',
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
  const [schoolYears, setSchoolYears] = useState([]);

  useEffect(()=>{
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
    } catch (error) {
      errorHandler(error);
    };
  };

  function errorHandler(error){
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
    <div>
      {schoolYear.sy_data ? (
        <div>
          <h4> {schoolYear.sy_data.sy_name} </h4>
          {schoolYear.current_chartData.length ? (
            <div>
              <div>
                <button onClick={() => sy_dispatch({ type : CHART_ACTIONS.SELECT_SEX })}> Sex </button>
                <button onClick={() => sy_dispatch({ type : CHART_ACTIONS.SELECT_STRAND })}> Strand </button>
                <button onClick={() => sy_dispatch({ type : CHART_ACTIONS.SELECT_YEARLEVEL })}> Year level </button>
              </div>

              <Chart
                chartType="PieChart"
                data={schoolYear.current_chartData}
                options={options}
                graph_id="PieChart"
                width={'100%'}
                height={'800px'}
              />

            </div>
          ) : (
            <div> No data to display... </div>
          )}
          {schoolYear.sy_data.can_update && (
            <div>
              <button> Update {schoolYear.sy_data.sy_name} </button>
              <button> Update Period </button>
            </div>
          )}
          {render_pages}
        </div>
      ) : (
        <div> No school year found... </div>
      )}
    </div>
  )
}
