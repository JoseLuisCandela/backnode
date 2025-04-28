import axios from "axios";
import crypto from "crypto";

const SUPABASE_URL = "https://jhutdencubufyjuvtnwx.supabase.co";
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodXRkZW5jdWJ1ZnlqdXZ0bnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMTM5NjcsImV4cCI6MjA2MDg4OTk2N30.x2poq7U5ZlevM_6pxcT0lJfvGaD2XJ5AY-4xpXMWIP0'; // reemplaza con tu API KEY

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
        Accept: "application/json",
      },
      data,
    });

    return { status: response.status, data: response.data };
  } catch (err) {
    return {
      status: err.response?.status || 500,
      data: err.response?.data || { error: err.message },
    };
  }
}

export default async function registerHandler(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: "Faltan datos" });
  }

  const hashedPassword = crypto.createHash("md5").update(password).digest("hex");

  const check = await supabaseRequest("GET", "users", null, {
    username: `eq.${username}`,
    select: "id",
  });

  if (check.status === 200 && check.data.length > 0) {
    return res.status(409).json({ success: false, error: "El usuario ya existe" });
  }

  const newUser = await supabaseRequest("POST", "users", {
    username,
    password: hashedPassword,
  });

  if (newUser.status === 201 || newUser.status === 200) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, error: "Error al registrar usuario" });
  }
}
