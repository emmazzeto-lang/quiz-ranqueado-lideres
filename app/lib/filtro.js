// COMO EDITAR: para bloquear mais palavras, acrescente nas listas abaixo, em minúsculas
// e SEM acentos (ex.: "desgraça" vira "desgraca"). Não precisa escrever as variações
// com k/c, w/v, y/i, números ou letras repetidas: o filtro já trata isso sozinho.

// Bloqueadas só quando aparecem como PALAVRA INTEIRA no nome. É a lista dos termos curtos
// ou ambíguos, que estariam dentro de nomes e palavras normais: "puta" existe em
// "computador", "cu" em "Lucas" e "anal" em "Analice", então aqui o nome só é barrado
// se a palavra estiver sozinha.
const PALAVRAS_INTEIRAS = [
  // palavrões e siglas
  "cu", "pau", "pica", "puta", "puto", "foda", "fdp", "vsf", "tnc", "tmnc", "vtnc", "vtmnc",
  "pqp", "krl", "pnc", "bct", "kct", "carai", "caraio", "cacete", "rola", "rabo", "bunda",
  "anal", "penis", "tetas", "chupa", "gozar", "orgia", "sexo", "sex", "safado", "safada",
  // ofensas
  "viado", "bicha", "bixa", "vadia", "otario", "otaria", "babaca", "idiota", "imbecil",
  "corno", "piranha", "lixo", "trouxa", "burro", "burra", "jumento", "nojento", "nojenta",
  "debil", "mongol", "macaco", "macaca", "favelado", "favelada",
  // ódio
  "nazi", "heil",
  // inglês
  "ass", "dick", "cock", "shit", "slut", "fag",
];

// Bloqueadas mesmo DENTRO de outra palavra. São termos longos, sem risco de aparecer
// em nomes comuns.
const PALAVRAS_CONTIDAS = [
  // palavrões
  "caralh", "buceta", "buseta", "punheta", "xoxota", "xereca", "fodase", "foder", "fuder", "fodid",
  "fudid", "merda", "bosta", "porra", "filhodaputa", "filhadaputa", "putaquepariu",
  "putaria", "puteiro", "putinha", "tomanocu", "tomarnocu", "cuzao", "cuzinho",
  "arrombad", "desgraca", "vagabund", "escroto", "escrota", "piroca", "boquete",
  "siririca", "suruba", "tesao", "vagina", "rapariga", "prostitut", "cornudo", "corninho",
  // pornografia e crimes
  "porno", "xvideos", "pornhub", "onlyfans", "estupr", "pedofil",
  // ofensas e preconceito
  "retardad", "autista", "mongoloide", "debiloide", "aleijad", "viadinho", "viadao",
  "traveco", "sapatao", "boiola", "baitola", "crioulo",
  // ódio
  "nazista", "hitler", "suastica", "siegheil", "kukluxklan", "terrorista", "binladen",
  // inglês
  "fuck", "bitch", "pussy", "cunt", "nigg", "faggot", "whore", "asshole", "bastard",
  "retard", "porn",
];

// Letras de outros alfabetos que parecem as nossas (cirílico e grego): "рorrа" com
// "р" e "а" russos passaria sem isso.
const PARECIDAS = {
  а: "a", в: "b", е: "e", к: "k", м: "m", н: "h", о: "o", р: "p", с: "c", т: "t",
  у: "y", х: "x", і: "i", α: "a", ε: "e", ι: "i", κ: "k", ν: "v", ο: "o", ρ: "p", τ: "t",
};

// Trocas de letras por números e símbolos: p0rr4 -> porra, pu7a -> puta.
// O "1" e o "|" podem ser "i" ou "l" (c4r4|h0), então o filtro testa as duas versões.
const TROCAS = { "@": "a", "4": "a", "3": "e", "€": "e", "!": "i", "0": "o", "5": "s", $: "s", "7": "t", "+": "t", "9": "g" };
const VARIANTES = [null, "i", "l"];

// Sons iguais com letras diferentes: "karalho", "wiado", "fuk" e "fuck" viram a mesma coisa.
function fonetica(t) {
  return t.replace(/ck/g, "c").replace(/k/g, "c").replace(/w/g, "v").replace(/y/g, "i");
}

// Minúsculas, sem acentos e sem letras "disfarçadas". NFKD também desfaz letras
// estilizadas (𝐩𝐨𝐫𝐫𝐚, ｐｏｒｒａ). Com "variante" também desfaz as trocas por números.
function limpar(texto, variante) {
  let t = String(texto).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  t = t.replace(/./g, (c) => PARECIDAS[c] ?? c);
  if (variante) {
    t = t.replace(/[@43€!05$7+9]/g, (c) => TROCAS[c]).replace(/[1|]/g, variante);
  }
  return fonetica(t);
}

// "caralh" vira /c+a+r+a+l+h+/, que também pega letras repetidas ("caaaralhooo").
// Letras duplicadas na palavra ("porra") continuam exigindo duas ("pora" não bloqueia,
// e isso evita pegar "temporada").
function padrao(palavra) {
  return fonetica(palavra).split("").map((letra) => letra + "+").join("");
}

const REGEX_INTEIRAS = PALAVRAS_INTEIRAS.map((p) => new RegExp(`^${padrao(p)}$`));
const REGEX_CONTIDAS = PALAVRAS_CONTIDAS.map((p) => new RegExp(padrao(p)));

// Separa em palavras e junta letras soltas: "p u t a" ou "p.u.t.a" viram "puta".
function palavras(textoLimpo) {
  const pedacos = textoLimpo.split(/[^a-z]+/).filter(Boolean);
  const resultado = [];
  let soltas = "";
  for (const p of pedacos) {
    if (p.length === 1) {
      soltas += p;
      continue;
    }
    if (soltas) {
      resultado.push(soltas);
      soltas = "";
    }
    resultado.push(p);
  }
  if (soltas) resultado.push(soltas);
  return resultado;
}

// Além das palavras, barra nomes que claramente não são nomes: links, quase sem
// letras ("!!!", "123") ou com a mesma letra repetida ("aaaaaa", "kkkkkkk").
function nomeAbsurdo(texto) {
  const t = String(texto).toLowerCase();
  if (/https?:|www\.|\.(com|net|org|br|gg|io)\b/.test(t)) return true;
  if ((t.match(/\p{L}/gu) || []).length < 2) return true;
  if (/(.)\1{4,}/u.test(t.replace(/\s/g, ""))) return true;
  return false;
}

// true se o texto tiver alguma palavra bloqueada ou não parecer um nome.
export function nomeProibido(texto) {
  if (nomeAbsurdo(texto)) return true;

  // Roda sem trocar números (pega "fdp123") e trocando (pega "p0rr4", "c4r41h0").
  for (const variante of VARIANTES) {
    const limpo = limpar(texto, variante);
    const compacto = limpo.replace(/[^a-z]/g, ""); // sem espaços e símbolos: "ca ra lho"
    if (REGEX_CONTIDAS.some((r) => r.test(compacto))) return true;

    // Testa cada palavra, o nome todo junto ("Pu Ta") e cada par de palavras vizinhas ("Lu Pi Ca").
    const lista = palavras(limpo);
    const pares = lista.slice(1).map((p, i) => lista[i] + p);
    const candidatos = [...lista, ...pares, compacto];
    if (candidatos.some((p) => REGEX_INTEIRAS.some((r) => r.test(p)))) return true;
  }
  return false;
}
