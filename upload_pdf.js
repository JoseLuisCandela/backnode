const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const router = express.Router();
const upload = multer({ dest: 'tmp/' });

const SUPABASE_URL = 'https://jhutdencubufyjuvtnwx.supabase.co';
const SUPABASE_API_KEY = 'TU_SUPABASE_API_KEY'; // reemplaza con tu clave real
const GEMINI_API_KEY = 'AIzaSyAbHrkEBJ0Gebu0o4Hai9Oow9RNyJvZUaM'; // reemplaza si quieres

// Función para chunking simple
function chunkText(text, maxTokens = 300) {
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).split(/\s+/).length > maxTokens) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += " " + sentence;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// Llama a Gemini para embeddings
async function generateEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedText?key=${GEMINI_API_KEY}`;
  try {
    const response = await axios.post(url, { text });
    return response.data.embedding || null;
  } catch (err) {
    console.error("Error en Gemini:", err.message);
    return null;
  }
}

router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  const userId = req.body.userId;
  const file = req.file;

  if (!userId || !file) {
    return res.status(400).json({ success: false, error: 'Faltan datos' });
  }

  const original = file.originalname;
  const tmpPath = file.path;
  const uniqueName = `${Date.now()}_${original}`;
  const bucket = 'pdfs';

  // Subir a Supabase Storage
  try {
    const fileBuffer = fs.readFileSync(tmpPath);
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${uniqueName}`;

    await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        'Content-Type': 'application/pdf',
        'x-upsert': 'true',
      },
    });

    // Insertar en tabla pdfs
    await axios.post(`${SUPABASE_URL}/rest/v1/pdfs`, {
      filename: uniqueName,
      originalname: original,
      user_id: parseInt(userId),
    }, {
      headers: {
        'apikey': SUPABASE_API_KEY,
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    });

    // Extraer texto
    const dataBuffer = fs.readFileSync(tmpPath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    // Guardar .txt local (opcional)
    fs.writeFileSync(`uploads/${uniqueName.replace('.pdf', '')}.txt`, text);

    // Chunk + embeddings
    const chunks = chunkText(text);
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      if (!embedding) continue;

      await axios.post(`${SUPABASE_URL}/rest/v1/pdf_chunks`, {
        filename: uniqueName,
        user_id: parseInt(userId),
        chunk_text: chunk,
        embedding: embedding
      }, {
        headers: {
          'apikey': SUPABASE_API_KEY,
          'Authorization': `Bearer ${SUPABASE_API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      });
    }

    fs.unlinkSync(tmpPath); // borrar temporal
    return res.json({ success: true, filename: uniqueName });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ success: false, error: 'Error al procesar el PDF' });
  }
});

module.exports = router;
