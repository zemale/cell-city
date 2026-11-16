/* Города внутри — переключение систем */
(function(){
  'use strict';
  var subs = {
    cell: 'Атлас живых систем · клетка как город',
    plant: 'Атлас живых систем · растение как город',
    animal: 'Атлас живых систем · животное как город',
    human: 'Атлас живых систем · человек как город'
  };
  var builds = { cell: window.buildCellCity, plant: window.buildPlantCity, animal: window.buildAnimalCity };
  var current = 'cell';
  var busy = false;

  function showToast(msg){
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function(){ t.classList.remove('show'); }, 3400);
  }

  function setTab(sys){
    var tabs = document.querySelectorAll('.tab'), i;
    for (i = 0; i < tabs.length; i++) tabs[i].classList.toggle('on', tabs[i].getAttribute('data-sys') === sys);
  }

  function apply(sys){
    if (!builds[sys]) { showToast('🫀 Человек — следующий город, уже в работе.'); return; }
    if (busy) return;
    busy = true;
    current = sys;
    setTab(sys);
    var p = document.querySelector('.brand p');
    if (p) p.textContent = subs[sys];
    document.getElementById('stage').innerHTML = '';
    builds[sys]();
    document.getElementById('stage').scrollTop = 0;
    busy = false;
  }

  var tabs = document.querySelectorAll('.tab'), i;
  for (i = 0; i < tabs.length; i++){
    (function(tab){
      tab.addEventListener('click', function(){ apply(tab.getAttribute('data-sys')); });
    })(tabs[i]);
  }

  var nightBtn = document.getElementById('night');
  if (nightBtn){
    nightBtn.addEventListener('click', function(){
      var on = document.body.classList.toggle('night');
      var l = nightBtn.querySelector('.lbl');
      var s = nightBtn.querySelector('span');
      if (l) l.textContent = on ? 'День' : 'Ночь';
      if (s) s.textContent = on ? '☀️' : '🌙';
    });
  }

  window.CITY_APPLY = apply;
})();
