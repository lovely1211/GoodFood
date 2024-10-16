import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Good Food.png';
import { useUser } from '../context/userContext';
import ForgotPassword from './sellerForgot';
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null); 
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isForgotPasswordPopupOpen, setIsForgotPasswordPopupOpen] = useState(false);
  const { setUser } = useUser(); 


  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userInfo');
  
    const checkToken = async () => {
      if (token && storedUser) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
  
          const { data } = await axiosInstance.get('/sellerAuth/profile', config);
          setUser(data.user); 
          // Don't redirect to /auth again if token is valid
        } catch (error) {
          console.error('Token verification error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          navigate('/auth');
        }
      } else {
        navigate('/auth');
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

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]); 
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      displayMessage("Please fill all the fields", 'warning');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      displayMessage("Passwords do not match", 'warning');
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return displayMessage("Invalid email address", 'warning');
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('profilePicture', profilePicture); 

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await axiosInstance.post("/sellerAuth/register", formData, config);

      // alert("Registration successful");
      
      localStorage.setItem("userInfo", JSON.stringify(data.user)); 
      // setLoading(false);
      navigate("/");
    } catch (error) {
      displayMessage(error.response?.data?.message || error.message, 'error');
      // setLoading(false);
    }finally {
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

      const { data } = await axiosInstance.post("/sellerAuth/login", {
        email: email.toLowerCase(),
        password,
      }, config);
      const userInfo = {
         ...data.user,
          role: 'seller',
      }; 
      
      localStorage.setItem("userInfo", JSON.stringify(userInfo)); 
      localStorage.setItem("token", data.token); 
      
      setUser(userInfo);
      alert("Login successful")

      // After successful login
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('role', 'seller');
      setLoading(false);
      navigate("/");
      
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      displayMessage(error.response?.data?.message || error.message, 'error');
    } finally {
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
    <div className='flex flex-col justify-center items-center mb-10'>
      <div className='bg-slate-400 w-[500px] rounded-b-lg mb-16 py-4 text-center justify-center items-center shadow-lg'>
        <div className='text-3xl mt-5 font-bold'>Welcome {isLoginPage && 'Back'}</div>
        <div className='text-lg font-bold mb-8'>{isLoginPage ? 'Login now to get explored' : 'Register now to get started'}</div>
        <form onSubmit={isLoginPage ? handleLogin : handleRegister} className='flex flex-col'>
          {!isLoginPage && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder='Enter your shop name'
              className='mb-4 p-2 mx-4 rounded-lg shadow-lg'
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder='Enter your email'
            className='mb-4 p-2 mx-4 rounded-lg shadow-lg'
          />

          <div className='relative mb-4 mx-4'>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder='Enter your password'
              className='p-2 rounded-lg shadow-lg w-full'
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 p-1 rounded'>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {!isLoginPage && (
            <div className='relative mb-8 mx-4'>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder='Confirm password'
                className='p-2 rounded-lg shadow-lg w-full'
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 p-1 rounded'
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
              placeholder='Upload your shop picture'
              className="mb-4 p-2 mx-4 rounded-lg shadow-lg bg-white"
            />
          )}
          <button type="submit" className='mb-2 mx-4 bg-yellow-400 text-slate-900 rounded-lg shadow-lg py-2 text-2xl font-bold' disabled={loading}>
            {loading ? "Loading..." : (isLoginPage ? 'Login' : 'Register now')}
          </button>
          <div className='text-blue-800 cursor-pointer text-left ml-5 mb-2' onClick={handleOpenForgotPassword}>Forgot password?</div>
          {isLoginPage && (
          <button
            type="button"
            className='bg-red-600 font-bold mb-4 rounded-lg cursor-pointer text-white text-2xl hover:bg-red-700 mx-4 py-2'
           onClick={() => {
              setEmail("email@gmail.com");
              setPassword("098765");
            }}
          >
            Continue as Guest
          </button>
          )}
        </form>
        {isForgotPasswordOpen && <ForgotPassword onClose={handleCloseForgotPassword} />}
        {message && <p className={`text-${messageType === 'success' ? 'green' : 'red'}-600 mb-2`}>{message}</p>}
        <div>
          {isLoginPage ? `Don't have an account? ` : `Already have an account? `}
          <span className='text-blue-800 cursor-pointer underline' onClick={toggleAuthPage}>
            {isLoginPage ? 'Register now' : 'Login'}
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
