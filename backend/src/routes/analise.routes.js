import express from "express";
import { analisar } from "../controllers/analise.controller.js";

const router = express.Router();

router.post("/", analisar);

export default router;
