import { obterDadosClimaticos } from "../services/clima.service.js";

import { calcularEToFAO56 } from "../services/eto.service.js";
import { calcularETc } from "../services/etc.service.js";

export async function analisar(req, res) {
  const { latitude, longitude, cultura, fase } = req.body;

  if (!latitude || !longitude || !cultura || !fase) {
    return res.status(400).json({
      erro: "Dados incompletos para análise"
    });
  }

  try {
    // 1️⃣ Buscar clima real
    const climaApi = await getClima(latitude, longitude);

    const clima = {
      tempMax: climaApi.daily.temperature_2m_max[0],
      tempMin: climaApi.daily.temperature_2m_min[0],
      umidade: 60, // Open-Meteo nem sempre envia atual → valor médio
      vento: climaApi.current_weather.windspeed,
      radiacao: climaApi.daily.shortwave_radiation_sum[0]
    };

    // 2️⃣ Calcular ETo
    const eto = calcularEToFAO56(clima);

    // 3️⃣ Calcular ETc
    const resultado = calcularETc({
      eto,
      cultura,
      fase
    });

    return res.json({
      status: "ok",
      clima,
      resultado
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      erro: error.message
    });
  }
}
