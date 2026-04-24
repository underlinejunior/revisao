const TOPICOS = [
  "Adição com números naturais",
  "Subtração com números naturais",
  "Multiplicação com números naturais",
  "Divisão exata",
  "Divisão com resto",
  "Expressões numéricas",
  "Problemas com mais de uma operação",
  "Sólidos geométricos",
  "Faces, arestas e vértices",
  "Polígonos e perímetro"
];

const letras = ["A", "B", "C", "D"];
let bancoQuestoes = [];
let respostas = JSON.parse(localStorage.getItem("respostasRevisao6Ano") || "{}");
let idsAtuais = [];
let indiceAtual = 0;
let modoAtual = "todos";

function numero(valor) {
  return Number(valor).toLocaleString("pt-BR");
}

function salvarRespostas() {
  localStorage.setItem("respostasRevisao6Ano", JSON.stringify(respostas));
}

function alternativasNumero(correta, unidade = "") {
  const candidatos = [
    correta,
    correta + 1,
    correta - 1,
    correta + 10,
    correta - 10,
    correta + 100,
    Math.max(0, correta - 100),
    correta * 2,
    Math.max(0, Math.floor(correta / 2))
  ];

  const unicos = [];
  for (const item of candidatos) {
    if (item >= 0 && !unicos.includes(item)) unicos.push(item);
  }

  while (unicos.length < 4) {
    const novo = correta + unicos.length * 7 + 3;
    if (!unicos.includes(novo)) unicos.push(novo);
  }

  return unicos.slice(0, 4).map((item) => `${numero(item)}${unidade}`);
}

function embaralharAlternativas(opcoes, correta) {
  const lista = [...new Set(opcoes)].slice(0, 4);
  while (lista.length < 4) lista.push(`Alternativa ${lista.length + 1}`);

  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }

  return {
    opcoes: lista,
    correta: lista.indexOf(correta)
  };
}

function adicionarQuestao(topico, enunciado, respostaCorreta, explicacao, distratores = []) {
  const id = bancoQuestoes.length + 1;
  const corretaTexto = String(respostaCorreta);
  const opcoesBase = [corretaTexto, ...distratores.map(String)];
  const { opcoes, correta } = embaralharAlternativas(opcoesBase, corretaTexto);

  bancoQuestoes.push({
    id,
    topico,
    enunciado,
    opcoes,
    correta,
    explicacao
  });
}

function adicionarNumerica(topico, enunciado, correta, explicacao, unidade = "") {
  const corretaTexto = `${numero(correta)}${unidade}`;
  const opcoes = alternativasNumero(correta, unidade);
  adicionarQuestao(topico, enunciado, corretaTexto, explicacao, opcoes.filter((opcao) => opcao !== corretaTexto));
}

function adicionarMultipla(topico, enunciado, correta, distratores, explicacao) {
  adicionarQuestao(topico, enunciado, correta, explicacao, distratores);
}

function montarQuestoes() {
  const T1 = TOPICOS[0];
  const adicoes = [
    [234, 125], [508, 341], [720, 189], [1245, 632], [2308, 1421],
    [3450, 2675], [4809, 3126], [7560, 2934], [9875, 4325], [12450, 8320]
  ];
  adicoes.forEach(([a, b]) => {
    const correta = a + b;
    adicionarNumerica(T1, `Resolva: ${numero(a)} + ${numero(b)}`, correta, `Para resolver, somamos as parcelas: ${numero(a)} + ${numero(b)} = ${numero(correta)}.`);
  });
  adicionarNumerica(T1, "Uma escola recebeu 235 livros de Matemática e 178 livros de Português. Quantos livros recebeu ao todo?", 413, "A ideia é juntar as quantidades: 235 + 178 = 413.", " livros");
  adicionarNumerica(T1, "Em uma campanha, foram arrecadados 450 kg de alimentos pela manhã e 375 kg à tarde. Quantos quilos foram arrecadados?", 825, "Somamos o que foi arrecadado nos dois períodos: 450 + 375 = 825.", " kg");
  adicionarNumerica(T1, "João tinha 128 figurinhas e ganhou mais 76. Com quantas figurinhas ficou?", 204, "Como ele ganhou mais figurinhas, fazemos 128 + 76 = 204.", " figurinhas");
  adicionarNumerica(T1, "Uma loja vendeu 324 camisetas pela manhã e 289 à tarde. Quantas camisetas vendeu no dia?", 613, "Somamos as vendas: 324 + 289 = 613.", " camisetas");
  adicionarNumerica(T1, "Uma biblioteca possui 1.250 livros de literatura e 875 livros didáticos. Quantos livros há no total?", 2125, "O total é a soma das duas quantidades: 1.250 + 875 = 2.125.", " livros");
  adicionarNumerica(T1, "Em uma cidade, havia 12.450 habitantes. No ano seguinte, chegaram mais 1.230 pessoas. Qual passou a ser a população?", 13680, "A população aumentou, então somamos: 12.450 + 1.230 = 13.680.", " habitantes");
  adicionarNumerica(T1, "Um mercado vendeu 2.345 produtos em janeiro e 3.128 em fevereiro. Quantos produtos foram vendidos nesses dois meses?", 5473, "Somamos os produtos vendidos nos dois meses: 2.345 + 3.128 = 5.473.", " produtos");
  adicionarNumerica(T1, "Uma escola tem 428 alunos no turno da manhã e 397 no turno da tarde. Quantos alunos estudam nessa escola?", 825, "O total de alunos é 428 + 397 = 825.", " alunos");
  adicionarNumerica(T1, "Uma fazenda colheu 3.250 laranjas em um dia e 2.780 no outro. Quantas laranjas foram colhidas?", 6030, "Somamos as colheitas dos dois dias: 3.250 + 2.780 = 6.030.", " laranjas");
  adicionarNumerica(T1, "Um caminhão transportou 4.500 tijolos em uma viagem e 3.750 em outra. Quantos tijolos transportou ao todo?", 8250, "O total é 4.500 + 3.750 = 8.250.", " tijolos");

  const T2 = TOPICOS[1];
  const subtracoes = [
    [500, 238], [900, 467], [1250, 684], [2000, 935], [3450, 1278],
    [5600, 2345], [8732, 4219], [10000, 6785], [15420, 8935], [25000, 13746]
  ];
  subtracoes.forEach(([a, b]) => {
    const correta = a - b;
    adicionarNumerica(T2, `Resolva: ${numero(a)} - ${numero(b)}`, correta, `Para resolver, retiramos ${numero(b)} de ${numero(a)}: ${numero(a)} - ${numero(b)} = ${numero(correta)}.`);
  });
  adicionarNumerica(T2, "Uma escola tinha 800 folhas de papel. Foram usadas 275. Quantas folhas restaram?", 525, "Como parte foi usada, fazemos 800 - 275 = 525.", " folhas");
  adicionarNumerica(T2, "Um mercado tinha 1.200 pacotes de arroz. Foram vendidos 468. Quantos pacotes ficaram?", 732, "Subtraímos os pacotes vendidos: 1.200 - 468 = 732.", " pacotes");
  adicionarNumerica(T2, "Ana tinha R$ 350,00 e gastou R$ 127,00. Quanto sobrou?", 223, "Para saber o que sobrou, fazemos 350 - 127 = 223.", " reais");
  adicionarNumerica(T2, "Em um estádio havia 5.000 lugares. Foram ocupados 3.785. Quantos lugares ficaram vazios?", 1215, "Os lugares vazios são 5.000 - 3.785 = 1.215.", " lugares");
  adicionarNumerica(T2, "Uma fábrica produziu 2.450 peças e vendeu 1.895. Quantas peças ainda não foram vendidas?", 555, "Subtraímos as peças vendidas: 2.450 - 1.895 = 555.", " peças");
  adicionarNumerica(T2, "Um agricultor colheu 4.320 mangas. Vendeu 2.875. Quantas mangas sobraram?", 1445, "Fazemos 4.320 - 2.875 = 1.445.", " mangas");
  adicionarNumerica(T2, "Uma loja tinha 1.500 brinquedos no estoque e vendeu 639. Quantos brinquedos restaram?", 861, "Subtraímos as vendas do estoque: 1.500 - 639 = 861.", " brinquedos");
  adicionarNumerica(T2, "Em uma escola, havia 960 alunos matriculados. Foram transferidos 84. Quantos alunos permaneceram?", 876, "Fazemos 960 - 84 = 876.", " alunos");
  adicionarNumerica(T2, "Um ônibus deveria percorrer 780 km. Já percorreu 345 km. Quantos quilômetros ainda faltam?", 435, "O que falta é 780 - 345 = 435.", " km");
  adicionarNumerica(T2, "Uma biblioteca tinha 3.200 livros. Doou 475 para outra escola. Quantos livros ficaram?", 2725, "Fazemos 3.200 - 475 = 2.725.", " livros");

  const T3 = TOPICOS[2];
  const multiplicacoes = [
    [24, 3], [36, 5], [125, 4], [48, 12], [235, 6],
    [72, 8], [105, 9], [230, 7], [315, 4], [426, 5]
  ];
  multiplicacoes.forEach(([a, b]) => {
    const correta = a * b;
    adicionarNumerica(T3, `Resolva: ${numero(a)} × ${numero(b)}`, correta, `A multiplicação representa parcelas iguais: ${numero(a)} × ${numero(b)} = ${numero(correta)}.`);
  });
  adicionarNumerica(T3, "Uma caixa possui 24 lápis. Quantos lápis há em 8 caixas iguais?", 192, "São 8 caixas com 24 lápis em cada: 24 × 8 = 192.", " lápis");
  adicionarNumerica(T3, "Um ônibus transporta 42 passageiros. Quantos passageiros podem ser transportados em 6 ônibus iguais?", 252, "Multiplicamos 42 passageiros por 6 ônibus: 42 × 6 = 252.", " passageiros");
  adicionarNumerica(T3, "Uma escola comprou 15 pacotes com 30 folhas cada. Quantas folhas foram compradas?", 450, "São 15 pacotes de 30 folhas: 15 × 30 = 450.", " folhas");
  adicionarNumerica(T3, "Um cinema possui 18 fileiras com 25 cadeiras em cada fileira. Quantas cadeiras há no cinema?", 450, "Multiplicamos fileiras por cadeiras: 18 × 25 = 450.", " cadeiras");
  adicionarNumerica(T3, "Uma loja recebeu 12 caixas com 45 brinquedos em cada caixa. Quantos brinquedos recebeu?", 540, "São 12 caixas com 45 brinquedos: 12 × 45 = 540.", " brinquedos");
  adicionarNumerica(T3, "Um pedreiro usa 125 tijolos por parede. Quantos tijolos usará em 8 paredes?", 1000, "Multiplicamos 125 por 8: 125 × 8 = 1.000.", " tijolos");
  adicionarNumerica(T3, "Uma padaria produz 230 pães por hora. Quantos pães produzirá em 5 horas?", 1150, "Em 5 horas: 230 × 5 = 1.150.", " pães");
  adicionarNumerica(T3, "Uma sala tem 7 fileiras com 9 cadeiras em cada uma. Quantas cadeiras há na sala?", 63, "Multiplicamos 7 × 9 = 63.", " cadeiras");
  adicionarNumerica(T3, "Um estacionamento tem 14 vagas em cada fila. Se há 9 filas, quantas vagas existem?", 126, "São 9 filas com 14 vagas: 14 × 9 = 126.", " vagas");
  adicionarNumerica(T3, "Um pacote contém 36 figurinhas. Quantas figurinhas há em 11 pacotes?", 396, "Multiplicamos 36 × 11 = 396.", " figurinhas");

  const T4 = TOPICOS[3];
  const divisoes = [
    [48, 6], [72, 8], [125, 5], [144, 12], [360, 9],
    [240, 6], [560, 8], [900, 10], [1200, 12], [2400, 24]
  ];
  divisoes.forEach(([a, b]) => {
    const correta = a / b;
    adicionarNumerica(T4, `Resolva: ${numero(a)} ÷ ${numero(b)}`, correta, `Dividir é repartir em partes iguais: ${numero(a)} ÷ ${numero(b)} = ${numero(correta)}.`);
  });
  adicionarNumerica(T4, "Uma professora quer dividir 60 lápis igualmente entre 5 alunos. Quantos lápis cada aluno receberá?", 12, "Dividimos 60 por 5: 60 ÷ 5 = 12.", " lápis");
  adicionarNumerica(T4, "Uma escola vai levar 144 alunos em ônibus. Cada ônibus comporta 36 alunos. Quantos ônibus serão necessários?", 4, "Fazemos 144 ÷ 36 = 4.", " ônibus");
  adicionarNumerica(T4, "Um pacote contém 96 balas. Elas serão divididas igualmente entre 8 crianças. Quantas balas cada criança receberá?", 12, "Dividimos 96 por 8: 96 ÷ 8 = 12.", " balas");
  adicionarNumerica(T4, "Um mercado recebeu 240 maçãs e quer colocá-las em caixas com 12 maçãs cada. Quantas caixas serão usadas?", 20, "Fazemos 240 ÷ 12 = 20.", " caixas");
  adicionarNumerica(T4, "Uma turma arrecadou R$ 500,00 e dividiu igualmente entre 10 grupos. Quanto cada grupo recebeu?", 50, "Dividimos 500 por 10: 500 ÷ 10 = 50.", " reais");
  adicionarNumerica(T4, "Uma escola comprou 360 cadernos para dividir igualmente entre 12 turmas. Quantos cadernos cada turma recebeu?", 30, "Fazemos 360 ÷ 12 = 30.", " cadernos");
  adicionarNumerica(T4, "Um agricultor colocou 480 laranjas em caixas com 24 laranjas cada. Quantas caixas foram usadas?", 20, "Fazemos 480 ÷ 24 = 20.", " caixas");
  adicionarNumerica(T4, "Uma fábrica produziu 1.200 peças em 6 dias. Quantas peças produziu por dia?", 200, "Fazemos 1.200 ÷ 6 = 200.", " peças");
  adicionarNumerica(T4, "Um professor dividiu 180 folhas entre 9 alunos. Quantas folhas cada aluno recebeu?", 20, "Dividimos 180 por 9: 180 ÷ 9 = 20.", " folhas");
  adicionarNumerica(T4, "Um mercado quer dividir 720 garrafas em caixas com 12 garrafas cada. Quantas caixas serão formadas?", 60, "Fazemos 720 ÷ 12 = 60.", " caixas");

  const T5 = TOPICOS[4];
  function adicionarDivisaoResto(enunciado, dividendo, divisor, unidadeQuociente = "", unidadeResto = "") {
    const quociente = Math.floor(dividendo / divisor);
    const resto = dividendo % divisor;
    const correta = `${numero(quociente)}${unidadeQuociente} e resto ${numero(resto)}${unidadeResto}`;
    const d1 = `${numero(quociente + 1)}${unidadeQuociente} e resto ${numero(Math.max(0, resto - 1))}${unidadeResto}`;
    const d2 = `${numero(Math.max(0, quociente - 1))}${unidadeQuociente} e resto ${numero(resto + divisor)}${unidadeResto}`;
    const d3 = `${numero(quociente)}${unidadeQuociente} e resto ${numero(resto + 1)}${unidadeResto}`;
    adicionarQuestao(T5, enunciado, correta, `Dividimos ${numero(dividendo)} por ${numero(divisor)}. O quociente é ${numero(quociente)} e o resto é ${numero(resto)}, pois ${numero(divisor)} × ${numero(quociente)} = ${numero(divisor * quociente)} e ${numero(dividendo)} - ${numero(divisor * quociente)} = ${numero(resto)}.`, [d1, d2, d3]);
  }
  [[29,5],[47,6],[85,9],[103,10],[157,12],[218,20],[76,7],[94,8],[135,11],[250,18]].forEach(([a,b]) => {
    adicionarDivisaoResto(`Resolva e indique o resto: ${numero(a)} ÷ ${numero(b)}`, a, b);
  });
  adicionarDivisaoResto("Uma professora tem 38 balas para dividir igualmente entre 5 alunos. Quantas balas cada um receberá e quantas sobrarão?", 38, 5, " balas", " balas");
  adicionarDivisaoResto("Um grupo de 53 estudantes será organizado em equipes com 6 alunos. Quantas equipes completas serão formadas e quantos alunos sobrarão?", 53, 6, " equipes", " alunos");
  adicionarDivisaoResto("Uma loja precisa guardar 95 camisetas em caixas com capacidade para 8 camisetas cada. Quantas caixas completas serão feitas e quantas camisetas sobrarão?", 95, 8, " caixas", " camisetas");
  adicionarDivisaoResto("Um agricultor colheu 127 laranjas e quer colocá-las em sacolas com 10 laranjas cada. Quantas sacolas completas fará e quantas laranjas sobrarão?", 127, 10, " sacolas", " laranjas");
  adicionarDivisaoResto("Uma biblioteca recebeu 218 livros e quer distribuí-los em prateleiras com 20 livros cada. Quantas prateleiras completas serão preenchidas e quantos livros sobrarão?", 218, 20, " prateleiras", " livros");
  adicionarDivisaoResto("Uma turma tem 41 alunos. O professor quer formar grupos de 4 alunos. Quantos grupos completos serão formados e quantos alunos ficarão sem grupo completo?", 41, 4, " grupos", " alunos");
  adicionarDivisaoResto("Uma padaria fez 89 pães e quer colocá-los em sacos com 6 pães cada. Quantos sacos completos serão feitos e quantos pães sobrarão?", 89, 6, " sacos", " pães");
  adicionarDivisaoResto("Um professor tem 115 folhas para distribuir em pacotes com 9 folhas. Quantos pacotes completos fará e quantas folhas sobrarão?", 115, 9, " pacotes", " folhas");
  adicionarDivisaoResto("Uma escola recebeu 260 lápis e quer separá-los em caixas com 24 lápis cada. Quantas caixas completas serão formadas e quantos lápis sobrarão?", 260, 24, " caixas", " lápis");
  adicionarDivisaoResto("Um mercado recebeu 345 ovos e quer organizá-los em cartelas com 12 ovos cada. Quantas cartelas completas serão feitas e quantos ovos sobrarão?", 345, 12, " cartelas", " ovos");

  const T6 = TOPICOS[5];
  const expressoes = [
    ["12 + 5 × 3", 12 + 5 * 3, "Primeiro fazemos a multiplicação: 5 × 3 = 15. Depois: 12 + 15 = 27."],
    ["40 - 24 ÷ 6", 40 - 24 / 6, "Primeiro fazemos a divisão: 24 ÷ 6 = 4. Depois: 40 - 4 = 36."],
    ["(18 + 12) ÷ 5", (18 + 12) / 5, "Primeiro resolvemos os parênteses: 18 + 12 = 30. Depois: 30 ÷ 5 = 6."],
    ["7 × (9 - 4)", 7 * (9 - 4), "Primeiro resolvemos os parênteses: 9 - 4 = 5. Depois: 7 × 5 = 35."],
    ["100 - 8 × 6", 100 - 8 * 6, "Primeiro fazemos a multiplicação: 8 × 6 = 48. Depois: 100 - 48 = 52."],
    ["35 + 20 ÷ 5", 35 + 20 / 5, "Primeiro fazemos a divisão: 20 ÷ 5 = 4. Depois: 35 + 4 = 39."],
    ["(25 + 15) × 2", (25 + 15) * 2, "Primeiro os parênteses: 25 + 15 = 40. Depois: 40 × 2 = 80."],
    ["80 ÷ 4 + 12", 80 / 4 + 12, "Primeiro a divisão: 80 ÷ 4 = 20. Depois: 20 + 12 = 32."],
    ["90 - (15 + 25)", 90 - (15 + 25), "Primeiro os parênteses: 15 + 25 = 40. Depois: 90 - 40 = 50."],
    ["6 × 8 + 30 ÷ 5", 6 * 8 + 30 / 5, "Multiplicação e divisão primeiro: 6 × 8 = 48 e 30 ÷ 5 = 6. Depois: 48 + 6 = 54."],
    ["50 + 4 × 9", 50 + 4 * 9, "Primeiro 4 × 9 = 36. Depois: 50 + 36 = 86."],
    ["(60 - 20) ÷ 4", (60 - 20) / 4, "Primeiro 60 - 20 = 40. Depois: 40 ÷ 4 = 10."],
    ["120 - 6 × 10", 120 - 6 * 10, "Primeiro 6 × 10 = 60. Depois: 120 - 60 = 60."],
    ["45 ÷ 5 + 18", 45 / 5 + 18, "Primeiro 45 ÷ 5 = 9. Depois: 9 + 18 = 27."],
    ["(14 + 6) × 3", (14 + 6) * 3, "Primeiro 14 + 6 = 20. Depois: 20 × 3 = 60."],
    ["200 - 100 ÷ 5", 200 - 100 / 5, "Primeiro 100 ÷ 5 = 20. Depois: 200 - 20 = 180."],
    ["9 × 7 - 15", 9 * 7 - 15, "Primeiro 9 × 7 = 63. Depois: 63 - 15 = 48."],
    ["64 ÷ 8 + 6 × 4", 64 / 8 + 6 * 4, "Primeiro 64 ÷ 8 = 8 e 6 × 4 = 24. Depois: 8 + 24 = 32."],
    ["(80 - 32) ÷ 6", (80 - 32) / 6, "Primeiro 80 - 32 = 48. Depois: 48 ÷ 6 = 8."],
    ["150 - (25 × 4)", 150 - (25 * 4), "Primeiro 25 × 4 = 100. Depois: 150 - 100 = 50."],
    ["30 + 12 × 2 - 10", 30 + 12 * 2 - 10, "Primeiro 12 × 2 = 24. Depois: 30 + 24 - 10 = 44."],
    ["(45 + 15) ÷ 10", (45 + 15) / 10, "Primeiro 45 + 15 = 60. Depois: 60 ÷ 10 = 6."],
    ["8 × (20 - 15)", 8 * (20 - 15), "Primeiro 20 - 15 = 5. Depois: 8 × 5 = 40."],
    ["72 ÷ 9 + 35", 72 / 9 + 35, "Primeiro 72 ÷ 9 = 8. Depois: 8 + 35 = 43."],
    ["100 - 5 × (6 + 4)", 100 - 5 * (6 + 4), "Primeiro 6 + 4 = 10. Depois 5 × 10 = 50. Por fim: 100 - 50 = 50."],
    ["(30 + 18) ÷ 6 + 7", (30 + 18) / 6 + 7, "Primeiro 30 + 18 = 48. Depois 48 ÷ 6 = 8. Por fim: 8 + 7 = 15."],
    ["4 × 12 + 60 ÷ 10", 4 * 12 + 60 / 10, "Primeiro 4 × 12 = 48 e 60 ÷ 10 = 6. Depois: 48 + 6 = 54."],
    ["(100 - 40) ÷ 3", (100 - 40) / 3, "Primeiro 100 - 40 = 60. Depois: 60 ÷ 3 = 20."],
    ["25 + 75 ÷ 5", 25 + 75 / 5, "Primeiro 75 ÷ 5 = 15. Depois: 25 + 15 = 40."],
    ["10 × (8 + 2) - 35", 10 * (8 + 2) - 35, "Primeiro 8 + 2 = 10. Depois 10 × 10 = 100. Por fim: 100 - 35 = 65."]
  ];
  expressoes.forEach(([texto, correta, explicacao]) => {
    adicionarNumerica(T6, `Resolva: ${texto}`, correta, explicacao);
  });

  const T7 = TOPICOS[6];
  const problemasMistos = [
    ["Uma papelaria comprou 12 caixas com 25 cadernos cada uma. Depois vendeu 87 cadernos. Quantos cadernos sobraram?", 12 * 25 - 87, "Primeiro calculamos o total comprado: 12 × 25 = 300. Depois subtraímos o que foi vendido: 300 - 87 = 213.", " cadernos"],
    ["Uma escola recebeu 350 livros. Depois comprou mais 125 e distribuiu 98 para os alunos. Quantos livros restaram?", 350 + 125 - 98, "Somamos os livros recebidos e comprados: 350 + 125 = 475. Depois subtraímos 98: 475 - 98 = 377.", " livros"],
    ["Em uma festa, foram compradas 15 caixas com 24 refrigerantes cada. Durante a festa, foram consumidos 275 refrigerantes. Quantos sobraram?", 15 * 24 - 275, "Primeiro 15 × 24 = 360. Depois 360 - 275 = 85.", " refrigerantes"],
    ["Uma turma arrecadou R$ 480,00. Esse valor será dividido igualmente entre 6 grupos. Depois, cada grupo gastou R$ 35,00. Quanto sobrou para cada grupo?", 480 / 6 - 35, "Primeiro 480 ÷ 6 = 80. Depois 80 - 35 = 45.", " reais"],
    ["Um supermercado recebeu 20 caixas com 18 pacotes de arroz em cada caixa. Foram vendidos 145 pacotes. Quantos pacotes restaram?", 20 * 18 - 145, "Primeiro 20 × 18 = 360. Depois 360 - 145 = 215.", " pacotes"],
    ["Uma escola tem 18 salas com 32 carteiras em cada sala. Se 75 carteiras estão quebradas, quantas carteiras podem ser usadas?", 18 * 32 - 75, "Primeiro 18 × 32 = 576. Depois 576 - 75 = 501.", " carteiras"],
    ["Um ônibus faz 8 viagens por dia levando 42 passageiros em cada viagem. Quantos passageiros transporta em um dia?", 8 * 42, "Multiplicamos as viagens pelos passageiros: 8 × 42 = 336.", " passageiros"],
    ["Uma loja comprou 300 brinquedos e separou 48 para uma promoção. O restante foi dividido igualmente em 12 prateleiras. Quantos brinquedos ficaram em cada prateleira?", (300 - 48) / 12, "Primeiro 300 - 48 = 252. Depois 252 ÷ 12 = 21.", " brinquedos"],
    ["Um aluno tinha 250 figurinhas. Ganhou 80 e depois perdeu 45. Com quantas figurinhas ficou?", 250 + 80 - 45, "Somamos o que ganhou e subtraímos o que perdeu: 250 + 80 - 45 = 285.", " figurinhas"],
    ["Uma fábrica produz 125 peças por dia. Quantas peças ficarão no estoque após 7 dias, se vender 600 peças?", 125 * 7 - 600, "Primeiro 125 × 7 = 875. Depois 875 - 600 = 275.", " peças"],
    ["Uma escola comprou 9 caixas com 36 lápis cada. Depois distribuiu 120 lápis. Quantos lápis restaram?", 9 * 36 - 120, "Primeiro 9 × 36 = 324. Depois 324 - 120 = 204.", " lápis"],
    ["Uma loja vendeu 45 produtos por dia durante 6 dias. Depois recebeu mais 180 produtos no estoque. Quantos produtos passaram pela loja nesse período?", 45 * 6 + 180, "Primeiro 45 × 6 = 270. Depois 270 + 180 = 450.", " produtos"],
    ["Um mercado tinha 800 garrafas de água. Vendeu 325 pela manhã e 210 à tarde. Quantas garrafas sobraram?", 800 - 325 - 210, "Subtraímos as vendas: 800 - 325 - 210 = 265.", " garrafas"],
    ["Uma família comprou 4 pacotes com 12 garrafas de suco cada. Depois consumiu 17 garrafas. Quantas sobraram?", 4 * 12 - 17, "Primeiro 4 × 12 = 48. Depois 48 - 17 = 31.", " garrafas"],
    ["Uma escola recebeu 600 folhas de papel. Usou 175 em uma atividade e 230 em outra. Quantas folhas sobraram?", 600 - 175 - 230, "Subtraímos as folhas usadas: 600 - 175 - 230 = 195.", " folhas"],
    ["Uma turma de 36 alunos arrecadou R$ 18,00 cada um. O valor total foi dividido igualmente entre 6 projetos. Quanto cada projeto recebeu?", 36 * 18 / 6, "Primeiro 36 × 18 = 648. Depois 648 ÷ 6 = 108.", " reais"],
    ["Uma biblioteca recebeu 15 caixas com 20 livros cada. Depois emprestou 85 livros. Quantos livros ficaram?", 15 * 20 - 85, "Primeiro 15 × 20 = 300. Depois 300 - 85 = 215.", " livros"],
    ["Um professor comprou 120 canetas para dividir entre 8 turmas. Depois comprou mais 40 canetas. Quantas canetas terá no total?", 120 + 40, "O problema pergunta o total de canetas que ele terá: 120 + 40 = 160.", " canetas"],
    ["Uma empresa comprou 25 pacotes com 12 folhas de adesivos cada. Usou 90 folhas. Quantas folhas sobraram?", 25 * 12 - 90, "Primeiro 25 × 12 = 300. Depois 300 - 90 = 210.", " folhas"],
    ["Um restaurante preparou 240 refeições. Vendeu 180 e doou 35. Quantas refeições restaram?", 240 - 180 - 35, "Subtraímos as refeições que saíram: 240 - 180 - 35 = 25.", " refeições"]
  ];
  problemasMistos.forEach(([texto, correta, explicacao, unidade]) => adicionarNumerica(T7, texto, correta, explicacao, unidade));

  const T8 = TOPICOS[7];
  adicionarMultipla(T8, "O que são sólidos geométricos?", "Figuras com três dimensões: comprimento, largura e altura", ["Figuras planas com apenas comprimento e largura", "Linhas abertas formadas por curvas", "Apenas desenhos feitos com régua"], "Sólidos geométricos são figuras espaciais, ou seja, possuem três dimensões e ocupam espaço.");
  adicionarMultipla(T8, "Qual opção apresenta apenas exemplos de sólidos geométricos?", "Cubo, cilindro e esfera", ["Triângulo, quadrado e círculo", "Linha, ponto e reta", "Pentágono, hexágono e retângulo"], "Cubo, cilindro e esfera são sólidos, pois possuem três dimensões.");
  adicionarMultipla(T8, "Qual sólido geométrico se parece com uma bola?", "Esfera", ["Cubo", "Cone", "Cilindro"], "A bola lembra uma esfera, que é totalmente arredondada.");
  adicionarMultipla(T8, "Qual sólido geométrico se parece com uma lata de refrigerante?", "Cilindro", ["Cone", "Esfera", "Pirâmide"], "A lata possui duas bases circulares e uma superfície lateral curva, como o cilindro.");
  adicionarMultipla(T8, "Qual sólido geométrico se parece com uma caixa de sapato?", "Paralelepípedo", ["Esfera", "Cone", "Cilindro"], "A caixa de sapato lembra um paralelepípedo, com faces retangulares.");
  adicionarMultipla(T8, "Qual sólido geométrico possui 6 faces quadradas?", "Cubo", ["Cone", "Esfera", "Cilindro"], "O cubo possui 6 faces, e todas elas são quadradas.");
  adicionarMultipla(T8, "Qual sólido geométrico possui uma base circular e um vértice?", "Cone", ["Cilindro", "Esfera", "Cubo"], "O cone tem uma base circular, uma superfície curva e um vértice.");
  adicionarMultipla(T8, "Qual sólido geométrico possui duas bases circulares e uma superfície lateral curva?", "Cilindro", ["Cone", "Pirâmide", "Cubo"], "O cilindro tem duas bases circulares paralelas e uma superfície lateral curva.");
  adicionarMultipla(T8, "Qual sólido geométrico é totalmente arredondado?", "Esfera", ["Cubo", "Prisma", "Pirâmide"], "A esfera é um corpo redondo sem faces planas, arestas ou vértices.");
  adicionarMultipla(T8, "Qual é a principal diferença entre cubo e paralelepípedo?", "No cubo todas as faces são quadradas; no paralelepípedo as faces geralmente são retangulares", ["O cubo é plano e o paralelepípedo é espacial", "O cubo tem base circular e o paralelepípedo não", "O cubo não possui arestas"], "Ambos são sólidos espaciais, mas no cubo as faces são quadradas.");
  adicionarMultipla(T8, "O que são poliedros?", "Sólidos formados apenas por faces planas", ["Sólidos totalmente arredondados", "Figuras abertas", "Figuras com apenas curvas"], "Poliedros são sólidos geométricos formados por faces planas.");
  adicionarMultipla(T8, "O cubo é classificado como:", "Poliedro", ["Corpo redondo", "Linha curva", "Figura aberta"], "O cubo é um poliedro porque possui apenas faces planas.");
  adicionarMultipla(T8, "O cilindro é classificado como:", "Corpo redondo", ["Poliedro", "Polígono", "Prisma triangular"], "O cilindro tem superfície curva, por isso é um corpo redondo.");
  adicionarMultipla(T8, "A esfera é um poliedro?", "Não, porque não possui faces planas", ["Sim, porque tem vértices", "Sim, porque tem faces quadradas", "Não, porque é uma figura plana"], "A esfera é um corpo redondo, não um poliedro.");
  adicionarMultipla(T8, "O cone possui superfície curva?", "Sim, além de uma base circular", ["Não, só possui faces quadradas", "Não, é formado apenas por triângulos", "Sim, mas possui duas bases circulares"], "O cone possui uma base circular, uma superfície lateral curva e um vértice.");
  adicionarMultipla(T8, "Qual opção apresenta dois corpos redondos?", "Cone e cilindro", ["Cubo e pirâmide", "Prisma e cubo", "Quadrado e retângulo"], "Cone e cilindro possuem superfície curva, portanto são corpos redondos.");
  adicionarMultipla(T8, "Qual opção apresenta dois poliedros?", "Cubo e pirâmide", ["Esfera e cone", "Cilindro e esfera", "Círculo e oval"], "Cubo e pirâmide são poliedros, pois possuem faces planas.");
  adicionarMultipla(T8, "Qual é o nome do sólido que possui duas bases iguais e paralelas?", "Prisma", ["Cone", "Esfera", "Círculo"], "O prisma possui duas bases iguais e paralelas.");
  adicionarMultipla(T8, "Qual é o nome do sólido que possui uma base e faces laterais triangulares?", "Pirâmide", ["Cilindro", "Esfera", "Retângulo"], "A pirâmide tem uma base e faces laterais em forma de triângulo.");
  adicionarMultipla(T8, "Uma pirâmide pode ter base triangular, quadrada ou pentagonal?", "Sim, a base pode ter diferentes formatos de polígonos", ["Não, toda pirâmide tem base circular", "Não, toda pirâmide é uma esfera", "Sim, mas não possui faces laterais"], "As pirâmides recebem nomes de acordo com a forma da base.");

  const T9 = TOPICOS[8];
  adicionarMultipla(T9, "O que são faces de um sólido geométrico?", "As superfícies que formam o sólido", ["Os pontos de encontro das arestas", "As linhas curvas do sólido", "A medida do contorno"], "Faces são as superfícies do sólido, como os quadrados que formam um cubo.");
  adicionarMultipla(T9, "O que são arestas de um sólido geométrico?", "Os segmentos onde duas faces se encontram", ["As superfícies do sólido", "O espaço dentro do sólido", "Apenas os cantos arredondados"], "Arestas são os segmentos formados pelo encontro de duas faces.");
  adicionarMultipla(T9, "O que são vértices de um sólido geométrico?", "Os pontos onde as arestas se encontram", ["As superfícies planas", "As bases circulares", "As linhas curvas"], "Vértices são os pontos, ou cantos, onde as arestas se encontram.");
  adicionarMultipla(T9, "Quantas faces tem um cubo?", "6", ["4", "8", "12"], "O cubo possui 6 faces quadradas.");
  adicionarMultipla(T9, "Quantas arestas tem um cubo?", "12", ["6", "8", "10"], "O cubo possui 12 arestas.");
  adicionarMultipla(T9, "Quantos vértices tem um cubo?", "8", ["4", "6", "12"], "O cubo possui 8 vértices.");
  adicionarMultipla(T9, "Quantas faces tem um paralelepípedo?", "6", ["4", "8", "12"], "O paralelepípedo possui 6 faces.");
  adicionarMultipla(T9, "Quantas arestas tem um paralelepípedo?", "12", ["6", "8", "14"], "Assim como o cubo, o paralelepípedo possui 12 arestas.");
  adicionarMultipla(T9, "Quantos vértices tem um paralelepípedo?", "8", ["4", "6", "12"], "O paralelepípedo possui 8 vértices.");
  adicionarMultipla(T9, "Uma pirâmide de base quadrada possui quantas faces ao todo?", "5", ["4", "6", "8"], "Ela tem 1 base quadrada e 4 faces laterais triangulares: 1 + 4 = 5 faces.");
  adicionarMultipla(T9, "Uma pirâmide de base quadrada possui quantos vértices?", "5", ["4", "6", "8"], "São 4 vértices na base e 1 vértice no topo: 5 vértices.");
  adicionarMultipla(T9, "Uma pirâmide de base quadrada possui quantas arestas?", "8", ["4", "5", "12"], "São 4 arestas na base e 4 arestas laterais: 8 arestas.");
  adicionarMultipla(T9, "O cilindro possui vértices?", "Não, pois não possui cantos", ["Sim, possui 8 vértices", "Sim, possui 4 vértices", "Sim, possui 1 vértice"], "O cilindro não possui vértices porque suas bases são circulares e não têm cantos.");
  adicionarMultipla(T9, "O cone possui vértice?", "Sim, possui um vértice", ["Não possui nenhum", "Possui 8", "Possui 12"], "O cone tem um ponto no topo, chamado vértice.");
  adicionarMultipla(T9, "A esfera possui faces planas, arestas ou vértices?", "Não possui faces planas, arestas nem vértices", ["Possui 6 faces e 8 vértices", "Possui 2 bases e 1 vértice", "Possui 12 arestas"], "A esfera é totalmente arredondada, sem faces planas, arestas ou vértices.");

  const T10 = TOPICOS[9];
  adicionarMultipla(T10, "O que é um polígono?", "Uma figura plana fechada formada por segmentos de reta", ["Um sólido com três dimensões", "Uma figura sempre arredondada", "Uma linha aberta formada por curvas"], "Polígonos são figuras planas fechadas formadas apenas por segmentos de reta.");
  adicionarMultipla(T10, "O círculo é um polígono?", "Não, porque possui linha curva", ["Sim, porque é fechado", "Sim, porque possui lados retos", "Não, porque é um sólido geométrico"], "O círculo é uma figura plana, mas não é polígono porque não é formado por segmentos de reta.");
  adicionarMultipla(T10, "Como se chama o polígono que possui 3 lados?", "Triângulo", ["Quadrilátero", "Pentágono", "Hexágono"], "O polígono de 3 lados é chamado de triângulo.");
  adicionarMultipla(T10, "Como se chama o polígono que possui 4 lados?", "Quadrilátero", ["Triângulo", "Pentágono", "Octógono"], "O polígono de 4 lados é chamado de quadrilátero.");
  adicionarMultipla(T10, "Como se chama o polígono que possui 5 lados?", "Pentágono", ["Hexágono", "Heptágono", "Triângulo"], "O polígono de 5 lados é o pentágono.");
  adicionarMultipla(T10, "Como se chama o polígono que possui 6 lados?", "Hexágono", ["Pentágono", "Heptágono", "Octógono"], "O polígono de 6 lados é o hexágono.");
  adicionarMultipla(T10, "Como se chama o polígono que possui 7 lados?", "Heptágono", ["Hexágono", "Octógono", "Decágono"], "O polígono de 7 lados é o heptágono.");
  adicionarMultipla(T10, "Como se chama o polígono que possui 8 lados?", "Octógono", ["Pentágono", "Hexágono", "Decágono"], "O polígono de 8 lados é o octógono.");
  adicionarMultipla(T10, "Como se chama o polígono que possui 10 lados?", "Decágono", ["Pentágono", "Hexágono", "Dodecágono"], "O polígono de 10 lados é o decágono.");
  adicionarMultipla(T10, "Quantos lados possui um pentágono?", "5", ["3", "4", "6"], "Pentágono é o polígono de 5 lados.");
  adicionarMultipla(T10, "Quantos lados possui um hexágono?", "6", ["5", "7", "8"], "Hexágono é o polígono de 6 lados.");
  adicionarMultipla(T10, "Quantos lados possui um octógono?", "8", ["6", "7", "10"], "Octógono é o polígono de 8 lados.");
  adicionarMultipla(T10, "Classifique o triângulo de lados 5 cm, 5 cm e 5 cm.", "Equilátero", ["Isósceles", "Escaleno", "Quadrilátero"], "Quando os três lados são iguais, o triângulo é equilátero.");
  adicionarMultipla(T10, "Classifique o triângulo de lados 7 cm, 7 cm e 4 cm.", "Isósceles", ["Equilátero", "Escaleno", "Pentágono"], "Quando dois lados são iguais, o triângulo é isósceles.");
  adicionarMultipla(T10, "Calcule o perímetro de um retângulo que possui 12 cm de comprimento e 5 cm de largura.", "34 cm", ["17 cm", "24 cm", "60 cm"], "O perímetro é a soma dos quatro lados: 12 + 5 + 12 + 5 = 34 cm.");
}

function preencherFiltro() {
  const filtro = document.getElementById("filtroTopico");
  TOPICOS.forEach((topico) => {
    const option = document.createElement("option");
    option.value = topico;
    option.textContent = topico;
    filtro.appendChild(option);
  });
}

const TEMPO_MINIMO_RESPOSTA = 60;
const CHAVE_INICIOS = "iniciosQuestoesRevisao6Ano";
const CHAVE_RANKING = "rankingRevisao6Ano";
let iniciosQuestoes = JSON.parse(localStorage.getItem(CHAVE_INICIOS) || "{}");
let ranking = JSON.parse(localStorage.getItem(CHAVE_RANKING) || "[]");
let intervaloTimer = null;

function obterQuestaoAtual() {
  return bancoQuestoes.find((q) => q.id === idsAtuais[indiceAtual]);
}

function salvarInicios() {
  localStorage.setItem(CHAVE_INICIOS, JSON.stringify(iniciosQuestoes));
}

function salvarRanking() {
  localStorage.setItem(CHAVE_RANKING, JSON.stringify(ranking));
}

function respostaEstaCorreta(questao) {
  return respostas[questao.id] !== undefined && respostas[questao.id] === questao.correta;
}

function calcularResumo(ids = bancoQuestoes.map((q) => q.id)) {
  const questoes = ids.map((id) => bancoQuestoes.find((q) => q.id === id)).filter(Boolean);
  const total = questoes.length;
  let respondidas = 0;
  let acertos = 0;

  questoes.forEach((questao) => {
    if (respostas[questao.id] !== undefined) {
      respondidas++;
      if (respostas[questao.id] === questao.correta) acertos++;
    }
  });

  return {
    total,
    respondidas,
    acertos,
    erros: respondidas - acertos,
    pendentes: total - respondidas,
    percentual: total ? Math.round((acertos / total) * 100) : 0,
    percentualRespondido: total ? Math.round((respondidas / total) * 100) : 0
  };
}

function atualizarTopo() {
  const geral = calcularResumo();
  document.getElementById("totalQuestoes").textContent = bancoQuestoes.length;
  document.getElementById("respondidasTopo").textContent = geral.respondidas;
  document.getElementById("acertosTopo").textContent = geral.acertos;
  document.getElementById("aproveitamentoTopo").textContent = `${geral.percentual}%`;
  atualizarPlacarTopicos();
}

function atualizarPlacarTopicos() {
  const area = document.getElementById("placarTopicos");
  if (!area) return;

  area.innerHTML = TOPICOS.map((topico) => {
    const idsTopico = bancoQuestoes.filter((q) => q.topico === topico).map((q) => q.id);
    const resumo = calcularResumo(idsTopico);
    const classe = resumo.erros > 0 ? "tem-erros" : resumo.respondidas === resumo.total && resumo.total > 0 ? "concluido" : "em-andamento";

    return `
      <article class="placar-card ${classe}">
        <div class="placar-card__topo">
          <h3>${topico}</h3>
          <strong>${resumo.acertos}/${resumo.total}</strong>
        </div>
        <div class="placar-card__detalhes">
          <span>${resumo.percentual}% de aproveitamento</span>
          <span>${resumo.erros} erro(s)</span>
          <span>${resumo.pendentes} pendente(s)</span>
        </div>
        <div class="placar-card__barra" aria-hidden="true"><span style="width:${resumo.percentual}%"></span></div>
      </article>`;
  }).join("");
}

function rotuloModoAtual() {
  if (modoAtual === "todos") return "Todos os tópicos";
  return modoAtual;
}

function atualizarProgresso() {
  const resumoAtual = calcularResumo(idsAtuais);
  const percentualRespondido = resumoAtual.percentualRespondido;
  const totalAtual = idsAtuais.length || 0;
  const posicaoAtual = totalAtual ? indiceAtual + 1 : 0;

  const textoModoQuestao = document.getElementById("textoModoQuestao");
  const textoProgresso = document.getElementById("textoProgresso");
  const percentualProgresso = document.getElementById("percentualProgresso");
  const barraProgresso = document.getElementById("barraProgresso");
  const acertosModo = document.getElementById("acertosModo");
  const errosModo = document.getElementById("errosModo");
  const pendentesModo = document.getElementById("pendentesModo");

  if (textoModoQuestao) textoModoQuestao.textContent = rotuloModoAtual();
  if (textoProgresso) textoProgresso.textContent = `Questão ${posicaoAtual} de ${totalAtual} • ${resumoAtual.respondidas} respondidas`;
  if (percentualProgresso) percentualProgresso.textContent = `${percentualRespondido}%`;
  if (barraProgresso) barraProgresso.style.width = `${percentualRespondido}%`;
  if (acertosModo) acertosModo.textContent = resumoAtual.acertos;
  if (errosModo) errosModo.textContent = resumoAtual.erros;
  if (pendentesModo) pendentesModo.textContent = resumoAtual.pendentes;
}

function segundosRestantesQuestao(questao) {
  if (respostas[questao.id] !== undefined) return 0;
  if (!iniciosQuestoes[questao.id]) {
    iniciosQuestoes[questao.id] = Date.now();
    salvarInicios();
  }
  const decorrido = Math.floor((Date.now() - iniciosQuestoes[questao.id]) / 1000);
  return Math.max(0, TEMPO_MINIMO_RESPOSTA - decorrido);
}

function formatarTempo(segundos) {
  const min = Math.floor(segundos / 60).toString().padStart(2, "0");
  const seg = Math.floor(segundos % 60).toString().padStart(2, "0");
  return `${min}:${seg}`;
}

function atualizarTimerVisual(questaoId) {
  const questao = bancoQuestoes.find((q) => q.id === questaoId);
  if (!questao) return;

  const restante = segundosRestantesQuestao(questao);
  const tempo = document.getElementById("tempoQuestao");
  const aviso = document.getElementById("avisoTempoQuestao");
  const botoes = document.querySelectorAll(".alternativa");

  if (tempo) tempo.textContent = formatarTempo(restante);

  if (restante <= 0) {
    botoes.forEach((botao) => {
      if (respostas[questao.id] === undefined) {
        botao.disabled = false;
        botao.classList.remove("bloqueada");
        botao.removeAttribute("aria-disabled");
      }
    });
    if (aviso) aviso.textContent = "Agora você pode marcar uma alternativa.";
    if (intervaloTimer) {
      clearInterval(intervaloTimer);
      intervaloTimer = null;
    }
  } else {
    if (aviso) aviso.textContent = "Leia com calma. As alternativas serão liberadas após 1 minuto.";
  }
}

function iniciarTimerQuestao(questao) {
  if (intervaloTimer) clearInterval(intervaloTimer);
  const restante = segundosRestantesQuestao(questao);
  atualizarTimerVisual(questao.id);

  if (restante > 0 && respostas[questao.id] === undefined) {
    intervaloTimer = setInterval(() => atualizarTimerVisual(questao.id), 1000);
  }
}

function renderizarQuestao() {
  if (intervaloTimer) {
    clearInterval(intervaloTimer);
    intervaloTimer = null;
  }

  if (!idsAtuais.length) {
    document.getElementById("areaQuestao").innerHTML = `
      <div class="alerta">
        Nenhuma questão encontrada para este modo. Tente selecionar outro tópico ou limpar a tentativa.
      </div>`;
    return;
  }

  const questao = obterQuestaoAtual();
  const resposta = respostas[questao.id];
  const temResposta = resposta !== undefined;
  const restante = segundosRestantesQuestao(questao);
  const bloqueada = !temResposta && restante > 0;

  const alternativas = questao.opcoes.map((opcao, index) => {
    let classe = "alternativa";
    if (bloqueada) classe += " bloqueada";
    if (temResposta) {
      if (index === questao.correta) classe += " correta";
      if (index === resposta && index !== questao.correta) classe += " errada";
    }

    const disabled = bloqueada || temResposta ? "disabled" : "";

    return `
      <button class="${classe}" data-indice="${index}" ${disabled}>
        <span class="letra">${letras[index]}</span>
        <span>${opcao}</span>
      </button>`;
  }).join("");

  let feedback = "";
  if (temResposta) {
    const acertou = resposta === questao.correta;
    feedback = `
      <div class="feedback ${acertou ? "certo" : "errado"}">
        <strong>${acertou ? "✅ Correto!" : "❌ Ainda não."}</strong>
        <p>${acertou ? "Você marcou a alternativa certa." : `A resposta correta é: <strong>${questao.opcoes[questao.correta]}</strong>.`} ${questao.explicacao}</p>
      </div>`;
  }

  document.getElementById("areaQuestao").innerHTML = `
    <div class="questao-cabecalho">
      <span class="topico-tag">${questao.topico}</span>
      <span class="numero-questao">Questão ${questao.id}</span>
    </div>

    <div class="temporizador ${temResposta ? "respondida" : bloqueada ? "aguardando" : "liberada"}">
      <div>
        <strong>Tempo mínimo de leitura</strong>
        <p id="avisoTempoQuestao">${temResposta ? "Questão já respondida." : bloqueada ? "Leia com calma. As alternativas serão liberadas após 1 minuto." : "Agora você pode marcar uma alternativa."}</p>
      </div>
      <span id="tempoQuestao">${formatarTempo(restante)}</span>
    </div>

    <p class="enunciado">${questao.enunciado}</p>
    <div class="alternativas">${alternativas}</div>
    ${feedback}
  `;

  document.querySelectorAll(".alternativa").forEach((botao) => {
    botao.addEventListener("click", () => marcarResposta(Number(botao.dataset.indice)));
  });

  document.getElementById("btnAnterior").disabled = indiceAtual === 0;
  document.getElementById("btnProxima").disabled = indiceAtual === idsAtuais.length - 1;

  iniciarTimerQuestao(questao);
  atualizarProgresso();
  atualizarTopo();
}

function marcarResposta(indice) {
  const questao = obterQuestaoAtual();
  if (!questao) return;

  const restante = segundosRestantesQuestao(questao);
  if (restante > 0) {
    alert(`Aguarde ${formatarTempo(restante)} para responder. Aproveite para ler o enunciado com atenção.`);
    return;
  }

  if (respostas[questao.id] !== undefined) return;

  respostas[questao.id] = indice;
  salvarRespostas();
  renderizarQuestao();
}

function mostrarDashboard() {
  if (intervaloTimer) {
    clearInterval(intervaloTimer);
    intervaloTimer = null;
  }

  document.body.classList.remove("modo-questoes");
  document.getElementById("telaDashboard").classList.remove("oculto");
  document.getElementById("telaQuestoes").classList.add("oculto");
  atualizarTopo();
}

function mostrarQuestoes() {
  document.body.classList.add("modo-questoes");
  document.getElementById("telaDashboard").classList.add("oculto");
  document.getElementById("telaQuestoes").classList.remove("oculto");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function iniciarQuestoesSelecionadas() {
  const topico = document.getElementById("filtroTopico").value;
  selecionarTopico(topico, true);
}

function selecionarModoTodos(entrar = false) {
  modoAtual = "todos";
  idsAtuais = bancoQuestoes.map((q) => q.id);
  indiceAtual = 0;

  const filtro = document.getElementById("filtroTopico");
  if (filtro) filtro.value = "todos";

  document.getElementById("areaResultado").classList.add("oculto");
  atualizarTopo();
  atualizarProgresso();

  if (entrar) {
    mostrarQuestoes();
    renderizarQuestao();
  }
}

function selecionarTopico(topico, entrar = false) {
  modoAtual = topico;
  idsAtuais = topico === "todos"
    ? bancoQuestoes.map((q) => q.id)
    : bancoQuestoes.filter((q) => q.topico === topico).map((q) => q.id);
  indiceAtual = 0;

  const filtro = document.getElementById("filtroTopico");
  if (filtro && Array.from(filtro.options).some((opcao) => opcao.value === topico)) {
    filtro.value = topico;
  }

  document.getElementById("areaResultado").classList.add("oculto");
  atualizarTopo();
  atualizarProgresso();

  if (entrar || !document.getElementById("telaQuestoes").classList.contains("oculto")) {
    mostrarQuestoes();
    renderizarQuestao();
  }
}

function obterIdsComErro(topico = null) {
  return bancoQuestoes
    .filter((questao) => !topico || questao.topico === topico)
    .filter((questao) => respostas[questao.id] !== undefined && respostas[questao.id] !== questao.correta)
    .map((questao) => questao.id);
}

function reiniciarQuestoes(ids) {
  ids.forEach((id) => {
    delete respostas[id];
    delete iniciosQuestoes[id];
  });
  salvarRespostas();
  salvarInicios();
}

function refazerErros(topico = null) {
  const ids = obterIdsComErro(topico);
  if (!ids.length) {
    alert("Não há erros respondidos para refazer nesse tópico. Muito bem!");
    return;
  }

  reiniciarQuestoes(ids);
  modoAtual = topico ? `Erros: ${topico}` : "Erros gerais";
  idsAtuais = ids;
  indiceAtual = 0;
  document.getElementById("areaResultado").classList.add("oculto");
  mostrarQuestoes();
  renderizarQuestao();
}

function textoNivel(percentual) {
  if (percentual >= 90) return "Excelente";
  if (percentual >= 70) return "Muito bom";
  if (percentual >= 50) return "Em desenvolvimento";
  return "Precisa revisar";
}

function renderizarRanking() {
  const lista = [...ranking]
    .sort((a, b) => b.acertos - a.acertos || b.percentual - a.percentual || new Date(b.dataISO) - new Date(a.dataISO))
    .slice(0, 10);

  if (!lista.length) {
    return `<div class="ranking-vazio">Nenhum resultado salvo ainda. Finalize a revisão e registre seu nome.</div>`;
  }

  return `
    <ol class="ranking-lista">
      ${lista.map((item, index) => `
        <li>
          <span class="ranking-posicao">${index + 1}º</span>
          <div>
            <strong>${item.nome}</strong>
            <small>${item.acertos}/${item.total} acertos • ${item.percentual}% • ${item.data}</small>
          </div>
        </li>`).join("")}
    </ol>`;
}

function blocoRanking(geral) {
  if (geral.respondidas < geral.total) {
    return `
      <div class="ranking-box bloqueado">
        <h3>Ranking</h3>
        <p>O ranking será liberado quando todas as ${geral.total} questões forem respondidas.</p>
        ${renderizarRanking()}
      </div>`;
  }

  return `
    <div class="ranking-box">
      <div class="ranking-box__cabecalho">
        <div>
          <h3>Finalizar e salvar no ranking</h3>
          <p>Digite o nome do aluno para registrar esta pontuação.</p>
        </div>
        <strong>${textoNivel(geral.percentual)}</strong>
      </div>
      <div class="ranking-form">
        <input id="nomeRanking" type="text" maxlength="40" placeholder="Nome do aluno" aria-label="Nome do aluno para o ranking" />
        <button id="btnSalvarRanking" class="btn btn-primario">Salvar no ranking</button>
      </div>
      <div id="mensagemRanking" class="mensagem-ranking" aria-live="polite"></div>
      ${renderizarRanking()}
    </div>`;
}

function renderizarResultado() {
  mostrarDashboard();
  const geral = calcularResumo();
  const area = document.getElementById("areaResultado");

  const cardsTopicos = TOPICOS.map((topico) => {
    const idsTopico = bancoQuestoes.filter((q) => q.topico === topico).map((q) => q.id);
    const resumo = calcularResumo(idsTopico);
    const largura = `${resumo.percentual}%`;
    const errosTopico = obterIdsComErro(topico).length;

    return `
      <div class="topico-card">
        <div class="topico-card__cabecalho">
          <h3>${topico}</h3>
          <strong>${resumo.acertos}/${resumo.total}</strong>
        </div>
        <p>${resumo.respondidas} respondidas • ${resumo.erros} erro(s) • ${resumo.pendentes} pendente(s)</p>
        <div class="topico-card__linha"><span style="width:${largura}"></span></div>
        ${errosTopico > 0 ? `<button class="btn btn-secundario" data-refazer-topico="${topico}">Refazer erros deste tópico</button>` : `<button class="btn btn-neutro" disabled>Sem erros respondidos</button>`}
      </div>`;
  }).join("");

  area.innerHTML = `
    <h2>Resultado da revisão</h2>
    <p>Confira seu desempenho geral, veja a pontuação por área e refaça os tópicos em que houve erro.</p>

    <div class="resultado__destaque">
      <div><strong>${geral.total}</strong><span>questões</span></div>
      <div><strong>${geral.respondidas}</strong><span>respondidas</span></div>
      <div><strong>${geral.acertos}</strong><span>acertos</span></div>
      <div><strong>${geral.percentual}%</strong><span>aproveitamento</span></div>
    </div>

    ${geral.pendentes > 0 ? `<div class="alerta">Ainda há ${geral.pendentes} questão(ões) sem resposta. Para liberar o ranking, responda todas as questões.</div>` : ""}
    ${geral.erros > 0 ? `<div class="alerta alerta-erro">Você tem ${geral.erros} erro(s) respondido(s). Use os botões de refazer para tentar novamente apenas o que precisa melhorar.</div>` : ""}

    <div class="botoes-controle resultado-botoes">
      <button id="btnResultadoRefazerErros" class="btn btn-secundario">Refazer todos os erros</button>
      <button id="btnResultadoTodos" class="btn btn-primario">Voltar para todas as questões</button>
    </div>

    ${blocoRanking(geral)}

    <div class="grade-topicos">${cardsTopicos}</div>
  `;

  area.classList.remove("oculto");
  area.scrollIntoView({ behavior: "smooth", block: "start" });

  document.getElementById("btnResultadoRefazerErros").addEventListener("click", () => refazerErros());
  document.getElementById("btnResultadoTodos").addEventListener("click", () => selecionarModoTodos(true));
  document.querySelectorAll("[data-refazer-topico]").forEach((botao) => {
    botao.addEventListener("click", () => refazerErros(botao.dataset.refazerTopico));
  });

  const btnSalvarRanking = document.getElementById("btnSalvarRanking");
  if (btnSalvarRanking) {
    btnSalvarRanking.addEventListener("click", () => salvarPontuacaoRanking(geral));
  }
}

function salvarPontuacaoRanking(geral) {
  const input = document.getElementById("nomeRanking");
  const mensagem = document.getElementById("mensagemRanking");
  const nome = input.value.trim();

  if (!nome) {
    mensagem.textContent = "Digite o nome do aluno antes de salvar.";
    mensagem.className = "mensagem-ranking erro";
    input.focus();
    return;
  }

  const agora = new Date();
  ranking.push({
    nome,
    total: geral.total,
    respondidas: geral.respondidas,
    acertos: geral.acertos,
    erros: geral.erros,
    percentual: geral.percentual,
    data: agora.toLocaleString("pt-BR"),
    dataISO: agora.toISOString()
  });
  salvarRanking();

  mensagem.textContent = "Pontuação salva no ranking!";
  mensagem.className = "mensagem-ranking sucesso";
  input.value = "";
  renderizarResultado();
}

function limparTentativa() {
  const confirmar = confirm("Deseja apagar todas as respostas, tempos de leitura e começar novamente?");
  if (!confirmar) return;

  respostas = {};
  iniciosQuestoes = {};
  salvarRespostas();
  salvarInicios();
  document.getElementById("areaResultado").classList.add("oculto");
  selecionarModoTodos();
}

function configurarEventos() {
  document.getElementById("filtroTopico").addEventListener("change", (evento) => {
    selecionarTopico(evento.target.value, false);
  });

  document.getElementById("btnIniciar").addEventListener("click", iniciarQuestoesSelecionadas);
  document.getElementById("btnIniciarRapido").addEventListener("click", () => selecionarTopico("todos", true));

  document.getElementById("btnVerRanking").addEventListener("click", () => {
    renderizarResultado();
    document.getElementById("areaResultado").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("btnVoltarDashboard").addEventListener("click", () => {
    mostrarDashboard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("btnAnterior").addEventListener("click", () => {
    if (indiceAtual > 0) {
      indiceAtual--;
      renderizarQuestao();
    }
  });

  document.getElementById("btnProxima").addEventListener("click", () => {
    if (indiceAtual < idsAtuais.length - 1) {
      indiceAtual++;
      renderizarQuestao();
    }
  });

  document.getElementById("btnResultado").addEventListener("click", renderizarResultado);
  document.getElementById("btnResultadoQuestao").addEventListener("click", renderizarResultado);
  document.getElementById("btnRefazerErros").addEventListener("click", () => refazerErros());
  document.getElementById("btnLimpar").addEventListener("click", limparTentativa);
}

function iniciarApp() {
  montarQuestoes();
  preencherFiltro();
  configurarEventos();
  selecionarModoTodos();

  console.log(`Banco de questões carregado: ${bancoQuestoes.length} questões.`);
}

iniciarApp();
