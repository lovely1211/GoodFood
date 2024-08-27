import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ItemDetails = ({ item, onClose }) => {
  const [categories, setCategories] = useState({});
  const [showCategories, setShowCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!item) return null;

  const { name, price, image, description, link, sellerId } = item;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: description,
          url: link,
        });
        console.log('Menu item shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard');
    }
  };

  const handleShowCategories = async (sellerId) => {
    if (showCategories[sellerId]) {
      setShowCategories(prev => ({
        ...prev,
        [sellerId]: !prev[sellerId],
      }));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:5000/api/menu/${sellerId}/category-counts`);

      if (response.status === 200) {
        setCategories(prevCategories => ({
          ...prevCategories,
          [sellerId]: response.data,
        }));
        setShowCategories(prev => ({
          ...prev,
          [sellerId]: true,
        }));
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to fetch categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    onClose(); // Close the item details popup
    navigate(`/?category=${category}`); // Navigate to menu page with selected category
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
      <div className="relative bg-white p-2 rounded-lg shadow-lg w-1/3">
        <button onClick={onClose} className="absolute top-3 right-3 text-2xl font-bold px-1 border-2 border-black rounded-md">
          &times;
        </button>
        <div className="text-red-600 text-3xl font-bold text-center">
          Item Details
        </div>
        <div className="m-2 p-1">
          <img
            src={`http://localhost:5000/uploads/${image}`}
            alt={name}
            className="w-full h-56 object-cover rounded-md"
          />
          {sellerId?.name && <p className='text-center text-gray-600'><strong>{sellerId.name}</strong></p>}
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Price:</strong> ₹ {price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          <p><strong>Description:</strong> {description}</p>
          <p><strong>Category:</strong> {item.category}</p>
          <div className="flex justify-evenly mt-4">
            <div className="">
              <button 
                onClick={() => handleShowCategories(sellerId._id)} 
                className="bg-yellow-400 hover:bg-yellow-600 font-semibold px-4 py-1 rounded"
              >
                {loading ? 'Loading...' : showCategories[sellerId._id] ? 'Hide' : 'Menu'}
              </button>
              {showCategories[sellerId._id] && categories[sellerId._id] && (
                <div className="absolute bottom-16 left-5 w-1/2 bg-black text-white font-medium p-4 rounded-lg">
                  Menu Categories
                  {categories[sellerId._id].map((category, index) => (
                    <div 
                      key={index} 
                      className="p-1 font-normal cursor-pointer"
                      onClick={() => handleCategoryClick(category.category)} 
                    >
                      {category.category} ({category.count})
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleShare} className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-1 rounded">
              Share
            </button>
            <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
