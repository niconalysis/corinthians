// Página 4: público e Neo Química Arena. Lê dados/publico.json (gerado por pipeline/exporta_publico.py).
// Público e médias usam só jogos em casa (público de jogo fora é do estádio do adversário). Aproveitamento compara casa e fora.
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const iniciais = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const plural = (n, um, varios) => `${n.toLocaleString("pt-BR")} ${n === 1 ? um : varios}`;
const num = (n) => Math.round(n).toLocaleString("pt-BR");
const dataBR = (d) => d.split("-").reverse().join("/");
const apr = (g) => (g.j ? Math.round(((g.v * 3 + g.e) / (g.j * 3)) * 100) : 0);
const MIN_ADV = 2; // adversário só entra no ranking com pelo menos 2 jogos em casa com público

let D = null;
let temp = "";
let soNqa = false;
let ordAdv = "media";
let verTodosAdv = false;

const nomeAdv = (j) => D.adversarios[j.aid]?.nome || "Adversário";

function escudo(aid) {
  const a = D.adversarios[aid];
  const nome = a?.nome || "?";
  return a?.escudo_url
    ? `<span class="mini-esc"><img src="${esc(a.escudo_url)}" alt="" loading="lazy" data-nome="${esc(nome)}"></span>`
    : `<span class="mini-esc"><span class="sem-foto" aria-hidden="true">${esc(iniciais(nome))}</span></span>`;
}
// Escudo que não carrega vira as iniciais do time.
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName !== "IMG" || !img.dataset.nome) return;
  const s = document.createElement("span");
  s.className = "sem-foto";
  s.setAttribute("aria-hidden", "true");
  s.textContent = iniciais(img.dataset.nome);
  img.replaceWith(s);
}, true);

const zerado = () => ({ j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 });
function soma(g, j) {
  g.j++;
  g[j.r.toLowerCase()]++;
  g.gp += j.f;
  g.gc += j.c;
}

function mando(titulo, emoji, g) {
  if (!g.j) return `<div class="mando"><h4>${emoji} ${titulo}</h4><div class="n">0<small>jogos</small></div></div>`;
  const t = g.j;
  return `<div class="mando"><h4>${emoji} ${titulo}</h4>
    <div class="ap">${apr(g)}%<small>de aproveitamento</small></div>
    <div class="barra" role="img" aria-label="${g.v} vitórias, ${g.e} empates, ${g.d} derrotas"><i class="v" style="width:${(g.v / t) * 100}%"></i><i class="e" style="width:${(g.e / t) * 100}%"></i><i class="d" style="width:${(g.d / t) * 100}%"></i></div>
    <div class="d">${plural(g.j, "jogo", "jogos")}: ${g.v}V · ${g.e}E · ${g.d}D<br>${g.gp} gols pró · ${g.gc} contra</div></div>`;
}

function render() {
  const todos = D.jogos;
  const dosAnos = temp ? todos.filter((j) => String(j.t) === temp) : todos;

  // jogos em casa que entram nas contas de público
  const casa = dosAnos.filter((j) => j.casa === true && (!soNqa || j.nqa));
  const comPub = casa.filter((j) => j.pub);
  const total = comPub.reduce((s, j) => s + j.pub, 0);
  const maior = comPub.reduce((m, j) => (!m || j.pub > m.pub ? j : m), null);
  const onde = soNqa ? "na Neo Química Arena" : "em casa";

  // média por temporada: sempre todas as temporadas (só a escolhida fica destacada); respeita o filtro de estádio
  const porAno = new Map();
  todos.forEach((j) => {
    if (j.casa !== true || !j.pub || (soNqa && !j.nqa)) return;
    const a = porAno.get(j.t) || { soma: 0, n: 0 };
    a.soma += j.pub;
    a.n++;
    porAno.set(j.t, a);
  });
  const anos = [...porAno.entries()].sort((a, b) => b[0] - a[0]);
  const maxAno = Math.max(...anos.map(([, a]) => a.soma / a.n), 1);

  // por adversário
  const porAdv = new Map();
  comPub.forEach((j) => {
    const a = porAdv.get(j.aid) || { aid: j.aid, soma: 0, n: 0, maior: 0 };
    a.soma += j.pub;
    a.n++;
    a.maior = Math.max(a.maior, j.pub);
    porAdv.set(j.aid, a);
  });
  const advs = [...porAdv.values()].filter((a) => a.n >= MIN_ADV)
    .sort((a, b) => (ordAdv === "media" ? b.soma / b.n - a.soma / a.n : b.maior - a.maior));
  const maxAdv = Math.max(...advs.map((a) => (ordAdv === "media" ? a.soma / a.n : a.maior)), 1);
  const advMostra = verTodosAdv ? advs : advs.slice(0, 10);

  // maiores públicos
  const top = [...comPub].sort((a, b) => b.pub - a.pub || (a.d < b.d ? 1 : -1)).slice(0, 10);

  // aproveitamento (respeita só a temporada)
  const gNqa = zerado(), gOutros = zerado(), gFora = zerado(), gCasa = zerado();
  const anoAp = new Map();
  dosAnos.forEach((j) => {
    if (j.casa === true) { soma(gCasa, j); soma(j.nqa ? gNqa : gOutros, j); }
    else if (j.casa === false) soma(gFora, j);
  });
  todos.forEach((j) => {
    if (j.casa === null) return;
    const a = anoAp.get(j.t) || { c: zerado(), f: zerado() };
    soma(j.casa ? a.c : a.f, j);
    anoAp.set(j.t, a);
  });
  const linhasAp = [...anoAp.entries()].sort((a, b) => b[0] - a[0]);

  const semPub = casa.length - comPub.length;
  const cobertura = semPub
    ? `<p class="nota">${plural(comPub.length, "jogo tem", "jogos têm")} público registrado, de ${casa.length.toLocaleString("pt-BR")} ${onde}. Nos demais, a fonte não informa o público.</p>`
    : "";

  if (!comPub.length) {
    $("#conteudo").innerHTML = `<p class="vazio">Nenhum jogo ${onde} com público registrado nesta seleção.</p>`;
  } else {
    $("#conteudo").innerHTML = `<div class="pb">
    <section class="bloco">
      <h3>Resumo ${onde}${temp ? ` em ${temp}` : ""}</h3>
      <div class="stats quatro">
        <div class="stat"><em>👥</em><b>${num(total / comPub.length)}</b><span>público médio</span></div>
        <div class="stat"><em>🏟️</em><b>${num(maior.pub)}</b><span>maior público</span><small>${dataBR(maior.d)} · ${esc(nomeAdv(maior))}</small></div>
        <div class="stat"><em>📅</em><b>${comPub.length.toLocaleString("pt-BR")}</b><span>${comPub.length === 1 ? "jogo" : "jogos"} com público</span></div>
        <div class="stat"><em>➕</em><b>${num(total)}</b><span>torcedores somados</span></div>
      </div>
      ${cobertura}
    </section>

    <section class="bloco">
      <h3>Público médio por temporada</h3>
      <p class="sub">Só jogos ${onde}. Toque numa temporada para filtrar a página.</p>
      ${anos.map(([ano, a]) => `<button type="button" class="lbar" data-ano="${ano}" aria-pressed="${String(ano) === temp}"><span class="ano">${ano}</span><span class="tr"><i style="width:${(a.soma / a.n / maxAno) * 100}%"></i></span><b>${num(a.soma / a.n)}<small>${plural(a.n, "jogo", "jogos")}</small></b></button>`).join("")}
    </section>

    <div class="grade dois">
      <section class="bloco">
        <h3>Maiores públicos</h3>
        <div class="todos top">${top.map((j, i) => `<button type="button" class="jogo" data-id="${esc(j.id)}" aria-label="Abrir resumo do jogo de ${dataBR(j.d)}">
          <span class="pos">${i + 1}</span>
          <span class="meio"><b>${esc(nomeAdv(j))} · ${j.f} x ${j.c}</b><small>${dataBR(j.d)} · ${esc(j.comp || "")}${j.est ? " · " + esc(j.est) : ""}</small></span>
          <span class="pub">${num(j.pub)}<small>pessoas</small></span>
        </button>`).join("")}</div>
      </section>

      <section class="bloco">
        <h3>Por adversário</h3>
        <div class="ferr" style="margin-bottom:8px"><label>Ordenar por
          <select id="ord-adv"><option value="media"${ordAdv === "media" ? " selected" : ""}>Público médio</option><option value="maior"${ordAdv === "maior" ? " selected" : ""}>Maior público</option></select>
        </label></div>
        <p class="sub">Só adversários com pelo menos ${MIN_ADV} jogos ${onde} com público.</p>
        ${advMostra.length ? advMostra.map((a) => {
          const v = ordAdv === "media" ? a.soma / a.n : a.maior;
          return `<div class="lbar adv">${escudo(a.aid)}<span class="nome">${esc(D.adversarios[a.aid]?.nome || "")}<small>${plural(a.n, "jogo", "jogos")}</small></span><span class="tr"><i style="width:${(v / maxAdv) * 100}%"></i></span><b>${num(v)}</b></div>`;
        }).join("") : '<p class="sem-dado">Nenhum adversário com jogos suficientes nesta seleção.</p>'}
        ${advs.length > 10 ? `<button type="button" class="link" id="mais-adv">${verTodosAdv ? "Mostrar só os 10 primeiros" : `Ver todos os ${advs.length} adversários`}</button>` : ""}
      </section>
    </div>
    </div>`;
  }

  // casa x fora fica de fora do ramo acima: mostra mesmo quando não há público registrado
  $("#conteudo").insertAdjacentHTML("beforeend", `<section class="bloco" style="margin-top:16px">
      <h3>Aproveitamento em casa e fora${temp ? ` em ${temp}` : ""}</h3>
      <p class="sub">Vitória vale 3 pontos e empate 1; aproveitamento é o que o Corinthians somou do total possível.</p>
      <div class="tres">${mando("Neo Química Arena", "🏟️", gNqa)}${mando("Outros estádios em casa", "📍", gOutros)}${mando("Fora", "✈️", gFora)}</div>
      <div class="tabela-rolagem"><table class="tab-ap">
        <thead><tr><th>Temporada</th><th class="n">Em casa</th><th class="n">Fora</th><th class="n">Jogos em casa</th><th class="n">Jogos fora</th></tr></thead>
        <tbody>${linhasAp.map(([ano, a]) => {
          const c = apr(a.c), f = apr(a.f);
          return `<tr><td class="ano">${ano}</td><td class="n${a.c.j && c > f ? " melhor" : ""}">${a.c.j ? c + "%" : "–"}</td><td class="n${a.f.j && f > c ? " melhor" : ""}">${a.f.j ? f + "%" : "–"}</td><td class="n">${a.c.j}</td><td class="n">${a.f.j}</td></tr>`;
        }).join("")}</tbody>
      </table></div>
    </section>`);

  $("#ord-adv")?.addEventListener("change", (e) => { ordAdv = e.target.value; verTodosAdv = false; render(); });
  $("#mais-adv")?.addEventListener("click", () => { verTodosAdv = !verTodosAdv; render(); });
}

// Abre o painel do jogo (o mesmo da página 1). O painel quer os campos de partidas.json; se o jogo não estiver lá
// (ou o arquivo não carregar), monta a partir do que esta página já tem.
let partidasPorId = null;
async function abreJogo(botao) {
  const j = D.jogos.find((x) => x.id === botao.dataset.id);
  if (!j) return;
  if (!partidasPorId) {
    try {
      const dados = await (await fetch("dados/partidas.json")).json();
      partidasPorId = new Map(dados.partidas.map((p) => [p.id_partida, p]));
    } catch {
      partidasPorId = new Map();
    }
  }
  const adv = D.adversarios[j.aid];
  const p = partidasPorId.get(j.id) || {
    id_partida: j.id, data: j.d, temporada: j.t, competicao: j.comp, corinthians_mandante: j.casa, adversario: adv?.nome,
    escudo_url: adv?.escudo_url, gols_corinthians: j.f, gols_adversario: j.c, resultado: j.r, estadio: j.est, publico: j.pub,
  };
  PainelJogo.abre(p, botao);
}

function escolheTemp(valor) {
  temp = valor;
  verTodosAdv = false;
  $("#f-temp").value = valor;
  render();
}

fetch("dados/publico.json")
  .then((r) => r.json())
  .then((d) => {
    D = d;
    $("#aviso-exemplo").hidden = !d.exemplo;
    [...new Set(d.jogos.map((j) => j.t))].sort((a, b) => b - a)
      .forEach((t) => $("#f-temp").insertAdjacentHTML("beforeend", `<option value="${t}">${t}</option>`));
    $("#f-temp").onchange = (e) => escolheTemp(e.target.value);
    $("#f-est").onclick = (e) => {
      const b = e.target.closest("button[data-v]");
      if (!b) return;
      soNqa = b.dataset.v === "nqa";
      verTodosAdv = false;
      document.querySelectorAll("#f-est button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      render();
    };
    $("#conteudo").onclick = (e) => {
      const ano = e.target.closest(".lbar[data-ano]");
      if (ano) return escolheTemp(temp === ano.dataset.ano ? "" : ano.dataset.ano);
      const jogo = e.target.closest(".jogo[data-id]");
      if (jogo) abreJogo(jogo);
    };
    render();
  })
  .catch(() => { $("#conteudo").innerHTML = '<p class="vazio">Não deu para carregar os dados agora.</p>'; });
