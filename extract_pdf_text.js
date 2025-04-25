const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const { supabaseRequest, SUPABASE_URL, SUPABASE_API_KEY } = require("./db");

const app = express();
app.use(express.json());

app.get("/extract_pdf_text", async (req, res) => {
  const pdfId = req.query.pdfId;

  if (!pdfId) {
    return res.status(400).json({ error: "pdfId requerido" });
  }

  // Obtener metadata del PDF desde Supabase
  const response = await supabaseRequest("GET", "pdfs", null, {
    id: `eq.${pdfId}`,
    limit: 1,
  });

  if (response.status !== 200 || response.data.length === 0) {
    return res.status(404).json({ error: "PDF no encontrado" });
  }

  const filename = response.data[0].filename;
  const bucket = "pdfs";
  const storageUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;

  try {
    const pdfBuffer = await axios.get(storageUrl, {
      headers: {
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
      },
      responseType: "arraybuffer",
    });

    const data = await pdfParse(pdfBuffer.data);
    res.json({ text: data.text });
  } catch (error) {
    console.error("Error descargando o procesando PDF:", error.message);
    res.status(500).json({ error: "No se pudo procesar el PDF" });
  }
});

// Puerto para local o deploy
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
