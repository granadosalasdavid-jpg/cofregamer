(function () {
  // Menú móvil
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var abierto = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
  }

  var D = window.CG_DATA;
  if (!D) return;

  // Cuenta atrás hasta el Black Friday
  var objetivo = new Date(D.sitio.black_friday).getTime();
  var cajas = document.querySelectorAll("[data-countdown]");
  var barra = document.querySelector("[data-cuenta]");
  function tic() {
    var resta = objetivo - Date.now();
    if (resta <= 0) {
      if (barra) barra.textContent = "¡es hoy!";
      cajas.forEach(function (c) { c.innerHTML = "<div><strong>¡Ya!</strong><span>Black Friday</span></div>"; });
      return;
    }
    var d = Math.floor(resta / 864e5), h = Math.floor(resta / 36e5) % 24, m = Math.floor(resta / 6e4) % 60;
    if (barra) barra.textContent = "faltan " + d + " días";
    cajas.forEach(function (c) {
      c.innerHTML = "<div><strong>" + d + "</strong><span>días</span></div><div><strong>" + h +
        "</strong><span>horas</span></div><div><strong>" + m + "</strong><span>min</span></div>";
    });
  }
  tic();
  setInterval(tic, 30000);

  // Buscador de regalos
  var form = document.getElementById("form-buscador");
  if (!form) return;
  var salida = document.getElementById("resultados");
  var pre = form.getAttribute("data-pre") || "";

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function valor(nombre) {
    var x = form.querySelector('input[name="' + nombre + '"]:checked');
    return x ? x.value : "";
  }
  function icono(p) {
    var cat = D.categorias[p.categoria];
    return '<div class="visual" style="--c:' + cat.color + '"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + D.iconos[cat.icono] + "</svg></div>";
  }
  function tarjeta(p, motivo) {
    var url = pre + "producto/" + p.slug + ".html";
    return '<article class="card"><a class="card-media" href="' + url + '" aria-hidden="true" tabindex="-1">' + icono(p) + "</a>" +
      '<div class="card-body"><p class="motivo">' + esc(motivo) + "</p>" +
      '<h3><a href="' + url + '">' + esc(p.nombre) + "</a></h3>" +
      '<div class="chips"><span class="chip">' + esc(D.rangos[p.precio]) + "</span>" +
      (p.digital ? '<span class="chip chip-hot">Llega al instante</span>' : "") + "</div>" +
      '<p class="card-text">' + esc(p.resumen) + "</p>" +
      '<p class="card-no"><strong>No es para:</strong> ' + esc(p.no_es_para) + "</p>" +
      '<div class="card-actions"><a class="btn btn-ghost" href="' + url + '">Por qué</a>' +
      '<a class="btn btn-amazon" href="' + esc(p.enlace) + '" target="_blank" rel="nofollow sponsored noopener">Ver precio ↗</a></div></div></article>';
  }

  var TOPE_EDAD = { "6": 9, "10": 13, "14": 17, "18": 99 };

  function buscar() {
    var edad = valor("edad"), plat = valor("plataforma"), presu = +valor("presupuesto") || 4,
      gusto = valor("gusto"), prisa = valor("prisa") === "si";
    var tope = TOPE_EDAD[edad] || 99;

    var lista = D.productos.filter(function (p) {
      if (p.edad_min > tope) return false;
      if (plat && plat !== "todas" && p.plataformas.indexOf(plat) < 0) return false;
      if (p.precio > presu) return false;
      if (prisa && !p.digital) return false;
      return true;
    }).map(function (p) {
      var puntos = 0, motivos = [];
      if (gusto && p.gustos.indexOf(gusto) >= 0) { puntos += 3; motivos.push("Encaja con sus gustos"); }
      if (p.precio === presu) { puntos += 2; motivos.push("Aprovecha tu presupuesto"); }
      else if (p.precio === presu - 1) { puntos += 1; motivos.push("Por debajo de tu presupuesto"); }
      if (edad && p.edad_min >= +edad - 4) { puntos += 1; }
      if (p.digital && prisa) motivos.push("Llega hoy por email");
      return { p: p, puntos: puntos, motivo: motivos[0] || "Compatible con lo que buscas" };
    }).sort(function (a, b) { return b.puntos - a.puntos; }).slice(0, 6);

    if (!lista.length) {
      salida.innerHTML = '<p class="lead">No hay nada que cumpla todo a la vez. Prueba a subir el presupuesto o marcar "No lo sé" en plataforma.</p>';
      return;
    }
    salida.innerHTML = "<h3>Te recomendamos:</h3>" + '<div class="grid">' +
      lista.map(function (r) { return tarjeta(r.p, r.motivo); }).join("") + "</div>";
  }

  form.addEventListener("change", buscar);
  form.addEventListener("submit", function (ev) { ev.preventDefault(); buscar(); salida.scrollIntoView({ behavior: "smooth" }); });
})();
