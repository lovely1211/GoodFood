// menu.js file
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Profile from './Profile';
import {useUser} from '../../context/userContext';
import Search from './menuComp/Search';
import UserDetailPopup from './menuComp/userDetailsPopup';
import ItemDetails from './menuComp/itemDetails';
import { FaHeart } from 'react-icons/fa'; 

// ------------images----------
import Appetizers from '../../assets/Appetizers.jpg';
import Beverages from '../../assets/Beverages.jpg';
import Sides from '../../assets/Sides.jpg';
import Desserts from '../../assets/Desserts.avif';
import Entrees from '../../assets/Entrees.jpg';
import bg_img from '../../assets/bg-image.webp';
import prc_img from '../../assets/prices-img.png';
import spc_img from '../../assets/special-img.jpg';
import cart_icon from '../../assets/cart-icon.png';

const ProfilePopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="absolute inset-0 bg-gray-500 opacity-50" onClick={onClose}></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg z-10">
        <Profile />
        <button
          className="absolute top-2 right-2 text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
}; 

const Menu = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [listCards, setListCards] = useState({});
  const [total, setTotal] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProfilePopupOpen, setProfilePopupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [likedItems, setLikedItems] = useState([]);
  const location = useLocation();
  const itemRefs = useRef({}); 

  const { user } = useUser();
  
  const goToAbout = () => navigate('/about');
  const goToContact = () => navigate('/contact');
  const goToOrders = () => navigate('/orders');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const productId = queryParams.get('productId');

    if (productId && itemRefs.current[productId]) {
      itemRefs.current[productId].scrollIntoView({ behavior: 'smooth' });
    }
  }, [location, products]);

  const recordView = async (productId) => {
    try {
      await axios.post('http://localhost:5000/api/seller/status/views', { productId });
    } catch (error) {
      console.error('Error recording view:', error.response ? error.response.data : error.message);
    }
  };

  const handleOpenProfile = () => {
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
    }
  }, [navigate, user]);
  
  useEffect(() => {
    fetchProducts();
    fetchLikedItems();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/menu');
      const productsWithSeller = response.data.map(product => ({
        ...product,
        sellerName: product.sellerId?.name || 'Unknown Seller',
      }));
      setProducts(productsWithSeller);
      setFilteredProducts(productsWithSeller); 
    } catch (error) {
      console.error('Error fetching products:', error); 
    }
  };  

  const fetchLikedItems = async () => {
    const buyerId = JSON.parse(localStorage.getItem('userInfo'))._id;
    try {
      const response = await axios.get(`http://localhost:5000/api/menu/likedItems/${buyerId}`);
      setLikedItems(response.data.map(item => item.productId));
    } catch (error) {
      console.error('Error fetching liked items:', error);
    }
  };

  const handleOpenShopping = () => {
    setIsActive((prevIsActive) => !prevIsActive);
  };

  const handleCloseShopping = () => {
    setIsActive(false);
  };

  const reloadCard = useCallback(() => {
    const cartItems = Object.values(listCards);
    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    setTotal(totalPrice);
    setQuantity(totalQuantity);
  }, [listCards]);

  useEffect(() => {
    reloadCard();
  }, [listCards, reloadCard]);

  const changeQuantity = (key, newQuantity) => {
    if (newQuantity <= 0) {
      const newListCards = { ...listCards };
      delete newListCards[key];
      setListCards(newListCards);
    } else {
      const newListCards = { ...listCards };
      newListCards[key].quantity = newQuantity;
      newListCards[key].totalPrice = newListCards[key].price * newQuantity;
      setListCards(newListCards);
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };
  
  const CheckOut = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const buyerId = userInfo._id;
    const cartItems = Object.values(listCards);
  
    const items = cartItems.map((item) => {
      if (!item.sellerId) {
        console.error('Error: sellerId is missing for item:', item);
        return null;
      }
      return {
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        sellerId: item.sellerId,
      };
    }).filter(item => item !== null); 
  
    const orderData = {
      buyerId,
      items,
      total: calculateTotal(items),
    };
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated. Please log in.');
      }
  
      const response = await axios.post('http://localhost:5000/api/orders/create', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.status === 201) {
        alert('Your order was placed successfully');
        setListCards({});
        setTotal(0);
        setQuantity(0);
      } else {
        console.log('Unexpected response:', response);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized: Please log in again.', error);
      } else if (error.response && error.response.status === 500) {
        console.error('Server error while placing order:', error.response.data);
      } else {
        console.error('Error placing order:', error);
      }
    }
  };  

  const addToCard = (key) => {
    if (listCards[key]) {
      changeQuantity(key, listCards[key].quantity + 1);
    } else {
      const product = products.find(p => p._id === key);
      setListCards((prevListCards) => ({ ...prevListCards, [key]: { ...product, quantity: 1, totalPrice: product.price } }));
    }
  };

  const handleSelectItem = (dish) => {
    const filtered = products.filter(product => product.category === dish.category);
    setFilteredProducts(filtered);
  };

  const handleSelectDish = (category) => {
    const filtered = products.filter(product => product.category === category);
    setFilteredProducts(filtered);
  };
  
  const handleViewItemDetails = (item) => {
    setSelectedItem(item); 
  };

  const handleCloseItemDetails = () => {
    setSelectedItem(null); 
  };

  const handleCheckout = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  const handlePopupConfirm = (updatedUser) => {
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    setIsPopupOpen(false);
    CheckOut();
  };

 const toggleLike = async (productId) => {
  const buyerId = JSON.parse(localStorage.getItem('userInfo'))._id;
  const isLiked = likedItems.includes(productId);

  // Update the state immediately
  setLikedItems((prevLikedItems) => {
    const updatedLikedItems = isLiked
      ? prevLikedItems.filter((id) => id !== productId)
      : [...prevLikedItems, productId];

    localStorage.setItem('likedItems', JSON.stringify(updatedLikedItems));
    return updatedLikedItems;
  });

  try {
    // Send the like/unlike request to the backend
    if (isLiked) {
      // Remove the like
      await axios.delete(`http://localhost:5000/api/menu/likedItems/${buyerId}/${productId}`);
    } else {
      // Add the like
      await axios.post('http://localhost:5000/api/menu/likedItems', {
        buyerId,
        productId,
        action: 'like',
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
  }
 }; 

 const goToLikedItemsPage = () => {
   navigate('/liked-items', { state: { likedItems } });
 };

  return (
    <div>
      {isProfilePopupOpen && (
        <ProfilePopup onClose={() => setProfilePopupOpen(false)} />
      )}
      <div className='sticky top-[55px] z-50 bg-gray-400 flex flex-row justify-between px-4 scroll-smooth'>
        <div className='flex flex-row items-center'>
        <div className='mx-1 border-2 border-black px-2 rounded-xl bg-yellow-400 text-black cursor-pointer'>Home</div>

        <div className='mx-1 border-2 border-black px-2 text-white rounded-xl bg-red-600 hover:bg-yellow-400 hover:text-black cursor-pointer' onClick={goToOrders}>Orders</div>

        <div className='mx-1 px-2 border-2 border-black text-white rounded-xl bg-red-600 hover:bg-yellow-400  hover:text-black cursor-pointer' onClick={handleOpenProfile}>Profile</div>

        <div className='mx-1 border-2 border-black px-2 text-white rounded-xl bg-red-600 hover:bg-yellow-400 hover:text-black cursor-pointer' onClick={goToAbout}>About</div>

        <div className='mx-1 border-2 border-black px-2 text-white rounded-xl bg-red-600 hover:bg-yellow-400 hover:text-black cursor-pointer' onClick={goToContact}>Contact us</div>

        {isProfileOpen && <Profile onClose={handleCloseProfile} />}
        </div>
        
       <div className='flex flex-row mx-10'>
       <div className="relative flex justify-center items-center cursor-pointer mx-10" onClick={goToLikedItemsPage}>
         <FaHeart className="text-red-600 text-4xl" />
       </div>
        <div className="relative flex justify-center items-start cursor-pointer" onClick={handleOpenShopping}>
         <img src={cart_icon} alt="cart" className="w-16" />
         <span className="bg-red-600 rounded-full text-sm text-white absolute px-2 py-1">{quantity}</span>
       </div>
       </div>

      </div>
      
      <div className='relative w-full h-96'>

        <img className='absolute top-0 left-0 w-full h-full object-cover border-2 rounded-b-3xl border-black' src={bg_img} alt='bg' />

        <div className='absolute inset-1 flex flex-col items-center justify-center space-y-4'>

          <div className="text-4xl font-bold text-white">Welcome to GoodFood</div>
          <div className="flex space-x-4">

            <div className='relative w-52 h-48 border-2 border-black rounded-2xl overflow-hidden'>

              <img className="w-full h-full object-cover" alt="img" src={prc_img} />

              <button className='absolute bottom-2 left-1/2 transform -translate-x-1/2 border-2 border-black bg-red-600 text-white h-12 w-36 flex items-center justify-center text-xl font-bold rounded-2xl hover:bg-yellow-400 hover:text-black' >PRICES</button>
            </div>

            <div className='relative w-52 h-48 border-2 border-black rounded-2xl overflow-hidden'>

              <img className="w-full h-full object-cover" alt="img" src={spc_img}/>

              <button className='absolute bottom-2 left-1/2 transform -translate-x-1/2 border-2 border-black bg-red-600 text-white h-12 w-36 flex items-center justify-center text-xl font-bold rounded-2xl hover:bg-yellow-400 hover:text-black'>SPECIALS</button>

            </div>
            
          </div>
          
          <div className="relative w-96">
              <Search onSelectDish={handleSelectItem} />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center">
          <div className="text-3xl font-bold mt-4">Your Menu - All Time Favourite</div>

          <div className='my-5 flex flex-row text-center font-medium'>
            <div className='mx-3' onClick={() => handleSelectDish('Appetizers')}>
              <img src={Appetizers} alt='' className='cursor-pointer object-cover rounded-full border-red-600 border-2 w-24 h-24'/>
              Appetizers
            </div>
            <div className='mx-3' onClick={() => handleSelectDish('Entrees')}>
              <img src={Entrees} alt='' className='cursor-pointer object-cover rounded-full border-red-600 border-2 w-24 h-24'/>
              Entrees
            </div>
            <div className='mx-3' onClick={() => handleSelectDish('Sides')}>
              <img src={Sides} alt='' className='cursor-pointer object-cover rounded-full border-red-600 border-2 w-24 h-24'/>
              Sides
            </div>
            <div className='mx-3' onClick={() => handleSelectDish('Desserts')}>
              <img src={Desserts} alt='' className='cursor-pointer object-cover rounded-full border-red-600 border-2 w-24 h-24'/>
              Desserts
            </div>
            <div className='mx-3' onClick={() => handleSelectDish('Beverages')}>
              <img src={Beverages} alt='' className='cursor-pointer object-cover rounded-full border-red-600 border-2 w-24 h-24'/>
              Beverages
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-2 p-4">
          {filteredProducts.map((product) => (
           <div key={product._id} 
           className="bg-white rounded-md p-3 mx-1 overflow-hidden relative" 
           ref={(el) => (itemRefs.current[product._id] = el)} >
             <img
               src={`http://localhost:5000/uploads/${product.image}`}
               alt={product.name}
               className="rounded-md w-full h-64 object-cover relative"
               onClick={() => recordView(product._id)}
             />
             <FaHeart
               className={`absolute top-4 right-4 text-2xl cursor-pointer heart-icon ${
                 likedItems.includes(product._id) ? 'text-red-600' : 'text-white'
               }`}
               onClick={() => {
                toggleLike(product._id);
              }}
             />

             <div className="">
               <div className='text-sm text-gray-600 text-center font-bold'>{product.sellerName}</div>
               <div className='flex flex-row items-center justify-evenly'>
                 <div className="text-lg font-bold text-center">{product.name}</div>
                 <div className="text-lg font-bold text-center">₹ {product.price}</div>
               </div>
               <button
                 className="border-2 border-black rounded-xl hover:bg-gray-800 bg-slate-900 text-white font-bold p-2 w-1/2 text-xl"
                 onClick={() => {
                   addToCard(product._id);
                   recordView(product._id);
                 }}>
                 Add To Cart
                 {listCards[product._id] ? ` : ${listCards[product._id].quantity}` : null}
               </button>
               <button
                 className="border-2 border-black rounded-xl hover:bg-gray-800 bg-slate-900 text-white font-bold p-2 w-1/2 text-xl"
                 onClick={() => {
                   handleViewItemDetails(product);
                   recordView(product._id);
                 }}>
                 View Details
               </button>
             </div>
           </div>
         ))}

          </div>

        {isActive && (
          <div className="fixed top-[80px] right-0 h-3/4 p-4 flex flex-col w-1/3 bg-gray-400 ">

            <div className="text-yellow-500 font-bold text-3xl py-5 ">Your Cart</div>

            <div className="grid grid-cols-3 text-lg gap-3 mb-1">

              <div>Name</div>
              <div>Price</div>
              <div>Quantity</div>

            </div>

            <div className="grow overflow-y-auto">
              {Object.keys(listCards).map((key) => (
                <div key={key} className="grid grid-cols-3 items-center gap-4 mb-2">
                  <div>{listCards[key].name}</div>
                  <div>₹ {listCards[key].price}</div>
                  <div>
                    <button onClick={() => changeQuantity(key, listCards[key].quantity - 1)}>-</button>
                    <span className="mx-2">{listCards[key].quantity}</span>
                    <button onClick={() => changeQuantity(key, listCards[key].quantity + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center py-3 border-t border-1 border-white">
              <div className="bg-yellow-500 hover:bg-yellow-600 font-bold text-xl rounded-lg w-1/2 py-3 cursor-pointer text-center" onClick={handleCheckout}>
                Checkout (₹ {total})
              </div>
              <div className="cursor-pointer text-white w-1/2 py-3 bg-gray-800 rounded-lg hover:bg-gray-900 text-xl font-bold text-center" onClick={handleCloseShopping}>
                Close
              </div>
            </div>

          </div>
        )}

        {selectedItem && (
          <ItemDetails item={selectedItem} onClose={handleCloseItemDetails} />
        )}

        {isPopupOpen && <UserDetailPopup onClose={handlePopupClose} onConfirm={handlePopupConfirm} />}
     
      </div>
      <div className='text-center text-base my-4'>Copyright © 2020-2021 GoodFood. All Rights are reserved</div>
    </div>
  );
};

export default Menu;
