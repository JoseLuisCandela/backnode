import axios from "axios";


/**
 * Genera embedding usando la API de Gemini
 * @param {string} text - Texto a vectorizar
 * @returns {Promise<Array<number>|null>}
 */
async function generateEmbeddingFromGemini(text) {
  const apiKey = "AIzaSyAbHrkEBJ0Gebu0o4Hai9Oow9RNyJvZUaM";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedText?key=${apiKey}`;

  try {
    const response = await axios.post(
      url,
      { text },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.embedding || null;
  } catch (error) {
    console.error("Error al generar embedding:", error.message);
    return null;
  }
}

module.exports = generateEmbeddingFromGemini;
