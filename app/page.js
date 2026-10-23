"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Cadastro() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [ra, setRa] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Se já existe um quiz em andamento neste aparelho (a pessoa fechou a aba e
  // reabriu o QR Code), volta direto para ele em vez de pedir cadastro de novo.
  useEffect(() => {
    try {
      if (localStorage.getItem("quizSessao")) router.replace("/quiz");
    } catch {}
  }, [router]);

  async function entrar(e) {
    e.preventDefault();
    setErro("");

    // Testa o armazenamento ANTES de registrar o RA no servidor.
    // (Alguns navegadores bloqueiam em modo anônimo; sem ele não há recuperação.)
    try {
      localStorage.setItem("quizTeste", "1");
      localStorage.removeItem("quizTeste");
    } catch {
      setErro("Seu navegador está bloqueando o armazenamento. Saia do modo anônimo e tente novamente.");
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch("/api/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ra, usuario }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setErro(dados.erro || "Erro ao iniciar.");
        setEnviando(false);
        return;
      }
      // fimEm = horário em que o tempo acaba (relógio do aparelho, só para exibir o cronômetro)
      localStorage.setItem(
        "quizSessao",
        JSON.stringify({ ...dados, usuario, fimEm: Date.now() + dados.segundos * 1000 })
      );
      router.push("/quiz");
    } catch {
      setErro("Sem conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  
  //============FRONT-END============
  return (
    <main className="pagina1">

      <section className="hero-banner">
        <div className="hero-content">
          <h1>Bem-vindos ao Quiz da <br></br> Semana da Liderança!</h1>

          <div className="hero-texto">
          <p>Para participar, é simples:</p>
          <p><strong>1. Entre na plataforma:</strong> digite seu nome completo e seu RA nos campos indicados.</p>
          <p><strong>2. Responda o quiz:</strong> leia cada pergunta com atenção e escolha a alternativa que considerar correta.</p>
          <p><strong>3. Fique de olho no tempo:</strong> o cronômetro começa a contar assim que você inicia.</p>
          
          <p>Como funciona a pontuação? Sua nota depende de dois fatores: a quantidade de acertos e o tempo que você levou para finalizar. Quanto mais respostas certas e quanto mais rápido você terminar, maior será sua pontuação no ranking.</p>
          <p>Boa sorte e bom quiz!</p>
          </div>

          <h2>Desenvolvido pelo Time de Soluções Digitais da Líderes JR. - 2026.</h2>
        </div>
      </section>

      <section className="corpo_principal">
        <div className="container1">
          <h2>Entrar no Quiz</h2>

          <form onSubmit={entrar}>
            <label className="campo" htmlFor="nome">
              Nome de usuário

              <input
                type="text"
                id="nome"
                placeholder="Digite seu nome"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                maxLength={30}
                required
              />
            </label>

            <label className="campo" htmlFor="ra">
              RA

              <input
                type="text"
                id="ra"
                placeholder="Digite seu RA"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
                maxLength={20}
                inputMode="numeric"
                required
              />
            </label>

            {erro && <p className="aviso">{erro}</p>}

            <button
              className="botao"
              type="submit"
              disabled={enviando}>
              {enviando ? "Aguarde..." : "Começar o quiz"}
            </button>
          </form>

          <Link href="/ranking" className="link">
            Ver ranking
          </Link>
        </div>
      </section>
    </main>
  );
}