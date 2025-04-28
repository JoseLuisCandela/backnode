import axios from "axios";

const SUPABASE_URL = "https://jhutdencubufyjuvtnwx.supabase.co";
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodXRkZW5jdWJ1ZnlqdXZ0bnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMTM5NjcsImV4cCI6MjA2MDg4OTk2N30.x2poq7U5ZlevM_6pxcT0lJfvGaD2XJ5AY-4xpXMWIP0'; // Reemplaza con tu API key real // tu key aquí

const saveConversationHandler = async (req, res) => {
  const { userId, name, messages } = req.body;

  if (!userId || !messages) {
    return res.status(400).json({ success: false, error: "Faltan campos obligatorios" });
  }

  try {
    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/conversations`,
      [
        {
          user_id: parseInt(userId),
          name: name || "Conversación",
          messages: JSON.stringify(messages)
        }
      ],
      {
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${SUPABASE_API_KEY}`,
          Prefer: "return=representation", // ← IMPORTANTE para obtener el nuevo ID
          "Content-Type": "application/json"
        }
      }
    );

    const insertedConversation = response.data[0];

    res.json({ success: true, id: insertedConversation.id });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Error al guardar conversación" });
  }
};

export default saveConversationHandler;
