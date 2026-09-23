(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ duration: 1.2, smoothWheel: true, autoRaf: false });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Posizione naturale nel documento, immune ai transform CSS: se il target
  // non è ancora stato rivelato (GSAP lo tiene con translateY(30) in attesa
  // dello ScrollTrigger), getBoundingClientRect() restituirebbe una posizione
  // "sporca" di quei 30px, facendo atterrare lo scroll nel punto sbagliato.
  function cimaNaturale(el) {
    let top = 0, nodo = el;
    while (nodo) { top += nodo.offsetTop || 0; nodo = nodo.offsetParent; }
    return top;
  }

  // Jump link: intercetta i click su àncore interne e usa lenis.scrollTo,
  // con offset pari all'altezza della nav sticky (74px)
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(cimaNaturale(target) - 74);
      }
    });
  });

  // Reveal on entry, stesso pattern di scroll.js in Viaggioperdue,
  // applicato a tutte le sezioni marcate .gsap-reveal, su qualunque pagina
  gsap.utils.toArray(".gsap-reveal")
    .forEach(function (sezione) {
      gsap.from(sezione, {
        opacity: 0, y: 30, duration: 0.9, ease: "power2.out",
        scrollTrigger: { trigger: sezione, start: "top 85%", toggleActions: "play none none none" }
      });
    });

  // Ricalcola i trigger quando le immagini finiscono di caricare
  // (stesso accorgimento di Viaggioperdue, con debounce)
  let timeoutId;
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("load", function () {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () { ScrollTrigger.refresh(); }, 150);
    });
  });
})();
