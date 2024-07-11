const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Flutterwave secret key
const flutterwaveSecretKey = 'FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X'; // Replace with your Flutterwave secret key

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Payment verification endpoint
app.post('/verify-payment', async (req, res) => {
  const { transaction_id, recipeName, recipeDetails } = req.body;

  try {
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`
      }
    });

    if (response.data.status === 'success') {
      // Save recipe details to cart.html
      const cartFilePath = path.join(__dirname, 'public', 'cart.html');
      const recipeHtml = `
        <div class="recipe">
            <h3>${recipeName}</h3>
            <p>Calories: ${recipeDetails.calories.toFixed(2)}</p>
            <p>Ingredients: ${recipeDetails.ingredientLines.join(', ')}</p>
            <a href="${recipeDetails.url}" target="_blank">Full Recipe</a>
        </div>
      `;
      fs.appendFileSync(cartFilePath, recipeHtml);
      res.json({ status: 'success', message: 'Payment verified successfully.' });
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
