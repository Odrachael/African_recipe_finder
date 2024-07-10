const apiKey = 'f194b8afb193bcb175d6d5efd27db06c';  // Replace with your actual API key
const appId = '4397d82e';    // Replace with your actual App ID

async function searchRecipes() {
    const query = document.getElementById('searchInput').value;
    const response = await fetch(`https://api.edamam.com/search?q=${query}&app_id=${appId}&app_key=${apiKey}`);
    const data = await response.json();
    displayRecipes(data.hits);
}

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

function payWithFlutterwave(recipeName) {
    FlutterwaveCheckout({
        public_key: 'FLWSECK-f980725d7ac4dbc40ff4a32a6dd23c27-1909dd1c0d2vt-X', // Replace with your public key
        tx_ref: '' + Math.floor((Math.random() * 1000000000) + 1),
        amount: 100, // Amount in Naira
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        redirect_url: "https://african-recipe-finder.vercel.app/verify-payment", // Your Vercel URL here
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

async function verifyPayment(transaction_id, recipeName) {
    const response = await fetch('/verify-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transaction_id })
    });

    const data = await response.json();

    if (data.status === 'success') {
        alert('Payment successful. Showing recipe details.');
        document.querySelectorAll('.details').forEach(detail => {
            if (detail.previousElementSibling.innerText.includes(recipeName)) {
                detail.style.display = 'block';
            }
        });
    } else {
        alert('Payment verification failed. Please try again.');
    }
}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
