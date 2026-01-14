import express from "express";
import cors from "cors";

import analiseRoutes from "./routes/analise.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// rotas
app.use("/analise", analiseRoutes);

export default app;
