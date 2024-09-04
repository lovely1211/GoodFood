// App.js

import React from 'react';
import RoutesComp from './manageRoutes/HomeRoutes';
import Logo from './assets/Good Food.png';
import './App.css';

function App() {
  return (
    <div className="bg-custom-radial">

      <div className='sticky top-0 z-50 flex bg-gray-400 p-2 justify-between'>
       <div className='text-4xl font-bold ml-2 flex'>
        <img src={Logo} alt='logo' className='w-10 rounded-full mr-2'/>
         GoodFood
       </div>
       <div className='text-2xl font-semibold'> 
         Good food choices are good investments....
       </div>
      </div>

      <div>
        <RoutesComp />
      </div>

    </div>
  );
}

export default App;
