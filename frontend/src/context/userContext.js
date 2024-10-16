import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Default to null
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Retrieve user and token from localStorage
    const storedUser = localStorage.getItem('userInfo');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      // If user data is found in localStorage, rehydrate the user state
      setUser(JSON.parse(storedUser));
    }

    setLoading(false); // Once done loading, set loading to false
  }, []);

  if (loading) {
    // While loading, return a simple loading indicator
    return <div className='text-center mt-10 text-lg'>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
