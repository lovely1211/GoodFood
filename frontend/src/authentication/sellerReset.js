import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await axios.put('http://localhost:5000/api/sellerAuth/reset-password', { token, password });
      setMessage('Password has been reset successfully');
      navigate('/login');
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
    }
    setLoading(false);
  };

  return (
    <div className='flex flex-col justify-center items-center'>
      <h2 className='text-3xl mb-4'>Reset Password</h2>
      <form onSubmit={handleResetPassword} className='flex flex-col'>
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder='Enter your new password'
          className='mb-4 p-2 rounded-lg'
        />
        <input
          type='password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder='Confirm your new password'
          className='mb-4 p-2 rounded-lg'
        />
        <button type='submit' disabled={loading} className='bg-yellow-400 p-2 rounded-lg'>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
