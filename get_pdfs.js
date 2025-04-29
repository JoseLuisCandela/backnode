import supabaseRequest from "./db.js";

const getPdfsHandler = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Falta userId" });
  }

  const response = await supabaseRequest("GET", "pdfs", null, {
    user_id: `eq.${userId}`,
    order: "uploaded_at.desc",
  });

  if (response.status === 200) {
    res.json(response.data);
  } else {
    res.status(500).json({ success: false, error: "Error al obtener los PDFs" });
  }
};

export default getPdfsHandler;
