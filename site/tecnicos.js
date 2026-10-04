// Página 4: técnicos. Lê dados/tecnicos.json (gerado por pipeline/exporta_tecnicos.py).
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const semAcento = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const iniciais = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
const dataBR = (d) => d.split("-").reverse().join("/");
const fmt1 = (n) => n.toFixed(1).replace(".", ",");
const apr = (g) => (g.j ? Math.round(((g.v * 3 + g.e) / (g.j * 3)) * 100) : 0);
const porJogo = (n, j) => (j ? n / j : 0);

let T = [];
let SEM_TECNICO = 0;
let sel = null; // técnico aberto no modo "um técnico"
let cmp = []; // até dois técnicos no modo "comparar"
let comparando = false;
let verTodos = false;

function foto(t) {
  return t.foto_url
    ? `<img src="${esc(t.foto_url)}" alt="${esc(t.nome)}" loading="lazy" referrerpolicy="no-referrer" data-nome="${esc(t.nome)}">`
    : `<span class="sem-foto" aria-hidden="true">${esc(iniciais(t.nome))}</span>`;
}
// Foto que não carrega vira as iniciais do técnico.
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName !== "IMG" || !img.dataset.nome) return;
  const s = document.createElement("span");
  s.className = "sem-foto";
  s.setAttribute("aria-hidden", "true");
  s.textContent = iniciais(img.dataset.nome);
  img.replaceWith(s);
}, true);

const periodo = (t) => `${dataBR(t.primeiro.d)} a ${dataBR(t.ultimo.d)}`;
const marcado = (id) => (comparando ? cmp.includes(id) : id === sel);

function tira() {
  const q = semAcento($("#busca").value.trim());
  const ord = $("#ord").value;
  const longos = $("#so-longos").getAttribute("aria-pressed") === "true";
  const chave = {
    jogos: (t) => -t.geral.j, vit: (t) => -t.geral.v, apr: (t) => -apr(t.geral),
    recente: (t) => t.ultimo.d.split("-").map((x) => 9999 - x).join("-"), nome: (t) => t.nome,
  };
  const L = T.filter((t) => semAcento(t.nome).includes(q) && (!longos || t.geral.j >= 10)).sort((x, y) => {
    const kx = chave[ord](x), ky = chave[ord](y);
    return kx < ky ? -1 : kx > ky ? 1 : x.nome.localeCompare(y.nome, "pt-BR");
  });
  $("#tira").innerHTML = L.length
    ? L.map((t) => `<button type="button" class="fig" role="option" data-id="${esc(t.nome)}" aria-pressed="${marcado(t.nome)}" aria-label="${esc(t.nome)}">
        <span class="ret">${foto(t)}</span>
        <span class="inf"><b>${esc(t.nome)}</b><small>${plural(t.geral.j, "jogo", "jogos")}</small><span class="em"><span>🏆 ${apr(t.geral)}%</span></span></span>
      </button>`).join("")
    : '<p class="vazio">Nenhum técnico com esses filtros.</p>';
}

const barra = (g) => {
  const t = g.j || 1;
  return `<div class="barra-t" role="img" aria-label="${g.v} vitórias, ${g.e} empates, ${g.d} derrotas"><i class="v" style="width:${(g.v / t) * 100}%"></i><i class="e" style="width:${(g.e / t) * 100}%"></i><i class="d" style="width:${(g.d / t) * 100}%"></i></div>`;
};

function mando(titulo, emoji, g) {
  if (!g.j) return `<div class="mando"><h4>${emoji} ${titulo}</h4><div class="n">0<small>jogos</small></div></div>`;
  return `<div class="mando"><h4>${emoji} ${titulo}</h4>
    <div class="n">${g.j}<small>${g.j === 1 ? "jogo" : "jogos"}</small></div>
    ${barra(g)}
    <div class="d">${g.v}V · ${g.e}E · ${g.d}D · ${apr(g)}% de aproveitamento<br>${g.gp} gols pró · ${g.gc} contra</div></div>`;
}

function jogoDestaque(rotulo, j) {
  if (!j) return `<div class="item"><span>${rotulo}</span><small class="sem-dado">Ainda não aconteceu</small></div>`;
  const onde = j.casa === true ? "em casa" : j.casa === false ? "fora" : "";
  return `<div class="item"><span>${rotulo}</span><b>${j.f} x ${j.c}</b><small>${esc(j.adv)} · ${dataBR(j.d)}${onde ? " · " + onde : ""}</small></div>`;
}

function artilheiros(t) {
  if (!t.artilheiros.length) return '<p class="sem-dado">Sem gols com autor registrado neste período.</p>';
  return `<div class="rank">${t.artilheiros.map((x, i) => `<div class="lin"><span class="pos">${i + 1}</span><span class="nome">${esc(x.nome)}</span><b>${x.gols}<small>${x.gols === 1 ? "gol" : "gols"}</small></b></div>`).join("")}</div>`;
}

function fichaUm(t) {
  const g = t.geral;
  const sg = g.gp - g.gc;
  const forma = t.jogos.slice(0, 5).map((j) => `<i class="${j.r}" title="${dataBR(j.d)}: ${j.f} x ${j.c} contra ${esc(j.adv)}">${j.r}</i>`).join("");
  const lista = verTodos ? t.jogos : t.jogos.slice(0, 10);
  const maxT = Math.max(...Object.values(t.porT).map((x) => x.j));

  $("#ficha").innerHTML = `<div class="cf">
    <section class="cf-topo">
      <div class="brasao foto-t">${foto(t)}</div>
      <div>
        <h2>${esc(t.nome)}</h2>
        <p>${plural(g.j, "jogo", "jogos")} · de ${periodo(t)} · aproveitamento: <b>${apr(g)}%</b></p>
        ${t.passagens > 1 ? `<p class="passagem">${t.passagens} passagens pelo clube</p>` : ""}
        <div class="forma"><span>Últimos jogos:</span>${forma}</div>
      </div>
      <div class="placar">
        <div class="stat"><em>🏆</em><b>${g.v}</b><span>${g.v === 1 ? "vitória" : "vitórias"}</span></div>
        <div class="stat"><em>🤝</em><b>${g.e}</b><span>${g.e === 1 ? "empate" : "empates"}</span></div>
        <div class="stat"><em>😞</em><b>${g.d}</b><span>${g.d === 1 ? "derrota" : "derrotas"}</span></div>
      </div>
    </section>

    <section class="bloco">
      <h3>Em casa e fora</h3>
      <div class="mandos">${mando("Em casa", "📍", t.casa)}${mando("Fora", "✈️", t.fora)}</div>
    </section>

    <section class="bloco">
      <h3>Em números</h3>
      <div class="stats quatro">
        <div class="stat"><em>⚽</em><b>${g.gp}</b><span>gols do Corinthians</span><small>${fmt1(porJogo(g.gp, g.j))} por jogo</small></div>
        <div class="stat"><em>🛡️</em><b>${g.gc}</b><span>gols sofridos</span><small>${fmt1(porJogo(g.gc, g.j))} por jogo</small></div>
        <div class="stat"><em>➕</em><b>${sg > 0 ? "+" : ""}${sg}</b><span>saldo de gols</span></div>
        <div class="stat"><em>📈</em><b>${apr(g)}%</b><span>aproveitamento</span><small>dos pontos possíveis</small></div>
        <div class="stat"><em>🔥</em><b>${t.seq_invicto}</b><span>jogos seguidos sem perder</span></div>
        <div class="stat"><em>🏆</em><b>${t.seq_vitorias}</b><span>vitórias seguidas</span></div>
        <div class="stat"><em>🟨</em><b>${t.amarelos}</b><span>cartões amarelos</span></div>
        <div class="stat"><em>🟥</em><b>${t.vermelhos}</b><span>cartões vermelhos</span></div>
      </div>
    </section>

    <div class="grade dois">
      <section class="bloco"><h3>⚽ Artilheiros sob o comando dele</h3>${artilheiros(t)}</section>
      <section class="bloco">
        <h3>Destaques</h3>
        <div class="dest">
          ${jogoDestaque("Maior vitória", t.maior_vitoria)}
          ${jogoDestaque("Maior derrota", t.maior_derrota)}
          ${jogoDestaque("Primeiro jogo", t.primeiro)}
          ${jogoDestaque("Último jogo", t.ultimo)}
        </div>
      </section>
    </div>

    <div class="grade dois">
      <section class="bloco">
        <h3>Por temporada</h3>
        ${Object.entries(t.porT).map(([ano, x]) => `<div class="temp"><span>${ano}</span><span>${barra(x)}</span><b>${x.j}<small>${x.v}V ${x.e}E ${x.d}D</small></b></div>`).join("")}
      </section>
      <section class="bloco">
        <h3>Por campeonato</h3>
        ${t.competicoes.map((c) => `<div class="tbar" style="grid-template-columns:minmax(0,150px) 1fr auto"><span>${esc(c.nome)}</span><span class="tr"><i style="width:${(c.j / maxJogos(t)) * 100}%"></i></span><b>${c.v}V ${c.e}E ${c.d}D</b></div>`).join("")}
      </section>
    </div>

    <section class="bloco">
      <h3>${verTodos ? "Todos os jogos" : "Jogos mais recentes"}</h3>
      <div class="todos">${lista.map((j) => `<button type="button" class="jogo" data-id="${esc(j.id)}" aria-label="Abrir resumo do jogo contra ${esc(j.adv)} em ${dataBR(j.d)}: ${j.f} a ${j.c}">
        <span class="dt">${dataBR(j.d)}</span>
        <span class="meio"><b>${esc(j.adv)}${j.casa === true ? '<span class="mando-tag">Casa</span>' : j.casa === false ? '<span class="mando-tag">Fora</span>' : ""}</b><small>${esc(j.comp || "")}${j.est ? " · " + esc(j.est) : ""}</small></span>
        <span class="pl"><span>${j.f} x ${j.c}</span><i class="r${j.r.toLowerCase()}">${j.r}</i></span>
      </button>`).join("")}</div>
      ${t.jogos.length > 10 ? `<button type="button" class="link" id="mais">${verTodos ? "Mostrar só os mais recentes" : `Ver todos os ${t.jogos.length} jogos`}</button>` : ""}
    </section>
  </div>`;
  $("#mais")?.addEventListener("click", () => { verTodos = !verTodos; fichaUm(t); });
  $(".todos")?.addEventListener("click", (e) => {
    const b = e.target.closest(".jogo[data-id]");
    if (b) abreJogo(t, b);
  });
}
const maxJogos = (t) => Math.max(...t.competicoes.map((c) => c.j), 1);

// ---- comparação ----
function linhaCmp(rotulo, a, b, { valor, texto = null, maiorMelhor = true, sub = null }) {
  const va = valor(a), vb = valor(b);
  const melhor = va === vb ? 0 : (va > vb) === maiorMelhor ? 1 : 2;
  const max = Math.max(va, vb, 0.0001);
  const lado = (v, t, classe, ehMelhor, s) => `<div class="lado-v ${classe} ${ehMelhor ? "melhor" : ""}"><b>${texto ? texto(t) : v}${s ? `<small> ${s}</small>` : ""}</b><span class="tr"><i style="width:${Math.max(0, (v / max) * 100)}%"></i></span></div>`;
  return `<div class="cmp-lin">${lado(va, a, "esq", melhor === 1, sub?.(a))}<span class="rot">${rotulo}</span>${lado(vb, b, "dir", melhor === 2, sub?.(b))}</div>`;
}

function fichaCmp() {
  const [a, b] = cmp.map((id) => T.find((t) => t.nome === id));
  if (!a || !b) {
    const outro = a || b;
    $("#ficha").innerHTML = `<p class="vazio">${outro ? `${esc(outro.nome)} escolhido. Falta mais um técnico para comparar.` : "Escolha dois técnicos acima para compará-los."}</p>`;
    return;
  }
  const topo = (t) => `<div class="lado-t"><div class="foto-c">${foto(t)}</div><h2>${esc(t.nome)}</h2><span class="sub">${esc(periodo(t))}</span></div>`;
  const nomeArt = (t) => t.artilheiros[0];
  $("#ficha").innerHTML = `<div class="cmp">
    <section class="cmp-cab">${topo(a)}<span class="x">x</span>${topo(b)}</section>
    <section class="bloco">
      <h3>Retrospecto</h3>
      ${linhaCmp("Jogos", a.geral, b.geral, { valor: (g) => g.j })}
      ${linhaCmp("Aproveitamento", a.geral, b.geral, { valor: apr, texto: (g) => apr(g) + "%" })}
      ${linhaCmp("Vitórias", a.geral, b.geral, { valor: (g) => g.v, sub: (g) => `(${Math.round((g.v / g.j) * 100)}%)` })}
      ${linhaCmp("Empates", a.geral, b.geral, { valor: (g) => g.e, sub: (g) => `(${Math.round((g.e / g.j) * 100)}%)`, maiorMelhor: false })}
      ${linhaCmp("Derrotas", a.geral, b.geral, { valor: (g) => g.d, sub: (g) => `(${Math.round((g.d / g.j) * 100)}%)`, maiorMelhor: false })}
    </section>
    <section class="bloco">
      <h3>Gols</h3>
      ${linhaCmp("Gols marcados por jogo", a.geral, b.geral, { valor: (g) => porJogo(g.gp, g.j), texto: (g) => fmt1(porJogo(g.gp, g.j)) })}
      ${linhaCmp("Gols sofridos por jogo", a.geral, b.geral, { valor: (g) => porJogo(g.gc, g.j), texto: (g) => fmt1(porJogo(g.gc, g.j)), maiorMelhor: false })}
      ${linhaCmp("Saldo por jogo", a.geral, b.geral, { valor: (g) => porJogo(g.gp - g.gc, g.j), texto: (g) => { const s = porJogo(g.gp - g.gc, g.j); return (s > 0 ? "+" : "") + fmt1(s); } })}
    </section>
    <section class="bloco">
      <h3>Em casa e fora</h3>
      ${linhaCmp("Aproveitamento em casa", a.casa, b.casa, { valor: apr, texto: (g) => (g.j ? apr(g) + "%" : "–") })}
      ${linhaCmp("Aproveitamento fora", a.fora, b.fora, { valor: apr, texto: (g) => (g.j ? apr(g) + "%" : "–") })}
    </section>
    <section class="bloco">
      <h3>Sequências e disciplina</h3>
      ${linhaCmp("Jogos seguidos sem perder", a, b, { valor: (t) => t.seq_invicto })}
      ${linhaCmp("Vitórias seguidas", a, b, { valor: (t) => t.seq_vitorias })}
      ${linhaCmp("Amarelos por jogo", a, b, { valor: (t) => porJogo(t.amarelos, t.geral.j), texto: (t) => fmt1(porJogo(t.amarelos, t.geral.j)), maiorMelhor: false })}
      ${linhaCmp("Vermelhos", a, b, { valor: (t) => t.vermelhos, maiorMelhor: false })}
    </section>
    <section class="bloco">
      <h3>⚽ Artilheiro do período</h3>
      <div class="cmp-lin">
        <div class="lado-v esq txt"><b>${nomeArt(a) ? esc(nomeArt(a).nome) : "–"}</b><small>${nomeArt(a) ? plural(nomeArt(a).gols, "gol", "gols") : ""}</small></div>
        <span class="rot">Mais gols</span>
        <div class="lado-v dir txt"><b>${nomeArt(b) ? esc(nomeArt(b).nome) : "–"}</b><small>${nomeArt(b) ? plural(nomeArt(b).gols, "gol", "gols") : ""}</small></div>
      </div>
    </section>
    <p class="nota">Os técnicos têm quantidades de jogos diferentes. Por isso a comparação usa percentuais e médias por jogo; em empates e derrotas, quanto menor, melhor.</p>
  </div>`;
}

// Abre o painel do jogo (o mesmo da página 1). O painel quer os campos de partidas.json; se o jogo não estiver lá
// (ou o arquivo não carregar), monta a partir do que esta página já tem.
let partidasPorId = null;
async function abreJogo(t, botao) {
  const j = t.jogos.find((x) => x.id === botao.dataset.id);
  if (!j) return;
  if (!partidasPorId) {
    try {
      const dados = await (await fetch("dados/partidas.json")).json();
      partidasPorId = new Map(dados.partidas.map((p) => [p.id_partida, p]));
    } catch {
      partidasPorId = new Map();
    }
  }
  const p = partidasPorId.get(j.id) || {
    id_partida: j.id, data: j.d, competicao: j.comp, corinthians_mandante: j.casa, adversario: j.adv,
    escudo_url: /^\d+$/.test(j.adv_id) ? `https://a.espncdn.com/i/teamlogos/soccer/500/${j.adv_id}.png` : null,
    gols_corinthians: j.f, gols_adversario: j.c, resultado: j.r, estadio: j.est, tecnico: t.nome,
  };
  PainelJogo.abre(p, botao);
}

// ---- tela ----
function mostra() {
  $("#dica-cmp").hidden = !comparando;
  $("#modo-um").setAttribute("aria-pressed", !comparando);
  $("#modo-cmp").setAttribute("aria-pressed", comparando);
  tira();
  if (comparando) {
    fichaCmp();
  } else if (sel) {
    fichaUm(T.find((t) => t.nome === sel));
  } else {
    $("#ficha").innerHTML = '<p class="vazio">Escolha um técnico acima para ver como o Corinthians foi sob o comando dele.</p>';
  }
}

function escolhe(id) {
  if (comparando) {
    cmp = cmp.includes(id) ? cmp.filter((x) => x !== id) : [...cmp, id].slice(-2);
  } else {
    sel = id;
    verTodos = false;
  }
  mostra();
  $(`.fig[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
}

function trocaModo(cmpLigado) {
  comparando = cmpLigado;
  if (comparando && cmp.length === 0) cmp = [sel, T.find((t) => t.nome !== sel)?.nome].filter(Boolean);
  mostra();
}

fetch("dados/tecnicos.json")
  .then((r) => r.json())
  .then((d) => {
    T = d.tecnicos;
    SEM_TECNICO = d.sem_tecnico || 0;
    $("#aviso-exemplo").hidden = !d.exemplo;
    if (SEM_TECNICO) $("#rodape-nota").textContent = `${plural(SEM_TECNICO, "jogo", "jogos")} sem técnico registrado ${SEM_TECNICO === 1 ? "não entra" : "não entram"} nesta página.`;
    sel = T[0]?.nome ?? null;
    $("#busca").oninput = tira;
    $("#ord").onchange = tira;
    $("#so-longos").onclick = (e) => {
      const b = e.currentTarget;
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true");
      tira();
    };
    $("#tira").onclick = (e) => {
      const b = e.target.closest(".fig");
      if (b) escolhe(b.dataset.id);
    };
    $("#modo-um").onclick = () => trocaModo(false);
    $("#modo-cmp").onclick = () => trocaModo(true);
    mostra();
  })
  .catch(() => { $("#ficha").innerHTML = '<p class="vazio">Não deu para carregar os dados agora.</p>'; });
