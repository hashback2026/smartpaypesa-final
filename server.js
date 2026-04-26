
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const API_KEY = process.env.API_KEY;
const ENDPOINT = 'https://api.smartpaypesa.com/v1/initiatestk';

function normalizePhone(phone) {
  let p = (phone || '').toString().trim().replace(/\s+/g, '');
  if (p.startsWith('+')) p = p.slice(1);
  if (p.startsWith('07') || p.startsWith('01')) {
    p = '254' + p.slice(1);
  }
  return p;
}

app.post('/stkpush', async (req, res) => {
  try {
    const { numbers, amount, reference } = req.body;

    if (!numbers || !amount) {
      return res.status(400).json({ error: 'Numbers and amount required' });
    }

    const results = [];

    for (let rawPhone of numbers) {
      const phone = normalizePhone(rawPhone);
      try {
        const response = await axios({
  method: 'POST',
  url: ENDPOINT,
  data: {
    phone: phone,
    amount: Number(amount),
    account_reference: reference || 'TEST',
    description: reference || 'Payment'
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': API_KEY   // ⚠️ NO Bearer
  }
});
          {
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        results.push({ phone, success: true, data: response.data });
      } catch (err) {
        results.push({
          phone,
          success: false,
          status: err.response?.status,
          error: err.response?.data || err.message
        });
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
