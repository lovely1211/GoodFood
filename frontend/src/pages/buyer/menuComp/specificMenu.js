// CategoryDropdown.js
import React, { useState } from 'react';

const CategoryDropdown = ({ categories, onCategorySelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="absolute bottom-2 right-2 border-2 border-black bg-yellow-400 text-black font-semibold p-2 rounded-xl"
      >
        Menu
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 bg-white border-2 border-black rounded-lg mt-2 w-full">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => onCategorySelect(category)}
              className="block px-4 py-2 text-left hover:bg-gray-200 w-full"
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
