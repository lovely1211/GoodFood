import React, { useState } from 'react';
import BackBtn from './backBtn';
import axiosInstance from '../../axiosInstance';

const Contact = () => {
  const [formData, setFormData] = useState({
    queryType: '',
    name: '',
    email: '',
    message: '',
    isMember: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/service/sendQuery', formData);
      alert('Your query has been sent successfully!');
      setFormData({
        queryType: '',
        name: '',
        email: '',
        message: '',
        isMember: ''
      });
    } catch (error) {
      alert('Failed to send your query. Please try again.');
      console.error('Error sending query:', error);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <BackBtn/>
      <div className='flex flex-col justify-center items-center border-2 rounded-2xl border-black bg-gray-400 w-1/2 p-3 m-4'>
        <div className='text-red-600 text-3xl font-bold text-center m-2'>Contact Us</div>
        <form onSubmit={handleSubmit}>
          <div className="m-2 p-2 text-center">
            <select
              name="queryType"
              id="query"
              value={formData.queryType}
              onChange={handleChange}
              className='border-2 border-black p-2 w-96 rounded-lg text-gray-600'
            >
              <option value="">Type of Query</option>
              <option value="Order related Issues">Order related Issues</option>
              <option value="Site related Issues">Site related Issues</option>
              <option value="Complaint related Issues">Complaint related Issues</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="m-1 p-2 text-center">
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your Name"
              value={formData.name}
              onChange={handleChange}
              className='p-2 w-96 rounded-lg border-2 border-black'
            />
          </div>

          <div className="m-1 p-2 text-center">
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className='p-2 w-96 rounded-lg border-2 border-black'
            />
          </div>

          <div className="m-2 p-2 text-center">
            <textarea
              name="message"
              id="message"
              value={formData.message}
              onChange={handleChange}
              className='p-2 w-96 rounded-lg border-2 border-black'
              cols="30"
              rows="10"
              placeholder='Elaborate your query...'
            />
          </div>

          <div id="radio" className='m-2 text-center'>
            Are you a member of GoodFood:
            Yes <input type="radio" name="isMember" value="Yes" onChange={handleChange}/>
            No <input type="radio" name="isMember" value="No" onChange={handleChange}/>
          </div>

          <div id="btn" className='m-2 text-center'>
            <input
              type="submit"
              value="Submit"
              className='h-10 w-2/3 border-2 border-black bg-yellow-400 hover:bg-yellow-500 font-medium text-xl rounded-lg mx-1'
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
