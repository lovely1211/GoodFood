import React, { useState, useContext, useEffect, useCallback } from 'react';
import BackBtn from './backBtn';
import { MenuContext } from '../../context/menuContext';
import { useUser } from '../../context/userContext';
import axiosInstance from '../../axiosInstance';

const MenuItemManager = () => {
  const { menuItems, setMenuItems } = useContext(MenuContext);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImage, setItemImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    setTotalItems(menuItems.length);
  }, [menuItems]);

  const token = localStorage.getItem('token');

  const fetchMenuItems = useCallback(async () => {
    if (!user || !user.id) {
      console.error('User or user ID is missing');
      return;
    }
    
    try {
      const response = await axiosInstance.get(`/menu/seller/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  }, [user, token, setMenuItems]);  

  useEffect(() => {
    if (user && user.id) {
      fetchMenuItems();
    } else {
      console.error('User is not authenticated or user ID is missing');
    }
  }, [fetchMenuItems, user]);
  

  const handleImageChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  const addMenuItem = async () => {
    const formData = new FormData();
    formData.append('name', itemName);
    formData.append('category', itemCategory);
    formData.append('price', itemPrice);
    formData.append('description', itemDescription);
    if (itemImage) formData.append('image', itemImage);
    formData.append('sellerId', user._id);
    formData.append('sellerName', user.name);

    try {
      const response = await axiosInstance.post('/menu/', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });
      setMenuItems([...menuItems, response.data]);
      alert('Added new item successfully');
      resetForm();
    } catch (error) {
      console.error('There was an error adding the menu item!', error);
    }
  };

  const editMenuItem = async () => {
    const formData = new FormData();
    formData.append('name', itemName);
    formData.append('category', itemCategory);
    formData.append('price', itemPrice);
    formData.append('description', itemDescription);
    if (itemImage) formData.append('image', itemImage);
    formData.append('sellerId', user._id);

    try {
      const response = await axiosInstance.patch(`/menu/${editItemId}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });
      setMenuItems(menuItems.map(item => (item._id === editItemId ? response.data : item)));
      resetForm();
    } catch (error) {
      console.error('There was an error updating the menu item!', error);
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      await axiosInstance.delete(`/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(menuItems.filter(item => item._id !== id));
    } catch (error) {
      console.error('There was an error deleting the menu item!', error);
    }
  };

  const resetForm = () => {
    setItemName('');
    setItemCategory('');
    setItemPrice('');
    setItemDescription('');
    setItemImage(null);
    setEditMode(false);
    setEditItemId(null);
  };

  const handleEditClick = (menuItem) => {
    setItemName(menuItem.name);
    setItemCategory(menuItem.category);
    setItemPrice(menuItem.price);
    setItemDescription(menuItem.description);
    setEditMode(true);
    setEditItemId(menuItem._id);
  };

  const handleCategoryClick = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className='items-center justify-center flex flex-col my-10'>
      <div className='text-3xl font-bold'>Your Menu Items</div>
      <BackBtn/>
      <div className='mt-4'>
        <div className='text-xl font-bold'>Total Items: {totalItems}</div>
      </div>
      <div className='justify-center flex flex-row items-center mt-8'>
        <select  
          value={itemCategory}
          onChange={(e) => setItemCategory(e.target.value)}
          className="p-1 border-2 border-black rounded-lg text-base font-normal mx-1">
          <option value="">Select a Category</option>
          <option value="Appetizers">Appetizers</option>
          <option value="Entrees">Entrees</option>
          <option value="Sides">Sides</option>
          <option value="Desserts">Desserts</option>
          <option value="Beverages">Beverages</option>
        </select>
        
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item Name"
          className='p-1 border-2 border-black rounded-lg text-base font-normal mx-1'
        />

        <input
          type="number"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          placeholder="Item Price"
          className='p-1 border-2 border-black rounded-lg text-base font-normal mx-1'
        />
        <input
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          maxLength={500}
          placeholder="Item Description"
          className='p-1 border-2 border-black rounded-lg text-base font-normal mx-1'
        />
        <input
          type="file"
          onChange={handleImageChange}
          className='border-2 border-black rounded-lg text-base font-normal mx-1'
        />
        <button onClick={editMode ? editMenuItem : addMenuItem} className='border-2 border-black rounded-lg p-1 text-xl font-bold bg-yellow-400 hover:bg-yellow-500'>
          {editMode ? 'Update' : 'Create'}
        </button>
      </div>
      <div className='mt-8 w-1/2'>
        {Object.keys(groupedMenuItems).map((category) => (
          <div key={category} onClick={() => handleCategoryClick(category)} className='border-2 border-black rounded-lg p-2 mb-4 shadow-lg bg-slate-300'>
            <div className='text-2xl font-semibold text-center cursor-pointer'>
              {category}
            </div>
            {expandedCategory === category && (
              <table className='w-full mt-4'>
                <thead>
                  <tr>
                    <th className='border-2 border-gray-600 p-2'>Name</th>
                    <th className='border-2 border-gray-600 p-2'>Price (₹)</th>
                    <th className='border-2 border-gray-600 p-2'>Description</th>
                    <th className='border-2 border-gray-600 p-2'>Image</th>
                    <th className='border-2 border-gray-600 p-2'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedMenuItems[category].map((menuItem) => (
                    <tr key={menuItem._id}>
                      <td className='border-2 border-gray-600 p-2 text-center'>{menuItem.name}</td>
                      <td className='border-2 border-gray-600 p-2 text-center'>{menuItem.price}</td>
                      <td className='border-2 border-gray-600 p-2 text-center'>{menuItem.description}</td>
                      <td className='border-2 border-gray-600 p-2 text-center'>
                        {menuItem.image && (
                          <img
                            src={`http://localhost:5000/uploads/${menuItem.image}`}
                            alt={menuItem.name}
                            className='w-12 h-12 object-cover rounded-md mx-auto'
                          />
                        )}
                      </td>
                      <td className='border-2 border-gray-600 p-2 text-center'>
                        <button
                          onClick={() => handleEditClick(menuItem)}
                          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mr-2'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMenuItem(menuItem._id)}
                          className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md'
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuItemManager;