// Página 3: histórico de confrontos. Lê dados/confrontos.json (gerado por pipeline/exporta_confrontos.py).
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const semAcento = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const iniciais = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
const dataBR = (d) => d.split("-").reverse().join("/");
const apr = (g) => (g.j ? Math.round(((g.v * 3 + g.e) / (g.j * 3)) * 100) : 0);

let A = [];
let sel = null;
let verTodos = false;

function escudo(a) {
  return a.escudo_url
    ? `<img src="${esc(a.escudo_url)}" alt="Escudo do ${esc(a.nome)}" loading="lazy" data-nome="${esc(a.nome)}">`
    : `<span class="sem-foto" aria-hidden="true">${esc(iniciais(a.nome))}</span>`;
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

function tira() {
  const q = semAcento($("#busca").value.trim());
  const ord = $("#ord").value;
  const chave = { jogos: (a) => -a.geral.j, vit: (a) => -a.geral.v, apr: (a) => -apr(a.geral), nome: (a) => a.nome };
  const L = A.filter((a) => semAcento(a.nome).includes(q)).sort((x, y) => {
    const kx = chave[ord](x), ky = chave[ord](y);
    return kx < ky ? -1 : kx > ky ? 1 : x.nome.localeCompare(y.nome, "pt-BR");
  });
  $("#tira").innerHTML = L.length
    ? L.map((a) => `<button type="button" class="fig" role="option" data-id="${esc(a.id)}" aria-pressed="${a.id === sel}" aria-label="${esc(a.nome)}">
        <span class="esc">${escudo(a)}</span>
        <span class="inf"><b>${esc(a.nome)}</b><span class="em"><span>${plural(a.geral.j, "jogo", "jogos")}</span></span></span>
      </button>`).join("")
    : '<p class="vazio">Nenhum adversário com esse nome.</p>';
}

const barra = (g) => {
  const t = g.j || 1;
  return `<div class="barra" role="img" aria-label="${g.v} vitórias, ${g.e} empates, ${g.d} derrotas"><i class="v" style="width:${(g.v / t) * 100}%"></i><i class="e" style="width:${(g.e / t) * 100}%"></i><i class="d" style="width:${(g.d / t) * 100}%"></i></div>`;
};

function ranking(lista) {
  if (!lista.length) return '<p class="sem-dado">Sem gols registrados neste confronto.</p>';
  return `<div class="rank">${lista.map((x, i) => `<div class="lin"><span class="pos">${i + 1}</span><span class="nome">${esc(x.nome)}</span><b>${x.gols}<small>${x.gols === 1 ? "gol" : "gols"}</small></b></div>`).join("")}</div>`;
}

function mando(titulo, emoji, g) {
  if (!g.j) return `<div class="mando"><h4>${emoji} ${titulo}</h4><div class="n">0<small>jogos</small></div></div>`;
  return `<div class="mando"><h4>${emoji} ${titulo}</h4>
    <div class="n">${g.j}<small>${g.j === 1 ? "jogo" : "jogos"}</small></div>
    ${barra(g)}
    <div class="d">${g.v}V · ${g.e}E · ${g.d}D<br>${g.gp} gols pró · ${g.gc} contra</div></div>`;
}

function jogoDestaque(rotulo, j) {
  if (!j) return `<div class="item"><span>${rotulo}</span><small class="sem-dado">Ainda não aconteceu</small></div>`;
  const onde = j.casa === true ? "em casa" : j.casa === false ? "fora" : "";
  return `<div class="item"><span>${rotulo}</span><b>${j.f} x ${j.c}</b><small>${dataBR(j.d)}${onde ? " · " + onde : ""}</small></div>`;
}

function ficha() {
  const a = A.find((x) => x.id === sel);
  if (!a) {
    $("#ficha").innerHTML = '<p class="vazio">Escolha um adversário acima para ver o histórico de confrontos.</p>';
    return;
  }
  const g = a.geral;
  const sg = g.gp - g.gc;
  const anos = a.jogos.map((j) => +j.d.slice(0, 4));
  const de = Math.min(...anos), ate = Math.max(...anos);
  const forma = a.jogos.slice(0, 5).map((j) => `<i class="${j.r}" title="${dataBR(j.d)}: ${j.f} x ${j.c}">${j.r}</i>`).join("");
  const arb = a.arbitro;
  const lista = verTodos ? a.jogos : a.jogos.slice(0, 10);

  $("#ficha").innerHTML = `<div class="cf">
    <section class="cf-topo">
      <div class="brasao">${escudo(a)}</div>
      <div>
        <h2>${esc(a.nome)}</h2>
        <p>${plural(g.j, "jogo", "jogos")} entre ${de === ate ? de : `${de} e ${ate}`} · aproveitamento do Corinthians: <b>${apr(g)}%</b></p>
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
      <div class="mandos">${mando("Em casa", "📍", a.casa)}${mando("Fora", "✈️", a.fora)}</div>
    </section>

    <section class="bloco">
      <h3>Em números</h3>
      <div class="stats quatro">
        <div class="stat"><em>⚽</em><b>${g.gp}</b><span>gols do Corinthians</span><small>${(g.gp / g.j).toFixed(1).replace(".", ",")} por jogo</small></div>
        <div class="stat"><em>🛡️</em><b>${g.gc}</b><span>gols do adversário</span><small>${(g.gc / g.j).toFixed(1).replace(".", ",")} por jogo</small></div>
        <div class="stat"><em>➕</em><b>${sg > 0 ? "+" : ""}${sg}</b><span>saldo de gols</span></div>
        <div class="stat"><em>👥</em><b>${a.publico_medio ? a.publico_medio.toLocaleString("pt-BR") : "–"}</b><span>público médio</span></div>
        <div class="stat"><em>🟨</em><b>${a.amarelos}</b><span>amarelos do Corinthians</span></div>
        <div class="stat"><em>🟥</em><b>${a.vermelhos}</b><span>vermelhos do Corinthians</span></div>
        <div class="stat"><em>🎫</em><b style="font-size:1.1rem">${esc(a.estadio_mais_usado || "–")}</b><span>estádio mais usado</span></div>
        <div class="stat"><em>📅</em><b>${dataBR(a.ultimo.d)}</b><span>último jogo</span><small>${a.ultimo.f} x ${a.ultimo.c}</small></div>
      </div>
    </section>

    <div class="grade dois">
      <section class="bloco"><h3>⚽ Maiores goleadores do Corinthians neste confronto</h3>${ranking(a.artilheiros_cor)}</section>
      <section class="bloco"><h3>⚽ Maiores goleadores do ${esc(a.nome)} neste confronto</h3>${ranking(a.artilheiros_adv)}</section>
    </div>

    <div class="grade dois">
      <section class="bloco">
        <h3>Árbitro que mais apitou</h3>
        ${arb.nome
          ? `<div class="arb"><span class="ic">👨‍⚖️</span><div><b>${esc(arb.nome)}</b><span class="sem-dado">${plural(arb.jogos, "jogo", "jogos")} apitados</span></div></div>
             <p class="nota">Conta só os ${arb.com_arbitro} dos ${g.j} jogos que têm árbitro registrado. Nos demais, a fonte não informa quem apitou.</p>`
          : '<p class="sem-dado">Nenhum jogo deste confronto tem árbitro registrado.</p>'}
      </section>
      <section class="bloco">
        <h3>Destaques</h3>
        <div class="dest">
          ${jogoDestaque("Maior vitória", a.maior_vitoria)}
          ${jogoDestaque("Maior derrota", a.maior_derrota)}
          ${jogoDestaque("Primeiro jogo", a.primeiro)}
          ${jogoDestaque("Último jogo", a.ultimo)}
        </div>
      </section>
    </div>

    <section class="bloco">
      <h3>Por campeonato</h3>
      ${a.competicoes.map((c) => `<div class="tbar" style="grid-template-columns:minmax(0,150px) 1fr auto"><span>${esc(c.nome)}</span><span class="tr"><i style="width:${(c.j / g.j) * 100}%"></i></span><b>${c.v}V ${c.e}E ${c.d}D</b></div>`).join("")}
    </section>

    <section class="bloco">
      <h3>${verTodos ? "Todos os jogos" : "Jogos mais recentes"}</h3>
      <div class="todos">${lista.map((j) => `<div class="jogo">
        <span class="dt">${dataBR(j.d)}</span>
        <span class="meio"><b>${esc(j.comp || "")}${j.casa === true ? '<span class="mando-tag">Casa</span>' : j.casa === false ? '<span class="mando-tag">Fora</span>' : ""}</b><small>${esc(j.est || "")}</small></span>
        <span class="pl"><span>${j.f} x ${j.c}</span><i class="r${j.r.toLowerCase()}">${j.r}</i></span>
      </div>`).join("")}</div>
      ${a.jogos.length > 10 ? `<button type="button" class="link" id="mais">${verTodos ? "Mostrar só os mais recentes" : `Ver todos os ${a.jogos.length} jogos`}</button>` : ""}
    </section>
  </div>`;
  $("#mais")?.addEventListener("click", () => { verTodos = !verTodos; ficha(); });
}

function escolhe(id) {
  sel = id;
  verTodos = false;
  tira();
  ficha();
  $(`.fig[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
}

fetch("dados/confrontos.json")
  .then((r) => r.json())
  .then((d) => {
    A = d.adversarios;
    $("#aviso-exemplo").hidden = !d.exemplo;
    $("#busca").oninput = tira;
    $("#ord").onchange = tira;
    $("#tira").onclick = (e) => {
      const b = e.target.closest(".fig");
      if (b) escolhe(b.dataset.id);
    };
    tira();
    ficha();
  })
  .catch(() => { $("#ficha").innerHTML = '<p class="vazio">Não deu para carregar os dados agora.</p>'; });
