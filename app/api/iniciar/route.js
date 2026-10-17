import { NextResponse } from "next/server";
import { iniciarParticipacao } from "../../lib/armazenamento";
import { perguntasPublicas, TEMPO_TOTAL } from "../../lib/perguntas";


export async function POST(req) {
  const corpo = await req.json().catch(() => ({}));
  const ra = String(corpo.ra ?? "").trim().toUpperCase();
  const usuario = String(corpo.usuario ?? "").trim();

  if (!/^[0-9A-Z]{3,20}$/.test(ra) || usuario.length < 2 || usuario.length > 30) {
    return NextResponse.json({ erro: "Dados inválidos. Confira o RA e o nome." }, { status: 400 });
  }

  const r = await iniciarParticipacao(ra, usuario).catch((e) => {
    console.error("[iniciar] ERRO:", e);
    return null;
  });
  if (!r) {
    return NextResponse.json({ erro: "Erro no servidor. Tente novamente." }, { status: 500 });
  }
  if (r.jaExiste) {
    return NextResponse.json({ erro: "Este RA já participou do quiz." }, { status: 409 });
  }

  return NextResponse.json({
    ra,
    token: r.token,
    segundos: TEMPO_TOTAL,
    perguntas: perguntasPublicas,
  });
}