// Página 2: jogadores e mapa de estádios. Lê dados/jogadores.json (gerado por pipeline/exporta_jogadores.py).
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const semAcento = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const sobrenome = (n) => n.split(" ").slice(-1)[0];
const iniciais = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const gol = (n) => (n === 1 ? "gol" : "gols");

const POS = { G: ["Goleiro", "luva"], D: ["Defensor", "escudo"], M: ["Meio-campo", "bola"], A: ["Atacante", "chuteira"] };
const ICONES = {
  luva: '<path d="M7 11V5a1.5 1.5 0 0 1 3 0v5m0-1V4a1.5 1.5 0 0 1 3 0v5m0-4.5a1.5 1.5 0 0 1 3 0V13c0 5-2 8-6 8-3 0-5-2-6-5l-2-4a1.5 1.5 0 0 1 3-1l1 2"/>',
  escudo: '<path d="M5 3h14v9c0 5-4 8-7 9-3-1-7-4-7-9z"/>',
  bola: '<circle cx="12" cy="12" r="9"/><path d="M12 8l4 3-1.5 5h-5L8 11z"/>',
  chuteira: '<path d="M3 15l5-9 5 3 7 4v5H3z"/><path d="M8 18v2m4-2v2m4-2v2"/>',
};
const icone = (p) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[POS[p][1]]}</svg>`;
const PINO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';

let J = [];
let E = [];
let sel = null;
let filtroPos = "";
let modo = "jogos";
let mapa = null;
let camada = null;

// Foto do jogador; sem foto (ou se a imagem falhar), mostra as iniciais.
function imagem(j) {
  return j.foto_url
    ? `<img src="${esc(j.foto_url)}" alt="${esc(j.nome)}" loading="lazy" data-nome="${esc(j.nome)}">`
    : `<span class="sem-foto" aria-hidden="true">${esc(iniciais(j.nome))}</span>`;
}
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName !== "IMG" || !img.dataset.nome) return;
  const s = document.createElement("span");
  s.className = "sem-foto";
  s.setAttribute("aria-hidden", "true");
  s.textContent = iniciais(img.dataset.nome);
  img.replaceWith(s);
}, true);
const foto = (j) => `<span class="foto">${imagem(j)}</span>`;

function totais(j) {
  const t = { jogos: 0, gols: 0, ass: 0, cs: 0, ga: 0, vit: 0 };
  for (const x of Object.values(j.porT)) for (const k in t) t[k] += x[k] || 0;
  const anos = Object.keys(j.porT).map(Number);
  Object.assign(j, t, { ini: Math.min(...anos), fim: Math.max(...anos) });
}
const stat = (j, t) => (t ? j.porT[t] || { jogos: 0, gols: 0, ass: 0, cs: 0, ga: 0, vit: 0 } : j);

// ---- abas ----
function aba(mapaAberto) {
  $("#p-j").hidden = mapaAberto;
  $("#p-m").hidden = !mapaAberto;
  $("#aba-j").setAttribute("aria-selected", !mapaAberto);
  $("#aba-m").setAttribute("aria-selected", mapaAberto);
  if (mapaAberto) {
    historias();
    iniciaMapa();
    setTimeout(() => mapa.invalidateSize(), 50);
  }
}

// ---- jogadores ----
function lista() {
  const t = $("#temp").value;
  const q = semAcento($("#busca").value);
  const o = $("#ord").value;
  const L = J.filter((j) => (!filtroPos || j.pos === filtroPos) && semAcento(j.nome).includes(q) && stat(j, t).jogos > 0);
  L.sort((a, b) => (o === "nome" ? a.nome.localeCompare(b.nome) : (stat(b, t)[o] || 0) - (stat(a, t)[o] || 0)));
  if (!L.length) {
    $("#tira").innerHTML = "";
    $("#ficha").innerHTML = '<p class="vazio">Nenhum jogador encontrado com esses filtros.</p>';
    return;
  }
  if (sel === null || !L.some((j) => j.id === sel)) sel = L[0].id;
  $("#tira").innerHTML = L.map((j) => {
    const x = stat(j, t);
    const numeros = j.pos === "G" ? `<span>🧤 ${x.cs}</span>` : `<span>⚽ ${x.gols}</span><span>🤝 ${x.ass}</span>`;
    return `<button type="button" class="fig" role="option" data-fig="${esc(j.id)}" aria-pressed="${j.id === sel}" aria-label="${esc(j.nome)}">
      <span class="ret">${imagem(j)}</span>
      <span class="inf"><b>${esc(sobrenome(j.nome))}</b><small>${icone(j.pos)}${POS[j.pos][0]}</small><span class="em">${numeros}</span></span></button>`;
  }).join("");
  $("#ficha").innerHTML = ficha(J.find((j) => j.id === sel));
  const vm = $("#ver-mapa");
  if (vm) vm.onclick = () => irParaMapa(sel);
}

function dataCurta(iso) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function ficha(j) {
  const G = j.pos === "G";
  const estadios = Object.entries(j.porE).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxJogos = Math.max(...Object.values(j.porT).map((x) => x.jogos));
  const S = (e, n, l) => `<div class="stat"><em>${e}</em><b>${n}</b><span>${l}</span></div>`;
  const pct = (a, b) => `${Math.round((a / b) * 100)}%`;
  const stats = G
    ? S("🏁", j.jogos, "jogos") + S("🧤", j.cs, "jogos sem sofrer gol") + S("🛡️", pct(j.cs, j.jogos), "dos jogos sem sofrer gol") +
      S("🥅", j.ga, "gols sofridos") + S("🏆", pct(j.vit, j.jogos), "vitórias") + S("📅", Object.keys(j.porT).length, "temporadas")
    : S("🏁", j.jogos, "jogos") + S("⚽", j.gols, gol(j.gols)) + S("🤝", j.ass, "assistências") +
      S("🏆", pct(j.vit, j.jogos), "vitórias") + S("🎯", (j.gols / j.jogos).toFixed(2).replace(".", ","), "gols por jogo") +
      S("📅", Object.keys(j.porT).length, "temporadas");
  const temporadas = Object.entries(j.porT).map(([ano, x]) =>
    `<div class="tbar"><span>${ano}</span><span class="tr"><i style="width:${(x.jogos / maxJogos) * 100}%"></i></span><span><b>${x.jogos}</b> · ${G ? `🧤 ${x.cs}` : `⚽ ${x.gols}`}</span></div>`).join("");
  const ultimos = j.ult.map((u) => {
    const evento = G
      ? (u.s === 0 ? "🧤<small>sem sofrer gol</small>" : `<small>sofreu ${u.s} ${gol(u.s)}</small>`)
      : ("⚽".repeat(u.g) + (u.a ? "🤝" : "") || "<small>sem participação</small>");
    return `<div class="jogo"><span class="dt">${dataCurta(u.d)}</span><span><span class="pl">${u.f} × ${u.c}</span>${esc(u.adv)}</span><span class="ev">${evento}</span></div>`;
  }).join("");
  const onde = estadios.length
    ? `<div><h4>⚽ Onde mais marcou</h4>${estadios.map(([id, n]) => `<div class="mini"><span>${esc(E.find((e) => e.id === id)?.nome ?? "—")}</span><span><b>${n}</b> ${gol(n)}</span></div>`).join("")}</div>`
    : "";
  return `<article class="ficha"><div class="ret">${imagem(j)}</div><div>
    <h2>${esc(j.nome)}</h2>
    <div class="pos">${icone(j.pos)}${POS[j.pos][0]} · no clube de ${j.ini} a ${j.fim}</div>
    <div class="stats">${stats}</div>
    <div class="cols"><div><h4>Jogos por temporada</h4>${temporadas}</div>${onde || `<div><h4>Últimos jogos</h4><div class="ult">${ultimos}</div></div>`}</div>
    ${onde ? `<h4>Últimos jogos</h4><div class="ult">${ultimos}</div><button type="button" class="link" id="ver-mapa">Ver os gols no mapa</button>` : ""}
  </div></article>`;
}

// ---- mapa ----
let jogadorNoMapa = "";

function irParaMapa(id) {
  jogadorNoMapa = id;
  modo = "gols";
  [...$("#modo").children].forEach((b) => b.setAttribute("aria-pressed", b.dataset.m === modo));
  aba(true);
  desenha();
}

function historias() {
  const comGols = [...J].filter((j) => j.gols > 0).sort((a, b) => b.gols - a.gols).slice(0, 40);
  $("#historias").innerHTML =
    `<button type="button" class="hist" data-q="" aria-pressed="${jogadorNoMapa === ""}"><span class="anel"><span class="foto todos"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.8"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M16 14c3 0 6 2 6 5"/></svg></span></span><span class="n">Todos</span></button>` +
    comGols.map((j) => `<button type="button" class="hist" data-q="${esc(j.id)}" aria-pressed="${jogadorNoMapa === j.id}"><span class="anel">${foto(j)}</span><span class="n">${esc(sobrenome(j.nome))} · ${j.gols}</span></button>`).join("");
}

function iniciaMapa() {
  if (mapa) return;
  mapa = L.map("mapa", { worldCopyJump: true, minZoom: 3 }).setView([-15, -52], 4);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(mapa);
  camada = L.layerGroup().addTo(mapa);
  desenha();
  mapa.fitBounds(E.map((e) => [e.lat, e.lng]), { padding: [30, 30] });
}

function valor(e) {
  if (jogadorNoMapa !== "") return J.find((j) => j.id === jogadorNoMapa).porE[e.id] || 0;
  return modo === "gols" ? e.gols : e.jogos;
}

function desenha() {
  const quem = jogadorNoMapa !== "" ? J.find((j) => j.id === jogadorNoMapa) : null;
  const rotulo = quem ? `gols de ${quem.nome}` : modo === "gols" ? "gols" : "jogos";
  const emoji = quem || modo === "gols" ? "⚽" : "🏁";
  const V = E.map((e) => ({ e, v: valor(e) }));
  const max = Math.max(...V.map((x) => x.v), 1);
  $("#lado-t").textContent = quem ? "Onde ele marcou" : "Estádios mais visitados";
  $("#lado-s").textContent = `${emoji} Tamanho do pino = ${rotulo}. Toque num estádio para ver no mapa.`;
  if (camada) {
    camada.clearLayers();
    const marcados = [];
    V.forEach(({ e, v }) => {
      const d = v === 0 ? 12 : 18 + Math.sqrt(v / max) * 30;
      const icon = L.divIcon({ className: "", iconSize: [d, d], html: `<div class="pino ${v === 0 ? "apagado" : ""}" style="width:${d}px;height:${d}px">${v || ""}</div>` });
      e.marcador = L.marker([e.lat, e.lng], { icon, title: e.nome }).addTo(camada);
      e.marcador.bindPopup(`<b>${esc(e.nome)}</b><br>${esc(e.cidade)} · ${esc(e.uf)}<br>${e.jogos} jogos · ${e.v}V ${e.e}E ${e.d}D` + (quem ? `<br>${v} ${gol(v)} de ${esc(quem.nome)}` : ""));
      if (v > 0) marcados.push([e.lat, e.lng]);
    });
    if (quem && marcados.length) mapa.fitBounds(marcados, { padding: [40, 40], maxZoom: 8 });
  }
  const topo = [...V].sort((a, b) => b.v - a.v).filter((x) => x.v > 0).slice(0, 14);
  $("#lista").innerHTML = topo.map(({ e, v }) =>
    `<button type="button" class="est" data-id="${esc(e.id)}"><span class="ic">${PINO}</span><div><b>${esc(e.nome)}</b><small>${esc(e.cidade)} · ${esc(e.uf)}</small>${quem ? "" : `<div class="barra"><i class="v" style="flex:${e.v}"></i><i class="e" style="flex:${e.e}"></i><i class="d" style="flex:${e.d}"></i></div>`}</div><span class="v">${emoji} ${v}</span></button>`).join("") +
    (quem ? "" : '<div class="leg"><span>■ vitórias</span><span style="color:#8a8a90">■ empates</span><span style="color:#5a5a60">■ derrotas</span></div>');
}

// ---- inicialização ----
function ligaEventos() {
  $("#aba-j").onclick = () => aba(false);
  $("#aba-m").onclick = () => aba(true);
  ["busca", "temp", "ord"].forEach((id) => ($("#" + id).oninput = lista));
  $("#posicoes").onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    filtroPos = b.dataset.p;
    [...$("#posicoes").children].forEach((x) => x.setAttribute("aria-pressed", x === b));
    lista();
  };
  $("#tira").onclick = (e) => {
    const b = e.target.closest(".fig");
    if (!b) return;
    sel = b.dataset.fig;
    lista();
    $(`.fig[data-fig="${CSS.escape(sel)}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  };
  $("#modo").onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    modo = b.dataset.m;
    jogadorNoMapa = "";
    [...$("#modo").children].forEach((x) => x.setAttribute("aria-pressed", x === b));
    historias();
    desenha();
  };
  $("#historias").onclick = (e) => {
    const b = e.target.closest(".hist");
    if (!b) return;
    jogadorNoMapa = b.dataset.q;
    if (jogadorNoMapa !== "") modo = "gols";
    [...$("#modo").children].forEach((x) => x.setAttribute("aria-pressed", x.dataset.m === modo));
    historias();
    desenha();
  };
  $("#lista").onclick = (e) => {
    const b = e.target.closest(".est");
    if (!b) return;
    const est = E.find((x) => x.id === b.dataset.id);
    mapa.setView([est.lat, est.lng], 11);
    est.marcador.openPopup();
  };
}

async function inicia() {
  let dados;
  try {
    const resp = await fetch("dados/jogadores.json");
    if (!resp.ok) throw new Error(resp.status);
    dados = await resp.json();
  } catch {
    $("#ficha").innerHTML = '<p class="vazio">Não consegui carregar os jogadores agora. Tente de novo em instantes.</p>';
    return;
  }
  $("#aviso-exemplo").hidden = !dados.exemplo;
  J = dados.jogadores;
  J.forEach(totais);
  E = dados.estadios;
  E.forEach((e) => (e.gols = J.reduce((s, j) => s + (j.porE[e.id] || 0), 0)));

  const anos = [...new Set(J.flatMap((j) => Object.keys(j.porT)))].sort();
  anos.forEach((a) => $("#temp").insertAdjacentHTML("beforeend", `<option>${a}</option>`));
  $("#posicoes").innerHTML = [["", "Todos"], ...Object.entries(POS).map(([k, v]) => [k, v[0] + "s"])]
    .map(([k, t]) => `<button type="button" data-p="${k}" aria-pressed="${k === ""}">${t}</button>`).join("");
  ligaEventos();
  lista();
}

inicia();
