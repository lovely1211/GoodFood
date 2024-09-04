import React, { useState, useEffect } from 'react';
import axios from 'axios';
import View from '../../../assets/view icon.png';
import Review from '../../../assets/review.png';
import Feedback from '../../../assets/feedback.png';

const Sidebar = ({ sellerId }) => {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalRatings: 0,
    totalComments: 0,
    mostOrderedItems: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerStats = async () => {
      try {
        const viewsResponse = await axios.get('http://localhost:5000/api/seller/status/views', {
          params: { sellerId }
        });

        const feedbackResponse = await axios.get(`http://localhost:5000/api/seller/status/seller/${sellerId}`);
        const itemsResponse = await axios.get(`http://localhost:5000/api/seller/status/most-ordered-items/${sellerId}`);

        setStats({
          totalViews: viewsResponse.data.totalViews || 0,
          totalRatings: feedbackResponse.data.totalRatings || 0,
          totalComments: feedbackResponse.data.totalComments || 0,
          mostOrderedItems: itemsResponse.data || []
        });
      } catch (error) {
        console.error('Error fetching seller stats:', error);
        setError('Failed to load statistics. Please try again later.');
      }
    };

    if (sellerId) {
      fetchSellerStats();
    }
  }, [sellerId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const status = [
    { title: 'Total Views', count: stats.totalViews, icon: View },
    { title: 'Total Reviews', count: stats.totalRatings, icon: Review },
    { title: 'Total Feedbacks', count: stats.totalComments, icon: Feedback },
  ];

  return (
    <div className="rounded-lg mt-6 w-96 flex flex-col justify-start items-center bg-gray-300 p-4 overflow-y-auto">
      {status.map((stat, index) => (
        <div key={index} className="w-full p-6 bg-white shadow-md rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{stat.title}</h3>
              <p className="text-2xl">{stat.count}</p>
            </div>
            <img src={stat.icon} alt="icon" className="w-12 h-12"/>
          </div>
        </div>
      ))}

      <h3 className="text-xl font-semibold mb-4">Most Popular Items</h3>
      {stats.mostOrderedItems.map((item, index) => (
        <div key={index} className="w-full p-6 bg-white shadow-md rounded-lg mb-4">
          <div className="text-gray-900 font-medium text-lg">{item.name}</div>
          <div className="text-gray-600">Ordered {item.orderCount} times</div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
