import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// SOMENTE SERVIDOR. Os resultados ficam na tabela "participantes" do Supabase
// (o SQL para criar a tabela está em supabase/schema.sql).
// Usa a chave SECRETA, que nunca pode ir para o navegador: por isso as variáveis
// NÃO começam com NEXT_PUBLIC_.
const TABELA = "participantes";

let cliente = null;

function banco() {
  if (cliente) return cliente;
  // Aceita a URL com ou sem o "/rest/v1/" do final (o painel mostra das duas formas)
  const url = process.env.SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, "");
  const chave = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !chave) {
    throw new Error("Faltam SUPABASE_URL e/ou SUPABASE_SECRET_KEY nas variáveis de ambiente.");
  }
  cliente = createClient(url, chave, { auth: { persistSession: false } });
  return cliente;
}

// Registra o início da participação. Um RA só pode iniciar uma vez.
export async function iniciarParticipacao(ra, usuario) {
  const token = randomUUID();
  const { error } = await banco()
    .from(TABELA)
    .insert({ ra, usuario, token, iniciado_em: new Date().toISOString() });

  // 23505 = valor repetido na chave (o RA já existe)
  if (error?.code === "23505") return { jaExiste: true };
  if (error) throw error;
  return { token };
}

// Salva uma resposta durante o quiz. "inicioMinimo" (ms) é o horário de início mais
// antigo que ainda está dentro do prazo: quem começou antes disso já estourou o tempo.
// Devolve false se não gravou (sessão inválida, já enviado ou tempo esgotado).
export async function salvarResposta(ra, token, perguntaId, opcao, inicioMinimo) {
  const { data, error } = await banco().rpc("salvar_resposta", {
    p_ra: ra,
    p_token: token,
    p_pergunta: String(perguntaId),
    p_opcao: opcao,
    p_limite: new Date(inicioMinimo).toISOString(),
  });

  if (error?.code === "22P02") return false; // token que não é um UUID válido
  if (error) throw error;
  return data === true;
}

// Fecha a participação. "calcular" recebe o registro (início e respostas já salvas)
// e devolve os campos do resultado.
export async function finalizarParticipacao(ra, token, calcular) {
  const { data: linha, error } = await banco()
    .from(TABELA)
    .select("iniciado_em, finalizado_em, respostas")
    .eq("ra", ra)
    .eq("token", token)
    .maybeSingle();

  // Token que não é um UUID válido também cai aqui (o banco recusa o formato)
  if (error?.code === "22P02" || (!error && !linha)) return { erro: "sessao" };
  if (error) throw error;
  if (linha.finalizado_em) return { erro: "ja_enviado" };

  const r = calcular({ iniciadoEm: Date.parse(linha.iniciado_em), respostasSalvas: linha.respostas || {} });
  if (!(await gravarResultado(ra, token, r))) return { erro: "ja_enviado" };
  return { ok: true };
}

// Grava o resultado. Só grava se ainda não estiver finalizado: se a pessoa enviar
// duas vezes ao mesmo tempo (ou o ranking finalizar junto), só a primeira vale.
// Devolve true se gravou.
async function gravarResultado(ra, token, r) {
  const { data, error } = await banco()
    .from(TABELA)
    .update({
      acertos: r.acertos,
      total: r.total,
      percentual: r.percentual,
      multiplicador: r.multiplicador,
      pontuacao: r.pontuacao,
      tempo_segundos: r.tempoSegundos,
      finalizado_em: new Date().toISOString(),
    })
    .eq("ra", ra)
    .eq("token", token)
    .is("finalizado_em", null)
    .select("ra");

  if (error) throw error;
  return data.length > 0;
}

// Finaliza quem começou e abandonou (fechou a aba, bloqueou a tela e não voltou):
// todo mundo que iniciou antes de "inicioMinimo" (ms) e não enviou já estourou o
// tempo, então é pontuado com as respostas que salvou durante o quiz.
export async function finalizarExpirados(inicioMinimo, calcular) {
  const { data, error } = await banco()
    .from(TABELA)
    .select("ra, token, iniciado_em, respostas")
    .is("finalizado_em", null)
    .lt("iniciado_em", new Date(inicioMinimo).toISOString());

  if (error) throw error;
  await Promise.all(
    data.map((linha) =>
      gravarResultado(
        linha.ra,
        linha.token,
        calcular({ iniciadoEm: Date.parse(linha.iniciado_em), respostasSalvas: linha.respostas || {} })
      )
    )
  );
}

// Ranking: só quem terminou; mais pontos primeiro, empate decidido pelo menor tempo.
// O token nunca sai daqui.
export async function listarRanking() {
  const { data, error } = await banco()
    .from(TABELA)
    .select("usuario, ra, percentual, pontuacao")
    .not("finalizado_em", "is", null)
    .order("pontuacao", { ascending: false })
    .order("tempo_segundos", { ascending: true });

  if (error) throw error;
  // Garante número (a coluna é "numeric" no banco) para a tabela exibir certinho
  return data.map((r) => ({ ...r, percentual: Number(r.percentual), pontuacao: Number(r.pontuacao) }));
}
