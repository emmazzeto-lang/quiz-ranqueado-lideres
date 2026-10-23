"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CHAVE = "quizSessao";

// Embaralhamento Fisher-Yates
function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function formatar(seg) {
  const m = String(Math.floor(seg / 60)).padStart(2, "0");
  const s = String(seg % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function salvar(sessao) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(sessao));
  } catch {}
}

export default function Quiz() {
  const router = useRouter();
  const [sessao, setSessao] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [restante, setRestante] = useState(null);
  const [faltando, setFaltando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const sessaoRef = useRef(null);
  const respostasRef = useRef({});
  const enviadoRef = useRef(false);
  const fimRef = useRef(0);

  // Carrega a sessão guardada no aparelho. Se já houver ordem embaralhada e
  // respostas salvas (recarregamento ou reabertura), retoma exatamente de onde parou.
  useEffect(() => {
    let s = null;
    try {
      s = JSON.parse(localStorage.getItem(CHAVE));
    } catch {}
    if (!s) {
      localStorage.removeItem(CHAVE);
      router.replace("/");
      return;
    }

    if (!s.quiz) {
      // Primeira vez: embaralha uma única vez e guarda a ordem
      s.quiz = embaralhar(
        s.perguntas.map((p) => ({
          ...p,
          opcoes: embaralhar(p.opcoes.map((texto, original) => ({ texto, original }))),
        }))
      );
      s.respostas = {};
      salvar(s);
    }

    sessaoRef.current = s;
    respostasRef.current = s.respostas;
    fimRef.current = s.fimEm;
    setSessao(s);
    setQuiz(s.quiz);
    setRespostas(s.respostas);
    setRestante(Math.max(0, Math.ceil((s.fimEm - Date.now()) / 1000)));
  }, [router]);

  async function enviar() {
    if (enviadoRef.current || !sessao) return;
    enviadoRef.current = true;
    setEnviando(true);
    setErro("");
    try {
      const resp = await fetch("/api/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ra: sessao.ra, token: sessao.token, respostas: respostasRef.current }),
      });
      if (!resp.ok && resp.status !== 409) throw new Error();
      localStorage.removeItem(CHAVE); // terminou: limpa o que estava guardado
      router.push("/ranking");
    } catch {
      enviadoRef.current = false;
      setEnviando(false);
      setErro("Não foi possível enviar. Tente novamente.");
    }
  }

  // Contagem regressiva; ao zerar (inclusive se zerou com a página fechada),
  // envia o que estiver respondido
  useEffect(() => {
    if (!sessao) return;
    const id = setInterval(() => {
      const seg = Math.max(0, Math.ceil((fimRef.current - Date.now()) / 1000));
      setRestante(seg);
      if (seg === 0) {
        clearInterval(id);
        enviar();
      }
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao]);

  function escolher(id, original) {
    respostasRef.current = { ...respostasRef.current, [id]: original };
    setRespostas(respostasRef.current);
    setFaltando(false);
    // Guarda no aparelho a cada resposta marcada
    sessaoRef.current = { ...sessaoRef.current, respostas: respostasRef.current };
    salvar(sessaoRef.current);
  }

  function enviarManual() {
    if (Object.keys(respostasRef.current).length < quiz.length) {
      setFaltando(true);
      return;
    }
    enviar();
  }

  if (!quiz) return null;


  //============FRONT-END============
    return (
    <main className="pagina">
      <header className="quiz_cabecalho">
        <div className="quiz_titulo">
          <span>QUIZ</span>
          <h1>Semana da Liderança</h1>
        </div>
        <div className={restante <= 30 ? "timer urgente" : "timer"}>
          ⏱ {formatar(restante)}
        </div>
      </header>


      <div className="quiz_conteudo">

        {quiz.map((p, i) => (
          <fieldset key={p.id} className="container2 pergunta">
            
            <div className="pergunta_titulo">
              <span className="numero_pergunta">
                {i + 1}
              </span>
              <span className="texto_pergunta">
                {p.texto}
              </span>
            </div>

            <div className="opcoes">
              {p.opcoes.map((o) => (
                <label
                  key={o.original}
                  className="opcao">
                  <input
                    type="radio"
                    name={`pergunta-${p.id}`}
                    checked={respostas[p.id] === o.original}
                    onChange={() => escolher(p.id, o.original)}
                    disabled={enviando || restante === 0}/>
                  <span>{o.texto}</span>
                </label>
              ))}
            </div>

          </fieldset>
        ))}

        {faltando && (
          <p className="aviso">
            Responda todas as perguntas antes de enviar.
          </p>
        )}

        {erro && (
          <p className="aviso">
            {erro}
          </p>
        )}

        <button
          className="botao"
          onClick={enviarManual}
          disabled={enviando || restante === 0}>
          {enviando ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </main>
  );
}