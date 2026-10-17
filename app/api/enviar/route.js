import { NextResponse } from "next/server";
import { finalizarParticipacao } from "../../lib/armazenamento";
import { perguntas, TEMPO_TOTAL, TOLERANCIA } from "../../lib/perguntas";


export async function POST(req) {
  const corpo = await req.json().catch(() => ({}));
  const ra = String(corpo.ra ?? "").trim().toUpperCase();
  const token = String(corpo.token ?? "");
  const respostas = corpo.respostas && typeof corpo.respostas === "object" ? corpo.respostas : {};

  const r = await finalizarParticipacao(ra, token, (registro) => {
    // O tempo é medido pelo servidor, não pelo navegador
    const decorrido = (Date.now() - registro.iniciadoEm) / 1000;

    // Perguntas em branco não contam. Envio muito atrasado vale 0.
    const dentroDoPrazo = decorrido <= TEMPO_TOTAL + TOLERANCIA;
    const acertos = dentroDoPrazo
      ? perguntas.filter((p) => respostas[p.id] === p.correta).length
      : 0;
    const total = perguntas.length;
    const percentual = Math.round((acertos / total) * 1000) / 10;

    // Multiplicador de velocidade: 1 (no limite do tempo) até 2 (resposta instantânea) 
    const restante = Math.max(0, TEMPO_TOTAL - decorrido);
    const multiplicador = Math.round((1 + restante / TEMPO_TOTAL) * 100) / 100; // pontuação não pode ser maior por velocidade, mas mais pelo acerto
    const pontuacao = Math.round(percentual * multiplicador * 10) / 10;

    return { acertos, total, percentual, multiplicador, pontuacao, tempoSegundos: Math.round(decorrido) };
  }).catch((e) => {
    console.error("[enviar] ERRO:", e);
    return null;
  });

  if (!r) return NextResponse.json({ erro: "Erro ao salvar." }, { status: 500 });
  if (r.erro === "sessao") return NextResponse.json({ erro: "Sessão inválida." }, { status: 403 });
  if (r.erro === "ja_enviado") return NextResponse.json({ erro: "Respostas já enviadas." }, { status: 409 });
  return NextResponse.json({ ok: true });
}