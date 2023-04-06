import React, {useState, useEffect} from 'react';
import {Pie} from 'react-chartjs-2';
import {Chart, ArcElement, Tooltip, Legend} from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

export default function RenderSchoolYears() {
  const state = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Rainfall',
        data: [65, 59, 80, 81, 56],
        backgroundColor: [
          '#B21F00',
          '#C9DE00',
          '#2FDE00',
          '#00A6B4',
          '#6800B4',
        ],
        hoverBackgroundColor: [
        '#501800',
        '#4B5000',
        '#175000',
        '#003350',
        '#35014F',
        ]
      }
    ]
  };

  return (
    <div style={{ width: 800}}>
      <div style={{ width: 650 }}>
        <h2>Pie Chart</h2>
        <canvas id="myChart" width="400" height="100">
          <p> Canvas </p>
        </canvas>
        <Pie 
          data={state}
          options={{
            layout: {
              padding: 20
            },
            responsive: true,
          }}
            />
      </div>

    </div>
  )
}
