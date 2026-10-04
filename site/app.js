// Página 1: visão geral. Lê dados/partidas.json (gerado por pipeline/exporta_site.py) e recalcula tudo no navegador.
const $ = (id) => document.getElementById(id);
const ROTULO = { V: "Vitória", E: "Empate", D: "Derrota" };
const CLASSE = { V: "v", E: "e", D: "d" };
const POR_PAGINA = 40;

let partidas = [];
let filtro = { temporada: "", tecnico: "" };
let mostrados = POR_PAGINA;
let busca = "";
let detalhes = null;
let linhaAberta = null;
const porId = new Map();

const semAcento = (s) => (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmtData = (iso) => iso.split("-").reverse().join("/");
const fmtNum = (n) => n.toLocaleString("pt-BR");
const pct = (x) => `${Math.round(x * 100)}%`;
const ehCasa = (p) => p.corinthians_mandante === true;

const ICONES = {
  jogos: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  vitorias: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>',
  empates: '<path d="M5 9h14M5 15h14"/>',
  derrotas: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  aproveitamento: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-6"/>',
  feitos: '<circle cx="12" cy="12" r="9"/><path d="M12 8l3.5 2.5-1.3 4h-4.4l-1.3-4z"/><path d="M12 3v5M20.5 9.5l-5 1M17.5 19l-3.3-4.5M6.5 19l3.3-4.5M3.5 9.5l5 1"/>',
  sofridos: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
};
const iniciais = (nome) => (nome || "?").replace(/[^\p{L}\s]/gu, "").split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "?";
// Escudo, logo ou foto. Sem imagem (ou se ela falhar), mostra as iniciais.
const imagem = (url, nome, tipo = "") =>
  `<span class="escudo ${tipo}${url ? "" : " neutro"}">${url ? `<img src="${url}" alt="" loading="lazy" data-ini="${iniciais(nome)}">` : iniciais(nome)}</span>`;

function resumo(lista) {
  const r = { jogos: lista.length, V: 0, E: 0, D: 0, pro: 0, contra: 0 };
  for (const p of lista) {
    r[p.resultado]++;
    r.pro += p.gols_corinthians;
    r.contra += p.gols_adversario;
  }
  r.aproveitamento = r.jogos ? (r.V * 3 + r.E) / (r.jogos * 3) : 0;
  return r;
}

const passa = (p) =>
  (!filtro.temporada || String(p.temporada) === filtro.temporada) &&
  (!filtro.tecnico || p.tecnico === filtro.tecnico);

function preencheFiltros() {
  const temporadas = [...new Set(partidas.map((p) => p.temporada))].sort((a, b) => b - a);
  $("f-temporada").innerHTML =
    `<option value="">Todas as temporadas</option>` + temporadas.map((t) => `<option>${t}</option>`).join("");
  preencheTecnicos();
}

function preencheTecnicos() {
  const base = partidas.filter((p) => p.tecnico && (!filtro.temporada || String(p.temporada) === filtro.temporada));
  const contagem = {};
  for (const p of base) contagem[p.tecnico] = (contagem[p.tecnico] || 0) + 1;
  const nomes = Object.keys(contagem).sort((a, b) => contagem[b] - contagem[a]);
  if (filtro.tecnico && !nomes.includes(filtro.tecnico)) filtro.tecnico = "";
  $("f-tecnico").innerHTML =
    `<option value="">Todos os técnicos</option>` +
    nomes.map((n) => `<option ${n === filtro.tecnico ? "selected" : ""}>${n}</option>`).join("");
}

function desenhaMosaico() {
  const anos = [...new Set(partidas.map((p) => p.temporada))].sort((a, b) => a - b);
  $("mosaico").innerHTML = anos
    .map((ano) => {
      const jogos = partidas
        .filter((p) => p.temporada === ano)
        .map(
          (p) =>
            `<i class="q ${CLASSE[p.resultado]}${passa(p) ? "" : " fora"}" data-id="${p.id_partida}"></i>`
        )
        .join("");
      const ativo = filtro.temporada === String(ano) ? " ativo" : "";
      return `<div class="m-linha"><span class="m-ano${ativo}">${ano}</span><div class="m-jogos">${jogos}</div></div>`;
    })
    .join("");
}

function desenhaKpis(lista) {
  const r = resumo(lista);
  const saldo = r.pro - r.contra;
  const itens = [
    ["jogos", "Jogos", fmtNum(r.jogos)],
    ["vitorias", "Vitórias", fmtNum(r.V)],
    ["empates", "Empates", fmtNum(r.E)],
    ["derrotas", "Derrotas", fmtNum(r.D)],
    ["aproveitamento", "Aproveitamento", pct(r.aproveitamento), "destaque"],
    ["feitos", "Gols feitos", fmtNum(r.pro)],
    ["sofridos", "Gols sofridos", fmtNum(r.contra)],
  ];
  $("kpis").innerHTML = itens
    .map(([ic, rotulo, v, c = ""]) => `<div class="kpi ${c}"><span class="icone"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[ic]}</svg></span><dd>${v}</dd><dt>${rotulo}</dt></div>`)
    .join("");
  $("subtitulo").textContent = lista.length
    ? `${fmtNum(lista.length)} jogos · saldo de gols ${saldo > 0 ? "+" : ""}${saldo}`
    : "Nenhum jogo com esses filtros";
}

function barra(r) {
  if (!r.jogos) return `<div class="barra"></div>`;
  const w = (n) => `${(n / r.jogos) * 100}%`;
  return `<div class="barra" role="img" aria-label="${r.V} vitórias, ${r.E} empates, ${r.D} derrotas"><span class="v" style="width:${w(r.V)}"></span><span class="e" style="width:${w(r.E)}"></span><span class="d" style="width:${w(r.D)}"></span></div>`;
}

function desenhaTemporadas() {
  const base = partidas.filter((p) => !filtro.tecnico || p.tecnico === filtro.tecnico);
  const anos = [...new Set(base.map((p) => p.temporada))].sort((a, b) => a - b);
  $("temporadas").innerHTML = anos
    .map((ano) => {
      const r = resumo(base.filter((p) => p.temporada === ano));
      const ativo = filtro.temporada === String(ano) ? " ativo" : "";
      return `<div class="barra-linha${ativo}"><span class="rotulo">${ano}</span>${barra(r)}<span class="pct">${pct(r.aproveitamento)}</span></div>`;
    })
    .join("");
}

function desenhaCasaFora(lista) {
  const grupos = [
    ["Em casa", lista.filter((p) => ehCasa(p))],
    ["Fora", lista.filter((p) => p.corinthians_mandante === false)],
  ];
  $("casa-fora").innerHTML =
    `<div class="casa-fora">` +
    grupos
      .map(([nome, jogos]) => {
        const r = resumo(jogos);
        return `<div class="cf"><span class="rotulo">${nome}</span>${barra(r)}<small>${fmtNum(r.jogos)} jogos · aproveitamento ${r.jogos ? pct(r.aproveitamento) : "–"}</small></div>`;
      })
      .join("") +
    `</div>`;
}

function desenhaLista(lista) {
  const termo = semAcento(busca.trim());
  const filtrada = termo
    ? lista.filter((p) => semAcento([p.adversario, p.competicao, p.tecnico, p.estadio].join(" ")).includes(termo))
    : lista;
  $("busca-contagem").textContent = termo ? `${fmtNum(filtrada.length)} ${filtrada.length === 1 ? "jogo encontrado" : "jogos encontrados"}` : "";
  const recentes = [...filtrada].sort((a, b) => (a.data < b.data ? 1 : -1));
  $("lista").innerHTML = recentes.length
    ? recentes
        .slice(0, mostrados)
        .map(
          (p) =>
            `<tr class="${CLASSE[p.resultado]}" data-id="${esc(p.id_partida)}" tabindex="0" role="button" aria-label="Abrir resumo: ${esc(p.adversario)}, ${p.gols_corinthians} a ${p.gols_adversario}, ${fmtData(p.data)}"><td>${fmtData(p.data)}</td>` +
            `<td><span class="com-imagem">${imagem(p.escudo_url, p.adversario)}${ehCasa(p) ? "" : "@ "}${esc(p.adversario ?? "—")}</span></td>` +
            `<td class="placar" aria-label="${ROTULO[p.resultado]}"><span class="resultado"><i></i>${p.gols_corinthians} x ${p.gols_adversario}</span></td>` +
            `<td><span class="com-imagem">${imagem(p.competicao_logo_url, p.competicao)}${esc(p.competicao ?? "")}</span></td>` +
            `<td><span class="com-imagem">${imagem(p.tecnico_foto_url, p.tecnico, "foto")}${esc(p.tecnico ?? "—")}</span></td></tr>`
        )
        .join("")
    : `<tr><td colspan="5" class="vazio">Nenhum jogo encontrado. Mude a busca ou use "Limpar filtros".</td></tr>`;
  $("mais").hidden = recentes.length <= mostrados;
}

function desenha() {
  const lista = partidas.filter(passa);
  desenhaMosaico();
  desenhaKpis(lista);
  desenhaTemporadas();
  desenhaCasaFora(lista);
  desenhaLista(lista);
}

function ligaEventos() {
  $("f-temporada").addEventListener("change", (e) => {
    filtro.temporada = e.target.value;
    mostrados = POR_PAGINA;
    preencheTecnicos();
    desenha();
  });
  $("f-tecnico").addEventListener("change", (e) => {
    filtro.tecnico = e.target.value;
    mostrados = POR_PAGINA;
    desenha();
  });
  $("limpar").addEventListener("click", () => {
    filtro = { temporada: "", tecnico: "" };
    busca = "";
    $("busca").value = "";
    mostrados = POR_PAGINA;
    $("f-temporada").value = "";
    preencheTecnicos();
    desenha();
  });
  $("mais").addEventListener("click", () => {
    mostrados += POR_PAGINA;
    desenha();
  });
  $("busca").addEventListener("input", (e) => {
    busca = e.target.value;
    mostrados = POR_PAGINA;
    desenhaLista(partidas.filter(passa));
  });
  $("lista").addEventListener("click", (e) => {
    const linha = e.target.closest("tr[data-id]");
    if (linha) abreJogo(linha.dataset.id, linha);
  });
  $("lista").addEventListener("keydown", (e) => {
    const linha = e.target.closest("tr[data-id]");
    if (linha && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      abreJogo(linha.dataset.id, linha);
    }
  });
  $("fundo-jogo").addEventListener("click", fechaJogo);
  document.addEventListener("keydown", (e) => e.key === "Escape" && !$("painel-jogo").hidden && fechaJogo());
  $("revisao").addEventListener("click", (e) => {
    const ligado = document.body.classList.toggle("revisao");
    e.currentTarget.setAttribute("aria-pressed", ligado);
    e.currentTarget.textContent = ligado ? "Esconder etiquetas dos blocos" : "Mostrar etiquetas dos blocos";
  });

  // Dica do jogo ao passar o mouse (ou tocar) num quadradinho do mosaico
  const dica = $("dica-jogo");
  const mostra = (e) => {
    const q = e.target.closest(".q[data-id]");
    if (!q) return void (dica.hidden = true);
    const p = porId.get(q.dataset.id);
    dica.innerHTML = `<b>${p.gols_corinthians} x ${p.gols_adversario}</b> ${ehCasa(p) ? "contra" : "fora contra"} ${p.adversario ?? "—"}<br>${fmtData(p.data)} · ${p.competicao ?? ""}`;
    dica.hidden = false;
    const x = Math.min(e.clientX + 14, window.innerWidth - 280);
    dica.style.left = `${Math.max(8, x)}px`;
    dica.style.top = `${e.clientY + 16}px`;
  };
  $("mosaico").addEventListener("mousemove", mostra);
  $("mosaico").addEventListener("click", mostra);
  $("mosaico").addEventListener("mouseleave", () => (dica.hidden = true));
}


// ---------- Painel do jogo ----------
const GRUPO = (pos) => {
  const p = pos.toUpperCase();
  if (p === "G" || p === "GK") return 0;
  if (/^(CD|CB|SW|LB|RB|LWB|RWB|D)/.test(p)) return 1;
  if (/^(DM|CDM)/.test(p)) return 2;
  if (/^(AM|CAM|SS|LW|RW)/.test(p)) return 4;
  if (/^(F|CF|ST|S)/.test(p)) return 5;
  return 3; // CM, LM, RM e o resto do meio-campo
};
const LADO = (pos) => {
  const p = pos.toUpperCase();
  if (/-L$/.test(p) || /^L/.test(p)) return -1;
  if (/-R$/.test(p) || /^R/.test(p)) return 1;
  return 0;
};

// Coloca os titulares no campo pela posição (goleiro embaixo, ataque em cima), espalhando cada linha pela largura.
function posicionaTitulares(titulares) {
  const linhas = new Map();
  titulares.forEach((t) => {
    const g = GRUPO(t.pos || "");
    if (!linhas.has(g)) linhas.set(g, []);
    linhas.get(g).push(t);
  });
  const ordem = [...linhas.keys()].sort((a, b) => a - b);
  const colocados = [];
  ordem.forEach((g, i) => {
    const y = ordem.length === 1 ? 50 : 91 - (i * (91 - 13)) / (ordem.length - 1);
    const jogadores = linhas.get(g).sort((a, b) => LADO(a.pos || "") - LADO(b.pos || ""));
    jogadores.forEach((t, k) => colocados.push({ ...t, x: ((k + 1) * 100) / (jogadores.length + 1), y }));
  });
  return colocados;
}

const CAMPO_SVG = `<svg class="linhas" viewBox="0 0 68 88" preserveAspectRatio="none" aria-hidden="true"><rect x="2" y="2" width="64" height="84"/><path d="M2 44h64"/><circle cx="34" cy="44" r="8"/><rect x="14" y="2" width="40" height="14"/><rect x="24" y="2" width="20" height="5"/><rect x="14" y="72" width="40" height="14"/><rect x="24" y="81" width="20" height="5"/></svg>`;
const sobrenome = (nome) => { const partes = nome.split(" "); return partes.length > 1 ? partes.slice(1).join(" ") : nome; };

function selosDoJogador(nome, d) {
  const gols = d.gols.filter((g) => g.favor && !g.contra && g.autor === nome).length;
  const cartoes = d.cartoes.filter((c) => c.nome === nome);
  const t = d.escalacao.find((e) => e.nome === nome);
  const out = [];
  if (gols) out.push(`<span class="selo" title="Gols">${gols > 1 ? gols + "×" : ""}<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 8l3.5 2.5-1.3 4h-4.4l-1.3-4z"/></svg></span>`);
  cartoes.forEach((c) => out.push(`<span class="selo ${c.tipo}" title="Cartão ${c.tipo}"></span>`));
  if (t && t.titular && t.saida < 90) out.push(`<span class="selo troca" title="Saiu aos ${t.saida} minutos">↓${t.saida}'</span>`);
  return out.join("");
}

function htmlPainel(p, d) {
  const casa = ehCasa(p) || p.corinthians_mandante == null;
  const nomeCor = "Corinthians";
  const lado = (nome, escudoUrl) => `<div class="pj-time">${imagem(escudoUrl, nome)}<span>${esc(nome)}</span></div>`;
  const esq = casa ? lado(nomeCor, null) : lado(p.adversario, p.escudo_url);
  const dir = casa ? lado(p.adversario, p.escudo_url) : lado(nomeCor, null);
  const placar = casa ? `${p.gols_corinthians} x ${p.gols_adversario}` : `${p.gols_adversario} x ${p.gols_corinthians}`;
  const meta = [fmtData(p.data), p.competicao, p.estadio, p.publico != null ? `${fmtNum(p.publico)} torcedores` : null].filter(Boolean).map(esc).join(" · ");

  const gols = d.gols.length
    ? d.gols
        .map((g) => {
          const detalhe = [g.penalti ? "pênalti" : "", g.contra ? "gol contra" : "", g.assist ? `assistência de ${esc(g.assist)}` : ""].filter(Boolean).join(" · ");
          return `<div class="linha-evento${g.favor ? "" : " contra"}"><span class="min">${g.min}'</span><div>${g.favor ? "<b>" : ""}${esc(g.autor)}${g.favor ? "</b>" : ""}${g.favor ? "" : ` <small style="display:inline">(${esc(p.adversario)})</small>`}${detalhe ? `<small>${detalhe}</small>` : ""}</div></div>`;
        })
        .join("")
    : `<p class="vazio-pj">Sem gols neste jogo.</p>`;

  const cartoes = d.cartoes.length
    ? d.cartoes.map((c) => `<div class="linha-evento"><span class="min">${c.min ? c.min + "'" : ""}</span><div><span class="cartao-chip ${c.tipo}"></span>${esc(c.nome)}</div></div>`).join("")
    : `<p class="vazio-pj">Nenhum cartão do Corinthians.</p>`;

  const titulares = posicionaTitulares(d.escalacao.filter((t) => t.titular));
  const campo = titulares
    .map((t) => `<div class="jog" style="left:${t.x}%;top:${t.y}%">${imagem(t.foto_url, t.nome, "foto")}<b>${esc(sobrenome(t.nome))}</b><span class="selos">${selosDoJogador(t.nome, d)}</span></div>`)
    .join("");
  const reservas = d.escalacao.filter((t) => !t.titular);
  const listaReservas = reservas.length
    ? `<div class="reservas">${reservas.map((t) => `<div class="reserva">${imagem(t.foto_url, t.nome, "foto")}<span>${esc(t.nome)}</span><small>entrou aos ${t.entrada}'</small></div>`).join("")}</div>`
    : `<p class="vazio-pj">Nenhuma substituição.</p>`;

  return `<button type="button" class="pj-fechar" id="pj-fechar" aria-label="Fechar">×</button>
    <div class="pj-cab"><div class="pj-meta" id="pj-titulo">${meta}</div>
      <div class="pj-placar">${esq}<div class="pj-gols">${placar}</div>${dir}</div>
      <span class="pj-resultado ${CLASSE[p.resultado].replace("v", "")}">${ROTULO[p.resultado]}${p.tecnico ? ` · técnico ${esc(p.tecnico)}` : ""}</span></div>
    <h3>Gols</h3>${gols}
    <h3>Cartões</h3>${cartoes}
    <h3>Escalação</h3><div class="campo">${CAMPO_SVG}${campo}</div>
    <h3>Quem entrou</h3>${listaReservas}`;
}

async function abreJogo(id, linha) {
  const p = porId.get(id);
  if (!p) return;
  if (!detalhes) {
    try {
      const resp = await fetch("dados/detalhes.json");
      detalhes = (await resp.json()).jogos;
    } catch {
      detalhes = {};
    }
  }
  const painel = $("painel-jogo");
  const d = detalhes[id];
  painel.innerHTML = d
    ? htmlPainel(p, d)
    : `<button type="button" class="pj-fechar" id="pj-fechar" aria-label="Fechar">×</button><div class="pj-cab"><div class="pj-meta" id="pj-titulo">${fmtData(p.data)} · ${esc(p.competicao ?? "")}</div><div class="pj-placar"><div class="pj-time"><span>Corinthians</span></div><div class="pj-gols">${p.gols_corinthians} x ${p.gols_adversario}</div><div class="pj-time"><span>${esc(p.adversario)}</span></div></div></div><p class="vazio-pj">Ainda não temos o detalhe deste jogo.</p>`;
  linhaAberta = linha;
  painel.hidden = false;
  $("fundo-jogo").hidden = false;
  $("pj-fechar").addEventListener("click", fechaJogo);
  $("pj-fechar").focus();
  painel.scrollTop = 0;
}

function fechaJogo() {
  $("painel-jogo").hidden = true;
  $("fundo-jogo").hidden = true;
  if (linhaAberta?.isConnected) linhaAberta.focus();
}

document.addEventListener(
  "error",
  (e) => {
    const img = e.target;
    if (img.tagName === "IMG" && img.dataset.ini) {
      img.parentElement.classList.add("neutro");
      img.replaceWith(document.createTextNode(img.dataset.ini));
    }
  },
  true
);

async function inicia() {
  try {
    const resp = await fetch("dados/partidas.json");
    const dados = await resp.json();
    partidas = dados.partidas;
    $("aviso-exemplo").hidden = !dados.exemplo;
    $("atualizado").textContent = `Dados atualizados em ${fmtData(dados.gerado_em.slice(0, 10))}`;
  } catch {
    $("subtitulo").textContent = "Não foi possível carregar os jogos. Tente atualizar a página.";
    return;
  }
  partidas.forEach((p) => porId.set(p.id_partida, p));
  preencheFiltros();
  ligaEventos();
  desenha();
}

inicia();
