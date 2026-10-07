(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Se la pagina si carica con un'ancora già nell'URL (link cross-pagina,
  // es. prenotazioni.html#el-malget), il salto nativo del browser avviene
  // subito, prima che GSAP applichi lo stato iniziale delle sezioni
  // .gsap-reveal (opacity:0, translateY(30)): il layout su cui il browser
  // calcola lo scroll non è ancora quello definitivo e la destinazione
  // atterra sotto la nav sticky. Annulliamo il salto nativo e lo rifacciamo
  // più sotto con Lenis, a layout ormai stabile.
  const hashInUrl = window.location.hash;
  if (hashInUrl.length > 1) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }

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

  // Ancora già presente nell'URL al caricamento (navigazione cross-pagina,
  // vedi commento in cima al file): rifacciamo il salto con Lenis usando
  // la stessa posizione naturale (offsetTop) dei click same-page, ora che
  // gli ScrollTrigger sono stati creati e il layout è stabile.
  if (hashInUrl.length > 1) {
    const target = document.querySelector(hashInUrl);
    if (target) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          lenis.scrollTo(cimaNaturale(target) - 74);

          // Seconda correzione quando i font web sono pronti: il primo
          // tentativo (due rAF sopra) può avvenire prima che i Google Fonts
          // sostituiscano il fallback. Su pagine con sezioni dense di testo
          // sopra l'ancora (es. la griglia .rooms di Bordolona Alta), il
          // cambio di font altera l'altezza del contenuto e sposta
          // l'ancora già raggiunta. Non si applica se il visitatore ha già
          // scorso di sua iniziativa nel frattempo, né se la posizione è
          // già corretta.
          if (document.fonts && document.fonts.ready) {
            var userInteracted = false;
            var timedOut = false;
            var markInteracted = function () { userInteracted = true; };
            var inputEvents = ["wheel", "touchstart", "keydown"];
            inputEvents.forEach(function (evt) {
              window.addEventListener(evt, markInteracted, { passive: true });
            });
            // "scroll" viene ascoltato con un piccolo ritardo, per non
            // intercettare lo scroll animato della correzione appena avviata
            // (Lenis ha duration 1.2s) come se fosse un'interazione.
            var scrollListenerTimer = setTimeout(function () {
              window.addEventListener("scroll", markInteracted, { passive: true });
            }, 1400);

            var removeInteractionListeners = function () {
              clearTimeout(scrollListenerTimer);
              inputEvents.forEach(function (evt) {
                window.removeEventListener(evt, markInteracted, { passive: true });
              });
              window.removeEventListener("scroll", markInteracted, { passive: true });
            };

            var fontsTimeoutTimer = setTimeout(function () {
              timedOut = true;
              removeInteractionListeners();
            }, 5000);

            document.fonts.ready.then(function () {
              clearTimeout(fontsTimeoutTimer);
              removeInteractionListeners();
              if (timedOut) return;
              if (window.location.hash !== hashInUrl) return;
              if (userInteracted) return;
              var currentTop = target.getBoundingClientRect().top;
              if (Math.abs(currentTop - 74) > 4) {
                lenis.scrollTo(cimaNaturale(target) - 74, { immediate: true });
              }
            });
          }
        });
      });
    }
  }

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
