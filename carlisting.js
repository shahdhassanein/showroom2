document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // FILTERING FUNCTIONALITY
    // ======================
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const brandFilter = document.getElementById('brandFilter');
    const resetButton = document.getElementById('resetFilters');
    const carBoxes = document.querySelectorAll('.flex-box');
    
    const PRICE_RANGES = {
        low: { min: 100000, max: 200000 },
        medium: { min: 200001, max: 300000 },
        high: { min: 300001, max: Infinity }
    };

    // Initialize filters
    if (categoryFilter) categoryFilter.addEventListener('change', filterCars);
    if (priceFilter) priceFilter.addEventListener('change', filterCars);
    if (brandFilter) brandFilter.addEventListener('change', filterCars);
    if (resetButton) resetButton.addEventListener('click', resetFilters);
    filterCars();

    // =================
    // CART FUNCTIONALITY
    // =================
    initializeCartButtons();
    updateCartCount();

    // ==============
    // CORE FUNCTIONS
    // ==============
    
    function parsePrice(priceString) {
        return parseInt(priceString.replace(/[^0-9]/g, ''));
    }
    
    function filterCars() {
        const selectedCategory = categoryFilter.value.toLowerCase();
        const selectedPrice = priceFilter.value;
        const selectedBrand = brandFilter.value.toLowerCase();
        
        let hasVisibleItems = false;
        
        carBoxes.forEach(box => {
            const category = box.dataset.category.toLowerCase();
            const price = parsePrice(box.dataset.price);
            const brand = box.dataset.brand.toLowerCase();
            
            const categoryMatch = selectedCategory === 'all' || category === selectedCategory;
            let priceMatch = true;
            if (selectedPrice !== 'all') {
                const range = PRICE_RANGES[selectedPrice];
                priceMatch = price >= range.min && price <= range.max;
            }
            const brandMatch = selectedBrand === 'all' || brand === selectedBrand;
            
            const shouldShow = categoryMatch && priceMatch && brandMatch;
            box.style.display = shouldShow ? 'block' : 'none';
            
            if (shouldShow) hasVisibleItems = true;
        });
        
        updateNoResultsMessage(hasVisibleItems);
    }
    
    function resetFilters(e) {
        e.preventDefault();
        categoryFilter.value = 'all';
        priceFilter.value = 'all';
        brandFilter.value = 'all';
        filterCars();
    }
    
    function updateNoResultsMessage(hasVisibleItems) {
        const noResultsMsg = document.getElementById('no-results-message');
        const flexContainer = document.querySelector('.flex-container');
        
        if (!hasVisibleItems && flexContainer && !noResultsMsg) {
            const msg = document.createElement('p');
            msg.id = 'no-results-message';
            msg.textContent = 'No cars match your filters. Try different criteria.';
            msg.style.textAlign = 'center';
            msg.style.margin = '20px 0';
            msg.style.color = '#ff0000';
            flexContainer.appendChild(msg);
        } else if (hasVisibleItems && noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    function initializeCartButtons() {
        const cartButtons = document.querySelectorAll('.add-to-cart');
        
        cartButtons.forEach(button => {
            // Remove any existing event listeners by cloning and replacing
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add proper click handler to the new button
            newButton.addEventListener('click', handleAddToCart);
            
            // Make sure data attributes are complete
            const carBox = newButton.closest('.flex-box');
            if (!newButton.hasAttribute('data-name')) {
                const carName = carBox.querySelector('h3').textContent;
                newButton.setAttribute('data-name', carName);
            }
            if (!newButton.hasAttribute('data-price')) {
                const priceText = carBox.querySelector('p').textContent;
                const priceValue = parsePrice(priceText);
                newButton.setAttribute('data-price', priceValue);
            }
            if (!newButton.hasAttribute('data-brand')) {
                newButton.setAttribute('data-brand', carBox.dataset.brand);
            }
            if (!newButton.hasAttribute('data-id')) {
                const name = newButton.dataset.name || carBox.querySelector('h3').textContent;
                const id = name.toLowerCase().replace(/\s+/g, '-');
                newButton.setAttribute('data-id', id);
            }
            
            // Remove any onclick attributes that might interfere
            newButton.removeAttribute('onclick');
            
            // Change button text to "Add to Cart" for consistency
            newButton.textContent = 'Add to Cart';
        });
    }

    function handleAddToCart(event) {
        event.preventDefault();
        
        const button = event.target;
        const product = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: parseFloat(button.dataset.price),
            brand: button.dataset.brand
        };

        // Add to cart using the cart.js addToCart function
        addToCart(product);
        
        // Visual feedback
        button.classList.add('added-to-cart');
        setTimeout(() => {
            button.classList.remove('added-to-cart');
        }, 1000);
        
        // Update cart count
        updateCartCount();
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        const countElements = document.querySelectorAll('.count');
        countElements.forEach(el => {
            el.textContent = totalItems;
        });
    }

    // Make addToCart function available if it's not defined
    if (typeof addToCart !== 'function') {
        window.addToCart = function(product) {
            // Get existing cart or initialize empty one
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Check if product already exists in cart
            const existingItem = cart.find(item => item.id === product.id);
            
            if (existingItem) {
                // Increase quantity if already in cart
                existingItem.quantity = (existingItem.quantity || 1) + 1;
            } else {
                // Add new item with quantity 1
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    brand: product.brand || ''
                });
            }
            
            // Save updated cart to local storage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count display
            updateCartCount();
            
            console.log('Added to cart:', product);
        };
    }
});
// Add this code to carllisting.js

