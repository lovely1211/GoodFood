import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import axios from 'axios';

const SellerProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('sellerToken');
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const response = await axios.get('http://localhost:5000/api/sellerAuth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Error fetching user:', error);
          localStorage.removeItem('sellerToken');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token, user, setUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'seller') {
    return <Navigate to="/auth" replace />;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default SellerProtectedRoute;
