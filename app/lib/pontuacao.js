import { perguntas, TEMPO_TOTAL, TOLERANCIA } from "./perguntas";

// SOMENTE SERVIDOR. Regra única de pontuação, usada no envio normal e na
// finalização automática de quem abandonou o quiz.
// "registro" tem iniciadoEm (ms) e respostasSalvas (salvas no banco durante o quiz);
// "respostasEnviadas" são as que chegaram no envio final (vazio se a pessoa não enviou).
export function calcularResultado(registro, respostasEnviadas = {}, agora = Date.now()) {
  // O tempo é medido pelo servidor, não pelo navegador
  const decorrido = (agora - registro.iniciadoEm) / 1000;

  // Perguntas em branco não contam.
  // No prazo: vale o que chegou agora (por cima do que já estava salvo).
  // Atrasado (tela bloqueada, aba fechada...): vale só o que foi salvo no banco
  // durante o quiz, que o servidor só aceita dentro do prazo. Nada respondido
  // depois do tempo conta.
  const dentroDoPrazo = decorrido <= TEMPO_TOTAL + TOLERANCIA;
  const validas = dentroDoPrazo
    ? { ...registro.respostasSalvas, ...respostasEnviadas }
    : registro.respostasSalvas;
  const acertos = perguntas.filter((p) => validas[p.id] === p.correta).length;
  const total = perguntas.length;
  const percentual = Math.round((acertos / total) * 1000) / 10;

  // O que mais pesa é ACERTAR. A velocidade é só um bônus pequeno:
  // vai de 1,0 (usou todo o tempo) até 1 + 1/total (terminou na hora).
  // Esse teto garante que UMA resposta certa a mais sempre vale mais do que qualquer
  // vantagem de velocidade. Entre quem acertou o mesmo número, vence o mais rápido.
  // (Com 0 acertos a pontuação é 0, nunca se ganha ponto só por ser rápido.)
  const restante = Math.max(0, TEMPO_TOTAL - decorrido);
  const multiplicador = 1 + restante / TEMPO_TOTAL / total; // pontuação corrigida
  const pontuacao = Math.round((acertos / total) * 100 * multiplicador * 100) / 100;

  // Quem enviou atrasado conta como tendo usado o tempo todo (para o desempate)
  const tempoSegundos = Math.round(Math.min(decorrido, TEMPO_TOTAL));

  return { acertos, total, percentual, multiplicador: Math.round(multiplicador * 1000) / 1000, pontuacao, tempoSegundos };
}

// Horário de início (ms) a partir do qual a pessoa ainda está no prazo.
// Quem começou antes disso já estourou os 3 minutos + tolerância.
export function inicioMinimoNoPrazo(agora = Date.now()) {
  return agora - (TEMPO_TOTAL + TOLERANCIA) * 1000;
}
