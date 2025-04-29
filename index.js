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
import getConversationsHandler from "./get_conversations.js";
import saveConversationHandler from "./save_convesation.js";
import deleteConversationHandler from "./delete_conversation.js";
import getPdfsHandler from "./get_pdfs.js";
import extractTextHandler from "./extract_pdf_text.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer para subir archivos PDF

const upload = multer({ dest: '/tmp/' }); // 

// Ruta raíz
app.get("/", (_, res) => {
  res.send("🚀 API corriendo correctamente");
});

// Rutas
//chat
app.patch("/rename_chat", renameChatHandler);
app.post("/update_conversation", updateConversationHandler);
app.get("/get_conversations", getConversationsHandler);
app.post("/save_conversation", saveConversationHandler);
app.delete("/delete_conversation", deleteConversationHandler);
//login
app.post("/login", loginHandler);
app.post("/register", registerHandler);
//pdfs
app.get("/get_pdfs", getPdfsHandler);
app.post("/upload_pdf", upload.single("file"), uploadPdfHandler);
app.post("/extract_pdf_text", extractTextHandler);


app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
