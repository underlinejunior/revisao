const letras = ["A", "B", "C", "D", "E"];

const estado = {
  questoes: [],
  indice: 0,
  pontuacao: 0,
  acertos: 0,
  erros: 0,
  travada: false,
  respostas: [],
  estatisticas: {}
};

const telaInicial = document.getElementById("telaInicial");
const telaQuiz = document.getElementById("telaQuiz");
const telaResultado = document.getElementById("telaResultado");
const totalBanco = document.getElementById("totalBanco");
const btnIniciar = document.getElementById("btnIniciar");
const btnProxima = document.getElementById("btnProxima");
const btnFinalizar = document.getElementById("btnFinalizar");
const btnReiniciar = document.getElementById("btnReiniciar");
const quantidadeSelect = document.getElementById("quantidade");
const topicoAtual = document.getElementById("topicoAtual");
const dificuldadeAtual = document.getElementById("dificuldadeAtual");
const pontuacaoEl = document.getElementById("pontuacao");
const acertosEl = document.getElementById("acertos");
const errosEl = document.getElementById("erros");
const barraProgresso = document.getElementById("barraProgresso");
const contador = document.getElementById("contador");
const enunciado = document.getElementById("enunciado");
const alternativasEl = document.getElementById("alternativas");
const feedback = document.getElementById("feedback");
const resultadoGeral = document.getElementById("resultadoGeral");
const resumoTopicos = document.getElementById("resumoTopicos");
const listaErros = document.getElementById("listaErros");

const bancoCompleto = gerarQuestoes();
totalBanco.textContent = bancoCompleto.length;

btnIniciar.addEventListener("click", iniciarQuiz);
btnProxima.addEventListener("click", proximaQuestao);
btnFinalizar.addEventListener("click", mostrarResultado);
btnReiniciar.addEventListener("click", () => location.reload());

function iniciarQuiz() {
  const topicosMarcados = [...document.querySelectorAll(".filtro-topico:checked")].map(item => item.value);
  if (topicosMarcados.length === 0) {
    alert("Selecione pelo menos um assunto para iniciar o quiz.");
    return;
  }

  const quantidade = Number(quantidadeSelect.value);
  const filtradas = bancoCompleto.filter(q => topicosMarcados.includes(q.topico));

  const organizadas = [1, 2, 3].flatMap(nivel => embaralhar(filtradas.filter(q => q.dificuldade === nivel)));
  estado.questoes = organizadas.slice(0, Math.min(quantidade, organizadas.length));
  estado.indice = 0;
  estado.pontuacao = 0;
  estado.acertos = 0;
  estado.erros = 0;
  estado.travada = false;
  estado.respostas = [];
  estado.estatisticas = {};

  estado.questoes.forEach(q => {
    if (!estado.estatisticas[q.topico]) {
      estado.estatisticas[q.topico] = { total: 0, acertos: 0, erros: 0 };
    }
    estado.estatisticas[q.topico].total++;
  });

  telaInicial.classList.add("escondido");
  telaResultado.classList.add("escondido");
  telaQuiz.classList.remove("escondido");
  atualizarPlacar();
  renderizarQuestao();
}

function renderizarQuestao() {
  const questao = estado.questoes[estado.indice];
  estado.travada = false;
  btnProxima.disabled = true;
  feedback.className = "feedback escondido";
  feedback.innerHTML = "";

  topicoAtual.textContent = questao.topico;
  dificuldadeAtual.textContent = nomeDificuldade(questao.dificuldade);
  contador.textContent = `Questão ${estado.indice + 1} de ${estado.questoes.length}`;
  barraProgresso.style.width = `${(estado.indice / estado.questoes.length) * 100}%`;
  enunciado.textContent = questao.enunciado;

  alternativasEl.innerHTML = "";
  questao.alternativas.forEach((alternativa, indice) => {
    const botao = document.createElement("button");
    botao.className = "alternativa";
    botao.type = "button";
    botao.innerHTML = `<span class="letra">${letras[indice]}</span><span>${alternativa.texto}</span>`;
    botao.addEventListener("click", () => responder(indice, botao));
    alternativasEl.appendChild(botao);
  });
}

function responder(indiceEscolhido, botaoEscolhido) {
  if (estado.travada) return;

  const questao = estado.questoes[estado.indice];
  const acertou = questao.alternativas[indiceEscolhido].correta;
  estado.travada = true;

  const botoes = [...document.querySelectorAll(".alternativa")];
  botoes.forEach((botao, indice) => {
    botao.disabled = true;
    if (questao.alternativas[indice].correta) botao.classList.add("correta");
  });

  if (acertou) {
    estado.acertos++;
    estado.pontuacao += pontosPorDificuldade(questao.dificuldade);
    estado.estatisticas[questao.topico].acertos++;
    botaoEscolhido.classList.add("correta");
    feedback.className = "feedback ok";
    feedback.innerHTML = `<strong>Parabéns! Resposta correta.</strong>${questao.explicacao}`;
    tocarSomVitoria();
    soltarFogos();
    animarPontuacao();
  } else {
    estado.erros++;
    estado.estatisticas[questao.topico].erros++;
    botaoEscolhido.classList.add("errada");
    const correta = questao.alternativas.find(item => item.correta).texto;
    feedback.className = "feedback erro";
    feedback.innerHTML = `<strong>Ops! A resposta correta era: ${correta}</strong>${questao.explicacao}`;
    tocarSomErro();
  }

  estado.respostas.push({
    id: questao.id,
    topico: questao.topico,
    assunto: questao.assunto,
    enunciado: questao.enunciado,
    escolha: questao.alternativas[indiceEscolhido].texto,
    correta: questao.alternativas.find(item => item.correta).texto,
    acertou,
    explicacao: questao.explicacao
  });

  atualizarPlacar();
  btnProxima.disabled = false;
  if (estado.indice === estado.questoes.length - 1) {
    btnProxima.textContent = "Ver resultado";
  } else {
    btnProxima.textContent = "Próxima questão";
  }
}

function proximaQuestao() {
  if (estado.indice >= estado.questoes.length - 1) {
    mostrarResultado();
    return;
  }
  estado.indice++;
  renderizarQuestao();
}

function mostrarResultado() {
  telaQuiz.classList.add("escondido");
  telaResultado.classList.remove("escondido");
  barraProgresso.style.width = "100%";

  const totalRespondidas = estado.acertos + estado.erros;
  const percentual = totalRespondidas ? Math.round((estado.acertos / totalRespondidas) * 100) : 0;

  resultadoGeral.innerHTML = `
    <div class="box"><strong>${estado.pontuacao}</strong><span>pontos</span></div>
    <div class="box"><strong>${estado.acertos}</strong><span>acertos</span></div>
    <div class="box"><strong>${estado.erros}</strong><span>erros</span></div>
    <div class="box"><strong>${percentual}%</strong><span>aproveitamento</span></div>
  `;

  const linhas = Object.entries(estado.estatisticas).map(([topico, dados]) => {
    const aproveitamento = dados.total ? Math.round((dados.acertos / dados.total) * 100) : 0;
    return `
      <tr>
        <td>${topico}</td>
        <td>${dados.total}</td>
        <td>${dados.acertos}</td>
        <td>${dados.erros}</td>
        <td>${aproveitamento}%</td>
      </tr>
    `;
  }).join("");

  resumoTopicos.innerHTML = `
    <h2>Resumo por tópico</h2>
    <table>
      <thead>
        <tr>
          <th>Tópico</th>
          <th>Questões</th>
          <th>Acertos</th>
          <th>Erros</th>
          <th>Aproveitamento</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
  `;

  const erros = estado.respostas.filter(item => !item.acertou);
  if (erros.length === 0) {
    listaErros.innerHTML = `<h2>Questões para revisar</h2><p>Excelente! Você não errou nenhuma questão nesta rodada.</p>`;
    soltarFogos();
    tocarSomVitoria();
    return;
  }

  listaErros.innerHTML = `
    <h2>Questões para revisar</h2>
    ${erros.map((item, indice) => `
      <div class="erro-item">
        <h3>${indice + 1}. ${item.topico} — ${item.assunto}</h3>
        <p><strong>Questão:</strong> ${item.enunciado}</p>
        <p><strong>Sua resposta:</strong> ${item.escolha}</p>
        <p><strong>Resposta correta:</strong> ${item.correta}</p>
        <p><strong>Explicação:</strong> ${item.explicacao}</p>
      </div>
    `).join("")}
  `;
}

function atualizarPlacar() {
  pontuacaoEl.textContent = estado.pontuacao;
  acertosEl.textContent = estado.acertos;
  errosEl.textContent = estado.erros;
}

function animarPontuacao() {
  pontuacaoEl.classList.remove("pulse");
  void pontuacaoEl.offsetWidth;
  pontuacaoEl.classList.add("pulse");
}

function nomeDificuldade(nivel) {
  if (nivel === 1) return "Fácil";
  if (nivel === 2) return "Médio";
  return "Desafio";
}

function pontosPorDificuldade(nivel) {
  if (nivel === 1) return 10;
  if (nivel === 2) return 15;
  return 20;
}

function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function montarQuestao(id, topico, assunto, dificuldade, enunciado, correta, erradas, explicacao) {
  const alternativas = embaralhar([
    { texto: correta, correta: true },
    ...erradas.map(texto => ({ texto, correta: false }))
  ]);

  return { id, topico, assunto, dificuldade, enunciado, alternativas, explicacao };
}

function gerarQuestoes() {
  const questoes = [];
  let id = 1;

  const contextoPreHistoria = [
    "Durante uma visita a um museu, uma turma observou pontas de pedra, ossos trabalhados e desenhos em cavernas.",
    "Em uma aula de História, estudantes compararam a vida de grupos caçadores-coletores com a de grupos agricultores.",
    "Ao analisar imagens de pinturas rupestres, a professora pediu que a turma pensasse sobre a vida dos primeiros seres humanos.",
    "Um grupo de alunos leu um texto sobre o domínio do fogo e as mudanças provocadas por essa descoberta.",
    "Em um trabalho escolar, uma equipe precisou explicar por que a agricultura transformou a vida humana.",
    "Ao estudar o período Neolítico, a turma percebeu que algumas comunidades passaram a morar por mais tempo no mesmo lugar.",
    "Um documentário mostrou que os primeiros seres humanos utilizavam elementos da natureza para fabricar instrumentos.",
    "Na biblioteca, a turma encontrou um livro que explicava a importância dos fósseis para conhecer o passado.",
    "Em uma atividade de revisão, os alunos discutiram a diferença entre nomadismo e sedentarização.",
    "Durante a correção de exercícios, a professora destacou que a Pré-História não significa ausência de cultura."
  ];

  const modelosPreHistoria = [
    {
      assunto: "Fontes históricas",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Esses materiais podem ser considerados fontes históricas porque`,
      correta: "ajudam a compreender formas de vida de sociedades do passado.",
      erradas: ["comprovam que todos os povos viviam do mesmo modo.", "mostram apenas fatos ocorridos depois da escrita.", "servem apenas como objetos de decoração.", "eliminam a necessidade de interpretação dos pesquisadores."],
      explicacao: "Fontes históricas são vestígios que ajudam a investigar o passado, como objetos, pinturas, fósseis, documentos e construções."
    },
    {
      assunto: "Paleolítico",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Uma característica comum do modo de vida paleolítico era`,
      correta: "a prática da caça, da pesca e da coleta de alimentos.",
      erradas: ["a construção de grandes cidades industriais.", "o uso de moedas em atividades bancárias.", "a produção de alimentos em fábricas.", "a escrita em livros impressos."],
      explicacao: "No Paleolítico, muitos grupos sobreviviam da caça, pesca e coleta, deslocando-se conforme a disponibilidade de recursos."
    },
    {
      assunto: "Nomadismo",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Quando um grupo se desloca em busca de alimentos e melhores condições de sobrevivência, esse modo de vida é chamado de`,
      correta: "nomadismo.",
      erradas: ["sedentarismo.", "urbanização.", "industrialização.", "monarquia."],
      explicacao: "Nomadismo é o deslocamento frequente de grupos humanos em busca de recursos, como água, caça, frutos e abrigo."
    },
    {
      assunto: "Domínio do fogo",
      dificuldade: 1,
      pergunta: ctx => `${ctx} O domínio do fogo foi importante porque permitiu`,
      correta: "cozinhar alimentos, aquecer o corpo e afastar animais.",
      erradas: ["criar computadores e redes sociais.", "substituir completamente a agricultura.", "impedir todos os conflitos entre grupos.", "eliminar a necessidade de abrigos."],
      explicacao: "O fogo trouxe mais proteção, calor e novas formas de preparar alimentos, melhorando as condições de sobrevivência."
    },
    {
      assunto: "Pinturas rupestres",
      dificuldade: 1,
      pergunta: ctx => `${ctx} As pinturas rupestres são importantes para a História porque`,
      correta: "registram cenas e símbolos que ajudam a estudar grupos antigos.",
      erradas: ["são fotografias tiradas por povos antigos.", "foram feitas apenas para vender em museus.", "mostram mapas políticos modernos.", "provam que não havia comunicação na Pré-História."],
      explicacao: "Pinturas rupestres revelam aspectos de comunicação, crenças, caça e cotidiano de grupos humanos antigos."
    },
    {
      assunto: "Neolítico",
      dificuldade: 2,
      pergunta: ctx => `${ctx} A chamada Revolução Neolítica está relacionada principalmente`,
      correta: "ao desenvolvimento da agricultura e da criação de animais.",
      erradas: ["à invenção da internet.", "ao início das grandes navegações europeias.", "ao desaparecimento de todas as aldeias.", "à criação das primeiras universidades."],
      explicacao: "A agricultura e a domesticação de animais permitiram maior produção de alimentos e favoreceram a formação de aldeias."
    },
    {
      assunto: "Sedentarização",
      dificuldade: 2,
      pergunta: ctx => `${ctx} A sedentarização ocorreu quando muitos grupos humanos passaram a`,
      correta: "fixar moradia em determinados lugares por mais tempo.",
      erradas: ["abandonar toda forma de cooperação.", "viver exclusivamente em navios.", "usar apenas alimentos industrializados.", "mudar de continente todos os dias."],
      explicacao: "Com a agricultura, grupos puderam permanecer em áreas férteis, formando aldeias e novas formas de organização."
    },
    {
      assunto: "Divisão de tarefas",
      dificuldade: 2,
      pergunta: ctx => `${ctx} O aumento da produção de alimentos contribuiu para`,
      correta: "a ampliação da divisão de tarefas dentro das comunidades.",
      erradas: ["o fim definitivo do trabalho humano.", "a eliminação de todos os instrumentos.", "a proibição da moradia fixa.", "a extinção imediata da pesca."],
      explicacao: "Com mais alimentos e comunidades maiores, as tarefas puderam se diversificar, como plantar, cuidar de animais, construir e produzir objetos."
    },
    {
      assunto: "Arqueologia",
      dificuldade: 2,
      pergunta: ctx => `${ctx} O trabalho do arqueólogo é importante porque`,
      correta: "estuda vestígios materiais para compreender sociedades antigas.",
      erradas: ["prevê exatamente o futuro das cidades.", "substitui todas as outras áreas do conhecimento.", "inventa objetos antigos sem investigação.", "analisa apenas notícias de televisão."],
      explicacao: "A arqueologia investiga objetos, ossos, ferramentas, construções e outros vestígios para interpretar o passado humano."
    },
    {
      assunto: "Mudanças sociais",
      dificuldade: 3,
      pergunta: ctx => `${ctx} Uma consequência da agricultura para a organização social foi`,
      correta: "o crescimento das aldeias e o surgimento de novas formas de cooperação e conflito.",
      erradas: ["o retorno obrigatório de todos os grupos ao nomadismo.", "a impossibilidade de armazenar alimentos.", "a ausência total de liderança em qualquer comunidade.", "o desaparecimento de instrumentos de trabalho."],
      explicacao: "A produção e o armazenamento de alimentos favoreceram aldeias maiores, divisão de tarefas e disputas por recursos e terras."
    }
  ];

  contextoPreHistoria.forEach((ctx, indiceContexto) => {
    modelosPreHistoria.forEach((modelo, indiceModelo) => {
      questoes.push(montarQuestao(
        id++,
        "Pré-História",
        modelo.assunto,
        modelo.dificuldade,
        modelo.pergunta(ctx),
        modelo.correta,
        modelo.erradas,
        modelo.explicacao
      ));
    });
  });

  const contextoAmerica = [
    "Em uma aula sobre o povoamento da América, a professora mostrou um mapa com possíveis rotas migratórias.",
    "Durante uma atividade, a turma comparou a hipótese da passagem pelo Estreito de Bering com a possibilidade de rotas costeiras.",
    "Ao estudar sítios arqueológicos brasileiros, os alunos conheceram pesquisas realizadas na Serra da Capivara.",
    "Um texto didático explicava que diferentes evidências ajudam a entender a chegada dos primeiros grupos humanos à América.",
    "Em um debate, os estudantes perceberam que a origem do homem americano é tema de investigação científica.",
    "Uma exposição apresentou instrumentos de pedra, pinturas rupestres e restos de fogueiras encontrados em antigas ocupações humanas.",
    "Ao observar imagens de sambaquis, a turma discutiu como povos antigos viviam em áreas litorâneas.",
    "Em uma reportagem escolar, foi citado que descobertas arqueológicas podem mudar interpretações sobre o passado.",
    "Na revisão, os alunos analisaram por que os primeiros grupos humanos precisavam se adaptar a ambientes diversos.",
    "Em um mapa da América, a turma localizou áreas frias, florestas, desertos e litorais ocupados por povos antigos."
  ];

  const modelosAmerica = [
    {
      assunto: "Migrações humanas",
      dificuldade: 1,
      pergunta: ctx => `${ctx} A palavra migração, nesse estudo, indica`,
      correta: "o deslocamento de grupos humanos de uma região para outra.",
      erradas: ["a permanência obrigatória no mesmo lugar para sempre.", "a construção de prédios comerciais modernos.", "a troca de dinheiro entre países atuais.", "a criação de mapas por satélite."],
      explicacao: "Migração é o deslocamento de pessoas ou grupos, muitas vezes em busca de alimento, abrigo e melhores condições de vida."
    },
    {
      assunto: "Estreito de Bering",
      dificuldade: 1,
      pergunta: ctx => `${ctx} A hipótese de Bering afirma que grupos humanos teriam chegado à América`,
      correta: "passando por uma área entre a Ásia e a América do Norte em período de baixa do nível do mar.",
      erradas: ["saindo da América para fundar a Europa medieval.", "viajando em aviões comerciais durante a Pré-História.", "atravessando diretamente o Oceano Atlântico em navios a vapor.", "usando mapas impressos produzidos no século XXI."],
      explicacao: "Uma das hipóteses mais conhecidas indica deslocamentos pelo norte, na região do Estreito de Bering, durante períodos glaciais."
    },
    {
      assunto: "Evidências arqueológicas",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Para estudar a presença humana antiga na América, os pesquisadores analisam`,
      correta: "fósseis, ferramentas, restos de fogueiras, pinturas e outros vestígios.",
      erradas: ["somente mensagens de celular.", "apenas documentos assinados em cartório.", "unicamente fotografias coloridas atuais.", "somente entrevistas televisionadas."],
      explicacao: "Como se trata de um passado muito antigo, vestígios materiais são fundamentais para a pesquisa."
    },
    {
      assunto: "Rotas costeiras",
      dificuldade: 2,
      pergunta: ctx => `${ctx} A hipótese das rotas costeiras sugere que`,
      correta: "alguns grupos podem ter se deslocado acompanhando litorais e recursos marinhos.",
      erradas: ["todos os povos americanos surgiram de uma única cidade moderna.", "a agricultura industrial foi a primeira atividade humana.", "os deslocamentos humanos ocorreram apenas por ferrovias.", "não houve adaptação aos ambientes naturais."],
      explicacao: "Além da rota pelo norte, há hipóteses que consideram deslocamentos por áreas costeiras, aproveitando recursos do mar."
    },
    {
      assunto: "Serra da Capivara",
      dificuldade: 2,
      pergunta: ctx => `${ctx} A Serra da Capivara, no Piauí, é importante porque`,
      correta: "possui sítios arqueológicos com pinturas e vestígios de ocupações antigas.",
      erradas: ["é uma fábrica de equipamentos eletrônicos.", "foi criada apenas para turismo de praias.", "tem somente prédios coloniais sem vestígios antigos.", "prova que não existiam povos antigos no Brasil."],
      explicacao: "A região da Serra da Capivara é conhecida por sítios arqueológicos, pinturas rupestres e pesquisas sobre antigas ocupações humanas."
    },
    {
      assunto: "Sambaquis",
      dificuldade: 2,
      pergunta: ctx => `${ctx} Os sambaquis indicam principalmente`,
      correta: "vestígios de povos que viveram em áreas próximas ao litoral e consumiam recursos marinhos.",
      erradas: ["restos de castelos medievais europeus.", "máquinas agrícolas do século XX.", "apenas lixeiras urbanas recentes.", "documentos digitais do período colonial."],
      explicacao: "Sambaquis são montes formados por conchas, ossos e outros vestígios, importantes para estudar povos antigos do litoral."
    },
    {
      assunto: "Diversidade cultural",
      dificuldade: 2,
      pergunta: ctx => `${ctx} A ocupação de ambientes diferentes na América mostra que`,
      correta: "os grupos humanos desenvolveram modos de vida variados.",
      erradas: ["todos os povos tinham exatamente as mesmas roupas, línguas e casas.", "a natureza não influenciava nenhuma atividade humana.", "as sociedades antigas não criavam técnicas.", "as pessoas viviam somente em um único clima."],
      explicacao: "A diversidade de ambientes contribuiu para diferentes formas de moradia, alimentação, trabalho e cultura."
    },
    {
      assunto: "Ciência e hipóteses",
      dificuldade: 3,
      pergunta: ctx => `${ctx} Quando novas descobertas arqueológicas aparecem, é correto afirmar que`,
      correta: "as hipóteses científicas podem ser revistas com base em novas evidências.",
      erradas: ["toda pesquisa antiga deve ser ignorada sem análise.", "a ciência nunca muda suas explicações.", "os vestígios deixam de ter valor para a História.", "a opinião sem prova passa a valer mais que a pesquisa."],
      explicacao: "O conhecimento científico é construído com evidências e pode ser aperfeiçoado quando novas informações são encontradas."
    },
    {
      assunto: "Adaptação ao ambiente",
      dificuldade: 3,
      pergunta: ctx => `${ctx} A adaptação dos primeiros grupos humanos aos ambientes americanos envolveu`,
      correta: "uso de recursos locais, criação de instrumentos e formas de organização do grupo.",
      erradas: ["dependência de supermercados e energia elétrica.", "abandono de qualquer técnica de sobrevivência.", "uso exclusivo de produtos industrializados.", "proibição de aprender com a natureza."],
      explicacao: "Os grupos humanos criaram soluções para sobreviver em diferentes ambientes, usando recursos disponíveis e conhecimentos coletivos."
    },
    {
      assunto: "Povoamento da América",
      dificuldade: 3,
      pergunta: ctx => `${ctx} Sobre o povoamento da América, a conclusão mais adequada é que`,
      correta: "existem diferentes hipóteses e evidências, por isso o tema continua sendo estudado.",
      erradas: ["não há qualquer vestígio sobre povos antigos.", "apenas uma resposta simples explica todos os casos.", "o assunto pertence somente à Geografia econômica atual.", "as pesquisas arqueológicas não têm relação com a História."],
      explicacao: "O povoamento americano é estudado por meio de hipóteses, mapas, vestígios e comparações entre diferentes descobertas."
    }
  ];

  contextoAmerica.forEach((ctx) => {
    modelosAmerica.forEach((modelo) => {
      questoes.push(montarQuestao(
        id++,
        "Origens do homem americano",
        modelo.assunto,
        modelo.dificuldade,
        modelo.pergunta(ctx),
        modelo.correta,
        modelo.erradas,
        modelo.explicacao
      ));
    });
  });

  const contextoGeografia = [
    "Em uma aula de Geografia, a professora pediu que os estudantes observassem o bairro onde vivem.",
    "Ao analisar um mapa do Brasil, a turma comparou áreas com características naturais, econômicas e culturais diferentes.",
    "Durante um passeio pela cidade, os alunos perceberam praças, ruas, escolas, comércios e rios modificados pela ação humana.",
    "Em uma atividade, a turma discutiu por que uma escola pode ser considerada um lugar importante para os estudantes.",
    "Ao estudar fronteiras, os alunos observaram que alguns espaços são organizados por regras e relações de poder.",
    "Um texto explicava que a paisagem pode revelar elementos naturais e elementos construídos pelas pessoas.",
    "Em um debate sobre pertencimento, vários alunos falaram sobre memórias relacionadas à rua, à casa e à escola.",
    "Na leitura de um mapa regional, a professora explicou que as regiões são recortes usados para facilitar estudos.",
    "Durante a revisão, os estudantes diferenciaram espaço geográfico, lugar, território, região e paisagem.",
    "Ao observar imagens de uma feira, de uma aldeia e de um centro comercial, a turma comparou diferentes formas de uso do espaço."
  ];

  const modelosGeo = [
    {
      assunto: "Lugar",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Em Geografia, o conceito de lugar está ligado principalmente`,
      correta: "às relações de vivência, identidade e pertencimento das pessoas com o espaço.",
      erradas: ["apenas a qualquer ponto sem significado para ninguém.", "somente aos países mais ricos do mundo.", "exclusivamente a áreas sem moradores.", "apenas aos mapas de satélite."],
      explicacao: "Lugar é o espaço vivido, onde as pessoas constroem experiências, lembranças e vínculos."
    },
    {
      assunto: "Paisagem",
      dificuldade: 1,
      pergunta: ctx => `${ctx} A paisagem pode ser entendida como`,
      correta: "aquilo que percebemos no espaço, incluindo elementos naturais e humanizados.",
      erradas: ["somente o que está escondido debaixo da terra.", "apenas os limites políticos entre países.", "um documento sem relação com o espaço.", "uma regra de comportamento escolar."],
      explicacao: "Paisagem é o conjunto de elementos visíveis e percebidos, como rios, prédios, ruas, vegetação e relevo."
    },
    {
      assunto: "Espaço geográfico",
      dificuldade: 1,
      pergunta: ctx => `${ctx} O espaço geográfico é formado`,
      correta: "pela relação entre natureza e ações humanas ao longo do tempo.",
      erradas: ["apenas por áreas que nunca foram modificadas.", "somente por desenhos feitos em cadernos.", "exclusivamente por planetas distantes.", "apenas por lugares sem população."],
      explicacao: "O espaço geográfico resulta das transformações feitas pelas sociedades na natureza e das formas de organização da vida humana."
    },
    {
      assunto: "Região",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Uma região pode ser definida como`,
      correta: "uma área delimitada para estudo por possuir critérios ou características comuns.",
      erradas: ["um espaço que não pode ser representado em mapas.", "um lugar sem nenhuma característica própria.", "uma pessoa que mora no campo.", "um objeto utilizado para medir temperatura."],
      explicacao: "Região é um recorte do espaço usado para organizar estudos, considerando critérios como clima, economia, cultura ou política."
    },
    {
      assunto: "Território",
      dificuldade: 2,
      pergunta: ctx => `${ctx} O conceito de território envolve`,
      correta: "controle, limites, regras e relações de poder sobre um espaço.",
      erradas: ["somente as lembranças pessoais de uma criança.", "apenas a cor predominante de uma paisagem.", "um espaço sem qualquer disputa ou regra.", "exclusivamente fenômenos astronômicos."],
      explicacao: "Território é um espaço apropriado ou controlado por pessoas, grupos, instituições ou Estados."
    },
    {
      assunto: "Fronteiras e limites",
      dificuldade: 2,
      pergunta: ctx => `${ctx} As fronteiras e os limites são importantes porque`,
      correta: "ajudam a indicar áreas de controle, administração e pertencimento territorial.",
      erradas: ["impedem qualquer relação entre povos vizinhos.", "existem apenas em desenhos infantis.", "não têm relação com organização do espaço.", "servem apenas para separar elementos naturais de mapas antigos."],
      explicacao: "Fronteiras e limites organizam territórios, mas também podem ser áreas de contato, troca e conflito."
    },
    {
      assunto: "Paisagem humanizada",
      dificuldade: 2,
      pergunta: ctx => `${ctx} Quando observamos ruas, casas, pontes e escolas, estamos vendo elementos`,
      correta: "humanizados, pois foram construídos ou modificados pela ação humana.",
      erradas: ["naturais, pois surgiram sem intervenção humana.", "invisíveis, pois não fazem parte da paisagem.", "astronômicos, pois pertencem ao espaço sideral.", "imaginários, pois não podem ser estudados."],
      explicacao: "Elementos humanizados são aqueles criados ou transformados pelas sociedades, como construções, plantações, estradas e cidades."
    },
    {
      assunto: "Critérios regionais",
      dificuldade: 3,
      pergunta: ctx => `${ctx} Ao dividir um país em regiões, é necessário escolher critérios porque`,
      correta: "a regionalização depende do objetivo do estudo e das características analisadas.",
      erradas: ["todas as regiões são iguais em qualquer mapa.", "os mapas não representam informações sobre o espaço.", "a Geografia não usa comparação entre áreas.", "as regiões são sempre naturais e nunca sociais."],
      explicacao: "Uma regionalização pode usar critérios físicos, econômicos, culturais, políticos ou sociais, conforme o objetivo da análise."
    },
    {
      assunto: "Território e poder",
      dificuldade: 3,
      pergunta: ctx => `${ctx} Um exemplo de território no cotidiano é`,
      correta: "uma escola com regras de uso, direção, salas e espaços organizados.",
      erradas: ["uma nuvem sem relação com qualquer grupo social.", "um pensamento que não se relaciona ao espaço.", "uma cor escolhida para pintar um desenho.", "um sonho sem localização ou controle."],
      explicacao: "Mesmo em escalas menores, como uma escola, existem espaços organizados por regras, autoridade e usos definidos."
    },
    {
      assunto: "Comparação de conceitos",
      dificuldade: 3,
      pergunta: ctx => `${ctx} A diferença mais adequada entre lugar e território é que`,
      correta: "lugar destaca vivência e identidade; território destaca controle, poder e limites.",
      erradas: ["lugar e território significam exatamente a mesma coisa.", "território trata apenas de sentimentos, e lugar apenas de fronteiras políticas.", "nenhum dos dois conceitos é usado pela Geografia.", "lugar é sempre maior que território."],
      explicacao: "Lugar se relaciona ao espaço vivido; território se relaciona à apropriação, controle e poder sobre o espaço."
    }
  ];

  contextoGeografia.forEach((ctx) => {
    modelosGeo.forEach((modelo) => {
      questoes.push(montarQuestao(
        id++,
        "Região, território e lugar",
        modelo.assunto,
        modelo.dificuldade,
        modelo.pergunta(ctx),
        modelo.correta,
        modelo.erradas,
        modelo.explicacao
      ));
    });
  });

  return questoes;
}

function criarAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  return new AudioContext();
}

function tocarNota(ctx, frequencia, inicio, duracao, tipo = "sine", volume = 0.08) {
  const oscilador = ctx.createOscillator();
  const ganho = ctx.createGain();
  oscilador.type = tipo;
  oscilador.frequency.setValueAtTime(frequencia, ctx.currentTime + inicio);
  ganho.gain.setValueAtTime(0.0001, ctx.currentTime + inicio);
  ganho.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + inicio + 0.02);
  ganho.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + duracao);
  oscilador.connect(ganho);
  ganho.connect(ctx.destination);
  oscilador.start(ctx.currentTime + inicio);
  oscilador.stop(ctx.currentTime + inicio + duracao + 0.02);
}

function tocarSomVitoria() {
  const ctx = criarAudioContext();
  if (!ctx) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, indice) => tocarNota(ctx, freq, indice * 0.09, 0.16, "triangle", 0.08));
}

function tocarSomErro() {
  const ctx = criarAudioContext();
  if (!ctx) return;
  tocarNota(ctx, 220, 0, 0.22, "sawtooth", 0.05);
  tocarNota(ctx, 164.81, 0.18, 0.32, "sawtooth", 0.05);
}

const canvas = document.getElementById("fogos");
const contextoCanvas = canvas.getContext("2d");
let particulas = [];

function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

function soltarFogos() {
  const centroX = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
  const centroY = Math.random() * canvas.height * 0.35 + canvas.height * 0.15;
  for (let i = 0; i < 85; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const velocidade = Math.random() * 5 + 2;
    particulas.push({
      x: centroX,
      y: centroY,
      vx: Math.cos(angulo) * velocidade,
      vy: Math.sin(angulo) * velocidade,
      vida: 70,
      tamanho: Math.random() * 4 + 2,
      cor: `hsl(${Math.floor(Math.random() * 360)}, 90%, 58%)`
    });
  }
}

function animarFogos() {
  contextoCanvas.clearRect(0, 0, canvas.width, canvas.height);
  particulas.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    p.vida--;
    contextoCanvas.globalAlpha = Math.max(p.vida / 70, 0);
    contextoCanvas.fillStyle = p.cor;
    contextoCanvas.beginPath();
    contextoCanvas.arc(p.x, p.y, p.tamanho, 0, Math.PI * 2);
    contextoCanvas.fill();
  });
  contextoCanvas.globalAlpha = 1;
  particulas = particulas.filter(p => p.vida > 0);
  requestAnimationFrame(animarFogos);
}

animarFogos();
