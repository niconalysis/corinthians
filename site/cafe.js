/* "Pague um cafezinho": botão no menu + painel com a chave Pix (igual em todas as páginas) */
(function () {
  var CHAVE = "nicolas.emerenciano@gmail.com";
  var BR_CODE = "00020101021126510014br.gov.bcb.pix0129nicolas.emerenciano@gmail.com5204000053039865802BR5922Corinthians em Numeros6009SAO PAULO62070503***63049ABB";
  var QR = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 49 49"><path stroke="#000" d="M0 0.5h7m1 0h1m1 0h2m1 0h3m1 0h2m1 0h1m1 0h10m1 0h4m3 0h1m1 0h7m-49 1h1m5 0h1m1 0h1m1 0h2m1 0h2m1 0h2m4 0h1m1 0h1m2 0h1m3 0h1m1 0h2m1 0h5m1 0h1m5 0h1m-49 1h1m1 0h3m1 0h1m1 0h2m1 0h3m2 0h1m1 0h5m1 0h2m1 0h1m2 0h1m1 0h4m1 0h1m1 0h2m1 0h1m1 0h3m1 0h1m-49 1h1m1 0h3m1 0h1m2 0h1m2 0h4m1 0h1m2 0h1m1 0h1m1 0h1m3 0h1m2 0h4m1 0h1m2 0h1m2 0h1m1 0h3m1 0h1m-49 1h1m1 0h3m1 0h1m1 0h4m2 0h2m1 0h3m1 0h6m1 0h3m2 0h1m1 0h1m1 0h1m4 0h1m1 0h3m1 0h1m-49 1h1m5 0h1m3 0h5m1 0h2m2 0h1m1 0h1m3 0h1m1 0h2m1 0h3m1 0h4m3 0h1m5 0h1m-49 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-40 1h2m1 0h2m2 0h1m4 0h2m3 0h1m1 0h2m1 0h1m2 0h1m-35 1h1m2 0h6m1 0h1m1 0h1m3 0h2m2 0h1m1 0h5m1 0h3m3 0h3m3 0h2m2 0h1m1 0h3m-47 1h1m1 0h2m1 0h1m1 0h1m2 0h1m2 0h1m3 0h3m3 0h3m1 0h3m1 0h3m1 0h8m1 0h1m-47 1h3m1 0h5m2 0h1m6 0h2m1 0h4m2 0h1m1 0h1m1 0h6m4 0h2m1 0h1m1 0h1m1 0h1m-41 1h1m1 0h2m3 0h1m2 0h9m3 0h3m1 0h1m5 0h5m1 0h2m-48 1h2m4 0h1m2 0h7m4 0h1m3 0h1m3 0h3m1 0h2m1 0h3m4 0h3m-44 1h2m1 0h2m1 0h2m1 0h1m1 0h1m3 0h1m1 0h3m3 0h1m1 0h1m1 0h4m1 0h1m1 0h2m1 0h1m3 0h3m2 0h1m-47 1h3m1 0h3m2 0h2m2 0h2m5 0h2m1 0h3m4 0h1m1 0h5m1 0h3m1 0h4m1 0h1m-49 1h1m2 0h3m3 0h1m1 0h2m1 0h1m1 0h3m1 0h1m1 0h2m2 0h2m5 0h3m1 0h2m1 0h1m1 0h1m3 0h1m1 0h1m-49 1h1m1 0h1m1 0h1m1 0h1m3 0h2m2 0h1m1 0h1m4 0h1m1 0h2m1 0h2m1 0h1m2 0h1m1 0h7m1 0h3m1 0h3m-48 1h1m1 0h2m5 0h5m1 0h2m1 0h1m3 0h1m1 0h1m2 0h5m1 0h2m1 0h1m1 0h2m1 0h1m3 0h1m-47 1h1m3 0h1m1 0h5m1 0h4m1 0h3m2 0h4m1 0h3m1 0h2m2 0h4m1 0h1m4 0h4m-49 1h3m1 0h2m2 0h3m1 0h3m2 0h5m1 0h1m1 0h1m1 0h3m1 0h1m3 0h1m1 0h3m1 0h2m-42 1h2m1 0h4m2 0h2m1 0h1m6 0h1m2 0h2m3 0h1m4 0h2m1 0h1m6 0h1m3 0h2m-48 1h1m1 0h1m6 0h3m1 0h2m4 0h3m2 0h2m2 0h4m1 0h3m1 0h1m1 0h1m1 0h1m1 0h1m2 0h1m-48 1h1m1 0h1m1 0h5m1 0h1m1 0h1m2 0h2m3 0h7m1 0h2m4 0h2m1 0h1m1 0h6m2 0h2m-48 1h1m2 0h1m3 0h1m2 0h1m1 0h2m1 0h1m5 0h1m3 0h1m2 0h2m1 0h1m1 0h2m1 0h1m2 0h1m3 0h3m1 0h1m-46 1h2m1 0h1m1 0h1m1 0h3m2 0h1m5 0h2m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h3m1 0h1m1 0h2m2 0h1m-49 1h1m1 0h3m3 0h5m1 0h1m1 0h1m2 0h2m1 0h1m3 0h1m1 0h6m4 0h1m1 0h1m3 0h1m-45 1h2m1 0h6m2 0h3m3 0h2m3 0h5m4 0h1m1 0h1m1 0h1m2 0h11m-48 1h3m1 0h1m1 0h3m1 0h2m1 0h1m1 0h3m1 0h1m2 0h1m2 0h1m7 0h2m2 0h1m2 0h1m2 0h1m1 0h3m-48 1h7m2 0h2m2 0h2m4 0h5m1 0h2m1 0h4m1 0h3m2 0h1m4 0h1m1 0h2m-47 1h1m1 0h3m2 0h6m1 0h6m3 0h3m3 0h1m2 0h3m1 0h1m2 0h1m2 0h1m2 0h1m-46 1h3m1 0h8m6 0h1m3 0h1m2 0h1m1 0h2m2 0h2m2 0h1m1 0h2m1 0h2m2 0h4m-48 1h1m2 0h1m2 0h1m4 0h3m3 0h1m2 0h1m2 0h2m1 0h2m6 0h1m3 0h1m3 0h2m-41 1h3m5 0h1m1 0h1m1 0h1m1 0h1m1 0h1m5 0h3m2 0h1m1 0h2m1 0h2m1 0h2m1 0h1m1 0h1m3 0h1m-48 1h4m3 0h3m1 0h1m3 0h1m2 0h4m1 0h4m2 0h1m1 0h1m1 0h1m2 0h2m1 0h1m1 0h1m1 0h1m1 0h2m-46 1h1m3 0h1m3 0h1m1 0h1m3 0h1m1 0h5m1 0h1m1 0h2m4 0h1m1 0h1m1 0h1m1 0h1m2 0h5m1 0h2m-49 1h1m1 0h1m1 0h2m1 0h3m1 0h1m3 0h1m1 0h1m1 0h1m1 0h2m2 0h2m3 0h1m1 0h1m1 0h1m4 0h1m4 0h1m1 0h1m-46 1h1m3 0h2m4 0h1m2 0h3m1 0h1m2 0h2m3 0h1m1 0h1m3 0h5m1 0h6m3 0h2m-49 1h1m1 0h3m2 0h3m1 0h2m2 0h1m3 0h2m3 0h1m1 0h2m1 0h3m3 0h7m2 0h1m2 0h1m-47 1h1m3 0h2m3 0h1m5 0h2m1 0h1m2 0h3m2 0h2m2 0h1m3 0h2m1 0h1m3 0h1m1 0h1m3 0h1m-48 1h3m3 0h2m1 0h1m1 0h1m1 0h3m1 0h1m1 0h1m2 0h2m7 0h2m4 0h3m2 0h1m1 0h2m1 0h1m-49 1h3m3 0h1m6 0h1m2 0h2m1 0h1m1 0h7m2 0h5m1 0h1m2 0h10m-41 1h1m5 0h1m1 0h2m4 0h1m3 0h1m1 0h1m1 0h5m1 0h2m1 0h2m3 0h1m1 0h1m-47 1h7m1 0h3m4 0h3m1 0h4m1 0h1m1 0h1m2 0h1m3 0h1m2 0h2m1 0h2m1 0h1m1 0h1m2 0h2m-49 1h1m5 0h1m1 0h3m2 0h2m1 0h1m1 0h3m1 0h1m3 0h3m4 0h3m1 0h2m1 0h1m3 0h1m-45 1h1m1 0h3m1 0h1m1 0h1m1 0h2m4 0h1m4 0h6m1 0h4m4 0h9m3 0h1m-49 1h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h1m2 0h4m1 0h2m4 0h2m1 0h6m3 0h6m3 0h2m-49 1h1m1 0h3m1 0h1m2 0h1m1 0h1m3 0h2m2 0h2m1 0h5m1 0h2m2 0h1m1 0h4m4 0h1m1 0h1m2 0h1m-48 1h1m5 0h1m7 0h1m1 0h1m1 0h1m2 0h3m1 0h1m1 0h1m2 0h5m2 0h2m1 0h3m1 0h5m-49 1h7m1 0h1m2 0h1m1 0h1m5 0h1m2 0h8m1 0h2m1 0h3m2 0h2m2 0h2m1 0h1m1 0h1"/></svg>';

  var lista = document.querySelector(".menu ul");
  if (!lista) return;

  var item = document.createElement("li");
  item.className = "menu-cafe";
  item.innerHTML = '<button type="button" class="cafe-botao">\u2615 Pague um cafezinho</button>';
  lista.appendChild(item);

  var caixa = document.createElement("dialog");
  caixa.className = "cafe-caixa";
  caixa.setAttribute("aria-labelledby", "cafe-titulo");
  caixa.innerHTML =
    '<form method="dialog"><button class="cafe-fechar" aria-label="Fechar">\u00d7</button></form>' +
    '<h2 id="cafe-titulo">Pague um cafezinho \u2615</h2>' +
    '<p>Gostou do site? Ele \u00e9 gratuito e feito com carinho. Se quiser ajudar, um Pix de qualquer valor j\u00e1 anima.</p>' +
    '<div class="cafe-qr" role="img" aria-label="QR Code Pix">' + QR + '</div>' +
    '<p class="cafe-legenda">Aponte a c\u00e2mera do app do seu banco</p>' +
    '<p class="cafe-chave-rotulo">Chave Pix (e-mail)</p>' +
    '<code class="cafe-chave">' + CHAVE + '</code>' +
    '<div class="cafe-acoes">' +
      '<button type="button" class="cafe-copiar" data-texto="' + CHAVE + '">Copiar chave</button>' +
      '<button type="button" class="cafe-copiar cafe-secundario" data-texto="' + BR_CODE + '">Copiar Pix copia e cola</button>' +
    '</div>' +
    '<p class="cafe-aviso" role="status" aria-live="polite"></p>';
  document.body.appendChild(caixa);

  item.firstChild.addEventListener("click", function () {
    if (caixa.showModal) caixa.showModal(); else caixa.setAttribute("open", "");
  });
  caixa.addEventListener("click", function (e) { if (e.target === caixa) caixa.close(); });

  var aviso = caixa.querySelector(".cafe-aviso");
  caixa.querySelectorAll(".cafe-copiar").forEach(function (b) {
    b.addEventListener("click", function () {
      var texto = b.getAttribute("data-texto");
      var ok = function () { aviso.textContent = "Copiado! Obrigado \u2615"; };
      var falha = function () { aviso.textContent = "N\u00e3o consegui copiar. Selecione o texto e copie."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(ok, falha);
      else falha();
    });
  });
})();
