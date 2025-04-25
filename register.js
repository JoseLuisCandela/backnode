const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const router = express.Router();

// Configuración de Supabase
const SUPABASE_URL = 'https://jhutdencubufyjuvtnwx.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // reemplaza con tu API KEY

const supabaseRequest = async (method, endpoint, data = null, query = null) => {
  let url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  if (query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      searchParams.append(key, value);
    }
    url += `?${searchParams.toString()}`;
  }

  try {
    const response = await axios({
      method,
      url,
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: data ? JSON.stringify(data) : null,
    });

    return { status: response.status, data: response.data };
  } catch (err) {
    return {
      status: err.response?.status || 500,
      data: err.response?.data || { error: err.message },
    };
  }
};

// Ruta: POST /register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Faltan datos' });
  }

  const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

  const check = await supabaseRequest('GET', 'users', null, {
    username: `eq.${username}`,
    select: 'id',
  });

  if (check.status === 200 && check.data.length > 0) {
    return res.status(409).json({ success: false, error: 'El usuario ya existe' });
  }

  const newUser = await supabaseRequest('POST', 'users', {
    username,
    password: hashedPassword,
  });

  if (newUser.status === 201) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, error: 'Error al registrar usuario' });
  }
});

module.exports = router;
