import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainAuth from '../authentication/Auth';
import BuyerMenu from '../pages/buyer/Menu';
import SellerDashboard from '../pages/seller/Dashboard';
import BuyerOrder from '../pages/buyer/Orders';
import SellerOrder from '../pages/seller/Order';
import BuyerAbout from '../pages/buyer/About';
import SellerAbout from '../pages/seller/About';
import BuyerContact from '../pages/buyer/Contact';
import SellerContact from '../pages/seller/Contact';
import LikedItems from '../pages/buyer/LikedItem';
import SellerMenu from '../pages/seller/MenuManagement';
import ProtectedRoute from './protectedRoute'; 
import BuyerResetPassword from '../authentication/buyerReset';
import SellerResetPassword from '../authentication/sellerReset';

const CombinedRoutes = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<MainAuth />} />
        
        {/* Routes for buyers */}
        {userRole === 'buyer' ? (
          <>
            <Route path="/" element={<ProtectedRoute><BuyerMenu /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><BuyerOrder /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><BuyerAbout /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><BuyerContact /></ProtectedRoute>} />
            <Route path="/menu/:id" element={<ProtectedRoute><BuyerMenu /></ProtectedRoute>} />
            <Route path="/liked-items" element={<ProtectedRoute><LikedItems /></ProtectedRoute>} />
            <Route path="/reset-password" element={<BuyerResetPassword />} />
          </>
        ) : userRole === 'seller' ? (
          <>
            <Route path="/" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><SellerOrder /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><SellerAbout /></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute><SellerMenu /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><SellerContact /></ProtectedRoute>} />
            <Route path="/reset-password" element={<SellerResetPassword />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/auth" replace />} />
        )}

        <Route path="*" element={<Navigate to="/" replace />} /> 
      </Routes>
    </Router>
  );
};

export default CombinedRoutes;
