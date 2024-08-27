import React from 'react';
import MyChartComponent from './MyChartComp';

const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      data: [65, 59, 80, 81, 56, 55, 40],
    },
  ],
};

const options = {
  scales: {
    x: {
      type: 'category',
    },
  },
};

const App = () => {
  return (
    <div>
      <h2>Bar Chart Example</h2>
      <MyChartComponent data={data} options={options} />
    </div>
  );
};

export default App;
