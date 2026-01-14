import React from "react";
import { Link } from "react-router-dom";

/* ===============================
   🌱 DADOS DE KC (FUNCIONAIS)
================================ */
const culturas = {
  alface: {
    nome: "Alface",
    duracao: "75 a 140",
    fases_percentual: "27-37-26-10",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.0,
      fase4: 0.8
    }
  },
  algodao: {
    nome: "Algodão",
    duracao: "180 a 195",
    fases_percentual: "16-27-31-26",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.2,
      fase4: 0.7
    }
  },
  amendoim: {
    nome: "Amendoim",
    duracao: "130 a 140",
    fases_percentual: "22-26-34-18",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.1,
      fase4: 0.6
    }
  },
  batata: {
    nome: "Batata",
    duracao: "105 a 145",
    fases_percentual: "21-25-33-21",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.1,
      fase4: 0.7
    }
  },
  berinjela: {
    nome: "Berinjela",
    duracao: "130 a 140",
    fases_percentual: "22-32-30-16",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.1,
      fase4: 0.7
    }
  },
  beterraba: {
    nome: "Beterraba",
    duracao: "70 a 90",
    fases_percentual: "25-35-28-12",
    kc: {
      fase1: 0.4,
      fase2: 0.8,
      fase3: 1.1,
      fase4: 0.8
    }
  },
  cebola_seca: {
    nome: "Cebola (seca)",
    duracao: "150 a 210",
    fases_percentual: "10-17-49-24",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.1,
      fase4: 0.7
    }
  },
  cenoura: {
    nome: "Cenoura",
    duracao: "100 a 150",
    fases_percentual: "19-27-39-15",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.1,
      fase4: 0.7
    }
  },
  cruciferas: {
    nome: "Crucíferas",
    duracao: "80 a 95",
    fases_percentual: "26-37-25-12",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.0,
      fase4: 0.8
    }
  },
  feijao_vagem: {
    nome: "Feijão vagem",
    duracao: "75 a 90",
    fases_percentual: "21-34-33-12",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.1,
      fase4: 0.7
    }
  },
  feijao_seco: {
    nome: "Feijão seco",
    duracao: "95 a 110",
    fases_percentual: "16-25-40-19",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.1,
      fase4: 0.4
    }
  },
  girassol: {
    nome: "Girassol",
    duracao: "125 a 130",
    fases_percentual: "17-27-36-20",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.1,
      fase4: 0.4
    }
  },
  melao: {
    nome: "Melão",
    duracao: "120 a 160",
    fases_percentual: "20-28-37-15",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.1,
      fase4: 0.7
    }
  },
  milho_doce: {
    nome: "Milho-doce",
    duracao: "80 a 110",
    fases_percentual: "23-29-37-11",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.1,
      fase4: 0.9
    }
  },
  milho_graos: {
    nome: "Milho grãos",
    duracao: "125 a 180",
    fases_percentual: "17-28-33-22",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.2,
      fase4: 0.5
    }
  },
  pepino: {
    nome: "Pepino",
    duracao: "105 a 130",
    fases_percentual: "19-28-38-15",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.0,
      fase4: 0.8
    }
  },
  rabanete: {
    nome: "Rabanete",
    duracao: "35 a 40",
    fases_percentual: "20-27-40-13",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.0,
      fase4: 0.8
    }
  },
  tomate: {
    nome: "Tomate",
    duracao: "135 a 180",
    fases_percentual: "21-28-33-18",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.2,
      fase4: 0.7
    }
  },
  trigo: {
    nome: "Trigo",
    duracao: "120 a 150",
    fases_percentual: "13-20-43-24",
    kc: {
      fase1: 0.4,
      fase2: 0.7,
      fase3: 1.2,
      fase4: 0.3
    }
  }
};

const Ko = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tabela de Coeficientes de Cultura (Kc)</h1>
      <p style={styles.pageSubtitle}>
        Valores de Kc para diferentes culturas e fases de crescimento
      </p>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Cultura</th>
              <th style={styles.th}>Duração Total do Ciclo (dias)</th>
              <th style={styles.th}>Percentual das 4 Fases (1-2-3-4)</th>
              <th style={styles.th}>Kc Fase 1</th>
              <th style={styles.th}>Kc Fase 2</th>
              <th style={styles.th}>Kc Fase 3</th>
              <th style={styles.th}>Kc Fase 4</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(culturas).map((cultura, index) => (
              <tr key={index} style={index % 2 === 0 ? styles.trOdd : styles.trEven}>
                <td style={styles.td}>{cultura.nome}</td>
                <td style={styles.td}>{cultura.duracao}</td>
                <td style={styles.td}>{cultura.fases_percentual}</td>
                <td style={styles.td}>{cultura.kc.fase1}</td>
                <td style={styles.td}>{cultura.kc.fase2}</td>
                <td style={styles.td}>{cultura.kc.fase3}</td>
                <td style={styles.td}>{cultura.kc.fase4}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>🌱 O que é o Kc (Coeficiente de Cultura)?</h3>

        <p style={styles.paragraph}>
          <strong>Kc</strong> indica quanta água uma cultura precisa em relação à
          evapotranspiração de referência (ETo).
        </p>

        <h4 style={styles.infoSubtitle}>🧮 Fórmula:</h4>
        <div style={styles.formulaBox}>
          <div style={styles.formula}>ETc = ETo × Kc</div>
        </div>
      </div>

      <div style={styles.linkContainer}>
        <Link to="/etcc">
          <button style={styles.button}>🧮 Calcular ETc</button>
        </Link>

        <Link to="/eto">
          <button style={styles.buttonSecondary}>🌤️ Calcular ETo</button>
        </Link>

        <Link to="/dashboard">
          <button style={styles.buttonSecondary}>🏠 Voltar</button>
        </Link>
      </div>
    </div>
  );
};

/* ===============================
   🎨 ESTILOS (INALTERADOS)
================================ */
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    background: "#f1f8f1",
    minHeight: "100vh",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "10px",
    color: "#1a3c1a",
  },
  pageSubtitle: {
    fontSize: "18px",
    textAlign: "center",
    marginBottom: "30px",
    color: "#4b5563",
  },
  tableContainer: {
    overflowX: "auto",
    marginBottom: "30px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    padding: "10px",
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    textAlign: "center",
    fontSize: "14px",
  },
  tableHeader: {
    backgroundColor: "#22c55e",
  },
  th: {
    padding: "12px 8px",
    border: "1px solid #ddd",
    fontWeight: "bold",
    color: "white",
  },
  td: {
    padding: "10px 8px",
    border: "1px solid #ddd",
    fontSize: "13px",
  },
  trEven: { backgroundColor: "#f8f9fa" },
  trOdd: { backgroundColor: "white" },
  infoBox: {
    background: "#e8f5e9",
    padding: "20px",
    borderRadius: "10px",
    margin: "20px 0",
    borderLeft: "5px solid #22c55e",
  },
  infoTitle: {
    color: "#1a3c1a",
    marginBottom: "15px",
  },
  infoSubtitle: {
    color: "#2d5a2d",
    marginTop: "15px",
    marginBottom: "10px",
  },
  paragraph: {
    marginBottom: "10px",
    lineHeight: "1.5",
  },
  formulaBox: {
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    margin: "10px 0",
    textAlign: "center",
    border: "1px solid #c1e1c1",
  },
  formula: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1a3c1a",
  },
  linkContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginTop: "30px",
    flexWrap: "wrap",
  },
  button: {
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  },
  buttonSecondary: {
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default Ko;