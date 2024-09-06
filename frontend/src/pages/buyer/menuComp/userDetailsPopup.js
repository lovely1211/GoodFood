import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../axiosInstance';

const UserDetailPopup = ({ onClose, onConfirm }) => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiID, setUpiID] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser) {
      setUser(storedUser);
      setName(storedUser.name);
      setContactNumber(storedUser.contactNumber);
      setEmail(storedUser.email);
      setAddress(formatAddress(storedUser.address));
      setPaymentMethod(storedUser.paymentMethod || '');
      setUpiID(storedUser.upiID || ''); 
    }
  }, []);

  const formatAddress = (address) => {
    if (!address) return 'Address not available';
    const { street, city, state, zip, country } = address;
    const addressParts = [street, city, state, zip, country].filter(part => part); 
    return addressParts.join(', ');
  };

  const validateCardDetails = () => {
    const newErrors = {};
    const cardNumberPattern = /^[0-9]{16}$/;
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvPattern = /^[0-9]{3}$/;

    // Validate card number
    if (!cardNumberPattern.test(cardNumber)) newErrors.cardNumber = 'Invalid card number';

    // Validate expiry date
    if (!expiryPattern.test(expiryDate)) {
        newErrors.expiryDate = 'Invalid expiry date';
    } else {
        // Extract month and year from the expiry date
        const [expiryMonth, expiryYear] = expiryDate.split('/');
        const expiryDateObj = new Date(`20${expiryYear}-${expiryMonth}-01`);
        const currentDate = new Date();

        // Check if the expiry date is in the past
        if (expiryDateObj < currentDate) {
            newErrors.expiryDate = 'Card has expired';
        }
    }

    // Validate CVV
    if (!cvvPattern.test(cvv)) newErrors.cvv = 'Invalid CVV';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUpiID = () => {
    const newErrors = {};
    if (!upiID || !upiID.includes('@')) newErrors.upiID = 'Invalid UPI ID';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (paymentMethod === 'card' && !validateCardDetails()) return;
    if (paymentMethod === 'upi' && !validateUpiID()) return;

    const updatedUser = { 
      name, 
      contactNumber, 
      email, 
      address: parseAddress(address), 
      paymentMethod,
      cardDetails: paymentMethod === 'card' ? { cardNumber, expiryDate, cvv } : null,
      upiID: paymentMethod === 'upi' ? upiID : null
    };

    try {
      const token = localStorage.getItem('authToken');
      const response = await axiosInstance.put(
        `/buyerAuth/${user._id}`, 
        updatedUser,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }
      );
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      onConfirm(response.data);
    } catch (error) {
      console.error('Failed to update user:', error.response ? error.response.data : error.message);
    }
  };

  const parseAddress = (addressStr) => {
    const [street, city, state, zip, country] = addressStr.split(',').map(part => part.trim());
    return { street, city, state, zip, country };
  };

  return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
        <div className="relative bg-white p-4 rounded-lg shadow-lg w-1/3 max-h-screen overflow-auto">
          <button onClick={onClose} className="absolute top-3 right-3 text-2xl font-bold px-1 border-2 border-black rounded-md">
            &times;
          </button>
          <div className="text-red-600 text-3xl font-bold text-center mb-4">
            User Details
          </div>
          <div className="m-2 p-2 overflow-auto">
            <div className="mb-2">
              <label className="block font-bold">Name:</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            </div>
            <div className="mb-2">
              <label className="block font-bold">Phone:</label>
              <input 
                type="text" 
                value={contactNumber} 
                onChange={(e) => setContactNumber(e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            </div>
            <div className="mb-2">
              <label className="block font-bold">Email:</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            </div>
            <div className="mb-2">
              <label className="block font-bold">Address:</label>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            </div>
            <div className="mb-2">
              <label className="block font-bold">Payment Method:</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
                className="w-full p-2 border rounded">
                <option value="">Select Payment Method</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
                <option value="upi">UPI</option>
                <option value="card">Card Payment</option>
              </select>
            </div>
            {paymentMethod === 'card' && (
            <div className="mt-4">
              <div className="mb-2">
                <label className="block font-bold">Card Number:</label>
                <input 
                  type="text" 
                  value={cardNumber} 
                  onChange={(e) => setCardNumber(e.target.value)} 
                  className="w-full p-2 border rounded" 
                />
                {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}
              </div>
              <div className="mb-2">
                <label className="block font-bold">Expiry Date (MM/YY):</label>
                <input 
                  type="text" 
                  value={expiryDate} 
                  onChange={(e) => setExpiryDate(e.target.value)} 
                  className="w-full p-2 border rounded" 
                />
                {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate}</p>}
              </div>
              <div className="mb-2">
                <label className="block font-bold">CVV:</label>
                <input 
                  type="text" 
                  value={cvv} 
                  onChange={(e) => setCvv(e.target.value)} 
                  className="w-full p-2 border rounded" 
                />
                {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
              </div>
            </div>
            )}
            {paymentMethod === 'upi' && (
              <div className="mt-4">
                <div className="mb-2">
                  <label className="block font-bold">UPI ID:</label>
                  <input 
                    type="text" 
                    value={upiID} 
                    onChange={(e) => setUpiID(e.target.value)} 
                    className="w-full p-2 border rounded" 
                  />
                  {errors.upiID && <p className="text-red-500 text-sm">{errors.upiID}</p>}
                </div>
              </div>
            )}
            <div className="flex justify-between mt-4">
              <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">
                Save & Checkout
              </button>
              <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default UserDetailPopup;
