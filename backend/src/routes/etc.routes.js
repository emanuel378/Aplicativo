import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  const { eto, kc } = req.body;

  if (!eto || !kc) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const etc = Number(eto) * Number(kc);

  return res.json({
    eto,
    kc,
    etc
  });
});

export default router;
