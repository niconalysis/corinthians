// Página 1: visão geral. Lê dados/partidas.json (gerado por pipeline/exporta_site.py) e recalcula tudo no navegador.
const $ = (id) => document.getElementById(id);
const ROTULO = { V: "Vitória", E: "Empate", D: "Derrota" };
const CLASSE = { V: "v", E: "e", D: "d" };
const POR_PAGINA = 40;

let partidas = [];
let filtro = { temporada: "", tecnico: "" };
let mostrados = POR_PAGINA;

const fmtData = (iso) => iso.split("-").reverse().join("/");
const fmtNum = (n) => n.toLocaleString("pt-BR");
const pct = (x) => `${Math.round(x * 100)}%`;
const ehCasa = (p) => p.corinthians_mandante === true;

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
    ["", "Jogos", fmtNum(r.jogos)],
    ["v", "Vitórias", fmtNum(r.V)],
    ["", "Empates", fmtNum(r.E)],
    ["d", "Derrotas", fmtNum(r.D)],
    ["", "Aproveitamento", pct(r.aproveitamento)],
    ["", "Gols feitos", fmtNum(r.pro)],
    ["", "Gols sofridos", fmtNum(r.contra)],
  ];
  $("kpis").innerHTML = itens.map(([c, rotulo, v]) => `<div class="kpi ${c}"><dt>${rotulo}</dt><dd>${v}</dd></div>`).join("");
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
  $("temporadas").innerHTML =
    anos
      .map((ano) => {
        const r = resumo(base.filter((p) => p.temporada === ano));
        const ativo = filtro.temporada === String(ano) ? " ativo" : "";
        return `<div class="barra-linha${ativo}"><span class="rotulo">${ano}</span>${barra(r)}<span class="pct">${pct(r.aproveitamento)}</span></div>`;
      })
      .join("") + `<p class="nota">A barra mostra vitórias, empates e derrotas. O número ao lado é o aproveitamento de pontos.</p>`;
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
        return `<div class="barra-linha" style="grid-template-columns:76px 1fr 56px"><span class="rotulo">${nome}</span>${barra(r)}<span class="pct">${r.jogos ? pct(r.aproveitamento) : "–"}</span></div><p class="nota" style="margin:0 0 14px 86px">${fmtNum(r.jogos)} jogos</p>`;
      })
      .join("") +
    `</div>`;
}

function desenhaLista(lista) {
  const recentes = [...lista].sort((a, b) => (a.data < b.data ? 1 : -1));
  $("lista").innerHTML = recentes.length
    ? recentes
        .slice(0, mostrados)
        .map(
          (p) =>
            `<tr class="${CLASSE[p.resultado]}"><td>${fmtData(p.data)}</td><td>${ehCasa(p) ? "" : "@ "}${p.adversario ?? "—"}</td><td class="placar" aria-label="${ROTULO[p.resultado]}">${p.gols_corinthians} x ${p.gols_adversario}</td><td>${p.competicao ?? ""}</td><td>${p.tecnico ?? "—"}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="5" class="vazio">Nenhum jogo com esses filtros. Use "Limpar filtros".</td></tr>`;
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
    mostrados = POR_PAGINA;
    $("f-temporada").value = "";
    preencheTecnicos();
    desenha();
  });
  $("mais").addEventListener("click", () => {
    mostrados += POR_PAGINA;
    desenha();
  });
  $("revisao").addEventListener("click", (e) => {
    const ligado = document.body.classList.toggle("revisao");
    e.currentTarget.setAttribute("aria-pressed", ligado);
    e.currentTarget.textContent = ligado ? "Esconder etiquetas dos blocos" : "Mostrar etiquetas dos blocos";
  });

  // Dica do jogo ao passar o mouse (ou tocar) num quadradinho do mosaico
  const dica = $("dica-jogo");
  const porId = new Map();
  partidas.forEach((p) => porId.set(p.id_partida, p));
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
  preencheFiltros();
  ligaEventos();
  desenha();
}

inicia();
