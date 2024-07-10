const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Flutterwave secret key
const flutterwaveSecretKey = 'FLWPUBK-5c9f92dd2ffb8db88f88179527f52b27-X'; // Replace with your Flutterwave secret key

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Payment verification endpoint
app.post('/verify-payment', async (req, res) => {
  const { transaction_id } = req.body;

  try {
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`
      }
    });

    if (response.data.status === 'success') {
      res.json({ status: 'success', message: 'Payment verified successfully.' });
    } else {
      res.json({ status: 'failed', message: 'Payment verification failed.' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'An error occurred during payment verification.' });
  }
});

// Serve the recipe details page
app.get('/recipe-details', (req, res) => {
  const recipeName = req.query.recipe;

  // Fetch the recipe details using Edamam API or any other logic
  // For demonstration, we will use a dummy recipe
  const recipeDetails = {
    name: recipeName,
    calories: 500,
    ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
    image: 'https://via.placeholder.com/150',
    url: 'https://example.com/full-recipe'
  };

  res.send(`
    <html>
      <head>
        <title>${recipeDetails.name} - Recipe Details</title>
      </head>
      <body>
        <h1>${recipeDetails.name}</h1>
        <img src="${recipeDetails.image}" alt="${recipeDetails.name}">
        <p>Calories: ${recipeDetails.calories}</p>
        <p>Ingredients: ${recipeDetails.ingredients.join(', ')}</p>
        <a href="${recipeDetails.url}" target="_blank">Full Recipe</a>
      </body>
    </html>
  `);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
