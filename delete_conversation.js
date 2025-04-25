
import express from 'express';
import cors from 'cors';
import supabaseRequest from './db.js';
const express = require("express");
const cors = require("cors");
const { supabaseRequest } = require("./db");

const app = express();
app.use(cors());
app.use(express.json()); // Para recibir JSON en body

app.delete("/delete", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: "Falta el ID" });
  }

  const response = await supabaseRequest("DELETE", "conversations", null, {
    id: `eq.${id}`,
  });

  if (response.status === 204) {
    res.json({ success: true });
  } else {
    console.error("Error Supabase:", response.data);
    res
      .status(500)
      .json({ success: false, error: "Error al eliminar la conversación" });
  }
});

// Puerto local o exportable (útil para servidores tipo Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
