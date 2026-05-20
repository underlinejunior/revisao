const letras = ["A", "B", "C", "D", "E"];
const TEMPO_COMENTARIO = 10;

const estado = {
  questoes: [],
  indice: 0,
  pontuacao: 0,
  acertos: 0,
  erros: 0,
  travada: false,
  bloqueadoComentario: false,
  temporizadorComentario: null,
  respostas: [],
  estatisticas: {},
  quizIniciado: false
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

window.addEventListener("popstate", () => {
  if (!telaQuiz.classList.contains("escondido")) {
    history.pushState({ quizBloqueado: true }, "", location.href);
    alert("Durante o quiz, não é possível voltar para questões anteriores. Continue pela próxima questão.");
  }
});

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
  estado.bloqueadoComentario = false;
  estado.respostas = [];
  estado.estatisticas = {};
  limparTemporizadorComentario();

  estado.questoes.forEach(q => {
    if (!estado.estatisticas[q.topico]) {
      estado.estatisticas[q.topico] = { total: 0, acertos: 0, erros: 0 };
    }
    estado.estatisticas[q.topico].total++;
  });

  telaInicial.classList.add("escondido");
  telaResultado.classList.add("escondido");
  telaQuiz.classList.remove("escondido");

  if (!estado.quizIniciado) {
    history.pushState({ quizBloqueado: true }, "", location.href);
    estado.quizIniciado = true;
  }

  atualizarPlacar();
  renderizarQuestao();
}

function renderizarQuestao() {
  const questao = estado.questoes[estado.indice];
  const ultimaQuestao = estado.indice === estado.questoes.length - 1;

  estado.travada = false;
  estado.bloqueadoComentario = false;
  limparTemporizadorComentario();

  btnProxima.disabled = true;
  btnProxima.textContent = "Próxima questão";
  btnProxima.classList.toggle("escondido", ultimaQuestao);
  btnFinalizar.disabled = true;
  btnFinalizar.classList.add("escondido");

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
  const alternativaEscolhida = questao.alternativas[indiceEscolhido];
  const alternativaCorreta = questao.alternativas.find(item => item.correta);
  const acertou = alternativaEscolhida.correta;

  estado.travada = true;
  estado.bloqueadoComentario = true;
  btnProxima.disabled = true;
  btnProxima.classList.add("escondido");
  btnFinalizar.disabled = true;
  btnFinalizar.classList.add("escondido");

  const botoes = [...document.querySelectorAll(".alternativa")];
  botoes.forEach((botao, indice) => {
    botao.disabled = true;
    if (questao.alternativas[indice].correta) {
      botao.classList.add("correta");
    }
  });

  if (acertou) {
    estado.acertos++;
    estado.pontuacao += pontosPorDificuldade(questao.dificuldade);
    estado.estatisticas[questao.topico].acertos++;
    botaoEscolhido.classList.add("correta");
    feedback.className = "feedback ok";
    feedback.innerHTML = `
      <div class="feedback-card">
        <strong class="feedback-titulo">Correto! Você marcou a resposta certa.</strong>
        <p><strong>Resposta:</strong> ${alternativaCorreta.texto}</p>
        <p><strong>Por quê?</strong> ${questao.explicacao}</p>
        <div id="tempoComentario" class="tempo-comentario"></div>
        <button id="btnComentarioAcao" class="btn secundario feedback-acao" type="button" disabled>Aguarde...</button>
      </div>
    `;
    tocarSomVitoria();
    soltarFogos();
    animarPontuacao();
  } else {
    estado.erros++;
    estado.estatisticas[questao.topico].erros++;
    botaoEscolhido.classList.add("errada");
    feedback.className = "feedback erro";
    feedback.innerHTML = `
      <div class="feedback-card">
        <strong class="feedback-titulo">Errado. Veja a resposta correta com calma.</strong>
        <p><strong>Sua resposta:</strong> ${alternativaEscolhida.texto}</p>
        <p><strong>Resposta correta:</strong> ${alternativaCorreta.texto}</p>
        <p><strong>Por quê?</strong> ${questao.explicacao}</p>
        <div id="tempoComentario" class="tempo-comentario"></div>
        <button id="btnComentarioAcao" class="btn secundario feedback-acao" type="button" disabled>Aguarde...</button>
      </div>
    `;
    tocarSomErro();
  }

  estado.respostas.push({
    id: questao.id,
    topico: questao.topico,
    assunto: questao.assunto,
    enunciado: questao.enunciado,
    escolha: alternativaEscolhida.texto,
    correta: alternativaCorreta.texto,
    acertou,
    explicacao: questao.explicacao
  });

  atualizarPlacar();
  iniciarBloqueioComentario();
}

function iniciarBloqueioComentario() {
  let restante = TEMPO_COMENTARIO;
  const tempoEl = document.getElementById("tempoComentario");
  const btnComentarioAcao = document.getElementById("btnComentarioAcao");

  const atualizarMensagem = () => {
    if (!tempoEl) return;
    tempoEl.innerHTML = `Leia o comentário antes de continuar. A ação será liberada em <strong>${restante}s</strong>.`;
  };

  if (btnComentarioAcao) {
    btnComentarioAcao.disabled = true;
    btnComentarioAcao.textContent = `Aguarde ${restante}s`;
  }

  atualizarMensagem();
  estado.temporizadorComentario = setInterval(() => {
    restante--;

    if (btnComentarioAcao) {
      btnComentarioAcao.textContent = `Aguarde ${Math.max(restante, 0)}s`;
    }

    if (restante > 0) {
      atualizarMensagem();
      return;
    }

    limparTemporizadorComentario();
    estado.bloqueadoComentario = false;

    const ultimaQuestao = estado.indice === estado.questoes.length - 1;
    const textoAcao = ultimaQuestao ? "Finalizar quiz" : "Próxima questão";

    if (tempoEl) {
      tempoEl.classList.add("liberado");
      tempoEl.innerHTML = ultimaQuestao
        ? "Comentário liberado. Agora você pode finalizar o quiz."
        : "Comentário liberado. Agora você pode abrir a próxima questão.";
    }

    if (btnComentarioAcao) {
      btnComentarioAcao.disabled = false;
      btnComentarioAcao.textContent = textoAcao;
      btnComentarioAcao.classList.toggle("principal", ultimaQuestao);
      btnComentarioAcao.classList.toggle("secundario", !ultimaQuestao);
      btnComentarioAcao.addEventListener("click", () => {
        if (ultimaQuestao) {
          mostrarResultado();
          return;
        }
        proximaQuestao();
      }, { once: true });
    }

    if (ultimaQuestao) {
      btnProxima.classList.add("escondido");
      btnProxima.disabled = true;
      btnFinalizar.classList.remove("escondido");
      btnFinalizar.disabled = false;
    } else {
      btnFinalizar.classList.add("escondido");
      btnFinalizar.disabled = true;
      btnProxima.classList.remove("escondido");
      btnProxima.disabled = false;
      btnProxima.textContent = "Próxima questão";
    }
  }, 1000);
}

function limparTemporizadorComentario() {
  if (estado.temporizadorComentario) {
    clearInterval(estado.temporizadorComentario);
    estado.temporizadorComentario = null;
  }
}

function proximaQuestao() {
  if (estado.bloqueadoComentario) return;

  if (estado.indice >= estado.questoes.length - 1) {
    mostrarResultado();
    return;
  }

  estado.indice++;
  renderizarQuestao();
}

function mostrarResultado() {
  if (estado.bloqueadoComentario) return;

  const totalRespondidas = estado.acertos + estado.erros;
  if (totalRespondidas < estado.questoes.length) return;

  limparTemporizadorComentario();
  telaQuiz.classList.add("escondido");
  telaResultado.classList.remove("escondido");
  barraProgresso.style.width = "100%";

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

  const contextoGeografia = [
    "Em uma aula, a turma observou uma imagem da Terra vista do espaço e comparou com mapas do planeta.",
    "Durante uma visita ao laboratório, os estudantes usaram uma lanterna e uma bola para simular o Sol e a Terra.",
    "Uma reportagem mostrava missões espaciais e imagens de planetas do Sistema Solar.",
    "Na revisão, o professor pediu que a turma explicasse por que existe dia e noite.",
    "Em um calendário, os alunos perceberam que o ano tem relação com o movimento da Terra em torno do Sol.",
    "Ao observar o céu à noite, um estudante viu a Lua, estrelas e alguns pontos luminosos que poderiam ser planetas.",
    "A turma comparou os planetas rochosos com os planetas gasosos em um cartaz de Ciências e Geografia.",
    "Em uma atividade, os alunos discutiram por que a Terra é considerada um planeta com condições favoráveis à vida.",
    "Durante a leitura da apostila, a turma estudou o Universo, as galáxias, as estrelas e o Sistema Solar.",
    "Um aluno perguntou por que não sentimos a Terra girar, mesmo sabendo que ela está em movimento."
  ];

  const modelosGeografia = [
    {
      assunto: "Universo",
      dificuldade: 1,
      pergunta: ctx => `${ctx} O Universo pode ser entendido como`,
      correta: "o conjunto de tudo que existe, como galáxias, estrelas, planetas, matéria e energia.",
      erradas: ["apenas o planeta Terra.", "somente o Sol e a Lua.", "uma cidade iluminada à noite.", "apenas os oceanos do planeta.", "um mapa usado em sala de aula."],
      explicacao: "Universo é a totalidade do espaço, da matéria e da energia. Nele estão as galáxias, estrelas, planetas e muitos outros corpos celestes."
    },
    {
      assunto: "Galáxias",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Uma galáxia é melhor definida como`,
      correta: "um grande conjunto de estrelas, gases, poeira e outros corpos celestes.",
      erradas: ["uma camada de ar que envolve a Terra.", "um tipo de rocha encontrado no solo.", "uma fase da Lua vista da Terra.", "um aparelho usado para medir temperatura.", "uma linha imaginária do globo terrestre."],
      explicacao: "Galáxias são enormes conjuntos de estrelas e outros materiais. A Terra fica na galáxia chamada Via Láctea."
    },
    {
      assunto: "Sistema Solar",
      dificuldade: 1,
      pergunta: ctx => `${ctx} No Sistema Solar, o Sol ocupa posição central porque`,
      correta: "é a estrela em torno da qual os planetas orbitam.",
      erradas: ["é um planeta rochoso igual à Terra.", "gira em torno de todos os satélites artificiais.", "fica parado dentro da atmosfera terrestre.", "é a única lua do planeta Terra.", "não emite luz nem calor."],
      explicacao: "O Sol é uma estrela. Sua gravidade mantém os planetas e outros corpos em órbita ao seu redor."
    },
    {
      assunto: "Planetas",
      dificuldade: 1,
      pergunta: ctx => `${ctx} A Terra é classificada como planeta porque`,
      correta: "orbita o Sol e não possui luz própria.",
      erradas: ["produz luz própria como uma estrela.", "fica fora do Sistema Solar.", "é feita apenas de gases leves.", "não realiza nenhum movimento.", "é maior que o Sol."],
      explicacao: "Planetas giram ao redor de uma estrela e não produzem luz própria. A Terra recebe luz e calor do Sol."
    },
    {
      assunto: "Rotação da Terra",
      dificuldade: 1,
      pergunta: ctx => `${ctx} O movimento de rotação da Terra é responsável principalmente`,
      correta: "pela sucessão dos dias e das noites.",
      erradas: ["pela criação dos continentes.", "pelo surgimento das estrelas.", "pela formação dos oceanos.", "pela mudança do formato da Lua.", "pela distância entre as galáxias."],
      explicacao: "Rotação é o giro da Terra em torno de si mesma. Esse movimento faz uma parte do planeta ficar iluminada enquanto outra fica escura."
    },
    {
      assunto: "Translação da Terra",
      dificuldade: 2,
      pergunta: ctx => `${ctx} O movimento de translação da Terra corresponde`,
      correta: "ao caminho que a Terra realiza ao redor do Sol.",
      erradas: ["ao giro da Terra em torno de si mesma.", "ao movimento das águas dos rios.", "à queda de objetos no chão.", "ao deslocamento de carros em uma rua.", "ao brilho das estrelas durante a noite."],
      explicacao: "Translação é o movimento da Terra ao redor do Sol. Ele está relacionado à duração do ano."
    },
    {
      assunto: "Lua",
      dificuldade: 2,
      pergunta: ctx => `${ctx} A Lua é um satélite natural porque`,
      correta: "orbita a Terra de forma natural.",
      erradas: ["é uma estrela que produz luz própria.", "é um planeta maior que Júpiter.", "foi construída por seres humanos.", "fica no centro do Sistema Solar.", "não se movimenta no espaço."],
      explicacao: "Satélite natural é um corpo celeste que orbita um planeta. A Lua orbita a Terra e reflete a luz do Sol."
    },
    {
      assunto: "Condições de vida na Terra",
      dificuldade: 2,
      pergunta: ctx => `${ctx} Uma condição importante para a vida na Terra é`,
      correta: "a presença de água líquida e temperatura adequada em muitas regiões.",
      erradas: ["a ausência total de atmosfera.", "a falta completa de luz solar.", "a inexistência de qualquer forma de água.", "a distância igual a todos os planetas.", "o planeta ser feito somente de gelo."],
      explicacao: "A Terra tem água, atmosfera e recebe energia solar em condições que favorecem muitas formas de vida."
    },
    {
      assunto: "Planetas rochosos e gasosos",
      dificuldade: 3,
      pergunta: ctx => `${ctx} Uma diferença entre planetas rochosos e gasosos é que`,
      correta: "os rochosos têm superfície sólida, enquanto os gasosos são formados principalmente por gases.",
      erradas: ["os rochosos são sempre maiores que todos os gasosos.", "os gasosos ficam todos entre Mercúrio e Marte.", "os rochosos não orbitam o Sol.", "os gasosos têm superfície sólida igual à da Terra.", "os rochosos produzem luz própria."],
      explicacao: "Mercúrio, Vênus, Terra e Marte são rochosos. Júpiter, Saturno, Urano e Netuno são gasosos ou gigantes gasosos/gelados."
    },
    {
      assunto: "Leitura de fenômenos astronômicos",
      dificuldade: 3,
      pergunta: ctx => `${ctx} Quando alguém diz que o Sol 'nasce' no leste e 'se põe' no oeste, a explicação correta envolve`,
      correta: "a rotação da Terra, que causa a impressão de movimento aparente do Sol no céu.",
      erradas: ["o Sol girando todos os dias em torno da Terra.", "a Lua empurrando o Sol para o horizonte.", "a ausência de movimento do planeta Terra.", "a translação da Lua ao redor do Sol.", "a criação de novas estrelas durante o dia."],
      explicacao: "O Sol parece se mover no céu, mas essa aparência ocorre porque a Terra gira em torno de si mesma."
    }
  ];

  contextoGeografia.forEach(ctx => {
    modelosGeografia.forEach(modelo => {
      questoes.push(montarQuestao(id++, "Geografia: Universo, Sistema Solar e Terra", modelo.assunto, modelo.dificuldade, modelo.pergunta(ctx), modelo.correta, modelo.erradas, modelo.explicacao));
    });
  });

  const contextoMovimentos = [
    "No pátio da escola, dois alunos observaram uma bola rolando após ser chutada.",
    "Durante uma aula prática, a professora pediu que a turma observasse uma bicicleta passando pela rua.",
    "Um estudante percebeu que um ônibus parado no ponto parecia se mover quando outro ônibus saiu ao lado.",
    "Em uma corrida, os alunos compararam quem percorreu a mesma distância em menos tempo.",
    "Ao empurrar um carrinho de brinquedo, a turma notou que ele mudava de posição com o passar do tempo.",
    "Na quadra, uma bola foi lançada para cima e depois voltou ao chão.",
    "Durante uma viagem, uma criança sentada no carro viu árvores passando pela janela.",
    "Em uma experiência simples, os alunos soltaram uma bolinha em uma rampa inclinada.",
    "Na aula de Física, a turma discutiu exemplos de repouso e movimento no cotidiano.",
    "Um vídeo mostrou atletas, carros, aviões e pessoas caminhando em diferentes velocidades."
  ];

  const modelosMovimentos = [
    {
      assunto: "Movimento",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Dizemos que um corpo está em movimento quando`,
      correta: "sua posição muda em relação a um referencial com o passar do tempo.",
      erradas: ["ele sempre fica no mesmo lugar.", "ele não possui massa.", "ele está obrigatoriamente quebrado.", "ele não pode ser observado.", "ele deixa de existir no espaço."],
      explicacao: "Movimento depende da mudança de posição em relação a algo escolhido como referência, chamado referencial."
    },
    {
      assunto: "Repouso",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Um objeto está em repouso quando`,
      correta: "sua posição não muda em relação ao referencial escolhido.",
      erradas: ["sua velocidade sempre aumenta.", "ele obrigatoriamente está no espaço sideral.", "ele muda de lugar a cada segundo.", "ele deixa de sofrer gravidade.", "ele não pode ser medido."],
      explicacao: "Repouso significa não mudar de posição em relação a um referencial. Uma pessoa sentada pode estar em repouso em relação ao banco."
    },
    {
      assunto: "Referencial",
      dificuldade: 1,
      pergunta: ctx => `${ctx} O referencial é importante no estudo dos movimentos porque`,
      correta: "ajuda a dizer em relação a quê um corpo está parado ou se movendo.",
      erradas: ["elimina a necessidade de observar o tempo.", "transforma qualquer corpo em estrela.", "faz todos os objetos terem a mesma velocidade.", "impede que algo mude de posição.", "serve apenas para medir temperatura."],
      explicacao: "O mesmo corpo pode parecer parado para uma pessoa e em movimento para outra, dependendo do referencial adotado."
    },
    {
      assunto: "Trajetória",
      dificuldade: 1,
      pergunta: ctx => `${ctx} A trajetória de um corpo é`,
      correta: "o caminho percorrido por ele durante o movimento.",
      erradas: ["a cor do objeto em repouso.", "o peso de um corpo parado.", "a quantidade de matéria de uma estrela.", "a temperatura de uma sala.", "o nome de qualquer planeta."],
      explicacao: "Trajetória é o caminho feito por um corpo. Pode ser reta, curva, circular ou ter outras formas."
    },
    {
      assunto: "Distância percorrida",
      dificuldade: 1,
      pergunta: ctx => `${ctx} A distância percorrida corresponde`,
      correta: "ao comprimento do caminho feito pelo corpo.",
      erradas: ["ao brilho produzido pelo objeto.", "ao tamanho da sombra de uma árvore.", "à cor da roupa do observador.", "à quantidade de planetas do Sistema Solar.", "ao nome do referencial escolhido."],
      explicacao: "Distância percorrida é quanto o corpo andou ao longo da trajetória, como 10 metros, 2 quilômetros ou 50 centímetros."
    },
    {
      assunto: "Rapidez e velocidade",
      dificuldade: 2,
      pergunta: ctx => `${ctx} Se dois alunos percorrem a mesma distância, chega primeiro aquele que`,
      correta: "tem maior velocidade média no percurso.",
      erradas: ["fica mais tempo parado.", "anda obrigatoriamente em zigue-zague.", "não muda de posição.", "não possui trajetória.", "não usa referencial."],
      explicacao: "Velocidade média relaciona distância e tempo. Para a mesma distância, quem gasta menos tempo tem maior velocidade média."
    },
    {
      assunto: "Mudança de velocidade",
      dificuldade: 2,
      pergunta: ctx => `${ctx} Quando um corpo passa a se mover cada vez mais rápido, ocorre`,
      correta: "aumento de velocidade, isto é, aceleração.",
      erradas: ["repouso absoluto em todos os referenciais.", "ausência de qualquer movimento.", "diminuição obrigatória da distância.", "desaparecimento da trajetória.", "transformação em satélite natural."],
      explicacao: "Aceleração acontece quando a velocidade muda. Ela pode aumentar, diminuir ou mudar a direção do movimento."
    },
    {
      assunto: "Movimento relativo",
      dificuldade: 2,
      pergunta: ctx => `${ctx} Essa situação mostra que movimento e repouso podem depender`,
      correta: "do referencial escolhido pelo observador.",
      erradas: ["apenas da cor do corpo observado.", "somente do mês do ano.", "da fase da Lua, em qualquer caso.", "do nome da escola.", "da quantidade de nuvens no céu."],
      explicacao: "Uma pessoa dentro de um ônibus pode estar parada em relação ao banco, mas em movimento em relação à calçada."
    },
    {
      assunto: "Forças e movimento",
      dificuldade: 3,
      pergunta: ctx => `${ctx} Ao chutar uma bola parada, o pé exerce uma ação que pode`,
      correta: "alterar o estado de repouso ou movimento da bola.",
      erradas: ["fazer a bola perder toda a matéria.", "impedir qualquer mudança de posição.", "transformar a bola em fonte de luz própria.", "eliminar a gravidade do local.", "apagar a trajetória já percorrida."],
      explicacao: "Uma força pode mudar o movimento de um corpo, fazendo-o iniciar, parar, acelerar, frear ou mudar de direção."
    },
    {
      assunto: "Interpretação de situação cotidiana",
      dificuldade: 3,
      pergunta: ctx => `${ctx} A análise correta dessa situação deve considerar`,
      correta: "posição, tempo, trajetória, velocidade e referencial.",
      erradas: ["apenas a cor do objeto.", "somente o nome da rua.", "apenas a fase da Lua.", "somente a marca do calçado.", "apenas a quantidade de alunos na turma."],
      explicacao: "Para estudar movimentos, observamos como a posição muda com o tempo, qual caminho foi seguido e qual referencial foi usado."
    }
  ];

  contextoMovimentos.forEach(ctx => {
    modelosMovimentos.forEach(modelo => {
      questoes.push(montarQuestao(id++, "Física: Física dos movimentos", modelo.assunto, modelo.dificuldade, modelo.pergunta(ctx), modelo.correta, modelo.erradas, modelo.explicacao));
    });
  });

  const contextoCinematica = [
    "Em uma atividade, a turma registrou a posição de um carrinho a cada segundo.",
    "Um aplicativo de mapas indicou que uma pessoa percorreu 3 km em determinado tempo.",
    "Na quadra, os estudantes compararam o movimento de uma bola rolando em linha reta e de outra fazendo curva.",
    "Durante um experimento, uma bolinha desceu uma rampa e ficou mais rápida.",
    "A professora desenhou no quadro uma estrada reta e pediu que os alunos pensassem no movimento de um carro.",
    "Em uma corrida, um estudante manteve quase o mesmo ritmo durante todo o trajeto.",
    "Um ciclista freou ao se aproximar de uma faixa de pedestres.",
    "Um ventilador girando chamou a atenção da turma para movimentos circulares.",
    "Na aula, os estudantes diferenciaram velocidade média, movimento uniforme e movimento variado.",
    "Uma questão contextualizada pediu que os alunos relacionassem distância, tempo e velocidade em uma situação do cotidiano."
  ];

  const modelosCinematica = [
    {
      assunto: "Cinemática",
      dificuldade: 1,
      pergunta: ctx => `${ctx} A cinemática é a parte da Física que estuda`,
      correta: "os movimentos, sem se preocupar primeiro com suas causas.",
      erradas: ["apenas a formação das estrelas.", "somente os seres vivos microscópicos.", "a composição química dos alimentos.", "as regras de acentuação gráfica.", "somente mapas políticos."],
      explicacao: "A cinemática descreve movimentos usando ideias como posição, tempo, trajetória, velocidade e aceleração."
    },
    {
      assunto: "Posição",
      dificuldade: 1,
      pergunta: ctx => `${ctx} A posição de um corpo indica`,
      correta: "onde ele está em relação a um referencial.",
      erradas: ["a quantidade de luz que ele emite.", "a cor que ele apresenta.", "o nome científico do objeto.", "a temperatura do Sol.", "a fase da Lua naquele dia."],
      explicacao: "Posição mostra a localização de um corpo em relação a um ponto ou sistema de referência."
    },
    {
      assunto: "Velocidade média",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Para calcular a velocidade média de forma simples, relacionamos`,
      correta: "distância percorrida e tempo gasto.",
      erradas: ["cor e formato do objeto.", "temperatura e umidade do ar.", "massa da Terra e brilho da Lua.", "nome da pessoa e idade.", "quantidade de planetas e estrelas."],
      explicacao: "Em nível básico, velocidade média indica quanto espaço foi percorrido em certo intervalo de tempo."
    },
    {
      assunto: "Movimento retilíneo",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Um movimento retilíneo acontece quando a trajetória é`,
      correta: "uma linha reta.",
      erradas: ["sempre circular.", "sempre em zigue-zague.", "invisível e sem caminho.", "igual ao formato da Lua.", "sem relação com espaço."],
      explicacao: "Movimento retilíneo é aquele em que o corpo se desloca seguindo uma trajetória reta."
    },
    {
      assunto: "Movimento curvilíneo",
      dificuldade: 1,
      pergunta: ctx => `${ctx} Um movimento curvilíneo é aquele em que`,
      correta: "a trajetória apresenta curva.",
      erradas: ["o corpo não muda de posição.", "a trajetória é sempre uma reta perfeita.", "não existe tempo envolvido.", "o objeto deixa de ter posição.", "o corpo não pode ser observado."],
      explicacao: "Quando o caminho tem curva, chamamos o movimento de curvilíneo. Uma bola fazendo curva é um exemplo."
    },
    {
      assunto: "Movimento uniforme",
      dificuldade: 2,
      pergunta: ctx => `${ctx} Um movimento uniforme ocorre quando`,
      correta: "a velocidade permanece constante ao longo do tempo.",
      erradas: ["a velocidade muda a cada instante obrigatoriamente.", "o corpo está sempre parado.", "a trajetória deixa de existir.", "o objeto não ocupa posição.", "o movimento acontece sem tempo."],
      explicacao: "No movimento uniforme, o corpo percorre distâncias iguais em tempos iguais, mantendo a velocidade constante."
    },
    {
      assunto: "Movimento variado",
      dificuldade: 2,
      pergunta: ctx => `${ctx} Um movimento variado ocorre quando`,
      correta: "a velocidade muda durante o movimento.",
      erradas: ["a velocidade fica sempre igual.", "o corpo não tem trajetória.", "o objeto não muda de posição em relação a nada.", "não existe tempo no movimento.", "a distância percorrida é sempre zero."],
      explicacao: "Se a velocidade aumenta, diminui ou muda de direção, o movimento é variado."
    },
    {
      assunto: "Aceleração",
      dificuldade: 2,
      pergunta: ctx => `${ctx} Quando um ciclista freia, sua velocidade diminui. Isso mostra que`,
      correta: "houve aceleração no sentido de reduzir a velocidade.",
      erradas: ["não ocorreu nenhuma mudança no movimento.", "o ciclista passou a produzir luz própria.", "a trajetória deixou de existir.", "a distância voltou automaticamente para zero.", "o referencial não importa em nenhuma análise."],
      explicacao: "Aceleração é mudança de velocidade. Frear também é uma forma de aceleração, pois a velocidade diminui."
    },
    {
      assunto: "Movimento circular",
      dificuldade: 3,
      pergunta: ctx => `${ctx} O giro das pás de um ventilador é exemplo de movimento`,
      correta: "circular, pois segue uma trajetória em forma de círculo.",
      erradas: ["retilíneo, pois segue apenas uma linha reta.", "sem trajetória, pois não há movimento.", "de translação da Terra.", "de repouso em relação ao ar.", "de formação de galáxias."],
      explicacao: "No movimento circular, o caminho se repete em torno de um centro, como nas pás de um ventilador ou em uma roda girando."
    },
    {
      assunto: "Questão de raciocínio tipo ENEM",
      dificuldade: 3,
      pergunta: ctx => `${ctx} Se uma pessoa percorre maior distância no mesmo intervalo de tempo que outra, podemos concluir que`,
      correta: "sua velocidade média foi maior.",
      erradas: ["ela ficou mais tempo parada.", "sua velocidade média foi menor obrigatoriamente.", "não houve movimento.", "a trajetória não existiu.", "o tempo não participou da comparação."],
      explicacao: "Velocidade média compara distância e tempo. No mesmo tempo, quem percorre maior distância tem maior velocidade média."
    }
  ];

  contextoCinematica.forEach(ctx => {
    modelosCinematica.forEach(modelo => {
      questoes.push(montarQuestao(id++, "Física: Cinemática e tipos de movimento", modelo.assunto, modelo.dificuldade, modelo.pergunta(ctx), modelo.correta, modelo.erradas, modelo.explicacao));
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
