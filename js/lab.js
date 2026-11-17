/* Города внутри — лаборатория: комната, объект, приборы, опыт */
(function(){
  'use strict';
  var LAB = window.CC_LAB;
  var host = document.getElementById('lab');
  if (!LAB || !host) return;

  var JKEY = 'cc-lab-journal-v1';
  var state = { room: null, subj: {}, vals: {}, gear: {} };

  var PAL = {
    cell:     { wall: '#f2f4ff', wall2: '#e3e9ff', floor: '#dde3f6', accent: '#7f9cf5' },
    plant:    { wall: '#f2f8ee', wall2: '#e3f1db', floor: '#e6efe0', accent: '#6aa86c' },
    animal:   { wall: '#fdf5ea', wall2: '#f8e8d2', floor: '#f1e7d8', accent: '#c98b4b' },
    human:    { wall: '#fdf0f3', wall2: '#f8e0e6', floor: '#f0e3e7', accent: '#cf6f8b' },
    bacteria: { wall: '#eff7f8', wall2: '#ddeef1', floor: '#e1edef', accent: '#3f9aa8' }
  };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function mx(v, min, max){ return Math.max(0, Math.min(1, (v - min) / (max - min))); }
  function room(){ return LAB[state.room]; }
  function knobs(){ return room().knobs; }
  function subj(){
    var list = room().subjects, id = state.subj[state.room];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }
  function val(kid){ return state.vals[state.room][kid]; }

  function initRoom(r){
    if (state.vals[r]) return;
    state.vals[r] = {}; state.gear[r] = {};
    LAB[r].knobs.forEach(function(k){ state.vals[r][k.id] = k.def; });
    LAB[r].gear.forEach(function(g, i){ state.gear[r][g.id] = i === 0; });
    state.subj[r] = LAB[r].subjects[0].id;
  }

  /* ---------- оценка опыта ---------- */
  function status(k, v){
    var r = subj().range[k.id];
    if (v < r[0]) return 'low';
    if (v > r[1]) return 'high';
    return 'ok';
  }
  function judge(){
    var lines = [], okN = 0;
    knobs().forEach(function(k){
      var v = val(k.id), st = status(k, v), r = subj().range[k.id];
      if (st === 'ok') okN++;
      lines.push({ id: k.id, label: k.label, unit: k.unit, v: v, st: st, band: r,
        text: st === 'ok' ? '' : room().frag[k.id][st] });
    });
    var tone = okN === knobs().length ? 'good' : (okN >= 2 ? 'warn' : 'bad');
    return { okN: okN, total: knobs().length, lines: lines, tone: tone };
  }
  function fmt(v, k){ return String(v) + (k.unit === '°C' ? ' °C' : (k.unit === 'ч' ? ' ч' : ' %')); }

  /* ---------- сцена ---------- */
  var DESK = 312;

  function colonies(){
    var m = mx(val('medium'), 0, 100), t = mx(val('temp'), 20, 42);
    return Math.round(3 + m * 8 + t * 5);
  }

  function dishDots(accent, isB){
    var out = '', n = isB ? colonies() : 10;
    for (var i = 0; i < n; i++){
      var a = i * 2.399, rad = 14 + (i % 5) * 14;
      var cx = 360 + Math.cos(a) * rad, cy = 268 + Math.sin(a) * rad * 0.3;
      var rr = isB ? 3.2 + (i % 3) : 4.6 + (i % 3);
      out += '<g class="lab-colony"><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + rr + '" fill="' + (isB ? '#d9ab44' : accent) + '" opacity="' + (isB ? '.92' : '.26') + '"/>' +
        (isB ? '' : '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (rr * 0.4).toFixed(1) + '" fill="' + accent + '" opacity=".5"/>') + '</g>';
    }
    return out;
  }

  function focusSvg(r, accent){
    var s = subj();

    if (r === 'plant'){
      var wtr = mx(val('water'), 0, 100), lt = mx(val('light'), 0, 100);
      var soil = 'hsl(' + (30 - wtr * 6) + ' ' + (32 - wtr * 9) + '% ' + (36 - wtr * 10) + '%)';
      var stemH = 40 + lt * 30;
      var tipY = DESK - 52 - stemH;
      var droop = wtr < 0.25 ? 8 : 0;
      return '<g class="lab-focus">' +
        '<ellipse cx="360" cy="' + (DESK + 6) + '" rx="86" ry="13" fill="#2b2340" opacity=".1"/>' +
        '<path d="M318 ' + (DESK - 52) + ' h84 l-9 46 q-2 7 -9 7 h-48 q-7 0 -9 -7z" fill="#e3a273" stroke="#cf8a58" stroke-width="2"/>' +
        '<path d="M318 ' + (DESK - 52) + ' h84 l-3 10 h-78z" fill="#efb489"/>' +
        '<ellipse cx="360" cy="' + (DESK - 52) + '" rx="42" ry="8" fill="' + soil + '"/>' +
        '<path d="M360 ' + (DESK - 54) + ' C ' + (360 - droop) + ' ' + (DESK - 54 - stemH * .5) + ' ' + (360 + droop) + ' ' + (tipY + stemH * .4) + ' ' + (360 + droop) + ' ' + (tipY + 4) + '" fill="none" stroke="#5f9e63" stroke-width="5" stroke-linecap="round"/>' +
        '<ellipse cx="' + (336 - droop) + '" cy="' + (DESK - 70 - stemH * .34) + '" rx="21" ry="9.5" fill="#6cb070" transform="rotate(-20 336 ' + (DESK - 70 - stemH * .34) + ')"/>' +
        '<ellipse cx="' + (386 + droop) + '" cy="' + (DESK - 70 - stemH * .55) + '" rx="19" ry="8.5" fill="#7cbb7d" transform="rotate(18 386 ' + (DESK - 70 - stemH * .55) + ')"/>' +
        '<circle cx="' + (360 + droop) + '" cy="' + (tipY - 2) + '" r="11" fill="' + (lt > .3 ? '#ffd166' : '#c9cf8e') + '" stroke="#e8b74e" stroke-width="1.5"/>' +
        '<circle cx="' + (360 + droop) + '" cy="' + (tipY - 2) + '" r="4.5" fill="#f7a638"/>' +
        '</g>';
    }

    if (r === 'animal'){
      return '<g class="lab-focus">' +
        '<ellipse cx="360" cy="' + (DESK + 6) + '" rx="96" ry="13" fill="#2b2340" opacity=".1"/>' +
        '<rect x="272" y="196" width="176" height="116" rx="16" fill="#eaf6ff" opacity=".85" stroke="' + accent + '" stroke-opacity=".4" stroke-width="2.5"/>' +
        '<path d="M272 240 q88 -12 176 0 v56 a16 16 0 0 1 -16 16 h-144 a16 16 0 0 1 -16 -16z" fill="#cfeaf7" opacity=".65"/>' +
        '<circle cx="318" cy="268" r="4" fill="#ffffff" opacity=".8"/>' +
        '<circle cx="332" cy="248" r="2.8" fill="#ffffff" opacity=".7"/>' +
        '<circle cx="408" cy="256" r="3.4" fill="#ffffff" opacity=".7"/>' +
        '<rect x="264" y="306" width="192" height="8" rx="4" fill="#dfe9f2"/>' +
        '<text x="360" y="292" class="lab-emoji" font-size="42" text-anchor="middle">' + s.i + '</text>' +
        '</g>';
    }

    if (r === 'human'){
      var load = mx(val('load'), 0, 100);
      var beat = (0.85 + load * 1.9).toFixed(2) + 's';
      return '<g class="lab-focus">' +
        '<ellipse cx="360" cy="' + (DESK + 6) + '" rx="104" ry="13" fill="#2b2340" opacity=".1"/>' +
        '<rect x="248" y="196" width="224" height="112" rx="16" fill="#2a2f45" opacity=".9"/>' +
        '<rect x="256" y="204" width="208" height="96" rx="11" fill="#12203a"/>' +
        '<polyline class="lab-ecg" points="266,254 300,254 312,230 324,278 338,246 352,254 384,254 396,236 406,270 418,246 430,254 454,254" fill="none" stroke="#63e6b0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="animation-duration:' + beat + '"/>' +
        '<text x="266" y="222" font-size="10" letter-spacing="1.4" fill="#7f8fb5" font-family="Manrope,sans-serif">ПУЛЬС</text>' +
        '<text x="360" y="292" class="lab-emoji" font-size="34" text-anchor="middle">' + s.i + '</text>' +
        '<rect x="404" y="286" width="42" height="26" rx="6" fill="#2a2f45"/>' +
        '</g>';
    }

    var isB = r === 'bacteria';
    var anti = isB ? mx(val('anti'), 0, 100) : 0;
    return '<g class="lab-focus">' +
      '<ellipse cx="360" cy="' + (DESK + 6) + '" rx="112" ry="14" fill="#2b2340" opacity=".1"/>' +
      '<ellipse cx="360" cy="276" rx="112" ry="34" fill="#ffffff" opacity=".55" stroke="#c9d3e6" stroke-width="1.5"/>' +
      '<ellipse cx="360" cy="' + (DESK - 22) + '" rx="112" ry="30" fill="#ffffff" opacity=".82" stroke="' + accent + '" stroke-opacity=".35" stroke-width="2"/>' +
      '<path d="M248 ' + (DESK - 22) + ' v22 a112 30 0 0 0 224 0 v-22" fill="' + (isB ? '#f3e8cd' : '#eef5ff') + '" opacity=".55"/>' +
      '<ellipse cx="360" cy="' + (DESK - 22) + '" rx="100" ry="25" fill="' + (isB ? '#f9f1dc' : '#f4f9ff') + '"/>' +
      dishDots(accent, isB) +
      (anti > 0.05 ? '<circle cx="360" cy="' + (DESK - 22) + '" r="' + (14 + anti * 46).toFixed(0) + '" fill="#ffffff" opacity=".55" stroke="#e0787f" stroke-width="1.8" stroke-dasharray="5 5"/>' : '') +
      '<ellipse cx="330" cy="' + (DESK - 30) + '" rx="34" ry="7" fill="#ffffff" opacity=".6" transform="rotate(-8 330 ' + (DESK - 30) + ')"/>' +
      '</g>';
  }

  function sceneSvg(){
    var r = state.room, pal = PAL[r], rr = room(), s = subj();
    var lightK = (r === 'plant') ? mx(val('light'), 0, 100) : 0.6;
    var warm = mx(val('temp'), 12, 42);
    var beamA = (0.12 + lightK * 0.3).toFixed(2);

    return '<svg class="lab-svg" viewBox="0 0 720 430" role="img" aria-label="' + esc(rr.room) + ': ' + esc(s.n) + '">' +
      '<defs>' +
        '<linearGradient id="labWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pal.wall + '"/><stop offset="1" stop-color="' + pal.wall2 + '"/></linearGradient>' +
        '<linearGradient id="labDesk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e4deef"/></linearGradient>' +
        '<linearGradient id="labFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pal.floor + '"/><stop offset="1" stop-color="#ffffff" stop-opacity=".35"/></linearGradient>' +
        '<linearGradient id="labBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6b8" stop-opacity="' + beamA + '"/><stop offset="1" stop-color="#ffe6b8" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="labVig" cx=".5" cy=".42" r=".72"><stop offset=".55" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#6a5b8a" stop-opacity=".07"/></radialGradient>' +
      '</defs>' +
      '<rect width="720" height="430" fill="url(#labWall)"/>' +
      '<rect y="' + (DESK - 6) + '" width="720" height="' + (430 - DESK + 6) + '" fill="url(#labFloor)"/>' +
      /* окно */
      '<g>' +
        '<rect x="486" y="52" width="176" height="140" rx="12" fill="#fffdf6" opacity=".95"/>' +
        '<rect x="494" y="60" width="160" height="124" rx="7" fill="#eaf3ff"/>' +
        '<path d="M494 122 H654 M574 60 V184" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M494 122 H654 M574 60 V184" stroke="#cdd8e6" stroke-width="1" opacity=".7"/>' +
        '<path d="M486 192 h176" stroke="#d8d1e0" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M486 52 q44 -26 88 0z" fill="#efe6f6" opacity=".8"/>' +
      '</g>' +
      '<path d="M494 184 L654 184 L720 430 L360 430 Z" fill="url(#labBeam)"/>' +
      /* полка */
      '<g>' +
        '<rect x="42" y="150" width="214" height="8" rx="4" fill="#ded6ea"/>' +
        '<path d="M56 150 v-30 a10 10 0 0 1 20 0 v30z" fill="#d8ecff" stroke="#a9c5e6" stroke-width="1.5"/>' +
        '<path d="M56 138 h20 v4 h-20z" fill="#8fb8e0" opacity=".55"/>' +
        '<path d="M96 150 v-40 h22 v40z" fill="#f3e6cb" stroke="#cbb897" stroke-width="1.5"/>' +
        '<circle cx="146" cy="132" r="18" fill="#e6f0fa" stroke="#b3c6dd" stroke-width="1.5"/>' +
        '<path d="M132 132 q14 -14 28 0" fill="none" stroke="#b3c6dd" stroke-width="1.5"/>' +
        '<path d="M178 150 v-34 q0 -8 12 -8 t12 8 v34z" fill="#fbe2e8" stroke="#dbafba" stroke-width="1.5"/>' +
        '<path d="M198 122 h18 v6 h-18z" fill="#f3c9d3"/>' +
      '</g>' +
      /* стол */
      '<rect x="0" y="' + DESK + '" width="720" height="90" fill="#fdfbff" opacity=".0"/>' +
      '<rect x="26" y="' + DESK + '" width="668" height="17" rx="8" fill="#ffffff"/>' +
      '<rect x="26" y="' + (DESK + 13) + '" width="668" height="9" rx="4" fill="#e6e0ee"/>' +
      '<rect x="62" y="' + (DESK + 22) + '" width="15" height="82" rx="5" fill="#ded6ea"/>' +
      '<rect x="643" y="' + (DESK + 22) + '" width="15" height="82" rx="5" fill="#ded6ea"/>' +
      '<rect x="26" y="' + (DESK + 8) + '" width="668" height="4" fill="#ffffff" opacity=".7"/>' +
      focusSvg(r, pal.accent) +
      '<rect width="720" height="430" fill="url(#labVig)"/>' +
      '<rect width="720" height="430" fill="#ff8f52" opacity="' + (warm > .78 ? ((warm - .78) * .45).toFixed(2) : '0') + '" style="mix-blend-mode:multiply"/>' +
      '</svg>';
  }

  /* ---------- HTML частей ---------- */
  function roomPills(){
    return LAB.order.map(function(r){
      return '<button class="lab-room' + (r === state.room ? ' on' : '') + '" data-room="' + r + '">' +
        '<span>' + LAB[r].icon + '</span>' + LAB[r].name + '</button>';
    }).join('');
  }
  function subjectChips(){
    return room().subjects.map(function(s){
      return '<button class="lab-sub' + (s.id === state.subj[state.room] ? ' on' : '') + '" data-sub="' + s.id + '">' +
        '<span>' + s.i + '</span>' + s.n + '</button>';
    }).join('');
  }
  function knobRows(){
    return knobs().map(function(k){
      var v = val(k.id), band = subj().range[k.id];
      var left = mx(band[0], k.min, k.max) * 100, right = mx(band[1], k.min, k.max) * 100;
      var st = status(k, v);
      return '<div class="lab-knob ' + st + '" data-knob="' + k.id + '">' +
        '<div class="lk-top"><span class="lk-name">' + k.label + '</span>' +
          '<span class="lk-val">' + fmt(v, k) + '</span></div>' +
        '<div class="lk-track"><div class="lk-band" style="left:' + left.toFixed(1) + '%;width:' + Math.max(right - left, 3).toFixed(1) + '%"></div>' +
          '<input type="range" min="' + k.min + '" max="' + k.max + '" step="' + k.step + '" value="' + v + '" aria-label="' + esc(k.label) + '">' +
        '</div>' +
        '<div class="lk-ends"><span>' + (k.low || '') + '</span><span>' + (k.high || '') + '</span></div>' +
        '</div>';
    }).join('');
  }
  function gearTiles(){
    return room().gear.map(function(g){
      var on = state.gear[state.room][g.id];
      return '<button class="lab-gear' + (on ? ' on' : '') + '" data-gear-btn="' + g.id + '" title="' + esc(g.shows) + '">' +
        '<span>' + g.i + '</span>' + g.n + '</button>';
    }).join('');
  }
  function gearNote(){
    var on = room().gear.filter(function(g){ return state.gear[state.room][g.id]; });
    if (!on.length) return '<p class="lg-note">Ничего не включено — видно только невооружённым глазом: ' + esc(subj().face) + '.</p>';
    return on.map(function(g){
      return '<p class="lg-note"><b>' + g.i + ' ' + g.n + '</b> — ' + esc(g.shows) + '.</p>';
    }).join('');
  }
  function verdictHtml(){
    var j = judge(), s = subj();
    var title = j.tone === 'good' ? 'Опыт удачный' : (j.tone === 'warn' ? 'Опыт почти удачный' : 'Опыт неудачный');
    var mark = j.tone === 'good' ? '✅' : (j.tone === 'warn' ? '⚠️' : '❌');
    var list = j.lines.filter(function(l){ return l.st !== 'ok'; }).map(function(l){
      return '<li><b>' + l.label + ' ' + fmt(l.v, { unit: l.unit }) + '</b> — ' + esc(l.text) + '</li>';
    }).join('');
    return '<div class="lab-verdict ' + j.tone + '">' +
      '<div class="lv-top"><span class="lv-mark">' + mark + '</span><b>' + title + '</b>' +
        '<span class="lv-score">' + j.okN + ' из ' + j.total + ' условий в норме</span></div>' +
      '<p class="lv-main">' + esc(j.tone === 'good' ? s.ok : (j.tone === 'warn' ? 'Часть условий вне оптимума — смотри пояснения ниже.' : 'Условия далеки от оптимума для этого объекта.')) + '</p>' +
      (list ? '<ul class="lv-list">' + list + '</ul>' : '') +
      '<p class="lv-opt">Оптимум для объекта: ' + j.lines.map(function(l){
        return l.label.toLowerCase() + ' ' + l.band[0] + '–' + l.band[1];
      }).join(' · ') + '</p>' +
      '</div>';
  }

  function journal(){
    var list = [];
    try { list = JSON.parse(localStorage.getItem(JKEY)) || []; } catch(e){ list = []; }
    if (!list.length) return '<div class="lab-journal-empty">Журнал пуст. Поставь опыт и нажми «Сохранить в журнал» — записи останутся в этом браузере.</div>';
    return list.slice(0, 6).map(function(e){
      return '<div class="lj-item"><span class="lj-ico">' + e.ico + '</span><div class="lj-body">' +
        '<b>' + esc(e.name) + '</b><p>' + esc(e.line) + '</p></div>' +
        '<span class="lj-time">' + esc(e.time) + '</span></div>';
    }).join('');
  }
  function saveEntry(){
    var list = [];
    try { list = JSON.parse(localStorage.getItem(JKEY)) || []; } catch(e){ list = []; }
    var j = judge(), s = subj(), d = new Date();
    var parts = j.lines.map(function(l){ return l.label.toLowerCase() + ' ' + fmt(l.v, { unit: l.unit }); });
    list.unshift({
      ico: s.i, name: s.n, line: (j.tone === 'good' ? 'Опыт удачный · ' : 'Неудачный · ') + parts.join(', '),
      time: ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2)
    });
    try { localStorage.setItem(JKEY, JSON.stringify(list.slice(0, 12))); } catch(e){}
    var box = host.querySelector('.lab-journal-list');
    if (box) box.innerHTML = journal();
    toast('Записал опыт в журнал 📓');
  }
  function toast(msg){
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function(){ t.classList.remove('show'); }, 2600);
  }

  /* ---------- сборка ---------- */
  function build(){
    if (!state.room) state.room = LAB.order[0];
    initRoom(state.room);
    var rr = room();
    host.innerHTML =
      '<div class="lab-head">' +
        '<div class="lab-title"><span class="lab-ico">' + rr.icon + '</span><div>' +
          '<h2>' + rr.room + '</h2><p>' + esc(rr.sub) + '</p></div></div>' +
        '<div class="lab-rooms">' + roomPills() + '</div>' +
      '</div>' +
      '<div class="lab-body">' +
        '<div class="lab-left">' +
          '<div class="lab-stage">' + sceneSvg() + '</div>' +
          '<div class="lab-result">' + verdictHtml() + '</div>' +
        '</div>' +
        '<div class="lab-side">' +
          '<div class="lab-block"><h3>Что исследуем</h3><div class="lab-subs">' + subjectChips() + '</div></div>' +
          '<div class="lab-block"><h3>Условия опыта</h3><div class="lab-knobs">' + knobRows() + '</div>' +
            '<div class="lab-actions"><button class="lab-btn ghost" data-act="reset">↺ Сбросить</button>' +
            '<button class="lab-btn" data-act="save">📓 Сохранить в журнал</button></div></div>' +
          '<div class="lab-block"><h3>Оборудование</h3><div class="lab-gears">' + gearTiles() + '</div>' +
            '<div class="lab-gear-note">' + gearNote() + '</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="lab-journal"><h3>Журнал опытов</h3><div class="lab-journal-list">' + journal() + '</div></div>';
  }

  function refreshScene(){
    var st = host.querySelector('.lab-stage');
    if (st) st.innerHTML = sceneSvg();
  }
  function refreshVerdict(){
    var box = host.querySelector('.lab-result');
    if (box) box.innerHTML = verdictHtml();
    var kn = host.querySelectorAll('.lab-knob');
    for (var i = 0; i < kn.length; i++){
      var k = kn[i], id = k.getAttribute('data-knob'), kb = null;
      for (var j = 0; j < knobs().length; j++) if (knobs()[j].id === id) kb = knobs()[j];
      if (!kb) continue;
      var v = val(id);
      k.classList.remove('low', 'ok', 'high');
      k.classList.add(status(kb, v));
      var lv = k.querySelector('.lk-val'); if (lv) lv.textContent = fmt(v, kb);
      var inp = k.querySelector('input'); if (inp && +inp.value !== +v) inp.value = v;
    }
  }
  function refreshGear(){
    var tiles = host.querySelectorAll('[data-gear-btn]');
    for (var i = 0; i < tiles.length; i++){
      var id = tiles[i].getAttribute('data-gear-btn');
      tiles[i].classList.toggle('on', !!state.gear[state.room][id]);
    }
    var note = host.querySelector('.lab-gear-note');
    if (note) note.innerHTML = gearNote();
    refreshScene();
  }
  function refreshSubs(){
    var chips = host.querySelectorAll('[data-sub]');
    for (var i = 0; i < chips.length; i++){
      chips[i].classList.toggle('on', chips[i].getAttribute('data-sub') === state.subj[state.room]);
    }
    refreshScene(); refreshVerdict();
  }

  host.addEventListener('click', function(e){
    var t = e.target;
    var roomBtn = t.closest ? t.closest('[data-room]') : null;
    if (roomBtn){ state.room = roomBtn.getAttribute('data-room'); build(); return; }
    var subBtn = t.closest ? t.closest('[data-sub]') : null;
    if (subBtn){ state.subj[state.room] = subBtn.getAttribute('data-sub'); refreshSubs(); return; }
    var gearBtn = t.closest ? t.closest('[data-gear-btn]') : null;
    if (gearBtn){
      var gid = gearBtn.getAttribute('data-gear-btn');
      state.gear[state.room][gid] = !state.gear[state.room][gid];
      refreshGear(); return;
    }
    var tile = t.closest ? t.closest('[data-gear]') : null;
    if (tile){
      var id2 = tile.getAttribute('data-gear');
      state.gear[state.room][id2] = !state.gear[state.room][id2];
      refreshGear(); return;
    }
    var act = t.closest ? t.closest('[data-act]') : null;
    if (act){
      var a = act.getAttribute('data-act');
      if (a === 'reset'){
        knobs().forEach(function(k){ state.vals[state.room][k.id] = k.def; });
        refreshVerdict(); refreshScene(); toast('Опыт сброшен — все условия по умолчанию');
      } else if (a === 'save'){ saveEntry(); }
    }
  });

  host.addEventListener('input', function(e){
    var inp = e.target;
    if (!inp || inp.type !== 'range') return;
    var wrap = inp.closest('[data-knob]');
    if (!wrap) return;
    var id = wrap.getAttribute('data-knob');
    state.vals[state.room][id] = parseFloat(inp.value);
    refreshVerdict(); refreshScene();
  });

  window.buildLab = function(){
    if (!LAB[state.room]) state.room = LAB.order[0];
    build();
  };
})();
