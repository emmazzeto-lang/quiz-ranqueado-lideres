"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { css } from "./lib/estilos";

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

  return (
    <main className="pagina">
      <h1>Cadastro</h1>
      <p>
        Você terá 3 minutos para responder o quiz e só pode participar uma vez. Quanto mais rápido
        terminar, maior a sua pontuação.
      </p>
      <form onSubmit={entrar}>
        <label className="campo">
          Nome de usuário
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} maxLength={30} required />
        </label>
        <label className="campo">
          RA
          <input value={ra} onChange={(e) => setRa(e.target.value)} maxLength={20} inputMode="numeric" required />
        </label>
        {erro && <p className="aviso">{erro}</p>}
        <button className="botao" type="submit" disabled={enviando}>
          {enviando ? "Aguarde..." : "Começar o quiz"}
        </button>
      </form>
      <Link href="/ranking" className="link">
        Ver ranking
      </Link>
      <style>{css}</style>
    </main>
  );
}