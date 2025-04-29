import axios from 'axios';
import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const SUPABASE_URL = 'https://jhutdencubufyjuvtnwx.supabase.co';
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BUCKET_NAME = 'pdfs';

// 🔹 Troceo de texto en chunks
function chunkText(text, maxTokens = 300) {
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    const sentenceLength = sentence.trim().split(/\s+/).length;
    if ((current + ' ' + sentence).trim().split(/\s+/).length > maxTokens) {
      if (current.trim()) chunks.push(current.trim());
      current = sentence;
    } else {
      current += ' ' + sentence;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// 🔹 Generación de embedding usando Gemini
async function generateEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await axios.post(url, {
      model: 'models/gemini-embedding-exp-03-07',
      content: {
        parts: [{ text }]
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data.embedding?.values || null;
  } catch (err) {
    console.error('❌ Error en generateEmbedding Gemini:', err.message);
    return null;
  }
}

// 🔹 Manejador principal para subida de PDF
export default async function uploadPdfHandler(req, res) {
  const userId = req.body.userId;
  const file = req.file;

  if (!userId || !file) {
    return res.status(400).json({ success: false, error: 'Faltan datos' });
  }

  const original = file.originalname;
  const tmpPath = file.path;

  const safeName = original.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w.-]/g, '');

  const uniqueName = `${Date.now()}_${safeName}`;

  try {
    const fileBuffer = fs.readFileSync(tmpPath);

    // 🔺 Subida a Supabase Storage
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${uniqueName}`;
    await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        'Content-Type': 'application/pdf',
        'x-upsert': 'true'
      }
    });

    // 📝 Registro en tabla pdfs
    await axios.post(`${SUPABASE_URL}/rest/v1/pdfs`, {
      filename: uniqueName,
      originalname: original,
      user_id: parseInt(userId)
    }, {
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      }
    });

    // 🧠 Procesamiento del PDF y generación de embeddings
    const pdfData = await pdfParse(fileBuffer);
    const text = pdfData.text;

    // 🔽 Guardar el texto en un archivo .txt en /tmp
    const txtFilename = uniqueName.replace('.pdf', '') + '.txt';
    const txtPath = `/tmp/${txtFilename}`;
    fs.writeFileSync(txtPath, text, 'utf8');
    console.log(`✅ Texto guardado en: ${txtPath}`);

    // Subida del .txt a Supabase Storage
    const txtBuffer = Buffer.from(text, 'utf8');
    const txtUploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${txtFilename}`;
    await axios.put(txtUploadUrl, txtBuffer, {
      headers: {
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        'Content-Type': 'text/plain',
        'x-upsert': 'true'
      }
    });

    // 🧩 Embeddings por chunk
    const chunks = chunkText(text);
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      if (!embedding) continue;

      await axios.post(`${SUPABASE_URL}/rest/v1/pdf_chunks`, {
        filename: uniqueName,
        user_id: parseInt(userId),
        chunk_text: chunk,
        embedding: `[${embedding.join(',')}]`
      }, {
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${SUPABASE_API_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        }
      });
    }

    fs.unlinkSync(tmpPath);
    return res.json({ success: true, filename: uniqueName });
  } catch (err) {
    console.error('🛑 Error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, error: 'Error al procesar el PDF' });
  }
}
