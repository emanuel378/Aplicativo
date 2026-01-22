// wastech/pages/etcc.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

/* ===============================
   🌱 DADOS KC (FRONT)
================================ */
const culturas = [
  {
    nome: "Alface",
    kcValores: { fase1: 0.4, fase2: 0.7, fase3: 1.0, fase4: 0.8 }
  },
  {
    nome: "Milho",
    kcValores: { fase1: 0.5, fase2: 0.9, fase3: 1.2, fase4: 0.6 }
  },
  {
    nome: "Feijão",
    kcValores: { fase1: 0.4, fase2: 0.8, fase3: 1.1, fase4: 0.7 }
  },
  {
    nome: "Arroz",
    kcValores: { fase1: 1.05, fase2: 1.2, fase3: 1.2, fase4: 0.9 }
  },
  {
    nome: "Trigo",
    kcValores: { fase1: 0.4, fase2: 0.8, fase3: 1.15, fase4: 0.4 }
  },
  {
    nome: "Soja",
    kcValores: { fase1: 0.5, fase2: 0.9, fase3: 1.15, fase4: 0.5 }
  },
  {
    nome: "Cana-de-açúcar",
    kcValores: { fase1: 0.4, fase2: 0.75, fase3: 1.25, fase4: 0.9 }
  },
  {
    nome: "Tomate",
    kcValores: { fase1: 0.6, fase2: 1.15, fase3: 1.15, fase4: 0.8 }
  },
  {
    nome: "Batata",
    kcValores: { fase1: 0.5, fase2: 0.85, fase3: 1.15, fase4: 0.75 }
  },
  {
    nome: "Cebola",
    kcValores: { fase1: 0.7, fase2: 1.05, fase3: 1.05, fase4: 0.85 }
  },
  {
    nome: "Cenoura",
    kcValores: { fase1: 0.7, fase2: 1.0, fase3: 1.05, fase4: 0.95 }
  },
  {
    nome: "Repolho",
    kcValores: { fase1: 0.7, fase2: 1.05, fase3: 1.05, fase4: 0.95 }
  },
  {
    nome: "Pepino",
    kcValores: { fase1: 0.6, fase2: 1.0, fase3: 1.1, fase4: 0.75 }
  },
  {
    nome: "Abóbora",
    kcValores: { fase1: 0.5, fase2: 0.9, fase3: 1.05, fase4: 0.8 }
  },
  {
    nome: "Melancia",
    kcValores: { fase1: 0.4, fase2: 0.85, fase3: 1.05, fase4: 0.75 }
  },
  {
    nome: "Melão",
    kcValores: { fase1: 0.5, fase2: 0.9, fase3: 1.05, fase4: 0.75 }
  },
  {
    nome: "Banana",
    kcValores: { fase1: 0.5, fase2: 0.9, fase3: 1.2, fase4: 1.1 }
  },
  {
    nome: "Manga",
    kcValores: { fase1: 0.4, fase2: 0.75, fase3: 1.0, fase4: 0.8 }
  },
  {
    nome: "Laranja",
    kcValores: { fase1: 0.6, fase2: 0.85, fase3: 1.0, fase4: 0.8 }
  },
  {
    nome: "Maçã",
    kcValores: { fase1: 0.5, fase2: 0.85, fase3: 1.0, fase4: 0.7 }
  },
  {
    nome: "Uva",
    kcValores: { fase1: 0.3, fase2: 0.7, fase3: 0.95, fase4: 0.6 }
  },
  {
    nome: "Café",
    kcValores: { fase1: 0.4, fase2: 0.8, fase3: 1.1, fase4: 0.9 }
  },
  {
    nome: "Algodão",
    kcValores: { fase1: 0.35, fase2: 0.75, fase3: 1.15, fase4: 0.7 }
  },
  {
    nome: "Girassol",
    kcValores: { fase1: 0.4, fase2: 0.8, fase3: 1.1, fase4: 0.6 }
  },
  {
    nome: "Sorgo",
    kcValores: { fase1: 0.35, fase2: 0.75, fase3: 1.1, fase4: 0.6 }
  },
  {
    nome: "Amendoim",
    kcValores: { fase1: 0.4, fase2: 0.8, fase3: 1.05, fase4: 0.6 }
  }
];


const fasesMap = {
  fase1: "Fase 1 - Inicial",
  fase2: "Fase 2 - Desenvolvimento",
  fase3: "Fase 3 - Meio",
  fase4: "Fase 4 - Final"
};

const ETCC = () => {
  const [eto, setEto] = useState("");
  const [culturaSelecionada, setCulturaSelecionada] = useState("");
  const [faseSelecionada, setFaseSelecionada] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const cultura = useMemo(() => {
    return culturas.find(c => c.nome === culturaSelecionada);
  }, [culturaSelecionada]);

  const calcularEtc = async () => {
    if (!eto || !cultura || !faseSelecionada) {
      alert("Preencha todos os campos");
      return;
    }

    const kc = cultura.kcValores[faseSelecionada];

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3333/api/etc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eto: Number(eto),
          kc,
          cultura: cultura.nome,
          fase: faseSelecionada
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao calcular ETc");
      }

      const data = await response.json();

      setResultado({
        cultura: cultura.nome,
        fase: faseSelecionada,
        kc,
        eto,
        etc: data.etc
      });

    } catch (error) {
      alert("Erro ao conectar com o backend");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const limparCampos = () => {
    setEto("");
    setCulturaSelecionada("");
    setFaseSelecionada("");
    setResultado(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Calculadora de ETc</h1>
      <p style={styles.pageSubtitle}>Evapotranspiração da Cultura</p>

      <div style={styles.card}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>🌤️ ETo (mm/dia)</label>
          <input
            type="number"
            step="0.1"
            value={eto}
            onChange={(e) => setEto(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>🌱 Cultura</label>
          <select
            value={culturaSelecionada}
            onChange={(e) => {
              setCulturaSelecionada(e.target.value);
              setFaseSelecionada("");
            }}
            style={styles.select}
          >
            <option value="">Selecione</option>
            {culturas.map((c, i) => (
              <option key={i} value={c.nome}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>📈 Fase</label>
          <select
            value={faseSelecionada}
            onChange={(e) => setFaseSelecionada(e.target.value)}
            style={styles.select}
            disabled={!cultura}
          >
            <option value="">Selecione</option>
            <option value="fase1">Fase 1</option>
            <option value="fase2">Fase 2</option>
            <option value="fase3">Fase 3</option>
            <option value="fase4">Fase 4</option>
          </select>
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={calcularEtc} style={styles.button} disabled={loading}>
            {loading ? "Calculando..." : "🧮 Calcular ETc"}
          </button>
          <button onClick={limparCampos} style={styles.buttonSecondary}>
            🗑️ Limpar
          </button>
        </div>

        {resultado && (
          <div style={styles.resultado}>
            <h3>📊 Resultado</h3>
            <p><strong>Cultura:</strong> {resultado.cultura}</p>
            <p><strong>Fase:</strong> {fasesMap[resultado.fase]}</p>
            <p><strong>Kc:</strong> {resultado.kc}</p>
            <p><strong>ETo:</strong> {resultado.eto} mm/dia</p>
            <h4>💧 ETc = {resultado.etc.toFixed(2)} mm/dia</h4>
          </div>
        )}
      </div>

      <div style={styles.linkContainer}>
        <Link to="/eto"><button style={styles.buttonSecondary}>↩️ Voltar</button></Link>
        <Link to="/dashboard"><button style={styles.button}>🏠 Dashboard</button></Link>
      </div>
    </div>
  );
};

/* ===============================
   🎨 ESTILOS
================================ */
const styles = {
  container: { padding: 20, background: "#f1f8f1", minHeight: "100vh" },
  title: { textAlign: "center", fontSize: 32, color: "#1a3c1a" },
  pageSubtitle: { textAlign: "center", marginBottom: 30 },
  card: { background: "white", padding: 20, borderRadius: 10, maxWidth: 500, margin: "0 auto" },
  inputGroup: { marginBottom: 15 },
  label: { display: "block", marginBottom: 5 },
  input: { width: "100%", padding: 10 },
  select: { width: "100%", padding: 10 },
  buttonGroup: { display: "flex", gap: 10, marginTop: 20 },
  button: { background: "#22c55e", color: "white", padding: 12, border: "none", borderRadius: 8 },
  buttonSecondary: { background: "#6b7280", color: "white", padding: 12, border: "none", borderRadius: 8 },
  resultado: { marginTop: 20, background: "#e8f5e9", padding: 15, borderRadius: 8 },
  linkContainer: { display: "flex", justifyContent: "center", gap: 10, marginTop: 30 }
};

export default ETCC;
