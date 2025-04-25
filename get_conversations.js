import express from "express";
import cors from "cors";
import axios from "axios";


const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = "https://jhutdencubufyjuvtnwx.supabase.co";
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodXRkZW5jdWJ1ZnlqdXZ0bnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMTM5NjcsImV4cCI6MjA2MDg4OTk2N30.x2poq7U5ZlevM_6pxcT0lJfvGaD2XJ5AY-4xpXMWIP0'; // poné tu key

// Función para hacer peticiones a Supabase REST API
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
        Accept: "application/json"
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

// Endpoint para obtener conversaciones
app.get("/get-conversations", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Falta userId" });
  }

  const response = await supabaseRequest("GET", "conversations", null, {
    user_id: `eq.${userId}`,
    order: "id.desc"
  });

  if (response.status === 200) {
    const conversations = response.data.map(conv => {
      try {
        conv.messages = JSON.parse(conv.messages);
      } catch {
        conv.messages = [];
      }
      return conv;
    });
    res.json(conversations);
  } else {
    res.status(500).json({
      success: false,
      error: "Error al obtener las conversaciones",
      details: response
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
