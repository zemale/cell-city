/* Города внутри — атлас: стартовый экран */
(function(){
  'use strict';
  var host = document.getElementById('atlas');
  if (!host) return;

  var CITIES = [
    { id:'cell', ico:'🏙', name:'Клетка', accent:'#7f9cf5',
      sub:'Город с электростанцией, фабриками и собственной таможней.' },
    { id:'plant', ico:'🌿', name:'Растение', accent:'#63a86b',
      sub:'Солнечная кухня: свет, вода и воздух превращаются в еду.' },
    { id:'animal', ico:'🐾', name:'Животное', accent:'#c98b4b',
      sub:'Город-транспорт: кровь развозит грузы, лёгкие берут кислород.' },
    { id:'human', ico:'🫀', name:'Человек', accent:'#cf6f8b',
      sub:'Двенадцать систем, которые договариваются между собой.' },
    { id:'bacteria', ico:'🦠', name:'Бактерия', accent:'#3f9aa8',
      sub:'Мини-город без ядра — самый древний и самый живучий.' },
    { id:'lab', ico:'🔬', name:'Лаборатория', accent:'#8a7cf0',
      sub:'Пять комнат, ползунки условий и приборы. Ставь опыты сама.' },
    { id:'rescue', ico:'🌱', name:'Спасатель растений', accent:'#4fa06a',
      sub:'Диагностика по симптомам: от сухой земли до вируса мозаики.' }
  ];

  function card(c, i){
    return '<button class="atlas-card" data-city="' + c.id + '" style="--accent:' + c.accent + ';animation-delay:' + (i * 55) + 'ms">' +
      '<div class="atlas-art"><span class="ring"></span><span class="ring small"></span>' +
        '<span class="ico">' + c.ico + '</span></div>' +
      '<div class="atlas-body"><h2>' + c.name + '</h2><p>' + c.sub + '</p>' +
        '<span class="atlas-go">Войти →</span></div></button>';
  }

  host.innerHTML = '<div class="atlas-inner">' +
    '<header class="atlas-head">' +
      '<span class="atlas-kicker">Атлас живых систем</span>' +
      '<h1>Города <em>внутри</em></h1>' +
      '<p class="atlas-sub">Пять живых городов — и лаборатория, где можно всё потрогать. Выбери, с чего начнёшь.</p>' +
    '</header>' +
    '<div class="atlas-grid">' + CITIES.map(card).join('') + '</div>' +
    '<footer class="atlas-foot">Совет: начни с клетки — это фундамент всех остальных городов.</footer>' +
  '</div>';

  function close(){
    host.classList.add('hide');
    document.body.classList.remove('atlas-open');
  }
  function open(){
    host.classList.remove('hide');
    document.body.classList.add('atlas-open');
    host.scrollTop = 0;
  }

  host.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('[data-city]') : null;
    if (!b) return;
    close();
    var sys = b.getAttribute('data-city');
    setTimeout(function(){
      if (typeof window.CITY_APPLY === 'function') window.CITY_APPLY(sys);
    }, 120);
  });

  var btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'atlasBtn';
  btn.innerHTML = '<span>🗺</span><span class="lbl">Атлас</span>';
  btn.addEventListener('click', open);
  var controls = document.querySelector('.controls');
  if (controls) controls.insertBefore(btn, controls.firstChild);

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !host.classList.contains('hide')) open === null ? 0 : close();
  });

  window.CC_ATLAS_OPEN = open;
  window.CC_ATLAS_CLOSE = close;

  document.body.classList.add('atlas-open');
})();
