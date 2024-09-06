// pages/seller/Dashboard

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useUser} from '../../context/userContext';
import Profile from './Profile';
import Sidebar from './dashboardComp/Sidebar'
import DashboardStats from './dashboardComp/Stats';
// import Charts from './dashboardComp/Charts';
import CustomerReview from './dashboardComp/Review';
import axiosInstance from '../../axiosInstance';


// Popup Component
const ProfilePopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="absolute inset-0 bg-gray-500 opacity-50" onClick={onClose}></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg z-10">
        <Profile />
        <button
          className="absolute top-2 right-2 text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isProfilePopupOpen, setProfilePopupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const { user } = useUser();

  const sellerId = JSON.parse(localStorage.getItem('userInfo')).id;

  useEffect(() => {
    const fetchNewOrderCount = async () => {
      try {
        const response = await axiosInstance.get(`/orders/seller/${sellerId}/new-count`);
        setNewOrderCount(response.data.count);
      } catch (error) {
        console.error('Error fetching new order count:', error);
      }
    };

    fetchNewOrderCount();
  }, [sellerId]);

  const handleOpenProfile = () => {
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  const goToMenu = () => navigate('/menu');
  const goToAbout = () => navigate('/about');
  const goToContact = () => navigate('/contact');
  const goToOrders = () => {
    // Mark new orders as viewed when navigating to the orders page
    axiosInstance.patch(`/orders/seller/${sellerId}/mark-viewed`)
      .then(() => setNewOrderCount(0))
      .catch(err => console.error('Error marking orders as viewed:', err));

    navigate('/orders');
  };
  
  useEffect(() => { 
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
    }
  }, [navigate, user]);


  return (
    <div>
      {isProfilePopupOpen && (
        <ProfilePopup onClose={() => setProfilePopupOpen(false)} />
      )}
        <div className='sticky top-[55px] z-50 bg-gray-400 flex flex-row justify-center items-center pb-3'> 
               <div className='mx-1 border-2 border-black px-2 rounded-xl bg-yellow-400 text-black cursor-pointer'>Dashboard</div>
        
               <div className='mx-1 border-2 border-black px-2 rounded-xl bg-red-600 hover:bg-yellow-400 hover:text-black text-white cursor-pointer' onClick={goToMenu}>Menu</div>

               <div className='mx-1 border-2 border-black px-2 rounded-xl bg-red-600 hover:bg-yellow-400 hover:text-black text-white cursor-pointer relative' onClick={goToOrders}>
                 Orders
                 {newOrderCount > 0 && (
                   <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black bg-yellow-400 rounded-full">
                     {newOrderCount}
                   </span>
                 )}
               </div>

               <div className='mx-1 border-2 border-black px-2 rounded-xl bg-red-600 hover:bg-yellow-400 hover:text-black text-white cursor-pointer' onClick={handleOpenProfile}>Profile</div>

               <div className='mx-1 border-2 border-black px-2 rounded-xl bg-red-600 hover:bg-yellow-400 hover:text-black text-white cursor-pointer' onClick={goToAbout}>About us</div>

               <div className='mx-1 border-2 border-black px-2 rounded-xl bg-red-600 hover:bg-yellow-400 hover:text-black text-white cursor-pointer' onClick={goToContact}>Contact us</div>       
          {isProfileOpen && <Profile onClose={handleCloseProfile} />}
        </div>
        <div className="flex w-full h-screen">
          <div className="flex-grow mx-4">
            <DashboardStats sellerId={sellerId}/>
            <CustomerReview sellerId={sellerId}/>
          </div>
          <Sidebar sellerId={sellerId} />
        </div>
    </div>
  )
}

export default Dashboard;