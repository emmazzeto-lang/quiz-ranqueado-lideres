import { NextResponse } from "next/server";
import { iniciarParticipacao } from "../../lib/armazenamento";
import {
  perguntasPublicas,
  TEMPO_TOTAL,
  ABERTURA,
  FECHAMENTO,
  situacaoHorario,
  formatarHorario,
} from "../../lib/perguntas";
import { nomeProibido } from "../../lib/filtro";


export async function POST(req) {
  // Fora do horário ninguém começa (o RA não é registrado, pode tentar de novo depois)
  const situacao = situacaoHorario();
  if (situacao === "antes") {
    return NextResponse.json({ erro: `O quiz ainda não começou. Ele abre em ${formatarHorario(ABERTURA)}.` }, { status: 403 });
  }
  if (situacao === "depois") {
    return NextResponse.json({ erro: `O quiz foi encerrado em ${formatarHorario(FECHAMENTO)}.` }, { status: 403 });
  }

  const corpo = await req.json().catch(() => ({}));
  const ra = String(corpo.ra ?? "").trim().toUpperCase();
  const usuario = String(corpo.usuario ?? "").trim();

  if (!/^[0-9]{3,20}$/.test(ra) || usuario.length < 2 || usuario.length > 30) {
    return NextResponse.json({ erro: "Dados inválidos. Confira o RA e o nome." }, { status: 400 });
  }

 // Barra nomes ofensivos ANTES de registrar o RA, para ele não ficar "gasto"
  if (nomeProibido(usuario)) {
    return NextResponse.json({ erro: "Esse nome de usuário não é permitido. Escolha outro." }, { status: 400 });
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