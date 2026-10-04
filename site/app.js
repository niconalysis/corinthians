// Página 1: visão geral. Lê dados/partidas.json (gerado por pipeline/exporta_site.py) e recalcula tudo no navegador.
const $ = (id) => document.getElementById(id);
const ROTULO = { V: "Vitória", E: "Empate", D: "Derrota" };
const CLASSE = { V: "v", E: "e", D: "d" };
const POR_PAGINA = 40;

let partidas = [];
let filtro = { temporada: "", tecnico: "" };
let mostrados = POR_PAGINA;
let busca = "";
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
// Casa ou fora, mais o nome do estádio. Quando a fonte não diz quem é o mandante, mostra só o estádio.
const localDoJogo = (p) => {
  const tag = p.corinthians_mandante === true ? "Casa" : p.corinthians_mandante === false ? "Fora" : "";
  return `<span class="local">${tag ? `<b class="${tag === "Casa" ? "casa" : "fora"}">${tag}</b>` : ""}<span>${esc(p.estadio ?? "—")}</span></span>`;
};
const { imagem } = PainelJogo; // painel-jogo.js também desenha os escudos e as fotos

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
            `<td><span class="com-imagem">${imagem(p.escudo_url, p.adversario)}${esc(p.adversario ?? "—")}</span></td>` +
            `<td class="placar" aria-label="${ROTULO[p.resultado]}"><span class="resultado"><i></i>${p.gols_corinthians} x ${p.gols_adversario}</span></td>` +
            `<td><span class="com-imagem">${imagem(p.competicao_logo_url, p.competicao)}${esc(p.competicao ?? "")}</span></td>` +
            `<td>${localDoJogo(p)}</td>` +
            `<td><span class="com-imagem">${imagem(p.tecnico_foto_url, p.tecnico, "foto")}${esc(p.tecnico ?? "—")}</span></td></tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="vazio">Nenhum jogo encontrado. Mude a busca ou use "Limpar filtros".</td></tr>`;
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
    if (linha) PainelJogo.abre(porId.get(linha.dataset.id), linha);
  });
  $("lista").addEventListener("keydown", (e) => {
    const linha = e.target.closest("tr[data-id]");
    if (linha && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      PainelJogo.abre(porId.get(linha.dataset.id), linha);
    }
  });
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
