const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configuración de Supabase
const SUPABASE_URL = 'https://jhutdencubufyjuvtnwx.supabase.co';
const SUPABASE_API_KEY = 'TU_SUPABASE_API_KEY'; // reemplaza con tu clave real

const supabaseRequest = async (method, table, data = null, query = null) => {
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(query)) {
      params.append(key, val);
    }
    url += `?${params.toString()}`;
  }

  try {
    const response = await axios({
      method,
      url,
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      data: data ? JSON.stringify(data) : null,
    });

    return { status: response.status, data: response.data };
  } catch (err) {
    return {
      status: err.response?.status || 500,
      data: err.response?.data || { error: err.message }
    };
  }
};

// Ruta: PATCH /rename-chat
router.patch('/rename-chat', async (req, res) => {
  const { chatId, newName } = req.body;

  if (!chatId || !newName) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  const result = await supabaseRequest('PATCH', 'conversations', {
    name: newName
  }, {
    id: `eq.${chatId}`
  });

  if (result.status === 204) {
    res.json({ success: true });
  } else {
    res.status(500).json({
      success: false,
      message: 'Error al renombrar',
      error: result.data || 'Error desconocido'
    });
  }
});

export default router;
