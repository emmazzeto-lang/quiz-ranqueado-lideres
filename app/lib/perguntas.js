// SOMENTE SERVIDOR: aqui ficam as respostas certas.
// "correta" = índice (começando em 0) da alternativa certa, na ordem escrita aqui.
export const TEMPO_TOTAL = 180; // segundos
export const TOLERANCIA = 10; // segundos extras aceitos por atraso de rede

export const perguntas = [
  {
    id: 0,
    texto: "Qual é a capital do Brasil?",
    opcoes: ["São Paulo", "Brasília", "Rio de Janeiro", "Salvador"],
    correta: 1,
  },
  {
    id: 1,
    texto: "Quantos estados tem o Brasil?",
    opcoes: ["24", "25", "26", "27"],
    correta: 2,
  },
  {
    id: 2,
    texto: "Qual é o maior rio do Brasil?",
    opcoes: ["Rio São Francisco", "Rio Paraná", "Rio Amazonas", "Rio Tocantins"],
    correta: 2,
  },
];

// Versão enviada ao navegador, sem a resposta certa
export const perguntasPublicas = perguntas.map(({ id, texto, opcoes }) => ({
  id,
  texto,
  opcoes,
}));