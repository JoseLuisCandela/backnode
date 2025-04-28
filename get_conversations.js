import express from "express";
import axios from "axios";

const router = express.Router();

const SUPABASE_URL = "https://jhutdencubufyjuvtnwx.supabase.co";
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodXRkZW5jdWJ1ZnlqdXZ0bnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMTM5NjcsImV4cCI6MjA2MDg4OTk2N30.x2poq7U5ZlevM_6pxcT0lJfvGaD2XJ5AY-4xpXMWIP0'; // poné tu key

router.get('/get', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'Falta userId' });
  }

  try {
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/conversations`, {
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
      },
      params: {
        user_id: `eq.${userId}`,
        order: 'id.desc'
      }
    });

    const conversations = (response.data || []).map(conv => ({
      ...conv,
      messages: safeParse(conv.messages)
    }));

    res.json(conversations);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Error al obtener conversaciones' });
  }
});

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

export default router;
