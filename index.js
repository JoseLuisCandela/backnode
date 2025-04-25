import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";

import uploadPdfHandler from "./upload_pdf.js";
import renameChatHandler from "./rename_chat.js";
import updateConversationHandler from "./update_conversation.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// Ruta para que Render no diga "Cannot GET /"
app.get("/", (req, res) => {
  res.send("🚀 API corriendo correctamente");
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer para subida de archivos
const upload = multer({ dest: "uploads/" });

// Rutas
app.post("/upload_pdf", upload.single("file"), uploadPdfHandler);
app.patch("/rename_chat", renameChatHandler);
app.patch("/update_conversation", updateConversationHandler);

// Escuchar
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
