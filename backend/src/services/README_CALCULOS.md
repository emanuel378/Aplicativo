Módulo de Lógica, Cálculos e Regras de Negócio

Responsável: Pessoa B

🎯 Objetivo deste módulo

Este módulo é responsável por toda a inteligência do sistema relacionada a:

Cálculos agronômicos

Regras de negócio

Coerência matemática dos resultados

Padronização das respostas para o frontend

⚠️ Nenhum cálculo deve existir no frontend.
O frontend apenas consome resultados prontos vindos do backend.

🧠 Responsabilidades da Pessoa B

Implementar fórmulas agronômicas

Centralizar dados técnicos (Kc, culturas, fases)

Validar dados de entrada

Garantir resultados consistentes

Isolar a lógica da API externa (INMET / OpenWeather)

📁 Estrutura do módulo
src/
└─ services/
   ├─ eto.service.js        # Cálculo da Evapotranspiração de Referência (ETo)
   ├─ etc.service.js        # Cálculo da Evapotranspiração da Cultura (ETc)
   ├─ kc.service.js         # Regras e validação do coeficiente Kc
   ├─ culturas.service.js   # Listagem e validação de culturas
└─ data/
   ├─ culturas.json         # Dados das culturas
   └─ kc.json               # Valores de Kc por cultura e fase

🌤️ 1. Cálculo da ETo (FAO-56)

Arquivo: eto.service.js

Responsável por calcular a Evapotranspiração de Referência (ETo) com base no método FAO-56 simplificado.

Entradas esperadas
{
  tempMax: number,
  tempMin: number,
  umidade: number,
  vento: number,
  radiacao: number
}

Saída
number // ETo em mm/dia

Observações

Valores são limitados entre 0 e 15 mm/dia

Não depende diretamente de API externa

A API (INMET / OpenWeather) apenas fornece os dados climáticos

🌱 2. Coeficiente de Cultura (Kc)

Arquivo: kc.service.js

Responsável por:

Validar cultura

Validar fase fenológica

Retornar o valor correto de Kc

Regras

Cultura obrigatória

Fase obrigatória

Erros explícitos em caso de inconsistência

Exemplo de uso
const kc = obterKc("Milho grãos", "fase3");

💧 3. Cálculo da ETc

Arquivo: etc.service.js

Calcula a Evapotranspiração da Cultura (ETc) usando a fórmula:

ETc = ETo × Kc

Entrada
{
  eto: number,
  cultura: string,
  fase: string
}

Saída padronizada
{
  eto: number,
  kc: number,
  etc: number
}

🌾 4. Culturas

Arquivo: culturas.service.js

Responsável por:

Listar culturas disponíveis

Validar existência de cultura

Fornecer metadados (duração, fases)

Importante

O frontend não define culturas

O frontend não conhece valores de Kc

Tudo vem do backend

🔗 Integração com a API Climática

A Pessoa B NÃO consome APIs externas diretamente.

Fluxo correto:

API Climática (INMET / OpenWeather)
        ↓
Pessoa A (Controller / Backend)
        ↓
Services (Pessoa B)
        ↓
Resultado final (ETo, ETc, recomendações)


A lógica da Pessoa B é independente da origem dos dados.

🔐 Separação de responsabilidades
Pessoa A

server.js

rotas

controllers

APIs externas

autenticação

banco de dados

Pessoa B

fórmulas

regras

validações

cálculos

dados técnicos

🚫 Pessoa A não altera fórmulas
🚫 Pessoa B não mexe em rotas ou server

🧪 Validação e Confiabilidade

Todos os serviços:

Validam entradas

Lançam erros claros

Evitam cálculos silenciosamente errados

🚀 Status atual
Módulo	Status
ETo	✅ Implementado
ETc	✅ Implementado
Kc	✅ Implementado
Culturas	✅ Implementado
Separação Front/Back	✅ Concluída