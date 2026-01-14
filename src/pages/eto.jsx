import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:3333/api/analise";

// Fix ícone Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function ETo() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  // ===============================
  // 📍 CLIQUE NO MAPA
  // ===============================
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setResultado(null);
      },
    });
    return null;
  }

  // ===============================
  // 🌱 CALCULAR ETo (BACKEND)
  // ===============================
  const calcularETo = async () => {
    if (!position) {
      alert("Clique no mapa para escolher a localização");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: position[0],
          longitude: position[1],
          cultura: "alface",
          fase: "fase3",
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        alert(json.erro || "Erro no backend");
        return;
      }

      setResultado(json);
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🌱 Calculadora de ETo</h1>

      {/* MAPA */}
      <div style={styles.mapContainer}>
        <MapContainer
          center={[-3.7327, -40.9921]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler />

          {position && (
            <Marker position={position}>
              <Popup>
                📍 Local selecionado <br />
                Lat: {position[0].toFixed(5)} <br />
                Lon: {position[1].toFixed(5)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <button onClick={calcularETo} disabled={loading} style={styles.calcBtn}>
        {loading ? "Calculando..." : "🚀 Calcular ETo da Área"}
      </button>

      {/* RESULTADO */}
      {resultado && (
        <div style={styles.card}>
          <h3>📊 Resultado</h3>
          <p><strong>ETo:</strong> {resultado.resultado.eto} mm/dia</p>
          <p>Temp Máx: {resultado.clima.tempMax} °C</p>
          <p>Temp Mín: {resultado.clima.tempMin} °C</p>
          <p>Umidade: {resultado.clima.umidade}%</p>
          <p>Vento: {resultado.clima.vento} m/s</p>
          <p>Radiação: {resultado.clima.radiacao} MJ/m²</p>
        </div>
      )}

      <Link to="/dashboard">
        <button style={styles.backBtn}>← Voltar</button>
      </Link>
    </div>
  );
}

// ===============================
// 🎨 ESTILOS
// ===============================
const styles = {
  container: {
    minHeight: "100vh",
    padding: 20,
    background: "#f1f8f1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 15,
  },
  mapContainer: {
    width: "100%",
    maxWidth: 600,
    height: 350,
    borderRadius: 12,
    overflow: "hidden",
    border: "2px solid #22c55e",
  },
  calcBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
  },
  backBtn: {
    background: "#64748b",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 8,
  },
};
