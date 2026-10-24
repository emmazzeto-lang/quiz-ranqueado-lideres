import { NextResponse } from "next/server";
import { finalizarParticipacao } from "../../lib/armazenamento";
import { calcularResultado } from "../../lib/pontuacao";


export async function POST(req) {
  const corpo = await req.json().catch(() => ({}));
  const ra = String(corpo.ra ?? "").trim().toUpperCase();
  const token = String(corpo.token ?? "");
  const respostas = corpo.respostas && typeof corpo.respostas === "object" ? corpo.respostas : {};

  // A regra de pontuação fica em lib/pontuacao.js
  const r = await finalizarParticipacao(ra, token, (registro) => calcularResultado(registro, respostas)).catch((e) => {
    console.error("[enviar] ERRO:", e);
    return null;
  });

  if (!r) return NextResponse.json({ erro: "Erro ao salvar." }, { status: 500 });
  if (r.erro === "sessao") return NextResponse.json({ erro: "Sessão inválida." }, { status: 403 });
  if (r.erro === "ja_enviado") return NextResponse.json({ erro: "Respostas já enviadas." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
