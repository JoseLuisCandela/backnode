import express from "express";
import cors from "cors";
import axios from "axios";
import crypto from "crypto";

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SUPABASE_URL = "https://jhutdencubufyjuvtnwx.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // reemplazar con tu key real

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

// Endpoint de login
app.post("/login", async (req, res) => {
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

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
