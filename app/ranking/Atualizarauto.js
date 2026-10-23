"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// a página do ranking no servidor, então novos resultados aparecem sozinhos,
// sem a pessoa precisar recarregar.
export default function AtualizarAuto({ segundos = 10 }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      // Não atualiza com a aba escondida (economiza o servidor)
      if (document.visibilityState === "visible") router.refresh();
    }, segundos * 1000);
    return () => clearInterval(id);
  }, [router, segundos]);

  return null;
}