const BuyerMenu = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [isCategoryPopupOpen, setCategoryPopupOpen] = useState(false);
    const [isItemsPopupOpen, setItemsPopupOpen] = useState(false);

    const handleMenuClick = async () => {
        const fetchedCategories = await fetchCategoriesBySeller(sellerId);
        setCategories(fetchedCategories);
        setCategoryPopupOpen(true);
    };

    const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        const fetchedItems = await fetchItemsByCategoryAndSeller(category.id, sellerId);
        setItems(fetchedItems);
        setItemsPopupOpen(true);
    };

    const handleItemClick = (item) => {
        // Logic to add item to cart or view details
    };

    return (
        <div>
            <button onClick={handleMenuClick}>Menu</button>

            {isCategoryPopupOpen && (
                <CategoryPopup 
                    categories={categories} 
                    onCategoryClick={handleCategoryClick} 
                    onClose={() => setCategoryPopupOpen(false)} 
                />
            )}

            {isItemsPopupOpen && (
                <ItemsPopup 
                    items={items} 
                    onItemClick={handleItemClick} 
                    onClose={() => setItemsPopupOpen(false)} 
                />
            )}
        </div>
    );
};

const CategoryPopup = ({ categories, onCategoryClick, onClose }) => (
    <div className="popup">
        <button onClick={onClose}>Close</button>
        {categories.map(category => (
            <div key={category.id} onClick={() => onCategoryClick(category)}>
                {category.name} ({category.itemCount})
            </div>
        ))}
    </div>
);

const ItemsPopup = ({ items, onItemClick, onClose }) => (
    <div className="popup">
        <button onClick={onClose}>Close</button>
        {items.map(item => (
            <div key={item.id} onClick={() => onItemClick(item)}>
                {item.name}
            </div>
        ))}
    </div>
);
