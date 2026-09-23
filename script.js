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

// Home hero carousel
document.addEventListener("DOMContentLoaded", function () {
  const immagini = document.querySelectorAll(".home-hero .hero-img");
  const segmenti = document.querySelectorAll("#homeAltscale .seg");
  if (immagini.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let indice = 0;
    setInterval(function () {
      immagini[indice].classList.remove("attiva");
      segmenti[indice].classList.remove("current");
      indice = (indice + 1) % immagini.length;
      immagini[indice].classList.add("attiva");
      segmenti[indice].classList.add("current");
    }, 5000);
  }
});

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
