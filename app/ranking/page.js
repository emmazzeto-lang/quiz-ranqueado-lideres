import { listarRanking } from "../lib/armazenamento";
import { css } from "../lib/estilos";

// Sempre lê dados novos, sem cache
export const dynamic = "force-dynamic";

export default async function Ranking() {
  let dados = [];
  let erro = false;
  try {
    dados = await listarRanking();
  } catch {
    erro = true;
  }

  return (
    <main className="pagina">
      <h1>Resultados</h1>
      {erro ? (
        <p className="aviso">Não foi possível carregar os resultados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Usuário</th>
              <th>RA</th>
              <th>Acertos</th>
              <th>Pontos</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((r, i) => (
              <tr key={r.ra}>
                <td>{i + 1}</td>
                <td>{r.usuario}</td>
                <td>{r.ra}</td>
                <td>{r.percentual}%</td>
                <td>{r.pontuacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <style>{css}</style>
    </main>
  );
}