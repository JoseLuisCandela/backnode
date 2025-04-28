import axios from "axios";

// Configuración de Supabase
const SUPABASE_URL = 'https://jhutdencubufyjuvtnwx.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodXRkZW5jdWJ1ZnlqdXZ0bnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMTM5NjcsImV4cCI6MjA2MDg4OTk2N30.x2poq7U5ZlevM_6pxcT0lJfvGaD2XJ5AY-4xpXMWIP0'; // Reemplaza con tu API key real

// Función manejadora
export default async function saveConversationHandler(req, res) {
  const { userId, messages } = req.body;

  if (!userId || !messages) {
    return res.status(400).json({ success: false, error: 'Faltan datos' });
  }

  let parsedMessages;
  try {
    parsedMessages = typeof messages === 'string' ? JSON.parse(messages) : messages;
    if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
      throw new Error('Mensajes inválidos');
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Mensajes inválidos' });
  }

  const name = (parsedMessages[1]?.text || 'Sin título').substring(0, 100);

  try {
    const response = await axios.post(`${SUPABASE_URL}/rest/v1/conversations`, {
      user_id: parseInt(userId),
      name,
      messages: JSON.stringify(parsedMessages)
    }, {
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        Prefer: 'return=minimal'
      }
    });

    if (response.status === 201) {
      return res.json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: 'Error al guardar en Supabase' });
    }
  } catch (error) {
    console.error(error); // importante para debug
    return res.status(500).json({ success: false, error: 'Error al guardar en Supabase' });
  }
}
