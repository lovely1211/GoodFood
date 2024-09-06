// authentication/buyerAuth.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Good Food.png';
import { useUser } from '../context/userContext';
import ForgotPassword from './buyerForgot';
import axiosInstance from '../axiosInstance';

const ForgotPasswordPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="absolute inset-0 bg-gray-500 opacity-50" onClick={onClose}></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg z-10">
        <ForgotPassword />
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

const Auth = () => {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [verificationStep, setVerificationStep] = useState(false);
  const [code, setCode] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isForgotPasswordPopupOpen, setIsForgotPasswordPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser(); 
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  useEffect(() => { 
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userInfo');
    const checkToken = async () => {
      if (token && storedUser) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          const { data } = await axiosInstance.get('/buyerAuth/profile', config,  {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(data.user);
          navigate('/');
        } catch (error) {
          console.error('Token verification error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
        }
      }
    };
    checkToken();
  }, [navigate, setUser]);

  const displayMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]); 
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    if (!name || !email || !contactNumber || !address || !password || !confirmPassword) {
      alert("Please fill all the fields");
      setLoading(false);
      return;
    }
  
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('contactNumber', contactNumber);
      formData.append('address', JSON.stringify(address)); 
      formData.append('password', password);
      formData.append('profilePicture', profilePicture); 
  
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
  
      const { data } = await axiosInstance.post("/buyerAuth/register", formData, config);
  
      if (data && data.user && data.user._id) {
        setUserId(data.user._id);
        setVerificationStep(true); // Show the verification input
      } else {
        alert("Registration failed. Please try again.");
      }
  
      setLoading(false);
  
    } catch (error) {
      alert(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };
  
  const handleVerifyCode = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const verificationResponse = await axiosInstance.post("/buyerAuth/verify-email", {
        userId,
        code
      });

      if (verificationResponse.data.message) {
        alert(verificationResponse.data.message);
        localStorage.setItem("userInfo", JSON.stringify(verificationResponse.data.user));
        navigate("/");
      } else {
        alert("Verification failed. Please check the code and try again.");
      }

      setLoading(false);
    } catch (error) {
      alert(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!email || !password) {
        displayMessage("Please fill all the fields", 'warning');
        setLoading(false);
        return;
    }

    try {
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };

        const normalizedEmail = email.toLowerCase(); 

        const { data } = await axiosInstance.post("/buyerAuth/login", { email: normalizedEmail, password }, config);      

        alert('Login successful!');

        const userInfo = {
            ...data.user,
            role: "buyer",
        };

        setUser(userInfo); 

        localStorage.setItem("userInfo", JSON.stringify(userInfo)); 
        localStorage.setItem("token", data.token); 
        // After successful login
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', 'buyer');

        setLoading(false);
        navigate("/");

    } catch (error) {
        console.error('Login error:', error.response?.data?.message || error.message);
        displayMessage(error.response?.data?.message || error.message, 'error');
        setLoading(false);
    }
  };

  const toggleAuthPage = () => {
    setIsLoginPage(!isLoginPage);
    setMessage('');
    setMessageType('');
  };

  const handleOpenForgotPassword = () => {
    setIsForgotPasswordOpen(true);
  };

  const handleCloseForgotPassword = () => {
    setIsForgotPasswordOpen(false);
  };

  return (
    <>
    {isForgotPasswordPopupOpen && (
      <ForgotPasswordPopup onClose={() => setIsForgotPasswordPopupOpen(false)} />
    )}
    <div className='flex mb-10 flex-col justify-center items-center'>
      <div className='bg-slate-400 w-[500px] rounded-b-lg mb-16 py-4 text-center justify-center items-center shadow-lg'>
        <div className='text-3xl mt-2 font-bold'>Welcome {isLoginPage && 'Back'}</div>
        <div className='text-lg font-bold mb-4'>{isLoginPage ? 'Login now to get explored' : 'Register now to get started'}</div>
        {!verificationStep ? (
          <form onSubmit={!isLoginPage ? handleRegister : handleLogin} className='flex flex-col'>
              <>
              {!isLoginPage && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder='Enter your name'
                  className='mb-4 p-2 mx-4 rounded-lg'
                />
              )}

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder='Enter your email'
                  className='mb-4 p-2 mx-4 rounded-lg'
                />
                {!isLoginPage && (
                <input
                  type="text"
                  name="contactNumber"
                  value={contactNumber}
                  placeholder='Enter your contact number'
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="mb-4 mx-4 p-2 rounded-lg "
                  required
                />
                )}

                {!isLoginPage && (
                  <input
                    type="text"
                    name='street'
                    value={address.street}
                    onChange={handleAddressChange}
                    required
                    placeholder='Street'
                    className='mb-4 mx-4 p-2 rounded-lg '
                  />
                )}
                {!isLoginPage && (
                  <input
                    type="text"
                    name='city'
                    value={address.city}
                    onChange={handleAddressChange}
                    required
                    placeholder='City'
                    className='mb-4 mx-4 p-2 rounded-lg '
                  />
                )}
                {!isLoginPage && (
                  <input
                    type="text"
                    name='state'
                    value={address.state}
                    onChange={handleAddressChange}
                    required
                    placeholder='State'
                    className='mb-4 mx-4 p-2 rounded-lg '
                  />
                )}
                {!isLoginPage && (
                  <input
                    type="text"
                    name='zip'
                    value={address.zip}
                    onChange={handleAddressChange}
                    required
                    placeholder='Zip Code'
                    className='mb-4 p-2 rounded-lg mx-4'
                  />
                )}
                {!isLoginPage && (
                  <input
                    type="text"
                    name='country'
                    value={address.country}
                    onChange={handleAddressChange}
                    required
                    placeholder='Country'
                    className='mb-4 p-2 rounded-lg mx-4'
                  />
                )}
                <div className="relative mb-4 mx-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder='Enter your password'
                    className='shadow-lg p-2 rounded-lg w-full'
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 p-1 rounded'>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                  {!isLoginPage && (
                 <div className="relative mb-4 mx-4">
                   <input
                     type={showConfirmPassword ? "text" : "password"}
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     required
                     placeholder="Confirm password"
                     className="p-2 rounded-lg shadow-lg w-full"
                   />
                   <button
                     type="button"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 p-1 rounded"
                   >
                     {showConfirmPassword ? "Hide" : "Show"}
                   </button>
                 </div>
                  )}

                {!isLoginPage && (
                  <input
                    type="file"
                    name="profilePicture"
                    onChange={handleFileChange}
                    placeholder='Upload profile picture'
                    className="mb-2 p-2 rounded-lg bg-white mx-4"
                 />
                )}
                <button type="submit" className='mb-2 mx-4 bg-yellow-400 text-slate-900 rounded-lg shadow-lg py-2 hover:bg-yellow-500 
                text-2xl font-bold'>
                 {!isLoginPage ? 'Register now' : 'Login'}
                </button>
                <div className='text-blue-800 cursor-pointer text-left ml-5 mb-2' onClick={handleOpenForgotPassword} >Forgot password?</div>
                <button
                  type="button"
                  className='bg-red-600 font-bold mb-4 rounded-lg cursor-pointer text-white text-2xl hover:bg-red-700 mx-4 py-2'
                 onClick={() => {
                    setEmail("lovely1211zmn@gmail.com");
                    setPassword("12345678");
                  }}
                >
                  Continue as Guest
                </button>
              </>
          </form>
        ) : (
            <form onSubmit={handleVerifyCode}>
              <p>Please check your email and enter 6 digits code</p>
              <input
                type="text"
                placeholder="Enter Verification Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className='w-1/2 mx-2 p-2 rounded-lg my-3'
                required
              />
              <button type="submit" disabled={loading} className='bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg shadow-lg p-2 font-bold '>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
        )}

        {isForgotPasswordOpen && <ForgotPassword onClose={handleCloseForgotPassword} />}
        {message && <p className={`text-${messageType === 'success' ? 'green' : 'red'}-600 mb-2`}>{message}</p>}
        <div>
          {isLoginPage ? `Don't have an account? ` : `Already have an account? `}
          <span className='text-blue-800 cursor-pointer underline' onClick={toggleAuthPage}>
            {!isLoginPage ? 'Login' : 'Register now'}
          </span>
        </div>
        
        {isLoginPage && (
          <div>
            <img src={Logo} alt='logo' className='w-24 rounded-full mx-48 mt-4'/>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Auth;
