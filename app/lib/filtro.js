// COMO EDITAR: para bloquear mais palavras, acrescente nas listas abaixo, em minúsculas
// e SEM acentos (ex.: "desgraça" vira "desgraca").

// Bloqueadas só quando aparecem como PALAVRA INTEIRA no nome. É a lista dos termos curtos
// ou ambíguos, que estariam dentro de nomes e palavras normais: "puta" existe em
// "computador" e "cu" em "Lucas", então aqui o nome só é barrado se a palavra estiver sozinha.
const PALAVRAS_INTEIRAS = [
  "cu", "pau", "pica", "puta", "puto", "foda", "fdp", "vsf", "tnc", "tmnc", "pqp", "krl",
  "viado", "bicha", "vadia", "cacete", "otario", "babaca", "idiota", "imbecil",
  "corno", "piranha", "lixo", "nazi", "buceta",
];

// Bloqueadas mesmo DENTRO de outra palavra. São termos longos, sem risco de aparecer
// em nomes comuns.
const PALAVRAS_CONTIDAS = [
  "caralho", "buceta", "punheta", "xoxota", "xereca", "fodase", "merda", "bosta",
  "porra", "filhodaputa", "filhadaputa", "putaquepariu", "arrombado", "arrombada",
  "desgracado", "desgracada", "vagabundo", "vagabunda", "retardado", "retardada",
  "autista", "viadinho", "cuzao", "nazista", "hitler", "crioulo",
];

// "caralho" vira /c+a+r+a+l+h+o+/, que também pega letras repetidas ("caaaralhooo").
// Letras duplicadas na palavra ("porra") continuam exigindo duas ("pora" não bloqueia,
// e isso evita pegar "temporada").
function padrao(palavra) {
  return palavra.split("").map((letra) => letra + "+").join("");
}

const REGEX_INTEIRAS = PALAVRAS_INTEIRAS.map((p) => new RegExp(`^${padrao(p)}$`));
const REGEX_CONTIDAS = PALAVRAS_CONTIDAS.map((p) => new RegExp(padrao(p)));

// Minúsculas e sem acentos. Com "trocarNumeros" também desfaz as trocas comuns
// de letras por símbolos: p0rr4 -> porra, pu7a -> puta.
function limpar(texto, trocarNumeros) {
  let t = String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (trocarNumeros) {
    t = t
      .replace(/[@4]/g, "a")
      .replace(/3/g, "e")
      .replace(/[1!|]/g, "i")
      .replace(/0/g, "o")
      .replace(/[5$]/g, "s")
      .replace(/7/g, "t");
  }
  return t;
}

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

// true se o texto tiver alguma palavra bloqueada.
export function nomeProibido(texto) {
  // Roda duas vezes: sem trocar números (pega "fdp123") e trocando (pega "p0rr4").
  for (const trocar of [false, true]) {
    const limpo = limpar(texto, trocar);
    const compacto = limpo.replace(/[^a-z]/g, ""); // sem espaços e símbolos: "ca ra lho"
    if (REGEX_CONTIDAS.some((r) => r.test(compacto))) return true;
    if (palavras(limpo).some((p) => REGEX_INTEIRAS.some((r) => r.test(p)))) return true;
  }
  return false;
}