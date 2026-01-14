import express from "express";
import cors from "cors";
import analiseRoutes from "./routes/analise.routes.js";
import etcRoutes from "./routes/etc.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "API HydroSense online" });
});

app.use("/api/analise", analiseRoutes);
app.use("/api/etc", etcRoutes); // ✅ AQUI

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
