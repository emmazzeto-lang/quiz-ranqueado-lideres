import { finalizarExpirados, listarRanking } from "../lib/armazenamento";
import { calcularResultado, inicioMinimoNoPrazo } from "../lib/pontuacao";
import AtualizarAuto from "./Atualizarauto";

// Sempre lê dados novos, sem cache
export const dynamic = "force-dynamic";

export default async function Ranking() {
  // Antes de mostrar, pontua quem estourou o tempo e não enviou (abandonou o quiz),
  // com as respostas salvas. Como o ranking recarrega a cada 30s, essas pessoas
  // aparecem logo depois que o tempo delas acaba. Se falhar, mostra o ranking assim mesmo.
  await finalizarExpirados(inicioMinimoNoPrazo(), (registro) => calcularResultado(registro)).catch((e) =>
    console.error("[ranking] erro ao finalizar expirados:", e)
  );

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

      <AtualizarAuto segundos={30} />
    </main>
  );
}