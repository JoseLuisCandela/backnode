import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import fetch from 'node-fetch'; // <<< --- AÑADIR ESTA LÍNEA ---

// Rutas
import uploadPdfHandler from "./upload_pdf.js";
import renameChatHandler from "./rename_chat.js";
import updateConversationHandler from "./update_conversation.js";
import loginHandler from "./login.js";
import registerHandler from "./register.js";
import getConversationsHandler from "./get_conversations.js";
import saveConversationHandler from "./save_convesation.js"; // Corregir typo: save_conversation.js
import deleteConversationHandler from "./delete_conversation.js";
import getPdfsHandler from "./get_pdfs.js";
import extractTextHandler from "./extract_pdf_text.js";
// Probablemente save_convesation.js debería ser save_conversation.js (revisa el nombre del archivo)

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors()); // Considera configurar cors({ origin: 'URL_DE_TU_FRONTEND_EN_PRODUCCION' }) para más seguridad
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer para subir archivos PDF
const upload = multer({ dest: '/tmp/' }); 

// --- NUEVA RUTA PARA BÚSQUEDA CON SERPAPI.COM ---
const SERPAPI_API_KEY_FROM_ENV = process.env.SERPAPI_API_KEY;

app.post('/serpapi-search', async (req, res) => {
  const { query, engine = 'google', hl = 'es', gl = 'pe', num = '5' } = req.body;

  if (!SERPAPI_API_KEY_FROM_ENV) {
    console.error('FATAL: SERPAPI_API_KEY no está configurada en las variables de entorno del backend.');
    return res.status(500).json({ error: 'La funcionalidad de búsqueda no está configurada correctamente en el servidor (falta API key).' });
  }

  if (!query) {
    return res.status(400).json({ error: 'Se requiere un término de búsqueda (query).' });
  }

  console.log(`Backend: Recibida solicitud de búsqueda para SerpApi.com: Query="${query}", Engine="${engine}", HL="${hl}", GL="${gl}", Num="${num}"`);

  try {
    const searchParams = new URLSearchParams({
      engine: engine,
      q: query,
      hl: hl,
      gl: gl,
      num: num,
      api_key: SERPAPI_API_KEY_FROM_ENV
    });
    // Ejemplo si quisieras añadir 'location':
    // if (req.body.location) searchParams.append('location', req.body.location);

    const serpApiUrl = `https://serpapi.com/search?${searchParams.toString()}`;
    
    console.log(`Backend: Enviando solicitud a SerpApi: ${serpApiUrl.replace(SERPAPI_API_KEY_FROM_ENV, "********")}`); // Ocultar API key en logs

    const serpApiResponse = await fetch(serpApiUrl);

    if (!serpApiResponse.ok) {
      let errorPayload = { error: `Error de SerpApi.com: ${serpApiResponse.statusText}` };
      try {
        errorPayload = await serpApiResponse.json();
      } catch (e) {
        console.warn("El error de SerpApi no fue JSON:", await serpApiResponse.text());
      }
      console.error('Error de la API de SerpApi.com:', serpApiResponse.status, errorPayload);
      return res.status(serpApiResponse.status).json({ 
        error: `Error al buscar con SerpApi.com: ${errorPayload.error || errorPayload.message || serpApiResponse.statusText}` 
      });
    }

    const searchData = await serpApiResponse.json();
    console.log('Backend: Resultados de SerpApi.com obtenidos exitosamente.');

    res.json({ results: searchData.organic_results || [] });

  } catch (error) {
    console.error('Error catastrófico en la ruta /api/serpapi-search:', error);
    res.status(500).json({ error: 'Error interno del servidor al realizar la búsqueda.', details: error.message });
  }
});
// --- FIN DE NUEVA RUTA ---


// Ruta raíz
app.get("/", (_, res) => {
  res.send("🚀 API corriendo correctamente");
});

// Rutas existentes
//chat
app.patch("/rename_chat", renameChatHandler);
app.post("/update_conversation", updateConversationHandler);
app.get("/get_conversations", getConversationsHandler);
app.post("/save_conversation", saveConversationHandler); // Revisa si el nombre del archivo es save_convesation.js o save_conversation.js
app.delete("/delete_conversation", deleteConversationHandler);
//login
app.post("/login", loginHandler);
app.post("/register", registerHandler);
//pdfs
app.get("/get_pdfs", getPdfsHandler);
app.post("/upload_pdf", upload.single("file"), uploadPdfHandler);
app.post("/extract_pdf_text", extractTextHandler);
app.use('/uploads', express.static('/tmp')); // Esto es para servir archivos estáticos, podría no ser lo ideal para /tmp en producción

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port} (o el puerto asignado por OnRender)`);
});