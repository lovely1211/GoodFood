// authentication/Auth.js

import React, { useState } from 'react';
import BuyerAuth from './buyerAuth'; 
import SellerAuth from './sellerAuth'; 

const MainAuth = () => {
  const [isBuyerAuth, setIsBuyerAuth] = useState(true);

  const toggleAuthType = () => {
    setIsBuyerAuth(!isBuyerAuth);
  };

  return (
    <div className="auth-container">
      <div className="flex justify-center mt-8">
        <button
          className={`w-[250px] px-4 py-2 text-2xl font-medium rounded-tl-lg ${isBuyerAuth ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-300 hover:bg-gray-400'}`}
          onClick={toggleAuthType}
        >
          Buyer
        </button>
        <button
          className={`w-[250px] px-4 py-2 text-2xl font-medium rounded-tr-lg ${!isBuyerAuth ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-300 hover:bg-gray-400'}`}
          onClick={toggleAuthType}
        >
          Seller
        </button>
      </div>
      <div className="auth-form">
        {isBuyerAuth ? <BuyerAuth /> : <SellerAuth />}
      </div>
    </div>
  );
};

export default MainAuth;

