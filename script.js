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
