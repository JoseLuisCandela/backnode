// procesar_pdf.js
const fs = require("fs");
const pdfParse = require("pdf-parse");
const axios = require("axios");

const SUPABASE_URL = "https://jhutdencubufyjuvtnwx.supabase.co";
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY; // tu Supabase key
const GEMINI_API_KEY = "AIzaSyAbHrkEBJ0Gebu0o4Hai9Oow9RNyJvZUaM"; // tu Gemini API Key

const PDF_PATH = "./archivo.pdf"; // ruta al PDF local
const PDF_ID = 1; // ID del PDF en tu tabla Supabase

// Función para hacer peticiones a Supabase
async function supabaseRequest(method, endpoint, data = null, query = null) {
  let url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  if (query) {
    const params = new URLSearchParams(query);
    url += `?${params.toString()}`;
  }

  try {
    const response = await axios({
      method,
      url,
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      data
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: { error: error.message }
    };
  }
}

// Función principal
async function procesarPDF() {
  const buffer = fs.readFileSync(PDF_PATH);
  const data = await pdfParse(buffer);
  const text = data.text;

  const chunks = [];
  const size = 1000;
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.substring(i, i + size));
  }

  for (const chunk of chunks) {
    try {
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
        {
          content: {
            parts: [{ text: chunk }]
          }
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const embedding = geminiRes.data.embedding.values;

      const insert = await supabaseRequest("POST", "pdf_chunks", {
        pdf_id: PDF_ID,
        chunk_text: chunk,
        embedding
      });

      if (insert.status >= 300) {
        console.error("❌ Error al insertar chunk:", insert.data);
        break;
      } else {
        console.log("✅ Chunk insertado");
      }
    } catch (err) {
      console.error("❌ Error procesando chunk:", err.message);
    }
  }

  console.log("🎉 PDF procesado e insertado");
}

procesarPDF();
