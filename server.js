const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Flutterwave secret key
const flutterwaveSecretKey = 'FLWSECK-f980725d7ac4dbc40ff4a32a6dd23c27-1909dd1c0d2vt-X'; // Replace with your Flutterwave secret key
const edamamApiKey = 'f194b8afb193bcb175d6d5efd27db06c';  // Replace with your actual API key
const edamamAppId = '4397d82e';    // Replace with your actual App ID

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the cart HTML file
app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

// Payment verification endpoint
app.post('/verify-payment', async (req, res) => {
  const { transaction_id, recipe } = req.body;

  try {
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`
      }
    });

    if (response.data.status === 'success') {
      const recipeResponse = await axios.get(`https://api.edamam.com/search?q=${recipe}&app_id=${edamamAppId}&app_key=${edamamApiKey}`);
      const recipeData = recipeResponse.data.hits[0]?.recipe;

      if (recipeData) {
        // Save the recipe details in the session
        req.session.recipeDetails = recipeData;
        res.json({ status: 'success', message: 'Payment verified successfully.', redirectUrl: '/cart' });
      } else {
        res.json({ status: 'failed', message: 'Recipe not found.' });
      }
    } else {
      res.json({ status: 'failed', message: 'Payment verification failed.' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'An error occurred during payment verification.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
