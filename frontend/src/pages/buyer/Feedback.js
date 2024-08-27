import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const Feedback = ({ orderId, buyerId, onFeedbackSubmitted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const feedbackStatus = localStorage.getItem(`feedbackSubmitted_${orderId}`);
    if (feedbackStatus) {
      setFeedbackSubmitted(true);
    }
  }, [orderId]);

  const handleImageChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('buyerId', buyerId);
    formData.append('orderId', orderId);
    formData.append('rating', rating);
    formData.append('comment', comment);
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      await axios.post('http://localhost:5000/api/feedback/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFeedbackSubmitted(true);
      localStorage.setItem(`feedbackSubmitted_${orderId}`, 'true');
      setIsOpen(false);
      onFeedbackSubmitted();
    } catch (error) {
      setErrorMessage('Error submitting feedback: ' + error.message);
    }
  };

  return (
    <div>
      {!feedbackSubmitted ? (
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-blue-500 text-white p-2 rounded-md w-full"
          >
            Please Give Us Feedback
          </button>

          {isOpen && (
            <form onSubmit={handleSubmit} className="absolute p-4 bg-gray-200 rounded-md shadow-md flex flex-col w-1/4">
              {errorMessage && <p className="text-red-600">{errorMessage}</p>}

              <div className="flex items-center">
                <span className="mr-2">Rating:</span>
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    size={24}
                    color={i < rating ? "#ffc107" : "#cfc5c2"}
                    onClick={() => setRating(i + 1)}
                    className="cursor-pointer"
                  />
                ))}
              </div>

              <label>
                Comment:
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="p-2 border rounded-md w-full"
                  placeholder="Write your comment here..."
                />
              </label>

              <label>
                Upload Images:
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>

              <button type="submit" className="mt-2 hover:bg-green-700 bg-green-500 text-white p-2 rounded-md">
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      ) : (
        <p className="text-green-600 font-bold">
          Thank you for your valuable feedback!
        </p>
      )}
    </div>
  );
};

export default Feedback;
