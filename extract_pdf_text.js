import axios from "axios";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import supabaseRequest from "./db.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

const extractTextHandler = async (req, res) => {
  const pdfId = req.body.pdfId;

  if (!pdfId) {
    return res.status(400).json({ error: "pdfId requerido" });
  }

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
    console.error("Error procesando el PDF:", error.message);
    res.status(500).json({ error: "No se pudo procesar el PDF" });
  }
};

export default extractTextHandler;
