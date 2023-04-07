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
      return {...schoolYear, sy_data : action.payload.data}

    default:
      return schoolYear
  };
};


export default function RenderSchoolYears() {
  const [schoolYear, sy_dispatch] = useReducer(reducer, {});
  const [schoolYears, setSchoolYears] = useState([]);
  const [syPages, setSyPages] = useState([]);

  useEffect(()=>{
    get_schoolyears();
  }, []);

  useEffect(()=>{
    if (schoolYears){
      sy_dispatch({ type : CHART_ACTIONS.REFRESH_PAGE, payload : {data:schoolYears[0]} })
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

  console.log(schoolYear);

  function errorHandler(error){
    console.error(error);
  }

  const data = [
    ['Task', 'Hours per Day'],
    ['Work', 11],
    ['Eat', 2],
    ['Commute', 2],
    ['Watch TV', 2],
    ['Sleep', 7],
    ['jakol', 7],
    ['kantot', 7],
  ];

  const options = {
    is3D: true,
    title: 'My Daily Activities',
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
          <Chart
            chartType="PieChart"
            data={schoolYear.sy_data.strands}
            options={options}
            graph_id="PieChart"
            width={'100%'}
            height={'800px'}
          />
        </div>
      ) : (
        <div> No data </div>
      )}
    </div>
  )
}
