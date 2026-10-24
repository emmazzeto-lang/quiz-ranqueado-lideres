import { NextResponse } from "next/server";
import { salvarResposta } from "../../lib/armazenamento";
import { perguntas } from "../../lib/perguntas";
import { inicioMinimoNoPrazo } from "../../lib/pontuacao";

// Chamada a cada alternativa marcada. Guarda a resposta no banco para ela valer
// mesmo que a pessoa bloqueie a tela ou feche a aba antes do envio final.
export async function POST(req) {
  const corpo = await req.json().catch(() => ({}));
  const ra = String(corpo.ra ?? "").trim().toUpperCase();
  const token = String(corpo.token ?? "");
  const perguntaId = Number(corpo.pergunta);
  const opcao = Number(corpo.opcao);

  const pergunta = perguntas.find((p) => p.id === perguntaId);
  if (!pergunta || !Number.isInteger(opcao) || opcao < 0 || opcao >= pergunta.opcoes.length) {
    return NextResponse.json({ erro: "Resposta inválida." }, { status: 400 });
  }

  // Só aceita se a pessoa ainda estiver no prazo (medido pelo servidor)
  const gravou = await salvarResposta(ra, token, perguntaId, opcao, inicioMinimoNoPrazo()).catch((e) => {
    console.error("[responder] ERRO:", e);
    return null;
  });

  if (gravou === null) return NextResponse.json({ erro: "Erro ao salvar." }, { status: 500 });
  if (!gravou) return NextResponse.json({ erro: "Fora do prazo ou sessão inválida." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
