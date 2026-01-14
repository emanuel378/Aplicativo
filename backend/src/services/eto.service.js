export function calcularEToFAO56(clima) {
  const {
    tempMax,
    tempMin,
    umidade,
    vento,
    radiacao
  } = clima;

  if (
    tempMax == null ||
    tempMin == null ||
    umidade == null ||
    vento == null ||
    radiacao == null
  ) {
    throw new Error("Dados climáticos insuficientes para ETo");
  }

  // Temperatura média
  const tempMedia = (tempMax + tempMin) / 2;

  // Converter vento de km/h para m/s
  const ventoMs = vento / 3.6;

  // FAO-56 simplificada e normalizada (mm/dia)
  const eto =
    0.408 * radiacao +
    0.5 * ventoMs * (1 - umidade / 100) +
    0.02 * (tempMax - tempMin);

  return Number(eto.toFixed(2));
}
