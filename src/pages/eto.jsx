// wastech/pages/eto.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Slider } from '@mui/material';
import { styled } from '@mui/material/styles';

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Ícone personalizado para localização atual
const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const selectedLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Slider customizado
const CustomSlider = styled(Slider)({
  color: '#22c55e',
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
  },
});

const API_KEY = "80131bb7e89396928dfc0e1f97f65471";

// Componente para mover o mapa
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 15);
    }
  }, [center, zoom, map]);
  
  return null;
}

const ETo = () => {
  const [position, setPosition] = useState([-15.7975, -47.8919]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [raio, setRaio] = useState(2000);
  const [mapCenter, setMapCenter] = useState([-15.7975, -47.8919]);
  const [mapZoom, setMapZoom] = useState(15);
  const [showCalculateButton, setShowCalculateButton] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  
  // Estados para histórico
  const [historico, setHistorico] = useState(() => {
    const saved = localStorage.getItem('etoHistorico');
    return saved ? JSON.parse(saved) : [];
  });
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  
  const [temperatura, setTemperatura] = useState("");
  const [umidade, setUmidade] = useState("");
  const [vento, setVento] = useState("");
  const [radiacao, setRadiacao] = useState("");
  const [resultadoManual, setResultadoManual] = useState(null);
  
  const mapRef = useRef(null);

  // ==========================================================
  // 📍 OBTER LOCALIZAÇÃO ATUAL COM ALTA PRECISÃO
  // ==========================================================
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log("Geolocalização não suportada.");
        setLocationError("Seu navegador não suporta geolocalização.");
        resolve([-15.7975, -47.8919]);
        return;
      }

      setIsGettingLocation(true);
      setLocationError(null);
      
      const options = {
        enableHighAccuracy: true, // ALTA PRECISÃO
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          const accuracy = pos.coords.accuracy;
          
          console.log("✅ Localização obtida:", {
            lat: newPos[0],
            lon: newPos[1],
            accuracy: `${accuracy}m`
          });
          
          setCurrentPosition(newPos);
          setPosition(newPos);
          setMapCenter(newPos);
          setSelectedArea({
            center: newPos,
            radius: raio
          });
          setLocationAccuracy(accuracy);
          setShowCalculateButton(true);
          setIsGettingLocation(false);
          
          // Ajustar zoom baseado na precisão
          let zoomLevel = 15;
          if (accuracy > 1000) zoomLevel = 12;
          else if (accuracy > 500) zoomLevel = 13;
          else if (accuracy > 100) zoomLevel = 14;
          setMapZoom(zoomLevel);
          
          // Ajustar raio baseado na precisão
          const novoRaio = Math.max(500, accuracy * 2);
          setRaio(novoRaio);
          
          resolve(newPos);
        },
        (err) => {
          console.error("❌ Erro na geolocalização:", err);
          
          let errorMsg = "Não foi possível obter sua localização.";
          switch(err.code) {
            case 1: // PERMISSION_DENIED
              errorMsg = "Permissão de localização negada. Por favor, permita o acesso.";
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMsg = "Localização indisponível. Verifique se o GPS está ativado.";
              break;
            case 3: // TIMEOUT
              errorMsg = "Tempo esgotado ao obter localização.";
              break;
          }
          
          setLocationError(errorMsg);
          
          // Usar fallback
          const fallbackPos = [-15.7975, -47.8919];
          setCurrentPosition(fallbackPos);
          setPosition(fallbackPos);
          setMapCenter(fallbackPos);
          setShowCalculateButton(true);
          setIsGettingLocation(false);
          
          resolve(fallbackPos);
        },
        options
      );
    });
  }, [raio]);

  // ==========================================================
  // 🗺️ HANDLE MAP CLICK
  // ==========================================================
  function MapClickHandler() {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        console.log("Mapa clicado:", lat, lng);
        
        setPosition([lat, lng]);
        setSelectedArea({
          center: [lat, lng],
          radius: raio
        });
        setShowCalculateButton(true);
        setData(null);
      },
    });

    return null;
  }

  // ==========================================================
  // 💾 SALVAR NO HISTÓRICO
  // ==========================================================
  const salvarNoHistorico = (dados) => {
    const novoRegistro = {
      id: Date.now(),
      data: new Date().toISOString(),
      lat: dados.lat,
      lon: dados.lon,
      cidade: dados.cidade || "Local selecionado",
      eto: dados.eto,
      raio: dados.raio,
      tipo: dados.tipo || "automático"
    };
    
    const novoHistorico = [novoRegistro, ...historico.slice(0, 9)];
    setHistorico(novoHistorico);
    localStorage.setItem('etoHistorico', JSON.stringify(novoHistorico));
  };

  // ==========================================================
  // 🎯 CALCULAR ETO PARA ÁREA SELECIONADA
  // ==========================================================
  const calcularEToParaArea = async () => {
    if (!position) {
      alert("Selecione uma localização no mapa primeiro!");
      return;
    }

    try {
      setLoading(true);
      setManualMode(false);
      
      const [lat, lon] = position;
      console.log(`Calculando ETo para área: ${lat}, ${lon} - Raio: ${raio}m`);
      
      // Gerar pontos de amostragem baseado no raio
      const pontos = gerarPontosAmostragem(lat, lon, raio);
      
      const allData = [];
      const promises = [];
      
      for (const [pointLat, pointLon] of pontos) {
        promises.push(
          fetchSinglePointWeather(pointLat, pointLon)
            .then(data => {
              if (data) allData.push(data);
            })
            .catch(error => {
              console.warn(`Erro no ponto ${pointLat}, ${pointLon}:`, error);
            })
        );
      }
      
      await Promise.all(promises);
      
      if (allData.length === 0) {
        alert("Não foi possível obter dados para esta área");
        return;
      }
      
      // Calcular médias ponderadas
      const avgData = calcularMediaPonderada(allData, raio);
      const eto = calcularEToFAO56(avgData);
      
      setData({
        lat,
        lon,
        ...avgData,
        eto,
        raio: raio,
        pontosAmostrados: allData.length
      });
      
      salvarNoHistorico({
        lat,
        lon,
        cidade: avgData.cidade,
        eto,
        raio: raio,
        tipo: "automático"
      });
      
      setSelectedArea({
        center: [lat, lon],
        radius: raio
      });
      
    } catch (error) {
      console.error("Erro ao buscar dados da área:", error);
      alert("Erro ao obter dados climáticos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 📊 GERAR PONTOS DE AMOSTRAGEM
  // ==========================================================
  const gerarPontosAmostragem = (lat, lon, radius) => {
    const pontos = [[lat, lon]];
    const radiusDeg = radius / 111000;
    let numPontosAdicionais = 0;
    
    if (radius <= 100) {
      numPontosAdicionais = 4;
    } else if (radius <= 1000) {
      numPontosAdicionais = 8;
    } else {
      numPontosAdicionais = 4;
    }
    
    for (let i = 0; i < numPontosAdicionais; i++) {
      const angulo = (360 / numPontosAdicionais) * i;
      const rad = angulo * Math.PI / 180;
      const distancia = radiusDeg * 0.5;
      const pointLat = lat + (Math.sin(rad) * distancia);
      const pointLon = lon + (Math.cos(rad) * distancia);
      pontos.push([pointLat, pointLon]);
    }
    
    return pontos;
  };

  // ==========================================================
  // ⚖️ CALCULAR MÉDIA PONDERADA
  // ==========================================================
  const calcularMediaPonderada = (dados, radius) => {
    const pesoCentro = radius <= 500 ? 1.0 : 2.0;
    
    let totalTempMax = 0;
    let totalTempMin = 0;
    let totalUmidade = 0;
    let totalVento = 0;
    let totalNuvens = 0;
    let totalRadiacao = 0;
    let totalPesos = 0;
    
    dados.forEach((dado, index) => {
      const peso = index === 0 ? pesoCentro : 1.0;
      
      totalTempMax += dado.tempMax * peso;
      totalTempMin += dado.tempMin * peso;
      totalUmidade += dado.umidade * peso;
      totalVento += dado.vento * peso;
      totalNuvens += dado.nuvens * peso;
      totalRadiacao += dado.radiacao * peso;
      totalPesos += peso;
    });
    
    return {
      tempMax: totalTempMax / totalPesos,
      tempMin: totalTempMin / totalPesos,
      umidade: Math.round(totalUmidade / totalPesos),
      vento: Number((totalVento / totalPesos).toFixed(1)),
      nuvens: Math.round(totalNuvens / totalPesos),
      radiacao: Number((totalRadiacao / totalPesos).toFixed(2)),
      cidade: dados[0].cidade || "Área selecionada",
      pais: dados[0].pais
    };
  };

  // ==========================================================
  // 🌦️ FETCH SINGLE POINT (OpenWeather)
  // ==========================================================
  const fetchSinglePointWeather = async (lat, lon) => {
    try {
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      
      if (!currentResponse.ok) throw new Error("Erro na API Current");
      const currentData = await currentResponse.json();
      
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      
      if (!forecastResponse.ok) throw new Error("Erro na API Forecast");
      const forecastData = await forecastResponse.json();
      
      const hoje = new Date();
      const hojeStr = hoje.toISOString().split('T')[0];
      
      const previsoesHoje = forecastData.list.filter(item => {
        const dataPrevisao = new Date(item.dt * 1000);
        const dataPrevisaoStr = dataPrevisao.toISOString().split('T')[0];
        return dataPrevisaoStr === hojeStr;
      });
      
      let tempMax = currentData.main.temp_max;
      let tempMin = currentData.main.temp_min;
      
      if (previsoesHoje.length > 0) {
        const temps = previsoesHoje.map(p => p.main.temp);
        tempMax = Math.max(...temps, tempMax);
        tempMin = Math.min(...temps, tempMin);
      }
      
      const nuvens = currentData.clouds.all;
      const radiacaoEstimada = calcularRadiacaoSolar(lat, lon, nuvens);
      
      return {
        tempMax,
        tempMin,
        umidade: currentData.main.humidity,
        vento: currentData.wind.speed,
        nuvens: nuvens,
        radiacao: radiacaoEstimada,
        cidade: currentData.name,
        pais: currentData.sys?.country
      };
      
    } catch (error) {
      console.error("Erro no ponto único:", error);
      throw error;
    }
  };

  // ==========================================================
  // ☀️ CALCULAR RADIAÇÃO SOLAR
  // ==========================================================
  const calcularRadiacaoSolar = (lat, lon, cloudCover) => {
    const hoje = new Date();
    const diaDoAno = Math.floor((hoje - new Date(hoje.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    
    const phi = lat * Math.PI / 180;
    const delta = 0.409 * Math.sin(2 * Math.PI / 365 * diaDoAno - 1.39);
    
    const Gsc = 0.0820;
    const dr = 1 + 0.033 * Math.cos(2 * Math.PI / 365 * diaDoAno);
    const omega_s = Math.acos(-Math.tan(phi) * Math.tan(delta));
    
    const Ra = 24 * 60 / Math.PI * Gsc * dr * (
      omega_s * Math.sin(phi) * Math.sin(delta) +
      Math.cos(phi) * Math.cos(delta) * Math.sin(omega_s)
    );
    
    const transmissivity = Math.max(0.1, 1 - (cloudCover / 100) * 0.7);
    const Rs = Ra * transmissivity;
    
    return Math.max(0, Math.min(Rs, 30));
  };

  // ==========================================================
  // 🧮 ETo (FAO-56 completo)
  // ==========================================================
  const calcularEToFAO56 = (d) => {
    try {
      const Tmean = (d.tempMax + d.tempMin) / 2;
      const RH = d.umidade;
      const u2 = Math.max(0.5, d.vento);
      
      const P = 101.3 * Math.pow((293 - 0.0065 * 0) / 293, 5.26);
      const gamma = 0.665e-3 * P;
      
      const delta = 4098 * (0.6108 * Math.exp(17.27 * Tmean / (Tmean + 237.3))) / 
                   Math.pow(Tmean + 237.3, 2);
      
      const es = 0.6108 * Math.exp(17.27 * Tmean / (Tmean + 237.3));
      const ea = es * RH / 100;
      const VPD = Math.max(0.1, es - ea);
      
      const Rs = d.radiacao || 15;
      const Rns = 0.77 * Rs;
      const Rnl = 4.903e-9 * Math.pow(Tmean + 273, 4) * (0.34 - 0.14 * Math.sqrt(ea)) * 
                  (1.35 * (Rs / (0.75 * 25)) - 0.35);
      const Rn = Rns - Rnl;
      const G = 0;
      
      const numerator = 0.408 * delta * (Rn - G) + gamma * (900 / (Tmean + 273)) * u2 * VPD;
      const denominator = delta + gamma * (1 + 0.34 * u2);
      
      const eto = Math.max(0, numerator / denominator);
      
      return Math.min(eto, 15).toFixed(2);
    } catch (error) {
      console.error("Erro no cálculo ETo:", error);
      return "0.00";
    }
  };

  // ==========================================================
  // 📏 HANDLE SLIDER CHANGE
  // ==========================================================
  const handleRaioChange = (event, newValue) => {
    setRaio(newValue);
    
    if (position) {
      setSelectedArea({
        center: position,
        radius: newValue
      });
    }
  };

  // ==========================================================
  // 🎯 FORMATAR RAIO PARA EXIBIÇÃO
  // ==========================================================
  const formatRaio = (metros) => {
    if (metros < 1000) {
      return `${metros} metros`;
    } else if (metros < 10000) {
      return `${(metros / 1000).toFixed(1)} km`;
    } else {
      return `${Math.round(metros / 1000)} km`;
    }
  };

  // ==========================================================
  // 🗑️ LIMPAR HISTÓRICO
  // ==========================================================
  const limparHistorico = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o histórico?")) {
      setHistorico([]);
      localStorage.removeItem('etoHistorico');
    }
  };

  // ==========================================================
  // 📅 FORMATAR DATA
  // ==========================================================
  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==========================================================
  // ✍️ CÁLCULO MANUAL
  // ==========================================================
  const calcularEToManual = () => {
    if (!temperatura || !umidade || !vento || !radiacao) {
      alert("Preencha todos os campos!");
      return;
    }

    const temp = parseFloat(temperatura);
    const umid = parseFloat(umidade);
    const vel = parseFloat(vento);
    const rad = parseFloat(radiacao);

    if ([temp, umid, vel, rad].some(isNaN)) {
      alert("Valores inválidos!");
      return;
    }

    const dados = {
      tempMax: temp,
      tempMin: temp - 5,
      umidade: umid,
      vento: Math.max(0.5, vel),
      radiacao: rad
    };
    
    const eto = calcularEToFAO56(dados);
    setResultadoManual(eto);
    setManualMode(true);
    
    // Salvar no histórico
    const registroManual = {
      id: Date.now(),
      data: new Date().toISOString(),
      tipo: "manual",
      eto: eto,
      temperatura: temp,
      umidade: umid,
      vento: vel,
      radiacao: rad
    };
    
    const novoHistorico = [registroManual, ...historico.slice(0, 9)];
    setHistorico(novoHistorico);
    localStorage.setItem('etoHistorico', JSON.stringify(novoHistorico));
  };

  const limparCampos = () => {
    setTemperatura("");
    setUmidade("");
    setVento("");
    setRadiacao("");
    setResultadoManual(null);
    setManualMode(false);
  };

  // ==========================================================
  // 🎯 OBTER LOCALIZAÇÃO AO INICIAR
  // ==========================================================
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // ==========================================================
  // 🗺️ BOTÃO PARA IR PARA MINHA LOCALIZAÇÃO
  // ==========================================================
  const irParaMinhaLocalizacao = () => {
    if (currentPosition) {
      setMapCenter(currentPosition);
      setMapZoom(16);
      setPosition(currentPosition);
      setSelectedArea({
        center: currentPosition,
        radius: raio
      });
    } else {
      getCurrentLocation();
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌱 Calculadora de ETo</h1>
      
      {/* Status da Localização */}
      {locationError && (
        <div style={styles.errorBox}>
          <strong>⚠️ {locationError}</strong>
        </div>
      )}
      
      {locationAccuracy && (
        <div style={styles.accuracyBox}>
          Precisão da localização: {Math.round(locationAccuracy)} metros
        </div>
      )}

      {/* Controles principais */}
      <div style={styles.controlsRow}>
        <button
          onClick={irParaMinhaLocalizacao}
          disabled={isGettingLocation}
          style={{
            ...styles.geoButton,
            backgroundColor: isGettingLocation ? "#94a3b8" : "#22c55e",
          }}
        >
          {isGettingLocation ? "📍 Buscando..." : "📍 Minha Localização"}
        </button>
        
        {showCalculateButton && position && (
          <button
            onClick={calcularEToParaArea}
            disabled={loading}
            style={{
              ...styles.calcButton,
              backgroundColor: loading ? "#94a3b8" : "#3b82f6",
            }}
          >
            {loading ? "⏳ Calculando..." : "🚀 Calcular ETo da Área"}
          </button>
        )}
        
        <button 
          onClick={() => setMostrarHistorico(!mostrarHistorico)} 
          style={styles.historyButton}
        >
          {mostrarHistorico ? "📋 Ocultar Histórico" : "📋 Ver Histórico"}
        </button>
      </div>

      {/* Controle de raio */}
      <div style={styles.raioContainer}>
        <h3 style={styles.raioTitle}>📏 Tamanho da Área de Cálculo</h3>
        
        <div style={styles.raioSliderContainer}>
          <div style={styles.raioLabels}>
            <span>50m</span>
            <span>500m</span>
            <span>2km</span>
            <span>5km</span>
            <span>15km</span>
          </div>
          
          <CustomSlider
            value={raio}
            onChange={handleRaioChange}
            min={50}
            max={15000}
            step={10}
            valueLabelDisplay="auto"
            valueLabelFormat={formatRaio}
            style={styles.slider}
          />
          
          <div style={styles.raioValueDisplay}>
            <span style={styles.raioValue}>{formatRaio(raio)}</span>
            <span style={styles.raioDesc}>raio da área</span>
          </div>
        </div>
      </div>

      {/* Mapa Melhorado */}
      <div style={styles.mapSection}>
        <div style={styles.mapHeader}>
          <h3 style={styles.mapTitle}>🗺️ Selecione a Área no Mapa</h3>
          <div style={styles.mapLegend}>
            <div style={styles.legendItem}>
              <div style={{...styles.legendIcon, backgroundColor: '#3b82f6'}}></div>
              <span>Área de cálculo</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendIcon, backgroundColor: '#dc2626'}}></div>
              <span>Local selecionado</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendIcon, backgroundColor: '#2563eb'}}></div>
              <span>Sua localização</span>
            </div>
          </div>
        </div>
        
        <div style={styles.mapContainer}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={styles.map}
            whenCreated={(map) => {
              mapRef.current = map;
            }}
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Camada adicional para melhor visualização */}
            <TileLayer
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
              opacity={0.5}
            />
            
            <ChangeMapView center={mapCenter} zoom={mapZoom} />
            
            <MapClickHandler />
            
            {/* Marcador da localização selecionada */}
            {position && (
              <Marker 
                position={position}
                icon={selectedLocationIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const newPos = marker.getLatLng();
                    setPosition([newPos.lat, newPos.lng]);
                    setSelectedArea({
                      center: [newPos.lat, newPos.lng],
                      radius: raio
                    });
                    setShowCalculateButton(true);
                    setData(null);
                  }
                }}
              >
                <Popup style={styles.popup}>
                  <div style={styles.popupContent}>
                    <div style={styles.popupIcon}>📍</div>
                    <div>
                      <strong style={styles.popupTitle}>Área Selecionada</strong>
                      <div style={styles.popupInfo}>
                        <div>Lat: {position[0].toFixed(6)}</div>
                        <div>Lon: {position[1].toFixed(6)}</div>
                        <div>Raio: {formatRaio(raio)}</div>
                      </div>
                      <button 
                        onClick={() => calcularEToParaArea()} 
                        style={styles.popupButton}
                      >
                        Calcular ETo Aqui
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Marcador da localização atual */}
            {currentPosition && 
             currentPosition[0] !== position[0] && 
             currentPosition[1] !== position[1] && (
              <Marker 
                position={currentPosition}
                icon={currentLocationIcon}
              >
                <Popup style={styles.popup}>
                  <div style={styles.popupContent}>
                    <div style={styles.popupIcon}>📍</div>
                    <div>
                      <strong style={styles.popupTitle}>Sua Localização</strong>
                      <div style={styles.popupInfo}>
                        <div>Lat: {currentPosition[0].toFixed(6)}</div>
                        <div>Lon: {currentPosition[1].toFixed(6)}</div>
                        {locationAccuracy && (
                          <div>Precisão: {Math.round(locationAccuracy)}m</div>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          setPosition(currentPosition);
                          setSelectedArea({
                            center: currentPosition,
                            radius: raio
                          });
                          setShowCalculateButton(true);
                        }}
                        style={styles.popupButton}
                      >
                        Usar Esta Localização
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Círculo mostrando a área de cálculo */}
            {selectedArea && (
              <Circle
                center={selectedArea.center}
                radius={raio}
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  color: '#1d4ed8',
                  weight: 3,
                  dashArray: '10, 5',
                  className: 'area-circle'
                }}
              >
                <Popup>
                  <div style={styles.areaPopup}>
                    <strong>Área de Cálculo</strong><br/>
                    Raio: {formatRaio(raio)}<br/>
                    Área: {Math.PI * (raio * raio / 1000000).toFixed(2)} km²
                  </div>
                </Popup>
              </Circle>
            )}
            
            {/* Grid de referência para áreas grandes */}
            {raio > 5000 && (
              <Circle
                center={selectedArea?.center || position || mapCenter}
                radius={raio}
                pathOptions={{
                  fillColor: 'transparent',
                  color: '#64748b',
                  weight: 1,
                  opacity: 0.3,
                  dashArray: '20, 20'
                }}
              />
            )}
          </MapContainer>
          
          {/* Controles do mapa */}
          <div style={styles.mapControls}>
            <button 
              onClick={() => mapRef.current?.zoomIn()}
              style={styles.controlButton}
              title="Zoom In"
            >
              ➕
            </button>
            <button 
              onClick={() => mapRef.current?.zoomOut()}
              style={styles.controlButton}
              title="Zoom Out"
            >
              ➖
            </button>
            <button 
              onClick={() => {
                if (currentPosition) {
                  mapRef.current?.flyTo(currentPosition, 16);
                }
              }}
              style={styles.controlButton}
              title="Ir para minha localização"
            >
              📍
            </button>
            <button 
              onClick={() => mapRef.current?.locate()}
              style={styles.controlButton}
              title="Localizar-me"
            >
              🔍
            </button>
          </div>
          
          <div style={styles.mapInstructions}>
            <p>💡 <strong>Clique no mapa</strong> para selecionar uma área</p>
            <p>📏 <strong>Ajuste o tamanho</strong> da área com o slider acima</p>
            <p>📍 <strong>Arraste o marcador vermelho</strong> para ajustar a posição</p>
            <p>🚀 <strong>Clique em "Calcular ETo da Área"</strong> para obter resultados</p>
          </div>
        </div>
      </div>

      {/* Histórico */}
      {mostrarHistorico && (
        <div style={styles.historicoContainer}>
          <div style={styles.historicoHeader}>
            <h3 style={styles.historicoTitle}>📋 Histórico de Cálculos</h3>
            <button onClick={limparHistorico} style={styles.limparHistoricoBtn}>
              🗑️ Limpar
            </button>
          </div>
          
          {historico.length === 0 ? (
            <div style={styles.historicoVazio}>
              Nenhum cálculo realizado ainda
            </div>
          ) : (
            <div style={styles.historicoList}>
              {historico.map((item) => (
                <div key={item.id} style={styles.historicoItem}>
                  <div style={styles.historicoItemHeader}>
                    <span style={styles.historicoData}>{formatarData(item.data)}</span>
                    <span style={{
                      ...styles.historicoTipo,
                      backgroundColor: item.tipo === 'manual' ? '#f59e0b' : '#3b82f6'
                    }}>
                      {item.tipo === 'manual' ? 'Manual' : 'Automático'}
                    </span>
                  </div>
                  
                  {item.tipo === 'automático' ? (
                    <div style={styles.historicoContent}>
                      <div style={styles.historicoLocal}>
                        <strong>{item.cidade}</strong>
                        <span>Lat: {item.lat?.toFixed(4)}, Lon: {item.lon?.toFixed(4)}</span>
                      </div>
                      <div style={styles.historicoEto}>
                        <span>ETo: </span>
                        <strong style={styles.historicoEtoValue}>{item.eto} mm/dia</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.historicoContent}>
                      <div style={styles.historicoDados}>
                        <span>Temp: {item.temperatura}°C</span>
                        <span>Umidade: {item.umidade}%</span>
                        <span>Vento: {item.vento} m/s</span>
                      </div>
                      <div style={styles.historicoEto}>
                        <span>ETo: </span>
                        <strong style={styles.historicoEtoValue}>{item.eto} mm/dia</strong>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resultados */}
      {data && !manualMode && (
        <div style={styles.resultCard}>
          <div style={styles.resultHeader}>
            <h3 style={styles.resultTitle}>
              📊 ETo para {data.cidade} (Área de {formatRaio(data.raio)})
            </h3>
            <div style={styles.resultSubtitle}>
              {new Date().toLocaleDateString('pt-BR')} • {data.pontosAmostrados} pontos amostrados
            </div>
          </div>
          
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statIcon}>🌡️</div>
              <div>
                <div style={styles.statLabel}>Temperatura</div>
                <div style={styles.statValue}>
                  {data.tempMax.toFixed(1)}°C / {data.tempMin.toFixed(1)}°C
                </div>
              </div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>💧</div>
              <div>
                <div style={styles.statLabel}>Umidade</div>
                <div style={styles.statValue}>{data.umidade}%</div>
              </div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>💨</div>
              <div>
                <div style={styles.statLabel}>Vento</div>
                <div style={styles.statValue}>{data.vento} m/s</div>
              </div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>☀️</div>
              <div>
                <div style={styles.statLabel}>Radiação</div>
                <div style={styles.statValue}>{data.radiacao.toFixed(1)} MJ/m²</div>
              </div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>📍</div>
              <div>
                <div style={styles.statLabel}>Coordenadas</div>
                <div style={styles.statValue}>
                  {data.lat.toFixed(4)}, {data.lon.toFixed(4)}
                </div>
              </div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>📐</div>
              <div>
                <div style={styles.statLabel}>Área</div>
                <div style={styles.statValue}>{formatRaio(data.raio)}</div>
              </div>
            </div>
          </div>
          
          <div style={styles.etoDisplay}>
            <div style={styles.etoLabel}>EVAPOTRANSPIRAÇÃO DE REFERÊNCIA (FAO-56)</div>
            <div style={styles.etoValue}>{data.eto} mm/dia</div>
            <div style={styles.etoSubtitle}>
              Baseado em {data.pontosAmostrados} pontos na área de {formatRaio(data.raio)}
            </div>
          </div>
        </div>
      )}

      {/* Cálculo Manual */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📝 Cálculo Manual</h3>
        
        <div style={styles.inputGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Temperatura Média (°C)</label>
            <input 
              type="number" 
              placeholder="Ex: 25" 
              value={temperatura} 
              onChange={(e) => setTemperatura(e.target.value)} 
              style={styles.input} 
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Umidade Relativa (%)</label>
            <input 
              type="number" 
              placeholder="Ex: 65" 
              value={umidade} 
              onChange={(e) => setUmidade(e.target.value)} 
              style={styles.input} 
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Vento (m/s)</label>
            <input 
              type="number" 
              step="0.1"
              placeholder="Ex: 2.5" 
              value={vento} 
              onChange={(e) => setVento(e.target.value)} 
              style={styles.input} 
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Radiação (MJ/m²/dia)</label>
            <input 
              type="number" 
              step="0.1"
              placeholder="Ex: 18.5" 
              value={radiacao} 
              onChange={(e) => setRadiacao(e.target.value)} 
              style={styles.input} 
            />
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            onClick={calcularEToManual} 
            style={styles.button}
          >
            Calcular Manualmente
          </button>
          <button onClick={limparCampos} style={styles.buttonSecondary}>
            Limpar Campos
          </button>
        </div>

        {resultadoManual && (
          <div style={styles.manualResult}>
            <h4>📐 Resultado Manual:</h4>
            <div style={styles.manualValue}>ETo = {resultadoManual} mm/dia</div>
          </div>
        )}
      </div>

      {/* Navegação */}
      <div style={styles.linkContainer}>
        <Link to="/dashboard" style={styles.navLink}>
          <button style={styles.navButton}>← Voltar</button>
        </Link>
        <Link to="/etcc" style={styles.navLink}>
          <button style={styles.navButton}>ETc →</button>
        </Link>
      </div>
      
      <div style={styles.footer}>
        <p style={styles.footerText}>
          <strong>📍 Nota:</strong> Localização obtida via GPS do dispositivo. 
          {locationAccuracy && ` Precisão: ${Math.round(locationAccuracy)} metros.`}
        </p>
      </div>
    </div>
  );
};

// ==========================================================
// 🎨 ESTILOS ATUALIZADOS
// ==========================================================
const styles = {
  container: { 
    padding: 20, 
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", 
    minHeight: "100vh", 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" 
  },
  title: { 
    fontSize: 32, 
    fontWeight: "800", 
    marginBottom: 24,
    color: "#0f172a",
    textAlign: "center",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
    background: "linear-gradient(135deg, #1d4ed8 0%, #22c55e 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  errorBox: {
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    border: "2px solid #ef4444",
    borderRadius: 12,
    padding: "12px 16px",
    marginBottom: 16,
    color: "#dc2626",
    textAlign: "center",
    width: "100%",
    maxWidth: 800,
    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.2)"
  },
  accuracyBox: {
    background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
    border: "2px solid #0ea5e9",
    borderRadius: 12,
    padding: "10px 16px",
    marginBottom: 16,
    color: "#0369a1",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
    width: "100%",
    maxWidth: 800,
    boxShadow: "0 2px 8px rgba(14, 165, 233, 0.2)"
  },
  controlsRow: {
    display: "flex",
    gap: 12,
    width: "100%",
    maxWidth: 800,
    marginBottom: 24,
    flexWrap: "wrap"
  },
  geoButton: { 
    flex: "1 1 200px",
    color: "#fff", 
    border: "none", 
    borderRadius: 12, 
    padding: "16px", 
    fontSize: 15, 
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  calcButton: { 
    flex: "2 1 300px",
    color: "#fff", 
    border: "none", 
    borderRadius: 12, 
    padding: "16px", 
    fontSize: 15, 
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  historyButton: {
    flex: "1 1 200px",
    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    color: "#fff", 
    border: "none", 
    borderRadius: 12, 
    padding: "16px", 
    fontSize: 15, 
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  raioContainer: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    padding: 24,
    borderRadius: 16,
    width: "100%",
    maxWidth: 800,
    marginBottom: 24,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e2e8f0"
  },
  raioTitle: {
    marginTop: 0,
    marginBottom: 20,
    color: "#1e293b",
    fontSize: 20,
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  raioSliderContainer: {
    marginBottom: 10,
    padding: "0 10px"
  },
  raioLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500"
  },
  slider: {
    margin: "20px 0",
    padding: "10px 0"
  },
  raioValueDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 20,
    padding: "16px",
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    borderRadius: 12,
    border: "2px solid #0ea5e9"
  },
  raioValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1d4ed8",
    textShadow: "0 2px 4px rgba(29, 78, 216, 0.1)"
  },
  raioDesc: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500"
  },
  // NOVOS ESTILOS PARA O MAPA
  mapSection: {
    width: "100%",
    maxWidth: 800,
    marginBottom: 24
  },
  mapHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 12
  },
  mapTitle: {
    margin: 0,
    color: "#1e293b",
    fontSize: 20,
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  mapLegend: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap"
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#475569",
    fontWeight: "500"
  },
  legendIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    border: "2px solid white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  mapContainer: {
    width: "100%",
    height: 500,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
    border: "3px solid #ffffff"
  },
  map: {
    width: "100%",
    height: "100%"
  },
  popup: {
    padding: 0,
    borderRadius: 12
  },
  popupContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: 16
  },
  popupIcon: {
    fontSize: 24,
    marginTop: 4
  },
  popupTitle: {
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 8,
    display: "block"
  },
  popupInfo: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
    marginBottom: 12
  },
  popupButton: {
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    width: "100%"
  },
  areaPopup: {
    padding: 12,
    fontSize: 14,
    color: "#1e293b"
  },
  mapControls: {
    position: "absolute",
    bottom: 20,
    right: 20,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 1000
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "white",
    border: "2px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  },
  mapInstructions: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    padding: "16px 24px",
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.6,
    borderTop: "1px solid #e2e8f0",
    textAlign: "center",
    fontWeight: "500",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  // ESTILOS EXISTENTES
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 800,
    marginBottom: 20,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 20,
    color: "#2d3748",
    fontSize: 20
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 24
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column"
  },
  inputLabel: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 8,
    fontWeight: "500"
  },
  input: {
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 16,
    transition: "all 0.3s ease",
    backgroundColor: "#f8fafc"
  },
  buttonGroup: {
    display: "flex",
    gap: 12,
    marginBottom: 20
  },
  button: {
    flex: 1,
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  buttonSecondary: {
    flex: 1,
    background: "#6b7280",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  manualResult: {
    background: "#fef3c7",
    padding: 20,
    borderRadius: 8,
    textAlign: "center",
    border: "1px solid #fbbf24"
  },
  manualValue: {
    color: "#d97706",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8
  },
  linkContainer: {
    display: "flex",
    gap: 12,
    width: "100%",
    maxWidth: 800,
    marginBottom: 20
  },
  navLink: {
    flex: 1,
    textDecoration: "none"
  },
  navButton: {
    width: "100%",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  footer: {
    width: "100%",
    maxWidth: 800,
    textAlign: "center",
    padding: "16px",
    borderTop: "1px solid #e2e8f0",
    marginTop: 20
  },
  footerText: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 1.6
  },
  // ESTILOS DO HISTÓRICO E RESULTADOS (ADICIONE AQUI)
  historicoContainer: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    maxWidth: 800,
    marginBottom: 20,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  },
  historicoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  },
  historicoTitle: {
    margin: 0,
    color: "#1e293b",
    fontSize: 18
  },
  limparHistoricoBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 12,
    cursor: "pointer"
  },
  historicoVazio: {
    textAlign: "center",
    padding: 30,
    color: "#94a3b8",
    fontStyle: "italic"
  },
  historicoList: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  historicoItem: {
    background: "#f8fafc",
    padding: 15,
    borderRadius: 6,
    borderLeft: "4px solid #3b82f6"
  },
  historicoItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  historicoData: {
    fontSize: 12,
    color: "#64748b"
  },
  historicoTipo: {
    fontSize: 11,
    color: "#fff",
    padding: "3px 8px",
    borderRadius: 12,
    fontWeight: "bold"
  },
  historicoContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  historicoLocal: {
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  historicoDados: {
    display: "flex",
    gap: 15,
    fontSize: 13,
    color: "#475569"
  },
  historicoEto: {
    display: "flex",
    alignItems: "baseline",
    gap: 8
  },
  historicoEtoValue: {
    fontSize: 20,
    color: "#059669"
  },
  resultCard: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 800,
    marginBottom: 20,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  },
  resultHeader: {
    marginBottom: 24
  },
  resultTitle: {
    marginTop: 0,
    marginBottom: 8,
    color: "#2d3748",
    fontSize: 20
  },
  resultSubtitle: {
    fontSize: 14,
    color: "#64748b"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 24
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#f8fafc",
    padding: 16,
    borderRadius: 8
  },
  statIcon: {
    fontSize: 24
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b"
  },
  etoDisplay: {
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    padding: "24px 32px",
    borderRadius: 12,
    textAlign: "center",
    color: "white"
  },
  etoLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: "0.05em",
    marginBottom: 8,
    opacity: 0.9
  },
  etoValue: {
    fontSize: 48,
    fontWeight: "bold",
    margin: "12px 0"
  },
  etoSubtitle: {
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 1.5
  }
};

export default ETo;