import React, { useState, useEffect } from 'react';
import axios from 'axios';
import search_icon from '../../../assets/search-icon.png';

const Search = ({ onSelectDish }) => {
    const [query, setQuery] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (query) {
            axios.get(`http://localhost:5000/api/menu/search?q=${query}`)
                .then(response => setItems(response.data))
                .catch(error => console.error('Error fetching dishes:', error));
        } else {
            setItems([]);
        }
    }, [query]);

    const handleSearchChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSelectDish = (item) => {
        onSelectDish(item); 
        setQuery('');
    };

    return (
        <div>
            <div className="relative w-96">
                <input
                    placeholder="What's on your mind?"
                    type="text"
                    value={query}
                    onChange={handleSearchChange}
                    className="border-2 border-black rounded-xl p-2 pr-10 bg-yellow-400 hover:bg-yellow-500 w-full"
                />
                <img src={search_icon} alt="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5" />
            </div>
            {query && (
                <ul className='absolute z-50 bg-white rounded-lg p-2 w-96 max-h-60 overflow-auto'>
                    {items.map(item => (
                        <li
                            key={item._id}
                            onClick={() => handleSelectDish(item)}
                            className="cursor-pointer hover:bg-gray-200 p-2"
                        >
                            {item.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Search;
