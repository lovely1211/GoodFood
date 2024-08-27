// liked item file
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router for navigation
import BackBtn from './menuComp/backBtn';
import axios from 'axios';
import { FaHeart } from 'react-icons/fa'; // Import the heart icon

const LikedItems = () => {
  const [likedItems, setLikedItems] = useState([]);
  const navigate = useNavigate(); // Use React Router's navigate function

  const buyerId = JSON.parse(localStorage.getItem('userInfo'))._id;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLikedItems = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/menu/likedItems/${buyerId}`);
        response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const likedItemsFromBackend = response.data.map(item => item.productId);
        setLikedItems(likedItemsFromBackend);
      } catch (error) {
        console.error('Error fetching liked items:', error);
      }
    };
  
    fetchLikedItems();
  }, [buyerId]);

  const deleteLikedItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/menu/${buyerId}/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update the likedItems state by filtering out the deleted item
      setLikedItems(prevLikedItems => prevLikedItems.filter(item => item._id !== productId));
    } catch (error) {
      console.error('There was an error deleting the liked item!', error);
    }
  };

  // Function to handle navigation to the buyer menu page and scroll to the item
  const handleNavigateToItem = (productId) => {
    navigate(`/?productId=${productId}`); // Passing productId as state
  };

  return (
    <div>
      <h2 className="text-2xl font-bold my-4 text-center">Liked Items</h2>
      <BackBtn />
      <div className="grid grid-cols-3 gap-4 mt-2 p-4">
        {likedItems.map((product, index) => (
          <div key={product._id || index} className="bg-white rounded-md p-3 mx-1 overflow-hidden relative">
            <img
              src={`http://localhost:5000/uploads/${product.image}`}
              alt={product.name}
              className="rounded-md w-full h-64 object-cover"
            />
            <FaHeart
              className="text-red-600 hover:bg-white text-2xl cursor-pointer absolute top-4 right-4"
              onClick={() => deleteLikedItem(product._id)}
            />
            <div className='flex flex-row items-center justify-evenly'>
              <div className="text-lg font-bold text-center">{product.name}</div>
              <div className="text-lg font-bold text-center">₹ {product.price}</div>
            </div>
            <div className="text-center mt-2">
              <button
                onClick={() => handleNavigateToItem(product._id)}
                className="border-2 border-black rounded-xl hover:bg-gray-800 bg-slate-900 text-white font-bold p-2 w-full text-xl"
              >
                Go to Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedItems;
