import React, { useEffect, useRef } from 'react';
import { Chart, registerables, CategoryScale } from 'chart.js';

Chart.register(...registerables);
Chart.register(CategoryScale);

const MyChartComponent = ({ data, options }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart instance
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar', // or any other chart type
      data,
      options,
    });

    // Cleanup function to destroy chart instance
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options]);

  return <canvas ref={chartRef}></canvas>;
};

export default MyChartComponent;
