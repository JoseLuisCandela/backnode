import axios from "axios";
import supabaseRequest from "./db.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

const extractTextHandler = async (req, res) => {
  const pdfId = req.body.pdfId;

  if (!pdfId) {
    return res.status(400).json({ error: "pdfId requerido" });
  }

  // Obtener info del PDF desde tabla 'pdfs'
  const response = await supabaseRequest("GET", "pdfs", null, {
    id: `eq.${pdfId}`,
    limit: 1,
  });

  if (response.status !== 200 || response.data.length === 0) {
    return res.status(404).json({ error: "PDF no encontrado" });
  }

  const filename = response.data[0].filename;
  const txtFilename = filename.replace('.pdf', '') + '.txt';
  const bucket = "pdfs";
  const txtUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${txtFilename}`;

  try {
    const txtResponse = await axios.get(txtUrl, {
      headers: {
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
      }
    });

    res.json({ text: txtResponse.data });
  } catch (error) {
    console.error("❌ Error leyendo el .txt:", error.message);
    res.status(500).json({ error: "No se pudo leer el archivo .txt" });
  }
};

export default extractTextHandler;
