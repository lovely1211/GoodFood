import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainAuth from '../authentication/Auth';
import BuyerDashboard from './buyerRoutes';
import { UserProvider } from '../context/userContext'; 
import SellerDashboard from './sellerRoutes';
import ProtectedRoute from './protectedRoute';

const HomeRoutes = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<MainAuth />} />
          <Route path="/buyer-home" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/seller-home" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default HomeRoutes;
