import express from "express";
import supabaseRequest from "./db.js";

const router = express.Router();

// BORRAR conversación
router.delete("/delete_conversation", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: "Falta el ID" });
  }

  try {
    const response = await supabaseRequest("DELETE", "conversations", null, {
      id: `eq.${id}`,
    });

    if (response.status === 204) {
      res.json({ success: true });
    } else {
      console.error("Error Supabase:", response.data);
      res.status(500).json({ success: false, error: "Error al eliminar la conversación" });
    }
  } catch (error) {
    console.error("Error al eliminar:", error.message);
    res.status(500).json({ success: false, error: "Error desconocido" });
  }
});

export default router;
