import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './context/userContext';
import { MenuProvider } from './context/menuContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  
  <React.StrictMode>
    <UserProvider>
    <MenuProvider>
      <App />
    </MenuProvider>
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
