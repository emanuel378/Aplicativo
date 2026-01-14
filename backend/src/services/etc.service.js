import { obterKc } from "./kc.service.js";

export function calcularETc({ eto, cultura, fase }) {
  if (eto == null) {
    throw new Error("ETo inválido");
  }

  const kc = obterKc(cultura, fase);
  const etc = eto * kc;

  return {
    eto,
    kc,
    etc: Number(etc.toFixed(2))
  };
}
