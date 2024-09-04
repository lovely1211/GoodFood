import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SellerRating = ({ sellerId }) => {
    const [rating, setRating] = useState(null);

    useEffect(() => {
        const fetchSellerRating = async () => {
            try {
                const response = await axios.get(`/api/seller/${sellerId}/overall-rating`);
                setRating(response.data.overallRating);
            } catch (error) {
                console.error('Error fetching seller rating:', error);
            }
        };

        fetchSellerRating();
    }, [sellerId]);

    return (
        <div>
            <h4>Seller Rating: {rating ? rating : 'No ratings yet'}</h4>
        </div>
    );
};

export default SellerRating;
