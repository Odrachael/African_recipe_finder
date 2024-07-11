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

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
