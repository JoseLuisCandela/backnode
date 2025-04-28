import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";

// Rutas
import uploadPdfHandler from "./upload_pdf.js";
import renameChatHandler from "./rename_chat.js";
import updateConversationHandler from "./update_conversation.js";
import loginHandler from "./login.js";
import registerHandler from "./register.js";
import getConversationsHandler from "./conversations/get_conversations.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer para subir archivos PDF
const upload = multer({ dest: "uploads/" });

// Ruta raíz
app.get("/", (_, res) => {
  res.send("🚀 API corriendo correctamente");
});

// Rutas
app.post("/upload_pdf", upload.single("file"), uploadPdfHandler);
app.patch("/rename_chat", renameChatHandler);
app.patch("/update_conversation", updateConversationHandler);
app.post("/login", loginHandler);
app.post("/register", registerHandler);
app.get("/get_conversations", getConversationsHandler);

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
