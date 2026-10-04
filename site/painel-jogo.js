// Painel lateral com os detalhes de um jogo (gols, cartões, escalação no campinho). Usado pelas páginas 1 e 3.
// Fica dentro de uma função para não colidir com os nomes de cada página: o resto do site usa só window.PainelJogo.
window.PainelJogo = (() => {
  const $ = (id) => document.getElementById(id);
  const ROTULO = { V: "Vitória", E: "Empate", D: "Derrota" };
  const CLASSE = { V: "v", E: "e", D: "d" };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmtData = (iso) => iso.split("-").reverse().join("/");
  const fmtNum = (n) => n.toLocaleString("pt-BR");
  const ehCasa = (p) => p.corinthians_mandante === true;
  const iniciais = (nome) => (nome || "?").replace(/[^\p{L}\s]/gu, "").split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "?";
  // Escudo, logo ou foto. Sem imagem (ou se ela falhar), mostra as iniciais.
  const imagem = (url, nome, tipo = "") =>
    `<span class="escudo ${tipo}${url ? "" : " neutro"}">${url ? `<img src="${url}" alt="" loading="lazy" data-ini="${iniciais(nome)}">` : iniciais(nome)}</span>`;

  let detalhes = null;
  let linhaAberta = null;

  const GRUPO = (pos) => {
    const p = pos.toUpperCase();
    if (p === "G" || p === "GK") return 0;
    if (/^(DM|CDM)/.test(p)) return 2; // antes da defesa, porque DM também começa com D
    if (/^(CD|CB|SW|LB|RB|LWB|RWB|D)/.test(p)) return 1;
    if (/^(AM|CAM|SS|LW|RW)/.test(p)) return 4;
    if (/^(F|LF|RF|CF|ST|S)/.test(p)) return 5;
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
    const escudoCor = "https://a.espncdn.com/i/teamlogos/soccer/500/874.png";
    const lado = (nome, escudoUrl) => `<div class="pj-time">${imagem(escudoUrl, nome)}<span>${esc(nome)}</span></div>`;
    const esq = casa ? lado(nomeCor, escudoCor) : lado(p.adversario, p.escudo_url);
    const dir = casa ? lado(p.adversario, p.escudo_url) : lado(nomeCor, escudoCor);
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


  // p: a partida (campos de partidas.json); linha: o elemento clicado, que recebe o foco de volta ao fechar.
  async function abre(p, linha) {
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
    const d = detalhes[p.id_partida];
    painel.innerHTML = d
      ? htmlPainel(p, d)
      : `<button type="button" class="pj-fechar" id="pj-fechar" aria-label="Fechar">×</button><div class="pj-cab"><div class="pj-meta" id="pj-titulo">${fmtData(p.data)} · ${esc(p.competicao ?? "")}</div><div class="pj-placar"><div class="pj-time"><span>Corinthians</span></div><div class="pj-gols">${p.gols_corinthians} x ${p.gols_adversario}</div><div class="pj-time"><span>${esc(p.adversario)}</span></div></div></div><p class="vazio-pj">Ainda não temos o detalhe deste jogo.</p>`;
    linhaAberta = linha;
    painel.hidden = false;
    $("fundo-jogo").hidden = false;
    $("pj-fechar").addEventListener("click", fecha);
    $("pj-fechar").focus();
    painel.scrollTop = 0;
  }

  function fecha() {
    $("painel-jogo").hidden = true;
    $("fundo-jogo").hidden = true;
    if (linhaAberta?.isConnected) linhaAberta.focus();
  }

  $("fundo-jogo").addEventListener("click", fecha);
  document.addEventListener("keydown", (e) => e.key === "Escape" && !$("painel-jogo").hidden && fecha());
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

  return { abre, imagem };
})();

