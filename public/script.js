// Function to search recipes based on user input
async function searchRecipes() {
    const query = document.getElementById('searchInput').value;
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    displayRecipes(data.hits);
}

// Function to display recipes on the index.html page
function displayRecipes(recipes) {
    const recipeResults = document.getElementById('recipeResults');
    recipeResults.innerHTML = '';

    recipes.forEach(recipeData => {
        const recipe = recipeData.recipe;
        const recipeElement = document.createElement('div');
        recipeElement.classList.add('recipe');
        
        recipeElement.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.label}">
            <h3>${recipe.label}</h3>
            <p class="price">100 NGN</p>
            <button class="buy-button" onclick="payWithFlutterwave('${recipe.label}')">Buy Now</button>
            <div class="details" style="display:none;">
                <p>Calories: ${recipe.calories.toFixed(2)}</p>
                <p>Ingredients: ${recipe.ingredientLines.join(', ')}</p>
                <a href="${recipe.url}" target="_blank">Full Recipe</a>
            </div>
        `;
        
        recipeResults.appendChild(recipeElement);
    });
}

// Function to handle payment using Flutterwave
function payWithFlutterwave(recipeName) {
    FlutterwaveCheckout({
        public_key: 'FLWPUBK-5c9f92dd2ffb8db88f88179527f52b27-X', // Replace with your public key
        tx_ref: '' + Math.floor((Math.random() * 1000000000) + 1),
        amount: 100, // Amount in Naira
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        redirect_url: "/cart", // Redirect to cart page
        meta: {
            consumer_id: 23,
            consumer_mac: "92a3-912ba-1192a"
        },
        customer: {
            email: "user@example.com",
            phonenumber: "080****4528",
            name: "John Doe"
        },
        customizations: {
            title: "Recipe Payment",
            description: "Payment for Nigerian recipes",
            logo: "https://yourlogo.com/logo.png"
        },
        callback: function(response) {
            verifyPayment(response.transaction_id, recipeName);
        },
        onclose: function() {
            alert('Transaction was not completed, window closed.');
        },
    });
}

// Function to verify payment on the server
async function verifyPayment(transaction_id, recipeName) {
    try {
        const response = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transaction_id, recipe: recipeName })
        });

        const data = await response.json();

        if (data.status === 'success') {
            window.location.href = "/cart"; // Redirect to cart page after successful payment
        } else {
            alert('Payment verification failed. Please try again.');
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        alert('Payment verification failed. Please try again.');
    }
}

// Function to fetch and display recipe details in cart.html
async function fetchRecipeDetails() {
    try {
        const response = await fetch('/api/recipe-details');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const recipe = await response.json();

        const cartContent = document.getElementById('cartContent');
        cartContent.innerHTML = `
            <div class="recipe">
                <img src="${recipe.image}" alt="${recipe.label}">
                <h3>${recipe.label}</h3>
                <p>Calories: ${recipe.calories.toFixed(2)}</p>
                <p>Ingredients: ${recipe.ingredientLines.join(', ')}</p>
                <a href="${recipe.url}" target="_blank">Full Recipe</a>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        const cartContent = document.getElementById('cartContent');
        cartContent.innerHTML = '<p>Failed to load recipe details. Please try again.</p>';
    }
}

// Call fetchRecipeDetails function when the cart.html page loads
document.addEventListener('DOMContentLoaded', fetchRecipeDetails);
