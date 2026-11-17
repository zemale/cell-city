/* Города внутри — интерактивные механики: экскурсия, поломки, карта, время, прогресс */
(function(){
  'use strict';
  var KEY = 'cc.progress.v1';
  var MAP = { cell:['CITY_DATA','cell'], plant:['PLANT_DATA','plant'], animal:['ANIMAL_DATA','animal'], human:['HUMAN_DATA','human'], bacteria:['BACTERIA_DATA','bacteria'] };

  function curSys(){ var t = document.querySelector('.tab.on'); return t ? t.getAttribute('data-sys') : 'cell'; }
  function organs(){ var m = MAP[curSys()]; var d = window[m[0]]; return d && d.organs ? d.organs : []; }
  function findObj(id){ var a = organs(), i; for (i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }

  function toast(msg){
    var t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.tm); toast.tm = setTimeout(function(){ t.classList.remove('show'); }, 3200);
  }

  var store = {
    read: function(){ try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e){ return {}; } },
    write: function(p){ try { localStorage.setItem(KEY, JSON.stringify(p)); } catch(e){} }
  };

  function paintProgress(){
    var p = store.read(), sys = curSys(), n = 0, list = document.querySelectorAll('.chip'), i;
    for (i = 0; i < list.length; i++){
      var got = !!p[sys + ':' + list[i].getAttribute('data-id')];
      list[i].classList.toggle('seen', got);
      if (got) n++;
    }
    var el = document.getElementById('cc-prog');
    if (el) el.textContent = n + '/' + list.length;
  }

  function markVisited(id){
    var p = store.read(); p[curSys() + ':' + id] = 1; store.write(p); paintProgress();
  }

  function extrasFor(id){
    var ex = window.CC_EXTRA || {};
    return (ex[curSys()] || {})[id] || null;
  }

  function enrich(id){
    var panel = document.getElementById('panel');
    if (!panel || !panel.classList.contains('open')) return;
    if (!id){
      var act = document.querySelector('.bldg.active');
      id = act ? act.getAttribute('data-id') : null;
    }
    if (!id) return;
    if (panel.querySelector('.fx')) return;
    var o = findObj(id);
    var ex = extrasFor(id);
    if (!ex && o) ex = { r: o.detail, o: o.why };
    if (!ex) return;

    var box = document.createElement('div');
    box.className = 'fx';
    box.innerHTML = '<div class="fx-row">' +
      '<button class="fx-btn" data-act="real">\u{1F52C} Как на самом деле</button>' +
      '<button class="fx-btn" data-act="break">\u26A1 Сломать</button></div>' +
      '<div class="fx-body"></div>';
    panel.appendChild(box);

    var body = box.querySelector('.fx-body');
    box.addEventListener('click', function(e){
      var b = e.target.closest ? e.target.closest('.fx-btn') : null;
      if (!b) return;
      var el = document.querySelector('.bldg[data-id="' + id + '"]');
      var broken = el && el.classList.contains('broken');
      if (b.getAttribute('data-act') === 'real'){
        if (b.classList.contains('on')){ body.innerHTML = ''; b.classList.remove('on'); }
        else {
          body.innerHTML = '<p class="fx-p">' + ex.r + '</p>';
          b.classList.add('on');
          var kb = box.querySelector('.fx-btn[data-act="break"]');
          if (kb) kb.classList.remove('on');
        }
        return;
      }
      if (broken){
        el.classList.remove('broken');
        body.innerHTML = ''; b.textContent = '\u26A1 Сломать'; b.classList.remove('on');
        toast('Починено — город снова работает.');
      } else {
        if (el) el.classList.add('broken');
        body.innerHTML = '<p class="fx-p">' + ex.o + '</p>';
        b.textContent = '\u{1F527} Починить'; b.classList.add('on');
        var rb = box.querySelector('.fx-btn[data-act="real"]');
        if (rb) rb.classList.remove('on');
        toast('Выключили: ' + (o ? o.name : 'объект'));
      }
    });
    panel.scrollTop = panel.scrollHeight;
  }

  /* ---------- мини-карта ---------- */
  function buildMap(){
    var wrap = document.getElementById('cc-map'); if (!wrap) return;
    var svg = document.querySelector('#stage svg');
    if (!svg){ wrap.innerHTML = ''; return; }
    var vb = svg.viewBox && svg.viewBox.baseVal;
    if (!vb || !vb.width) return;
    var W = 152, H = 106, dots = [], tags = svg.querySelectorAll('.tag'), i;
    for (i = 0; i < tags.length; i++){
      var g = tags[i].closest('.bldg'); if (!g) continue;
      var m = /translate\(([-\d.]+)[ ,]([-\d.]+)\)/.exec(tags[i].getAttribute('transform') || '');
      if (!m) continue;
      var x = (+m[1] - vb.x) / vb.width * W, y = (+m[2] - vb.y) / vb.height * H;
      x = Math.max(5, Math.min(W - 5, x)); y = Math.max(5, Math.min(H - 5, y));
      dots.push('<circle class="mm-dot" data-id="' + g.getAttribute('data-id') + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5"/>');
    }
    wrap.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' +
      '<rect class="mm-bg" x="0" y="0" width="' + W + '" height="' + H + '" rx="14"/>' + dots.join('') + '</svg>';
  }

  /* ---------- кнопки ---------- */
  function inject(){
    var controls = document.querySelector('.controls');
    if (!controls || document.getElementById('cc-tour')) return;
    function mk(id, html, title){
      var b = document.createElement('button');
      b.className = 'btn cc-btn'; b.id = id; b.title = title; b.innerHTML = html;
      controls.appendChild(b); return b;
    }
    mk('cc-tour', '<span>🎬</span><span class="lbl">Экскурсия</span>', 'Провести по всем объектам');
    mk('cc-live', '<span>💫</span><span class="lbl">Жизнь</span>', 'Остановить или запустить потоки');
    mk('cc-time', '<span>☀️</span><span class="lbl">День</span>', 'Время суток');
    var prog = document.createElement('span');
    prog.id = 'cc-prog'; prog.className = 'cc-prog'; prog.title = 'Осмотрено объектов';
    controls.appendChild(prog);

    var map = document.createElement('div');
    map.id = 'cc-map'; map.title = 'Карта города — нажми на точку';
    document.querySelector('.stage-wrap').appendChild(map);

    var w = document.createElement('div');
    w.id = 'cc-weather';
    document.querySelector('.app').appendChild(w);

    /* экскурсия */
    var tourTimer = null, tourBtn = document.getElementById('cc-tour');
    function stopTour(){ clearInterval(tourTimer); tourTimer = null; tourBtn.classList.remove('on'); tourBtn.querySelector('.lbl').textContent = 'Экскурсия'; }
    tourBtn.addEventListener('click', function(){
      if (tourTimer){ stopTour(); toast('Экскурсия остановлена'); return; }
      var chips = [].slice.call(document.querySelectorAll('.chip'));
      if (!chips.length) return;
      var i = 0;
      tourBtn.classList.add('on');
      tourBtn.querySelector('.lbl').textContent = 'Стоп';
      toast('Экскурсия: ' + chips.length + ' остановок');
      chips[0].click(); i = 1;
      tourTimer = setInterval(function(){
        if (i >= chips.length){ stopTour(); toast('Экскурсия закончена. Осмотрено ' + chips.length + ' объектов.'); return; }
        chips[i].click();
        if (chips[i].scrollIntoView) chips[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        i++;
      }, 4200);
    });

    /* живые потоки */
    var liveBtn = document.getElementById('cc-live');
    liveBtn.addEventListener('click', function(){
      var still = document.body.classList.toggle('still');
      liveBtn.classList.toggle('on', still);
      liveBtn.querySelector('.lbl').textContent = still ? 'Тихо' : 'Жизнь';
      toast(still ? 'Потоки остановлены' : 'Город ожил');
    });

    /* время суток */
    var STATES = [
      { k: '', l: 'День', i: '☀️' },
      { k: 't-morning', l: 'Утро', i: '🌅' },
      { k: 't-sunset', l: 'Закат', i: '🌇' },
      { k: 't-night', l: 'Ночь', i: '🌙' },
      { k: 't-rain', l: 'Дождь', i: '🌧' },
      { k: 't-winter', l: 'Зима', i: '❄️' }
    ];
    var ti = 0, timeBtn = document.getElementById('cc-time');
    timeBtn.addEventListener('click', function(){
      STATES.forEach(function(s){ if (s.k) document.body.classList.remove(s.k); });
      document.body.classList.remove('night');
      ti = (ti + 1) % STATES.length;
      var s = STATES[ti];
      if (s.k === 't-night') document.body.classList.add('night');
      else if (s.k) document.body.classList.add(s.k);
      timeBtn.querySelector('.lbl').textContent = s.l;
      timeBtn.querySelector('span').textContent = s.i;
      toast('Время: ' + s.l);
    });
  }

  /* ---------- события ---------- */
  document.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('.chip[data-id], .bldg[data-id]') : null;
    if (!t) return;
    var id = t.getAttribute('data-id');
    setTimeout(function(){ markVisited(id); enrich(id); }, 120);
  }, true);

  function hookApply(){
    var orig = window.CITY_APPLY;
    if (!orig || orig.__cc) return;
    var wrapped = function(sys){
      orig.apply(null, arguments);
      setTimeout(function(){ markVisitedHookReset(); buildMap(); paintProgress(); }, 260);
    };
    wrapped.__cc = true;
    window.CITY_APPLY = wrapped;
  }
  function markVisitedHookReset(){ /* прогресс считаем по текущей вкладке */ }

  function boot(){
    inject(); hookApply(); paintProgress();
    setTimeout(buildMap, 420);
    setTimeout(function(){ enrich(); }, 300);
    window.addEventListener('resize', function(){ clearTimeout(boot.rz); boot.rz = setTimeout(buildMap, 300); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
