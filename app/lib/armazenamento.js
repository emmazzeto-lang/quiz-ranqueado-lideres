import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// SOMENTE SERVIDOR. Substitui o banco de dados: os resultados ficam no
// arquivo dados/resultados.json, na pasta do projeto.
const PASTA = path.join(process.cwd(), "dados");
const ARQUIVO = path.join(PASTA, "resultados.json");

// Fila: executa uma operação por vez. Sem isso, duas pessoas enviando ao mesmo
// tempo poderiam sobrescrever o arquivo uma da outra. Fica em globalThis para
// ser a mesma fila em todas as rotas.
const g = globalThis;
g.__quizFila = g.__quizFila || Promise.resolve();

function naFila(tarefa) {
  const proxima = g.__quizFila.then(tarefa);
  g.__quizFila = proxima.catch(() => {});
  return proxima;
}

async function ler() {
  try {
    const texto = await fs.readFile(ARQUIVO, "utf-8");
    return texto.trim() ? JSON.parse(texto) : []; // arquivo vazio = sem participantes
  } catch (e) {
    if (e.code === "ENOENT") return []; // arquivo ainda não existe
    throw e;
  }
}

async function gravar(lista) {
  await fs.mkdir(PASTA, { recursive: true });
  // Grava num arquivo temporário e troca: evita arquivo pela metade se cair a energia
  const conteudo = JSON.stringify(lista, null, 2);
  const temp = ARQUIVO + ".tmp";
  try {
    await fs.writeFile(temp, conteudo, "utf-8");
    await fs.rename(temp, ARQUIVO);
  } catch (e) {
    // No Windows, antivírus/OneDrive podem travar a troca do arquivo (EPERM/EBUSY).
    // Nesse caso grava direto no arquivo final.
    console.error("[armazenamento] troca falhou, gravando direto:", e.code || e.message);
    await fs.writeFile(ARQUIVO, conteudo, "utf-8");
    await fs.rm(temp, { force: true }).catch(() => {});
  }
}

// Registra o início da participação. Um RA só pode iniciar uma vez.
export function iniciarParticipacao(ra, usuario) {
  return naFila(async () => {
    const lista = await ler();
    if (lista.some((r) => r.ra === ra)) return { jaExiste: true };

    const registro = {
      ra,
      usuario,
      token: randomUUID(),
      iniciadoEm: Date.now(),
      finalizadoEm: null,
      acertos: null,
      total: null,
      percentual: null,
      multiplicador: null,
      pontuacao: null,
      tempoSegundos: null,
    };
    lista.push(registro);
    await gravar(lista);
    return { token: registro.token };
  });
}

// Fecha a participação. "calcular" recebe o registro e devolve os campos do resultado.
export function finalizarParticipacao(ra, token, calcular) {
  return naFila(async () => {
    const lista = await ler();
    const registro = lista.find((r) => r.ra === ra && r.token === token);
    if (!registro) return { erro: "sessao" };
    if (registro.finalizadoEm) return { erro: "ja_enviado" };

    Object.assign(registro, calcular(registro), { finalizadoEm: Date.now() });
    await gravar(lista);
    return { ok: true };
  });
}

// Ranking: só quem terminou; mais pontos primeiro, empate decidido pelo menor tempo.
// O token nunca sai daqui.
export async function listarRanking() {
  const lista = await ler();
  return lista
    .filter((r) => r.finalizadoEm)
    .sort((a, b) => b.pontuacao - a.pontuacao || a.tempoSegundos - b.tempoSegundos)
    .map(({ usuario, ra, percentual, pontuacao }) => ({ usuario, ra, percentual, pontuacao }));
}