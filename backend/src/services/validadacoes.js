
export function validarClima({
  tempMax,
  tempMin,
  umidade,
  vento,
  radiacao,
  pressao
}) {
  if (tempMax < -5 || tempMax > 45) {
    throw new Error("Temperatura máxima fora do limite agronômico");
  }

  if (tempMin < -10 || tempMin > 35) {
    throw new Error("Temperatura mínima fora do limite agronômico");
  }

  if (tempMin > tempMax) {
    throw new Error("Temperatura mínima maior que a máxima");
  }

  if (umidade < 0 || umidade > 100) {
    throw new Error("Umidade relativa inválida");
  }

  if (vento < 0 || vento > 20) {
    throw new Error("Velocidade do vento fora do padrão FAO");
  }

  if (radiacao < 0 || radiacao > 35) {
    throw new Error("Radiação solar fora do limite esperado");
  }

  if (pressao < 80 || pressao > 110) {
    throw new Error("Pressão atmosférica inválida");
  }

  return true;
}

/**
 * Garante que a ETo final seja agronomicamente válida
 */
export function validarETo(eto) {
  if (isNaN(eto)) {
    throw new Error("ETo inválida (NaN)");
  }

  if (eto < 0) return 0;

  if (eto > 15) return 15; // teto diário agronômico

  return Number(eto.toFixed(2));
}

/**
 * Valida o coeficiente de cultura (Kc)
 */
export function validarKc(kc) {
  if (isNaN(kc)) {
    throw new Error("Kc inválido");
  }

  if (kc < 0.2 || kc > 1.3) {
    throw new Error("Kc fora do intervalo agronômico");
  }

  return Number(kc.toFixed(2));
}

/**
 * Valida a evapotranspiração da cultura (ETc)
 */
export function validarETc(etc) {
  if (isNaN(etc)) {
    throw new Error("ETc inválida");
  }

  if (etc < 0) return 0;

  if (etc > 18) return 18;

  return Number(etc.toFixed(2));
}

/**
 * Valida cultura e fase fenológica
 */
export function validarCulturaEFase(cultura, fase, tabelaKc) {
  if (!tabelaKc[cultura]) {
    throw new Error("Cultura não cadastrada");
  }

  if (!tabelaKc[cultura].kcValores[fase]) {
    throw new Error("Fase fenológica inválida");
  }

  return true;
}

/**
 * Valida lâmina de irrigação recomendada
 */
export function validarLamina(lamina) {
  if (isNaN(lamina)) {
    throw new Error("Lâmina inválida");
  }

  if (lamina < 0) return 0;

  if (lamina > 25) return 25;

  return Number(lamina.toFixed(2));
}
