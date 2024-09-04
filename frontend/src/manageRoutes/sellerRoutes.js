// manageRoutes/sellerRoutes.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Auth from '../authentication/sellerAuth';
import Dashboard from '../pages/seller/Dashboard';
import Menu from '../pages/seller/MenuManagement';
import About from '../pages/seller/About';
import Contact from '../pages/seller/Contact';
import Order from '../pages/seller/Order';
import ProtectedRoute from './protectedRoute'; 

function RoutesComp() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>}/>
        <Route path="/orders" element={<ProtectedRoute><Order/> </ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About/> </ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute> <Menu/></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute> <Contact/></ProtectedRoute>}/>
      </Routes>
    </Router>
  );
}

export default RoutesComp;