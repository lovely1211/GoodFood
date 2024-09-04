import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/userContext';

const BuyerProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('buyerToken');
  const { user } = useUser();

  if (!user || user.role !== 'buyer') {
    return <Navigate to="/auth" replace />;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default BuyerProtectedRoute;
