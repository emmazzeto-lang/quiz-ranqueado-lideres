// SOMENTE SERVIDOR: aqui ficam as respostas certas.
// "correta" = índice (começando em 0) da alternativa certa, na ordem escrita aqui.
export const TEMPO_TOTAL = 180; // segundos
export const TOLERANCIA = 10; // segundos extras aceitos por atraso de rede

export const perguntas = [
  {
    id: 0,
    texto: "O que é autogestão?",
    opcoes: ["Evitar responsabilidades.", "Delegar todas as atividades.", "Organizar e administrar suas próprias emoções, tarefas e responsabilidades.", "Depender de outras pessoas para realizar tarefas."],
    correta: 2,
  },
  {
    id: 1,
    texto: "Como a autogestão pode nos auxiliar além da vida profissional?",
    opcoes: ["Apenas na organização do trabalho.", "No aumento da competitividade.", "Na organização pessoal, no controle emocional e na tomada de decisões.", "Somente nos estudos."],
    correta: 2,
  },
  {
    id: 2,
    texto: "Como a gestão de equipes impacta no mercado?",
    opcoes: ["Diminui a colaboração entre profissionais.", "Melhora a produtividade, a comunicação e os resultados.", "Elimina a necessidade de liderança.", "Reduz a criatividade."],
    correta: 1,
  },
  {
    id: 3,
    texto: "Qual a importância da imagem pessoal?",
    opcoes: ["Influenciar apenas a aparência física.", "Garantir sucesso imediato.", "Transmitir credibilidade, confiança e profissionalismo.", "Substituir as competências profissionais."], 
    correta: 2,
  },
  {
    id: 4,
    texto: "O que é Branding?",
    opcoes: ["Uma estratégia para construir e fortalecer a identidade de uma marca.", "Uma ferramenta de controle financeiro.", "Um método de contratação.", "Uma técnica exclusiva de vendas."], 
    correta: 0,
  },
  {
    id: 5,
    texto: "O que é uma empresa júnior?",
    opcoes: ["Um estágio obrigatório da faculdade.", "Uma empresa administrada por professores.", "Uma organização formada por estudantes que oferecem serviços e desenvolvem projetos relacionados à sua formação.", "Uma empresa criada exclusivamente para gerar lucro."], 
    correta: 2,
  },
  {
    id: 6,
    texto: "Qual a importância de uma empresa júnior na formação acadêmica?",
    opcoes: ["Ensinar apenas conhecimentos teóricos.", "Desenvolver habilidades práticas, liderança e experiência profissional.", "Garantir um emprego após a faculdade.", "Substituir as aulas da graduação."], 
    correta: 1,
  },
  {
    id: 7,
    texto: "Uma empresa júnior tem peso no currículo como experiência profissional?",
    opcoes: ["Somente para quem ocupa a presidência.", "Apenas se o estudante receber salário.", "Sim, pois demonstra experiência prática, iniciativa e desenvolvimento de competências profissionais.", "Não, pois não envolve atividades práticas."], 
    correta: 2,
  },
  {
    id: 8,
    texto: "Qual o time da Líderes Jr. responsável pelas finanças?",
    opcoes: ["Projetos", "Secretaria", "Controladoria", "Novos Negócios"], 
    correta: 2,
  },
  {
    id: 9,
    texto: "Qual o time da Líderes Jr. responsável por organizar as agendas?",
    opcoes: ["Comunicação", "Administrativo e Secretaria", "Gestão de Pessoas", "Presidência"], 
    correta: 1,
  },
  {
    id: 10,
    texto: "Qual o time da Líderes Jr. responsável por distribuir as demandas aos diretores?",
    opcoes: ["Novos Negócios", "Projetos", "Controladoria", "Presidência"], 
    correta: 3,
  },
  {
    id: 11,
    texto: "Qual o time da Líderes Jr. responsável por desenvolver projetos?",
    opcoes: ["Projetos", "Soluções Digitais", "Secretaria", "Comunicação"], 
    correta: 0,
  },
  {
    id: 12,
    texto: "Qual o time da Líderes Jr. responsável pelo nosso Marketing?",
    opcoes: ["Presidência", "Gestão de Pessoas", "Marketing", "Controladoria"], 
    correta: 2,
  },
  {
    id: 13,
    texto: "Qual o time da Líderes Jr. responsável por fazer a triagem de currículos?",
    opcoes: ["Secretaria", "Recursos Humanos", "Projetos", "Novos Negócios"], 
    correta: 1,
  },
  {
    id: 14,
    texto: "Qual o time da Líderes Jr. responsável por desenvolver sites e sistemas?",
    opcoes: ["Projetos", "Controladoria", "Marketing", "Soluções Digitais"], 
    correta: 3,
  },
  {
    id: 15,
    texto: "Qual o time responsável pelo contato com clientes e parceiros?",
    opcoes: ["Novos Negócios", "Secretaria", "Gestão de Pessoas", "Presidência"], 
    correta: 0,
  },
];

// Versão enviada ao navegador, sem a resposta certa
export const perguntasPublicas = perguntas.map(({ id, texto, opcoes }) => ({
  id,
  texto,
  opcoes,
}));