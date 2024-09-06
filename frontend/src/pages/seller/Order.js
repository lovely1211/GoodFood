import React, { useEffect, useState } from 'react';
import BackBtn from './backBtn';
import { useUser } from '../../context/userContext';
import axiosInstance from '../../axiosInstance';

const formatAddress = (address) => {
  if (!address) return 'Address not available';
  const { street, city, state, zip, country } = address;
  const addressParts = [street, city, state, zip, country].filter(part => part);
  return addressParts.join(', ');
};

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryTimers, setDeliveryTimers] = useState({});
  const [extendedOrders, setExtendedOrders] = useState(new Set());
  const [feedbackData, setFeedbackData] = useState({});
  const { user } = useUser();

  useEffect(() => {
    const fetchOrders = async () => {
      const userInfo = localStorage.getItem('userInfo');
      const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

      if (!parsedUserInfo) {
        console.error('User info not found in local storage');
        return;
      }

      const sellerId = parsedUserInfo.id;
      if (!sellerId) {
        console.error('Seller ID is undefined');
        return;
      }

      try {
        const response = await axiosInstance.get(`/orders/seller/${sellerId}`);
        response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [user]);

  useEffect(() => {
    const updateDeliveryTimers = () => {
      const updatedTimers = {};

      orders.forEach(order => {
        const endTime = localStorage.getItem(`deliveryTime_${order._id}`);
        if (endTime && order.status === 'Received') {
          const endTimestamp = new Date(endTime).getTime();
          const currentTime = new Date().getTime();
          const remainingTime = endTimestamp - currentTime;

          if (remainingTime > 0) {
            updatedTimers[order._id] = Math.ceil(remainingTime / 1000 / 60);
          } else {
            updatedTimers[order._id] = 0;
          }
        }
      });

      setDeliveryTimers(updatedTimers);
    };

    updateDeliveryTimers();

    const interval = setInterval(() => {
      updateDeliveryTimers();
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  useEffect(() => {
    const fetchFeedback = async () => {
      for (const order of orders) {
        if (order.status === 'Canceled') {
          console.log(`Order ${order._id} is canceled. No feedback required.`);
          continue; // Skip to the next order
        }
        try {
          const response = await axiosInstance.get(`/feedback/${order._id}`);
          
          if (response.data) {
            setFeedbackData(prevFeedback => ({
              ...prevFeedback,
              [order._id]: response.data
            }));
          } else {
            console.warn(`No feedback found for order ${order._id}`);
          }
        } catch (error) {
          console.error(`Error fetching feedback for order ${order._id}:`, error);
        }
      }
    };
    
    if (orders.length > 0) {
      fetchFeedback();
    }
  }, [orders]);  

  const handleSetDeliveryTime = async (orderId, timeInMinutes) => {
    const deliveryTime = new Date(new Date().getTime() + timeInMinutes * 60000).toISOString();
    try {
      await axiosInstance.patch(`/orders/${orderId}/delivery-time`, {
        deliveryTime,
      });
      localStorage.setItem(`deliveryTime_${orderId}`, deliveryTime); // Save end time in localStorage
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, deliveryTime } : order
      ));
    } catch (error) {
      console.error('Error setting delivery time:', error);
    }
  };

  const handleReceiveOrder = async (orderId) => {
    const receivedTime = new Date().toISOString();

    try {
      await axiosInstance.patch(`/orders/${orderId}`, {
        status: 'Received',
        receivedAt: receivedTime,
      });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'Received', receivedAt: receivedTime } : order
      ));
    } catch (error) {
      console.error('Error marking order as received:', error);
    }
  };

  const handleDeliverOrder = async (orderId) => {
    const deliveredTime = new Date().toISOString();

    try {
      await axiosInstance.patch(`/orders/${orderId}`, {
        status: 'Delivered',
        deliveredAt: deliveredTime,
      });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'Delivered', deliveredAt: deliveredTime } : order
      ));
      setDeliveryTimers(prevTimers => {
        const newTimers = { ...prevTimers };
        localStorage.removeItem(`deliveryTime_${orderId}`); 
        delete newTimers[orderId];
        return newTimers;
      });
    } catch (error) {
      console.error('Error marking order as delivered:', error);
    }
  };

  const handleExtendDeliveryTime = async (orderId, extraMinutes) => {
    const currentDeliveryTime = new Date(orders.find(order => order._id === orderId).deliveryTime);
    const extendedDeliveryTime = new Date(currentDeliveryTime.getTime() + extraMinutes * 60000).toISOString();

    try {
      await axiosInstance.patch(`/orders/${orderId}/delivery-time`, {
        deliveryTime: extendedDeliveryTime,
      });
      localStorage.setItem(`deliveryTime_${orderId}`, extendedDeliveryTime); // Update end time in localStorage
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, deliveryTime: extendedDeliveryTime } : order
      ));
      setExtendedOrders(new Set([...extendedOrders, orderId]));
    } catch (error) {
      console.error('Error extending delivery time:', error);
    }
  };

  return (
    <div className='flex flex-col justify-center'>
      <div className='font-bold text-3xl my-6 text-center'>All Orders</div>
      <BackBtn />
      <div className='grid grid-cols-3 gap-3 p-4 mr-4'>
        {orders.map(order => (
          <div key={order._id} className="font-medium m-4 p-4 rounded-lg bg-white w-full h-96 flex flex-col justify-between">
            <div className={`badge ${order.status === 'Pending' ? 'bg-yellow-500' : order.status === 'Delivered' ? 'bg-green-500' : order.status === 'Received' ? 'bg-blue-500' : 'bg-red-500'} text-center p-2`}>
              Status: {order.status}
            </div>
            <div><strong>Name: </strong>  {order.buyerId ? order.buyerId.name : 'N/A'}</div>
            <div><strong>Contact no: </strong> {order.buyerId ? order.buyerId.contactNumber : 'N/A'}</div>
            <div><strong>Address: </strong> {order.buyerId ? formatAddress(order.buyerId.address) : 'N/A'}</div>
            <div>
              <div className='font-bold text-xl text-center mb-1'>Items detail</div>
              <ul>
                {order.items && order.items.map(item => (
                  <li key={item.productId ? item.productId._id : item._id}>
                    {item.name} - {item.quantity} x {item.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ₹
                  </li>
                ))}
              </ul>
              <div className='font-bold text-center'>Total: {order.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}  ₹</div>
            </div>
            {order.status === 'Pending' && (
              <>
                <select
                  className='mt-2 p-2 border border-gray-300 rounded'
                  onChange={(e) => handleSetDeliveryTime(order._id, e.target.value)} required
                >
                  <option value="">Select delivery time (minutes)</option>
                  {[2, 10, 15, 20, 25, 30, 35, 40].map(i => (
                    <option key={i} value={i}>{i} minutes</option>
                  ))}
                </select>
                <button
                  className='font-semibold text-xl border-2 border-black rounded-lg p-1 w-full bg-blue-600 hover:bg-blue-800 text-white'
                  onClick={() => handleReceiveOrder(order._id)}
                >
                  Mark as Received
                </button>
              </>
            )}
            {order.status === 'Received' && (
              <>
                <div>Order received at: {order.receivedAt ? new Date(order.receivedAt).toLocaleString() : 'N/A'}</div>
                {deliveryTimers[order._id] !== undefined && deliveryTimers[order._id] > 0 && (
                  <div>
                    Estimated Delivery Time: {deliveryTimers[order._id]} minutes remaining
                  </div>
                )}
                {deliveryTimers[order._id] > 0 && !extendedOrders.has(order._id) && (
                  <button
                    className='mt-2 font-semibold text-xl border-2 border-black rounded-lg p-1 w-full bg-yellow-400 hover:bg-yellow-600'
                    onClick={() => handleExtendDeliveryTime(order._id, 5)}
                  >
                    Extend Delivery Time by 5 minutes
                  </button>
                )}
                <button
                  className='mt-2 font-semibold text-xl border-2 border-black rounded-lg p-1 w-full bg-green-600 hover:bg-green-800 text-white'
                  onClick={() => handleDeliverOrder(order._id)}
                >
                  Mark as Delivered
                </button>
              </>
            )}
            {order.status === 'Delivered' && (
              <>
              <div>Order received at: {order.receivedAt ? new Date(order.receivedAt).toLocaleString() : 'N/A'}</div>
              <div>Order delivered at: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'N/A'}</div>
              {feedbackData[order._id] && (
                  <div className="mt-2">
                    <strong>Buyer Rating: </strong>{feedbackData[order._id].rating}/5
                    <div><strong>Comment: </strong>{feedbackData[order._id].comment}</div>
                  </div>
              )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderPage;
