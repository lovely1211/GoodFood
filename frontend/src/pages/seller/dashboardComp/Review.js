import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Review = ({ sellerId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/seller/status/today', {
          params: { sellerId }
        });
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error.message);
      }
    };
  
    fetchReviews();
  }, [sellerId]);

  const timeAgo = (date) => {
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);
    const interval = Math.floor(seconds / 60);
  
    if (interval < 1) return "Just now";
    if (interval < 60) return `${interval} mins ago`;
    if (interval < 1440) return `${Math.floor(interval / 60)} hours ago`;
    return `${Math.floor(interval / 1440)} days ago`;
  };  

  return (
    <div className="bg-white p-4 shadow-md rounded-lg mt-6">
      <h3 className="text-xl font-semibold mb-4">Today's Reviews</h3>
      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <div key={index} className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold">{review.buyer.name}</h4>
              <p className="text-gray-700">{review.comment}</p>
              {review.images && review.images.length > 0 && (
                <div className="mt-2">
                  {review.images.map((image, idx) => (
                    <img
                      key={idx}
                      src={`http://localhost:5000/${image}`}
                      alt={`feedback-image-${idx}`}
                      className="w-20 h-20 object-cover rounded-md mr-2"
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="text-gray-500 text-sm self-end">
              {timeAgo(review.createdAt)}
            </p>
          </div>
        ))
      ) : (
        <p>No reviews for today</p>
      )}
    </div>
  );
};

export default Review;
