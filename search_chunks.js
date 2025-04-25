import express from "express";

import axios from "axios";


const router = express.Router();

// Configuración Supabase
const SUPABASE_URL = 'https://jhutdencubufyjuvtnwx.supabase.co';
const SUPABASE_API_KEY = 'TU_SUPABASE_API_KEY'; // reemplaza con tu clave real

// Ruta: POST /search-chunks
router.post('/search-chunks', async (req, res) => {
  const { embedding, pdf_id, threshold = 0.75, count = 5 } = req.body;

  if (!embedding || !pdf_id) {
    return res.status(400).json({ error: "Faltan parámetros." });
  }

  const payload = {
    query_embedding: embedding,
    match_pdf_id: pdf_id,
    match_threshold: threshold,
    match_count: count
  };

  try {
    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/match_pdf_chunks`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_API_KEY,
          'Authorization': `Bearer ${SUPABASE_API_KEY}`
        }
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Error al hacer la búsqueda vectorial:", error.response?.data || error.message);
    return res.status(500).json({ error: "Error en la búsqueda." });
  }
});

module.exports = router;
