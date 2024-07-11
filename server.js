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
const flutterwaveSecretKey = 'FLWSECK-f980725d7ac4dbc40ff4a32a6dd23c27-1909dd1c0d2vt-X'; // Replace with your Flutterwave secret key
const edamamApiKey = 'f194b8afb193bcb175d6d5efd27db06c';  // Replace with your actual API key
const edamamAppId = '4397d82e';    // Replace with your actual App ID

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Payment verification endpoint
app.get('/verify-payment', async (req, res) => {
  const transaction_id = req.query.transaction_id;
  const recipeName = req.query.recipe;

  try {
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`
      }
    });

    if (response.data.status === 'success') {
      // Fetch the recipe details using Edamam API
      const edamamResponse = await axios.get(`https://api.edamam.com/search?q=${recipeName}&app_id=${edamamAppId}&app_key=${edamamApiKey}`);
      const recipe = edamamResponse.data.hits[0].recipe; // Assuming the first result is the desired recipe

      // Serve the recipe details page
      res.send(`
        <html>
          <head>
            <title>${recipe.label} - Recipe Details</title>
          </head>
          <body>
            <h1>${recipe.label}</h1>
            <img src="${recipe.image}" alt="${recipe.label}">
            <p>Calories: ${recipe.calories.toFixed(2)}</p>
            <p>Ingredients: ${recipe.ingredientLines.join(', ')}</p>
            <a href="${recipe.url}" target="_blank">Full Recipe</a>
          </body>
        </html>
      `);
    } else {
      res.send('Payment verification failed.');
    }
  } catch (error) {
    res.status(500).send('An error occurred during payment verification.');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
