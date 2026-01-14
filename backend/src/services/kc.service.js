import culturas from "../data/culturas.json" with { type: "json" };


export function obterKc(cultura, fase) {
  const culturaData = culturas[cultura];

  if (!culturaData) {
    throw new Error("Cultura não encontrada");
  }

  const kc = culturaData.kc[fase];

  if (kc == null) {
    throw new Error("Fase inválida para a cultura");
  }

  return kc;
}
