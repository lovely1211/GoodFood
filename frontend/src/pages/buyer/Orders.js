import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../context/userContext';
import BackBtn from './menuComp/backBtn';
import Feedback from './Feedback';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryTimers, setDeliveryTimers] = useState({});
  const { user } = useUser();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const buyerId = JSON.parse(localStorage.getItem('userInfo'))._id;
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/buyer/${buyerId}`);
        response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(response.data);
      } catch (error) {
        setErrorMessage('Error fetching orders: ' + error.message);
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, [user]);

  const handleFeedbackSubmitted = (orderId) => {
    alert('Feedback submitted successfully!');
    localStorage.setItem(`feedbackSubmitted_${orderId}`, 'true');
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId ? { ...order, feedbackSubmitted: true } : order
      )
    );
  };

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

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/cancel/${orderId}`);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: 'Canceled' } : order
        )
      );
    } catch (error) {
      setErrorMessage('Error canceling order: ' + (error.response?.data?.message || error.message));
      console.error('Error canceling order:', error.response?.data || error.message);
    }
  };

  const handleReorder = async (order) => {
    try {
      const reorderData = {
        orderId: order._id, // Add the original order ID
        items: order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        total: order.total,
        buyerId: user._id, // This should be correct since it's coming from the context
        sellerId: order.sellerId
      };
  
      await axios.post('http://localhost:5000/api/orders/reorder', reorderData);
      alert('Order placed successfully!');
    } catch (error) {
      setErrorMessage('Error reordering: ' + error.message);
      console.error('Error reordering:', error);
    }
  };  

  return (
    <div>
      <div className="flex flex-col justify-center">
        <div className='font-bold text-3xl my-6 text-center'>Your Orders</div>
        <BackBtn />
        {errorMessage && <p className="text-black text-center">{errorMessage}</p>}
        <div className='grid grid-cols-3 gap-3 p-4 mr-4'>
          {orders.map((order) => {
            const orderTime = new Date(order.createdAt).getTime();
            const currentTime = new Date().getTime();
            const canCancel = (currentTime - orderTime) <= 60000;

            return (
              <div key={order._id} className="font-medium m-4 p-4 rounded-lg bg-white w-full h-80 flex flex-col justify-between">
               <div>
                 <div className={`badge ${order.status === 'Pending' ? 'bg-yellow-500' : order.status === 'Delivered' ? 'bg-green-500'              : order.status === 'Received' ? 'bg-blue-500' : 'bg-red-500'} text-center p-2`}>
                   Status: {order.status}
                 </div>
                 <div className='font-bold text-xl text-center m-2'>Your Items</div>
                 <ul>
                   {order.items.map((item, index) => (
                     <li key={`${item.productId}-${index}`}>
                       <span>{item.name ?? 'Unknown Item'}</span> - {item.quantity} x {item.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ₹
                     </li>
                   ))}
                 </ul>
                 <div className='mt-1 text-lg font-bold'>Total: {order.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ₹</div>
               </div>

               {order.status === 'Received' && (
                 <>
                   <div>Order created at: {new Date(order.createdAt).toLocaleString()}</div>
                   {deliveryTimers[order._id] !== undefined && deliveryTimers[order._id] > 0 && (
                     <div>
                       Delivery Time: {deliveryTimers[order._id]} minutes remaining
                     </div>
                   )}
                 </>
                )}

               {order.status === 'Delivered' && (
                 <>
                   <div className='text-sm mt-1'>Order created at: {new Date(order.createdAt).toLocaleString()}</div>
                   <div className="text-red-600 mb-2 text-sm">Order has been delivered at: {new Date(order.deliveredAt).toLocaleString ()}</div>
                   <Feedback orderId={order._id} buyerId={user._id} sellerId={order.sellerId} onFeedbackSubmitted={() => handleFeedbackSubmitted(order._id)} />
                   <button
                     className='font-semibold text-xl border-2 border-black rounded-lg p-1 w-full bg-blue-600 hover:bg-blue-800 text-white mt-2'
                     onClick={() => handleReorder(order)}
                   >
                     Reorder
                   </button>
                 </>
               )}

               {canCancel && order.status !== 'Canceled' && (
                 <button
                   className='font-semibold text-xl border-2 border-black rounded-lg p-1 w-full bg-red-600 hover:bg-red-800 text-white'
                   onClick={() => handleCancelOrder(order._id)}
                 >
                   Cancel Order
                 </button>
               )}
             </div>

            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
