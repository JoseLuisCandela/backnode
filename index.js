import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import uploadPdfHandler from "./upload_pdf.js";
import renameChatHandler from "./rename_chat.js";
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

import updateConversationHandler from "./update_conversation.js";
// ... importa más handlers si tienes

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
app.use(uploadPdfHandler);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer para subir archivos PDF
const upload = multer({ dest: "uploads/" });

app.post("/upload_pdf", upload.single("file"), uploadPdfHandler);
app.patch("/rename_chat", renameChatHandler);
app.patch("/update_conversation", updateConversationHandler);
// Agrega más endpoints aquí

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
