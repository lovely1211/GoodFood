// pages/seller/Profile.js

import React, { useEffect, useState } from 'react';
import Logout from '../../components/logout';
const defaultProfilePicture = '../../assets/default.png';

const Profile = ({ onClose }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>; 
  }

  const profilePictureUrl = user.profilePicture ? `https://your-backend-url.onrender.com/${user.profilePicture}` : defaultProfilePicture;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
        <div className="relative bg-white p-4 rounded-lg shadow-lg w-1/3">
          <button onClick={onClose} className="absolute top-3 right-3 text-2xl font-bold px-1 border-2 border-black rounded-md">
            &times; 
          </button>
          <div className="text-red-600 text-4xl font-bold text-center m-2">
            User Profile
          </div>
          <div className="w-full flex justify-center mt-2">
            <img
              src={profilePictureUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full border-2 border-black object-cover"
            />
          </div>
          <div className="m-4 p-2">
            <p><strong>Shop Name: </strong> {user.name}</p>
            <p><strong>Email: </strong> {user.email}</p>
            <Logout />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
