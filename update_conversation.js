import express from 'express';
import axios from 'axios';

const router = express.Router();

// Configuración Supabase
const SUPABASE_URL = 'https://jhutdencubufyjuvtnwx.supabase.co';
const SUPABASE_API_KEY = 'TU_SUPABASE_API_KEY'; // reemplaza con tu clave real

router.patch('/update-conversation', async (req, res) => {
  const { id, messages } = req.body;

  if (!id || !messages) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  try {
    const response = await axios.patch(
      `${SUPABASE_URL}/rest/v1/conversations?id=eq.${id}`,
      { messages: JSON.stringify(messages) },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_API_KEY,
          'Authorization': `Bearer ${SUPABASE_API_KEY}`,
          'Prefer': 'return=minimal'
        }
      }
    );

    if (response.status === 204) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, message: "Error al actualizar", error: response.data });
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Error al actualizar",
      error: err.response?.data || "Error desconocido"
    });
  }
});

export default router;
