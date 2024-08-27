// manageRoutes/buyerRoutes.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from '../authentication/buyerAuth';
import Menu from '../pages/buyer/Menu';
import About from '../pages/buyer/About';
import Contact from '../pages/buyer/Contact';
import Order from '../pages/buyer/Orders';
import LikedItems from '../pages/buyer/LikedItem';
import ProtectedRoute from './protectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<ProtectedRoute> <Menu /> </ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute> <Order /> </ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute> <About /> </ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute> <Contact /> </ProtectedRoute>} />
        <Route path="/menu/:id" element={<ProtectedRoute> <Menu /> </ProtectedRoute>} />
        <Route path="/liked-items" element={<ProtectedRoute> <LikedItems /> </ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;


