import axios from "axios";


// URL y API Key de tu proyecto Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

/**
 * Función para hacer peticiones a Supabase REST API
 *
 * @param {string} method - Método HTTP (GET, POST, PATCH, DELETE)
 * @param {string} endpoint - Nombre del endpoint o tabla
 * @param {object|null} data - Cuerpo de la solicitud (para POST/PATCH)
 * @param {object|null} query - Parámetros de consulta (para GET)
 * @returns {Promise<{ status: number, data: any }>}
 */
async function supabaseRequest(method, endpoint, data = null, query = null) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const config = {
      method,
      url,
      headers,
    };

    if (query) {
      config.params = query;
    }

    if (data && (method === "POST" || method === "PATCH")) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: { error: error.message },
    };
  }
}

module.exports = { supabaseRequest };
