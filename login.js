import express from "express";
import axios from "axios";
import crypto from "crypto";

const router = express.Router();

const SUPABASE_URL = "https://jhutdencubufyjuvtnwx.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodXRkZW5jdWJ1ZnlqdXZ0bnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMTM5NjcsImV4cCI6MjA2MDg4OTk2N30.x2poq7U5ZlevM_6pxcT0lJfvGaD2XJ5AY-4xpXMWIP0";

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

// Ruta para login
router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: "Faltan datos" });
  }

  const hashedPassword = crypto.createHash("md5").update(password).digest("hex");

  const query = {
    username: `eq.${username}`,
    password: `eq.${hashedPassword}`,
    select: "*"
  };

  const response = await supabaseRequest("GET", "users", null, query);

  if (response.status === 200 && Array.isArray(response.data) && response.data.length === 1) {
    const user = response.data[0];
    res.json({ success: true, userId: user.id });
  } else {
    res.json({ success: false, error: "Credenciales inválidas" });
  }
});

export default router;
