import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/userContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Redirect based on user role
  if (user.role === 'buyer' && window.location.pathname.startsWith('/seller')) {
    return <Navigate to="/buyer-home" />;
  }

  if (user.role === 'seller' && window.location.pathname.startsWith('/buyer')) {
    return <Navigate to="/seller-home" />;
  }

  return children;
};

export default ProtectedRoute;
