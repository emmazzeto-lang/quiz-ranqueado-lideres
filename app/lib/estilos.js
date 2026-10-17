export const css = `
  .pagina { max-width: 560px; margin: 0 auto; padding: 24px 16px 48px;
    font-family: system-ui, sans-serif; background: #000; min-height: 100vh; }
  .pagina h1 { font-size: 1.6rem; margin: 0 0 16px; }

  .cartao { background: #000; border: 1px solid #ddd; border-radius: 10px;
    padding: 16px; margin: 0 0 14px; }
  .cartao legend { font-weight: 600; padding: 0 6px; }

  .campo { display: block; margin-bottom: 14px; font-weight: 600; }
  .campo input { display: block; width: 100%; box-sizing: border-box; margin-top: 6px;
    padding: 12px; font-size: 1rem; border: 1px solid #bbb; border-radius: 8px; }

  .opcao { display: flex; align-items: center; gap: 10px; padding: 10px 4px; cursor: pointer; }
  .opcao input { width: 18px; height: 18px; }

  .aviso { color: #c62828; margin: 0 0 12px; }

  .botao { font-size: 1rem; padding: 12px 28px; border: none; border-radius: 8px;
    background: #5b3a9e; color: #fff; cursor: pointer; }
  .botao:disabled { opacity: 0.6; cursor: default; }
  
  .timer { position: sticky; top: 0; z-index: 1; background: #000; color: #fff;
    padding: 10px 16px; margin: -24px -16px 16px; font-size: 1.2rem;
    font-weight: 700; text-align: center; }
  .timer.urgente { background: #c62828; }

  table { width: 100%; border-collapse: collapse; background: #000; border-radius: 10px; overflow: hidden; }
  th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid #eee; font-size: 0.95rem; }
  th { background: #000; }
  input:focus-visible, .botao:focus-visible { outline: 3px solid #1a73e8; outline-offset: 2px; }
`;

//Não está re