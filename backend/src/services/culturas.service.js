import culturasData from "../data/culturas.json";

/**
 * Retorna todas as culturas disponíveis
 */
export function listarCulturas() {
  return culturasData.map(c => ({
    nome: c.nome,
    duracao: c.duracao,
    fases: c.fases
  }));
}

/**
 * Busca uma cultura pelo nome
 */
export function obterCultura(nome) {
  if (!nome) {
    throw new Error("Nome da cultura não informado");
  }

  const cultura = culturasData.find(
    c => c.nome.toLowerCase() === nome.toLowerCase()
  );

  if (!cultura) {
    throw new Error(`Cultura '${nome}' não encontrada`);
  }

  return cultura;
}

/**
 * Verifica se uma cultura existe (uso interno)
 */
export function culturaExiste(nome) {
  return culturasData.some(
    c => c.nome.toLowerCase() === nome.toLowerCase()
  );
}
