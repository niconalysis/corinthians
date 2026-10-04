// Página: Rankings e recordes. Lê dados/rankings.json (gerado por pipeline/exporta_rankings.py).
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const iniciais = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const sobrenome = (n) => n.split(" ").slice(-1)[0];
const num = (n) => n.toLocaleString("pt-BR");
const dec = (n) => n.toFixed(2).replace(".", ",");
const pct = (a, b) => `${Math.round((a / b) * 100)}%`;
const dataBR = (iso) => iso.split("-").reverse().join("/");
const plural = (n, um, varios) => (n === 1 ? um : varios);

const ZERO = { jogos: 0, gols: 0, ass: 0, am: 0, vm: 0, cs: 0, ga: 0 };
const POR_PAGINA = 10;

// Cada ranking diz que número ordena, quem entra, o que aparece embaixo do nome e a unidade do número.
const RANKINGS = {
  gols: {
    emoji: "⚽", rotulo: "Artilheiros", titulo: "Artilheiros",
    texto: "Quem mais marcou gols pelo Corinthians. Gol contra não conta.",
    valor: (s) => s.gols, unidade: (n) => plural(n, "gol", "gols"),
    sub: (s) => `${num(s.jogos)} ${plural(s.jogos, "jogo", "jogos")} · ${dec(s.gols / s.jogos)} por jogo`,
  },
  ass: {
    emoji: "🤝", rotulo: "Garçons", titulo: "Garçons",
    texto: "Quem mais deu passes para gol.",
    valor: (s) => s.ass, unidade: (n) => plural(n, "assistência", "assistências"),
    sub: (s) => `${num(s.jogos)} ${plural(s.jogos, "jogo", "jogos")} · ${dec(s.ass / s.jogos)} por jogo`,
  },
  jogos: {
    emoji: "🏁", rotulo: "Mais jogos", titulo: "Mais jogos",
    texto: "Quem mais entrou em campo com a camisa do Corinthians.",
    valor: (s) => s.jogos, unidade: (n) => plural(n, "jogo", "jogos"),
    sub: (s) => `${num(s.gols)} ${plural(s.gols, "gol", "gols")} · ${num(s.ass)} ${plural(s.ass, "assistência", "assistências")}`,
  },
  cartoes: {
    emoji: "🟨", rotulo: "Mais cartões", titulo: "Mais cartões",
    texto: "Quem mais levou cartões, somando amarelos e vermelhos.",
    valor: (s) => s.am + s.vm, unidade: (n) => plural(n, "cartão", "cartões"),
    sub: (s) => `🟨 ${num(s.am)} · 🟥 ${num(s.vm)}`,
  },
  cs: {
    emoji: "🧤", rotulo: "Goleiros", titulo: "Goleiros sem sofrer gol",
    texto: "Goleiros com mais jogos sem sofrer gol: ele estava em campo e o adversário não marcou enquanto ele esteve lá.",
    valor: (s) => s.cs, unidade: (n) => plural(n, "jogo sem sofrer gol", "jogos sem sofrer gol"),
    sub: (s) => `${num(s.jogos)} ${plural(s.jogos, "jogo", "jogos")} · ${pct(s.cs, s.jogos)} sem sofrer gol`,
    so: "G",
  },
  goleadas: { emoji: "💥", rotulo: "Maiores goleadas", titulo: "Maiores goleadas" },
};

let D = null;
let ranking = "gols";
let mostrados = POR_PAGINA;

// Foto do jogador; sem foto (ou se a imagem falhar), mostra as iniciais.
const imagem = (j) => (j.foto_url
  ? `<img src="${esc(j.foto_url)}" alt="${esc(j.nome)}" loading="lazy" data-nome="${esc(j.nome)}">`
  : `<span class="sem-foto" aria-hidden="true">${esc(iniciais(j.nome))}</span>`);
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName !== "IMG" || !img.dataset.nome) return;
  const s = document.createElement("span");
  s.className = "sem-foto";
  s.setAttribute("aria-hidden", "true");
  s.textContent = iniciais(img.dataset.nome);
  img.replaceWith(s);
}, true);

// Soma das temporadas escolhidas ("" = todas).
function estatistica(j, temp) {
  if (temp) return { ...ZERO, ...(j.porT[temp] || {}) };
  const t = { ...ZERO };
  for (const x of Object.values(j.porT)) for (const k in t) t[k] += x[k] || 0;
  return t;
}

function tabela(r, temp) {
  const cfg = RANKINGS[r];
  return D.jogadores
    .filter((j) => !cfg.so || j.pos === cfg.so)
    .map((j) => ({ j, s: estatistica(j, temp) }))
    .filter((x) => x.s.jogos > 0 && cfg.valor(x.s) > 0)
    // empate: quem precisou de menos jogos fica na frente, depois ordem alfabética
    .sort((a, b) => cfg.valor(b.s) - cfg.valor(a.s) || a.s.jogos - b.s.jogos || a.j.nome.localeCompare(b.j.nome));
}

function podio(L, cfg) {
  return `<div class="podio">${L.slice(0, 3).map(({ j, s }, i) => `
    <div class="pod p${i + 1}">
      <span class="lugar" aria-label="${i + 1}º lugar">${i + 1}</span>
      <span class="foto">${imagem(j)}</span>
      <b class="nome" title="${esc(j.nome)}">${esc(sobrenome(j.nome))}</b>
      <span class="num">${num(cfg.valor(s))}<small>${cfg.unidade(cfg.valor(s))}</small></span>
      <span class="sub">${cfg.sub(s)}</span>
    </div>`).join("")}</div>`;
}

function linhas(L, cfg) {
  return L.slice(3, mostrados).map(({ j, s }, i) => `
    <div class="lin">
      <span class="n">${i + 4}</span>
      <span class="foto">${imagem(j)}</span>
      <span class="quem"><b>${esc(j.nome)}</b><small>${cfg.sub(s)}</small></span>
      <span class="val">${num(cfg.valor(s))}<small>${cfg.unidade(cfg.valor(s))}</small></span>
    </div>`).join("");
}

function desenhaJogadores(temp) {
  const cfg = RANKINGS[ranking];
  const L = tabela(ranking, temp);
  const cab = `<div class="titulo-rank"><h2>${cfg.titulo}${temp ? ` em ${temp}` : ""}</h2><p>${cfg.texto}</p></div>`;
  if (!L.length) return `${cab}<p class="vazio">Ainda não há números para este ranking${temp ? " nesta temporada" : ""}.</p>`;
  const resto = L.slice(3, mostrados);
  return `${cab}${podio(L, cfg)}
    ${resto.length ? `<div class="lista">${linhas(L, cfg)}</div>` : ""}
    ${L.length > mostrados ? `<button type="button" class="link" id="mais">Ver mais</button>` : ""}`;
}

function desenhaGoleadas(temp) {
  const cfg = RANKINGS.goleadas;
  const G = D.goleadas.filter((g) => !temp || String(g.t) === temp);
  const cab = `<div class="titulo-rank"><h2>${cfg.titulo}${temp ? ` em ${temp}` : ""}</h2><p>As vitórias do Corinthians com mais gols de diferença. Clique num jogo para ver os detalhes.</p></div>`;
  if (!G.length) return `${cab}<p class="vazio">Nenhuma vitória por 3 gols ou mais de diferença${temp ? " nesta temporada" : ""}.</p>`;
  const itens = G.slice(0, mostrados).map((g) => `
    <button type="button" class="goleada" data-id="${esc(g.id)}">
      ${PainelJogo.imagem(g.escudo_url, g.adv)}
      <span class="meio"><b>Corinthians x ${esc(g.adv)}${g.casa === true ? '<span class="mando-tag">Casa</span>' : g.casa === false ? '<span class="mando-tag">Fora</span>' : ""}</b>
        <small>${dataBR(g.d)} · ${esc(g.comp || "")}${g.est ? ` · ${esc(g.est)}` : ""}</small></span>
      <span class="placar">${g.f} x ${g.c}<small>+${g.f - g.c} de diferença</small></span>
    </button>`).join("");
  return `${cab}<div class="gol-lista">${itens}</div>
    ${G.length > mostrados ? `<button type="button" class="link" id="mais">Ver mais</button>` : ""}`;
}

// Aviso simples sobre os anos em que a fonte tem menos informação.
function nota(temp) {
  const anos = Object.keys(D.cobertura).filter((a) => !temp || a === temp).sort();
  if (!anos.length) return "";
  const lista = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} e ${xs.slice(-1)}` : xs[0]);
  const avisos = [];
  if (ranking === "cartoes") {
    const fracos = anos.filter((a) => D.cobertura[a].cartoes / D.cobertura[a].jogos < 0.5);
    if (fracos.length) avisos.push(`Em ${lista(fracos)} os cartões foram registrados em poucos jogos, então esses anos aparecem com menos cartões do que houve de verdade.`);
  } else if (ranking !== "goleadas") {
    const fracos = anos.filter((a) => D.cobertura[a].escalacao / D.cobertura[a].jogos < 0.9);
    if (fracos.length) avisos.push(`Em ${lista(fracos)} a lista de quem jogou está incompleta, então jogos, gols e assistências desses anos podem estar abaixo do real.`);
    if (ranking === "cs") avisos.push("Nos jogos sem informação de minutos, vale o placar final.");
  }
  const todas = Object.keys(D.cobertura).sort();
  const base = temp ? "" : `Os dados começam em ${todas[0]}.`;
  return [base, ...avisos].filter(Boolean).join(" ");
}

function desenha() {
  const temp = $("#temp").value;
  $("#conteudo").innerHTML = ranking === "goleadas" ? desenhaGoleadas(temp) : desenhaJogadores(temp);
  $("#mais")?.addEventListener("click", () => { mostrados += POR_PAGINA * 2; desenha(); });
  const n = nota(temp);
  $("#nota").hidden = !n;
  $("#nota").textContent = n;
  [...$("#rankings").children].forEach((b) => b.setAttribute("aria-pressed", b.dataset.r === ranking));
}

function abreJogo(botao) {
  const g = D.goleadas.find((x) => x.id === botao.dataset.id);
  if (!g) return;
  PainelJogo.abre({
    id_partida: g.id, data: g.d, temporada: g.t, competicao: g.comp, corinthians_mandante: g.casa, adversario: g.adv,
    escudo_url: g.escudo_url, gols_corinthians: g.f, gols_adversario: g.c, resultado: "V", estadio: g.est,
  }, botao);
}

fetch("dados/rankings.json")
  .then((r) => r.json())
  .then((d) => {
    D = d;
    $("#aviso-exemplo").hidden = !d.exemplo;
    $("#rankings").innerHTML = Object.entries(RANKINGS)
      .map(([k, c]) => `<button type="button" data-r="${k}" aria-pressed="${k === ranking}">${c.emoji} ${c.rotulo}</button>`).join("");
    const anos = Object.keys(d.cobertura).sort().reverse();
    $("#temp").innerHTML = `<option value="">Todas</option>` + anos.map((a) => `<option>${a}</option>`).join("");
    $("#rankings").onclick = (e) => {
      const b = e.target.closest("button[data-r]");
      if (!b) return;
      ranking = b.dataset.r;
      mostrados = POR_PAGINA;
      desenha();
    };
    $("#temp").onchange = () => { mostrados = POR_PAGINA; desenha(); };
    $("#conteudo").addEventListener("click", (e) => {
      const b = e.target.closest(".goleada");
      if (b) abreJogo(b);
    });
    desenha();
  })
  .catch(() => { $("#conteudo").innerHTML = '<p class="vazio">Não deu para carregar os dados agora.</p>'; });
