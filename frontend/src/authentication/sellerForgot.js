import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';

const ForgotPassword = ({onClose}) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/sellerAuth/forgot-password', { email });
      setMessage('Password reset link sent to your email');
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
    }
    setLoading(false);
  };

  return (
    <div className='flex flex-col justify-center items-center z-50 fixed inset-0 bg-gray-800 bg-opacity-50'>
      <div className='bg-white rounded-lg w-1/4 p-4 relative'>
      <button onClick={onClose} className="absolute top-3 right-3 text-2xl font-bold px-1 border-2 border-black rounded-md">
            &times; 
      </button>
      <h2 className='text-3xl mb-4'>Forgot Password</h2>
      <form onSubmit={handleForgotPassword} className='flex flex-col'>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder='Enter your email'
          className='mb-4 p-2 rounded-lg bg-slate-300'
        />
        <button type='submit' disabled={loading} className='bg-yellow-400 hover:bg-yellow-600 font-bold p-2 rounded-lg'>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {message && <p>{message}</p>}
     </div>
    </div>
  );
};

export default ForgotPassword;
