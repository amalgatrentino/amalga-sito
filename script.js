// Reveal on scroll
(function(){
  var els = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.12});
    els.forEach(function(el){ io.observe(el); });
  } else {
    els.forEach(function(el){ el.classList.add('is-visible'); });
  }
})();

// Sceglie la variante -m (700/1000px, per schermi fino a 800px) o -d
// (1600px) di una foto locale, alla stessa soglia usata nel CSS/preload
// dell'hero. Gli URL esterni (Cloudinary) restano invariati. Se per il
// file non esiste una -d (solo le tre foto hero ce l'hanno), su schermi
// larghi resta l'originale.
function scegliVariante(path) {
  if (!path || /^https?:\/\//i.test(path)) return path;
  const mobile = window.matchMedia("(max-width: 800px)").matches;
  if (mobile) return path.replace(/\.jpg$/i, "-m.jpg");
  const haVarianteD = /\/(el-malget-hero|bordolona-hero|bordolona-alta-hero)\.jpg$/i.test(path);
  return haVarianteD ? path.replace(/\.jpg$/i, "-d.jpg") : path;
}

// Home hero carousel: la prima foto è già nel markup (caricamento
// immediato, è l'LCP); le altre due arrivano via data-bg e vengono
// richieste solo dopo l'evento "load", per non competere con l'LCP sulla
// banda. La rotazione (stesso intervallo di 5s) parte solo quando sono
// già caricate e decodificate, così il primo cambio non mostra un lampo
// vuoto.
document.addEventListener("DOMContentLoaded", function () {
  const immagini = document.querySelectorAll(".home-hero .hero-img");
  const segmenti = document.querySelectorAll("#homeAltscale .seg");
  if (immagini.length <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function avviaCarosello() {
    let indice = 0;
    setInterval(function () {
      immagini[indice].classList.remove("attiva");
      segmenti[indice].classList.remove("current");
      indice = (indice + 1) % immagini.length;
      immagini[indice].classList.add("attiva");
      segmenti[indice].classList.add("current");
    }, 5000);
  }

  const daPrecaricare = Array.prototype.filter.call(immagini, function (el) {
    return el.dataset.bg;
  });

  if (daPrecaricare.length === 0) { avviaCarosello(); return; }

  // Il download delle immagini parte SOLO qui dentro, non prima: questa
  // funzione viene chiamata solo dopo "load" (vedi sotto), così le due
  // foto non entrano mai in corsa con le risorse della prima schermata.
  function precaricaEAvvia() {
    Promise.all(daPrecaricare.map(function (el) {
      return new Promise(function (resolve) {
        const src = scegliVariante(el.dataset.bg);
        const img = new Image();
        img.onload = function () {
          el.style.backgroundImage = "url('" + src + "')";
          if (img.decode) { img.decode().then(resolve).catch(resolve); } else { resolve(); }
        };
        img.onerror = resolve;
        img.src = src;
      });
    })).then(avviaCarosello);
  }

  function differisci(fn) {
    if ("requestIdleCallback" in window) { requestIdleCallback(fn, { timeout: 1500 }); }
    else { setTimeout(fn, 200); }
  }

  if (document.readyState === "complete") {
    differisci(precaricaEAvvia);
  } else {
    window.addEventListener("load", function () {
      differisci(precaricaEAvvia);
    });
  }
});

// Sfondi CSS differiti (card delle tre malghe, foto di "Fattore per un
// giorno" e di "Chi siamo"): caricati solo quando si avvicinano alla
// finestra visibile, per non competere con le risorse della prima
// schermata. Una sola funzione per tutti gli elementi con data-bg-lazy.
(function () {
  const elementi = document.querySelectorAll("[data-bg-lazy]");
  if (!elementi.length) return;
  function applica(el) {
    if (el.dataset.bgLazy) el.style.backgroundImage = "url('" + scegliVariante(el.dataset.bgLazy) + "')";
  }
  if (!("IntersectionObserver" in window)) {
    elementi.forEach(applica);
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        applica(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "300px" });
  elementi.forEach(function (el) { io.observe(el); });
})();

// Mobile nav toggle
(function(){
  var btn = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if(!btn || !links) return;
  btn.addEventListener('click', function(){
    var open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Chiudi' : 'Menu';
  });
})();
