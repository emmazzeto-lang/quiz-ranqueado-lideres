import { listarRanking } from "../lib/armazenamento";

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


  //============FRONT-END============
  return (
    <main className="pagina2">

      <header className="cabecalho">
        <h1>Resultados</h1>
      </header>

      <div className="corpo_principal">
        <section className="container2">

          {erro ? (
            <p className="aviso">
              Não foi possível carregar os resultados.
            </p>
          ) : (
            <div className="tabela_wrapper">
              <table className="tabela_ranking">
                <thead>
                  <tr>
                    <th className="col_posicao">#</th>
                    <th className="col_usuario">Usuário</th>
                    <th className="col_ra">RA</th>
                    <th className="col_pontos">Pontos</th>
                  </tr>
                </thead>

                <tbody>
                  {dados.map((r, i) => (
                    <tr key={r.ra}>
                      <td className="posicao">
                        {i + 1}
                      </td>

                      <td className="usuario">
                        {r.usuario}
                      </td>

                      <td className="ra">
                        {r.ra}
                      </td>

                      <td className="pontos">
                        {r.pontuacao}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <footer className="rodape">
        <p>Desenvolvido pelo Time de Soluções Digitais da Líderes JR. - 2026.</p>
      </footer>

    </main>
  );
}