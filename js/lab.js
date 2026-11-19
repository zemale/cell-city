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

  /* если у объекта не задана зона нормы для какого-то условия — добираем разумный дефолт */
  var FILL = {
    food: [42, 82], temp: [20, 27], oxy: [45, 88], salt: [0, 25], ph: [6.5, 7.6],
    light: [40, 84], water: [45, 78], hum: [45, 78], soil: [55, 88],
    sleep: [7, 9.5], load: [25, 65], screen: [0, 4],
    medium: [40, 75], anti: [0, 12], time: [12, 30]
  };
  LAB.order.forEach(function(r){
    LAB[r].subjects.forEach(function(sb){
      sb.range = sb.range || {};
      LAB[r].knobs.forEach(function(k){ if (!sb.range[k.id]) sb.range[k.id] = FILL[k.id] || [k.min, k.max]; });
    });
  });
  function rangeOf(kid){ return subj().range[kid] || [0, 100]; }

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
    var r = rangeOf(k.id);
    if (v < r[0]) return 'low';
    if (v > r[1]) return 'high';
    return 'ok';
  }
  function judge(){
    var lines = [], okN = 0;
    knobs().forEach(function(k){
      var v = val(k.id), st = status(k, v), r = rangeOf(k.id);
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

  function has(kid){ var f = false; knobs().forEach(function(x){ if (x.id === kid) f = true; }); return f; }
  function knobN(kid){
    var k = null; knobs().forEach(function(x){ if (x.id === kid) k = x; });
    if (!k) return .5;
    return mx(val(kid), k.min, k.max);
  }
  function inBand(kid){
    var r = rangeOf(kid);
    if (!r) return true;
    var v = val(kid);
    return v >= r[0] && v <= r[1];
  }
  function off(l){
    if (l.st === 'ok') return 0;
    var r = l.band;
    return l.st === 'low' ? (r[0] - l.v) / Math.max(1, r[0]) : (l.v - r[1]) / Math.max(1, r[1]);
  }
  function vibe(){
    var o = {};
    o.light = has('light') ? knobN('light') : .62;
    o.water = has('water') ? knobN('water') : .6;
    o.temp = has('temp') ? val('temp') : 22;
    o.hum = has('hum') ? val('hum') : 55;
    o.soil = has('soil') ? knobN('soil') : .6;
    o.salt = has('salt') ? val('salt') : 0;
    o.ph = has('ph') ? val('ph') : 7;
    o.food = has('food') ? knobN('food') : .6;
    o.oxy = has('oxy') ? knobN('oxy') : .5;
    o.sleep = has('sleep') ? val('sleep') : 8;
    o.load = has('load') ? knobN('load') : .4;
    o.screen = has('screen') ? val('screen') : 3;
    o.medium = has('medium') ? knobN('medium') : .55;
    o.anti = has('anti') ? knobN('anti') : 0;
    o.time = has('time') ? val('time') : 18;
    o.cold = mx(17 - o.temp, 0, 11);
    o.heat = mx(o.temp - 27, 0, 13);
    return o;
  }
  function colonyCount(v){
    var n = 2 + v.medium * 9 + mx(v.temp, 20, 40) * 5 + mx(v.time, 0, 48) * 3;
    n *= (1 - v.anti * .85) * (1 - mx(v.salt - 2, 0, 10) * .07);
    n *= (1 - mx(Math.abs(v.ph - 7) - .6, 0, 3) * .22);
    return Math.max(0, Math.round(n));
  }
  function colonyColor(v){
    if (v.ph > 8) return '#c98b2c';
    if (v.ph < 6) return '#8fae4a';
    if (v.temp < 26) return '#cfae55';
    return '#d9ab44';
  }

  function dishDots(accent, isB, v){
    var out = '', n = isB ? colonyCount(v) : Math.round(5 + v.food * 9);
    var antiR = 12 + v.anti * 50;
    var saltK = mx(v.salt, 0, 8), phK = mx(Math.abs(v.ph - 7), 0, 3);
    for (var i = 0; i < n; i++){
      var a = i * 2.399, rad = 12 + (i % 6) * 13;
      var cx = 360 + Math.cos(a) * rad, cy = 268 + Math.sin(a) * rad * .3;
      var dx = cx - 360, dy = cy - 268;
      var dd = Math.sqrt(dx * dx + (dy / .3) * (dy / .3));
      if (isB && v.anti > .03 && dd < antiR) continue;
      if (isB){
        var rr = 3.4 + (i % 3) * .8 + v.medium * 1.6 + mx(v.time, 0, 48) * .5;
        out += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + rr.toFixed(1) + '" fill="' + colonyColor(v) + '" opacity="' + (.55 + v.medium * .42).toFixed(2) + '"/>';
      } else {
        var dmg = Math.max(saltK, phK), rx = 4.4 + (i % 3) * 1.1, ry = rx * (1 - .32 * saltK);
        out += '<g opacity="' + (1 - dmg * .55).toFixed(2) + '">' +
          '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" fill="' + accent + '" opacity="' + (.2 + (1 - dmg) * .28).toFixed(2) + '" stroke="' + accent + '" stroke-width="1.1" stroke-opacity=".45"/>' +
          '<circle cx="' + (cx + 1).toFixed(1) + '" cy="' + (cy - .6).toFixed(1) + '" r="' + (rx * .34).toFixed(1) + '" fill="' + accent + '" opacity=".55"/></g>';
      }
    }
    return out;
  }

  function focusSvg(r, accent){
    var s = subj(), v = vibe();

    if (r === 'plant'){
      var wilt = Math.min(1, Math.max(
        mx(.32 - v.water, 0, .32),
        mx(.34 - v.light, 0, .34) * .85,
        v.cold * .8, v.heat * .9,
        mx(.3 - v.soil, 0, .3) * .6
      ));
      var yellow = Math.min(1, Math.max(mx(.35 - v.soil, 0, .35), mx(.3 - v.food, 0, .3)) * 1.3);
      var soil = 'hsl(30 ' + (32 - v.water * 9).toFixed(0) + '% ' + (36 - v.water * 11 - (1 - v.water) * 6).toFixed(0) + '%)';
      var stemH = 30 + v.light * 38 + v.soil * 12 - wilt * 22;
      var tipY = DESK - 52 - stemH;
      var droop = wilt * 30;
      var leafA = '#6cb070', leafB = '#7cbb7d';
      if (yellow > .35){ leafA = '#b7b96b'; leafB = '#c9c777'; }
      var lx1 = 336 - droop, ly1 = DESK - 70 - stemH * .34;
      var lx2 = 386 + droop, ly2 = DESK - 70 - stemH * .55;
      var petal = (v.light < .35 || wilt > .62) ? '#cfcfa0' : '#ffd166';
      return '<g class="lab-focus">' +
        '<ellipse cx="360" cy="' + (DESK + 6) + '" rx="86" ry="13" fill="#2b2340" opacity=".1"/>' +
        '<path d="M318 ' + (DESK - 52) + ' h84 l-9 46 q-2 7 -9 7 h-48 q-7 0 -9 -7z" fill="#e3a273" stroke="#cf8a58" stroke-width="2"/>' +
        '<path d="M318 ' + (DESK - 52) + ' h84 l-3 10 h-78z" fill="#efb489"/>' +
        '<ellipse cx="360" cy="' + (DESK - 52) + '" rx="42" ry="8" fill="' + soil + '"/>' +
        (v.water < .28 ? '<path d="M338 ' + (DESK - 51) + ' l9 5 l-6 4 M364 ' + (DESK - 50) + ' l10 4 l-7 4" stroke="#a08570" stroke-width="1.3" fill="none" opacity=".55"/>' : '') +
        '<path d="M360 ' + (DESK - 54) + ' C ' + (360 - droop) + ' ' + (DESK - 54 - stemH * .5) + ' ' + (360 + droop) + ' ' + (tipY + stemH * .4) + ' ' + (360 + droop) + ' ' + (tipY + 4) + '" fill="none" stroke="' + (yellow > .55 ? '#8f9a5a' : '#5f9e63') + '" stroke-width="5" stroke-linecap="round"/>' +
        '<ellipse cx="' + lx1.toFixed(1) + '" cy="' + ly1.toFixed(1) + '" rx="21" ry="9.5" fill="' + leafA + '" transform="rotate(' + (-20 - wilt * 46).toFixed(0) + ' ' + lx1.toFixed(1) + ' ' + ly1.toFixed(1) + ')"/>' +
        '<ellipse cx="' + lx2.toFixed(1) + '" cy="' + ly2.toFixed(1) + '" rx="19" ry="8.5" fill="' + leafB + '" transform="rotate(' + (18 + wilt * 46).toFixed(0) + ' ' + lx2.toFixed(1) + ' ' + ly2.toFixed(1) + ')"/>' +
        '<circle cx="' + (360 + droop).toFixed(1) + '" cy="' + (tipY - 2).toFixed(1) + '" r="' + (11 - wilt * 3.4).toFixed(1) + '" fill="' + petal + '" stroke="#e8b74e" stroke-width="1.5"/>' +
        '<circle cx="' + (360 + droop).toFixed(1) + '" cy="' + (tipY - 2).toFixed(1) + '" r="4.5" fill="#f7a638"/>' +
        '</g>';
    }

    if (r === 'animal'){
      var level = 30 + v.water * 82;
      var top = DESK - level;
      var tint = v.cold > .3 ? '#bcd8f7' : (v.heat > .35 ? '#cfe9ea' : '#cfeaf7');
      var bubbles = '';
      var nb = Math.round(1 + v.oxy * 4);
      for (var b = 0; b < nb; b++){
        var bx = 300 + b * 34, by = top + 22 + (b % 2) * 16;
        bubbles += '<circle cx="' + bx + '" cy="' + by + '" r="' + (2.2 + (b % 2)) + '" fill="#ffffff" opacity=".65"/>';
      }
      var food = v.food > .45 ? '<circle cx="336" cy="' + (top + 3) + '" r="2" fill="#c98b4b" opacity=".8"/><circle cx="356" cy="' + (top + 2) + '" r="1.7" fill="#c98b4b" opacity=".7"/><circle cx="380" cy="' + (top + 4) + '" r="2.2" fill="#c98b4b" opacity=".75"/>' : '';
      return '<g class="lab-focus">' +
        '<ellipse cx="360" cy="' + (DESK + 6) + '" rx="96" ry="13" fill="#2b2340" opacity=".1"/>' +
        '<rect x="272" y="196" width="176" height="116" rx="16" fill="#eaf6ff" opacity=".85" stroke="' + accent + '" stroke-opacity=".4" stroke-width="2.5"/>' +
        '<path d="M272 ' + (top - 4) + ' h176 v' + (DESK - 4 - (top - 4)) + ' a16 16 0 0 1 -16 16 h-144 a16 16 0 0 1 -16 -16z" fill="' + tint + '" opacity=".68"/>' +
        '<path d="M272 ' + top + ' h176" stroke="#ffffff" stroke-opacity=".8" stroke-width="2"/>' +
        bubbles + food +
        '<rect x="264" y="306" width="192" height="8" rx="4" fill="#dfe9f2"/>' +
        '<text x="360" y="' + (top + 34) + '" class="lab-emoji" font-size="' + (44 * (.86 + .14 * v.food)).toFixed(0) + '" text-anchor="middle">' + s.i + '</text>' +
        '</g>';
    }

    if (r === 'human'){
      var bpm = Math.round(Math.max(46, Math.min(178, 58 + v.load * 74 + Math.max(0, 8 - v.sleep) * 4.6 + v.screen * 1.7)));
      var beat = (60 / bpm).toFixed(2) + 's';
      var energy = Math.max(.12, Math.min(1, (v.sleep / 9) * .55 + v.food * .3 + v.water * .15));
      var scr = v.screen > 4 ? '#1d4a7a' : '#12203a';
      return '<g class="lab-focus">' +
        '<ellipse cx="360" cy="' + (DESK + 6) + '" rx="104" ry="13" fill="#2b2340" opacity=".1"/>' +
        '<rect x="248" y="196" width="224" height="112" rx="16" fill="#2a2f45" opacity=".9"/>' +
        '<rect x="256" y="204" width="208" height="96" rx="11" fill="' + scr + '"/>' +
        (v.screen > 4 ? '<rect x="256" y="204" width="208" height="96" rx="11" fill="#7fb6ff" opacity="' + ((v.screen - 4) * .035).toFixed(2) + '"/>' : '') +
        '<polyline class="lab-ecg" points="266,254 300,254 312,230 324,278 338,246 352,254 384,254 396,236 406,270 418,246 430,254 454,254" fill="none" stroke="' + (bpm > 130 ? '#ffb27a' : '#63e6b0') + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="animation-duration:' + beat + '"/>' +
        '<text x="266" y="222" font-size="10" letter-spacing="1.4" fill="#7f8fb5" font-family="Manrope,sans-serif">ПУЛЬС ' + bpm + '</text>' +
        '<rect x="434" y="216" width="8" height="72" rx="4" fill="#ffffff" opacity=".14"/>' +
        '<rect x="434" y="' + (288 - 72 * energy).toFixed(0) + '" width="8" height="' + (72 * energy).toFixed(0) + '" rx="4" fill="' + (energy < .4 ? '#e88a8a' : '#63e6b0') + '"/>' +
        '<text x="360" y="292" class="lab-emoji" font-size="34" text-anchor="middle">' + s.i + '</text>' +
        '</g>';
    }

    var isB = r === 'bacteria';
    var anti = isB ? v.anti : 0;
    var turb = isB ? .45 + v.medium * .5 : .35;
    return '<g class="lab-focus">' +
      '<ellipse cx="360" cy="' + (DESK + 6) + '" rx="112" ry="14" fill="#2b2340" opacity=".1"/>' +
      '<ellipse cx="360" cy="276" rx="112" ry="34" fill="#ffffff" opacity=".55" stroke="#c9d3e6" stroke-width="1.5"/>' +
      '<ellipse cx="360" cy="' + (DESK - 22) + '" rx="112" ry="30" fill="#ffffff" opacity=".82" stroke="' + accent + '" stroke-opacity=".35" stroke-width="2"/>' +
      '<path d="M248 ' + (DESK - 22) + ' v22 a112 30 0 0 0 224 0 v-22" fill="' + (isB ? '#f3e8cd' : '#eef5ff') + '" opacity="' + turb.toFixed(2) + '"/>' +
      '<ellipse cx="360" cy="' + (DESK - 22) + '" rx="100" ry="25" fill="' + (isB ? (v.medium > .6 ? '#f6e9c6' : '#f9f1dc') : '#f4f9ff') + '"/>' +
      dishDots(accent, isB, v) +
      (anti > .03 ? '<circle cx="360" cy="' + (DESK - 22) + '" r="' + (12 + anti * 50).toFixed(0) + '" fill="#ffffff" opacity=".5" stroke="#e0787f" stroke-width="1.8" stroke-dasharray="5 5"/>' : '') +
      '<ellipse cx="330" cy="' + (DESK - 30) + '" rx="34" ry="7" fill="#ffffff" opacity=".6" transform="rotate(-8 330 ' + (DESK - 30) + ')"/>' +
      '</g>';
  }

  function effectsSvg(){
    var v = vibe(), out = '', x = 28, y = 24, n = 0;
    knobs().forEach(function(k){
      if (n >= 4 || inBand(k.id)) return;
      var st = status(k, val(k.id)), label = st === 'low' ? k.low : k.high;
      var w = 20 + label.length * 7.2, col = st === 'low' ? '#6d7fd6' : '#dd7a4e';
      out += '<g><rect x="' + x + '" y="' + y + '" width="' + w.toFixed(0) + '" height="23" rx="11.5" fill="' + col + '" opacity=".9"/>' +
        '<text x="' + (x + w / 2).toFixed(0) + '" y="' + (y + 15.5) + '" text-anchor="middle" font-size="11.5" font-family="Manrope,sans-serif" fill="#ffffff">' + esc(label) + '</text></g>';
      y += 28; n++;
    });
    if (!n){
      out = '<g><rect x="28" y="24" width="' + (20 + 'Все условия в норме'.length * 7.2).toFixed(0) + '" height="23" rx="11.5" fill="#5fbf8a" opacity=".9"/>' +
        '<text x="' + (28 + 10 + 'Все условия в норме'.length * 3.6).toFixed(0) + '" y="39.5" text-anchor="middle" font-size="11.5" font-family="Manrope,sans-serif" fill="#ffffff">Все условия в норме</text></g>';
    }
    return out;
  }

  function sceneSvg(){
    var r = state.room, pal = PAL[r], rr = room(), s = subj(), v = vibe();
    var beamA = (0.10 + v.light * 0.34).toFixed(2);
    var dim = (r === 'plant') ? (1 - v.light) * 0.66 : ((r === 'animal') ? (1 - v.light) * 0.34 : 0);
    var winFill = v.light < .3 ? '#3d4864' : (v.light < .55 ? '#b9cfe6' : '#eaf3ff');
    var cold = (v.cold * .22).toFixed(2);
    var hot = (v.heat * .3).toFixed(2);

    return '<svg class="lab-svg" viewBox="0 0 720 430" role="img" aria-label="' + esc(rr.room) + ': ' + esc(s.n) + '">' +
      '<defs>' +
        '<linearGradient id="labWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pal.wall + '"/><stop offset="1" stop-color="' + pal.wall2 + '"/></linearGradient>' +
        '<linearGradient id="labDesk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e4deef"/></linearGradient>' +
        '<linearGradient id="labFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pal.floor + '"/><stop offset="1" stop-color="#ffffff" stop-opacity=".35"/></linearGradient>' +
        '<linearGradient id="labBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6b8" stop-opacity="' + beamA + '"/><stop offset="1" stop-color="#ffe6b8" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="labVig" cx=".5" cy=".42" r=".72"><stop offset=".55" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#6a5b8a" stop-opacity=".07"/></radialGradient>' +
        '<radialGradient id="labDark" cx=".52" cy=".36" r=".62"><stop offset="0" stop-color="#241d3d" stop-opacity=".35"/><stop offset="1" stop-color="#150f2b" stop-opacity=".92"/></radialGradient>' +
      '</defs>' +
      '<rect width="720" height="430" fill="url(#labWall)"/>' +
      '<rect y="' + (DESK - 6) + '" width="720" height="' + (430 - DESK + 6) + '" fill="url(#labFloor)"/>' +
      '<g>' +
        '<rect x="486" y="52" width="176" height="140" rx="12" fill="#fffdf6" opacity=".95"/>' +
        '<rect x="494" y="60" width="160" height="124" rx="7" fill="' + winFill + '"/>' +
        '<path d="M494 122 H654 M574 60 V184" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M494 122 H654 M574 60 V184" stroke="#cdd8e6" stroke-width="1" opacity=".7"/>' +
        '<path d="M486 192 h176" stroke="#d8d1e0" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M486 52 q44 -26 88 0z" fill="#efe6f6" opacity=".8"/>' +
        (v.light < .35 ? '<path d="M520 74 l8 8 M600 100 l7 7 M540 140 l6 6 M620 150 l7 7" stroke="#ffffff" stroke-width="2" opacity=".75" stroke-linecap="round"/>' : '') +
      '</g>' +
      '<path d="M494 184 L654 184 L720 430 L360 430 Z" fill="url(#labBeam)"/>' +
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
      '<rect x="26" y="' + DESK + '" width="668" height="17" rx="8" fill="#ffffff"/>' +
      '<rect x="26" y="' + (DESK + 13) + '" width="668" height="9" rx="4" fill="#e6e0ee"/>' +
      '<rect x="62" y="' + (DESK + 22) + '" width="15" height="82" rx="5" fill="#ded6ea"/>' +
      '<rect x="643" y="' + (DESK + 22) + '" width="15" height="82" rx="5" fill="#ded6ea"/>' +
      '<rect x="26" y="' + (DESK + 8) + '" width="668" height="4" fill="#ffffff" opacity=".7"/>' +
      focusSvg(r, pal.accent) +
      (cold > 0 ? '<rect width="720" height="430" fill="#5b79d8" opacity="' + cold + '"/>' : '') +
      (hot > 0 ? '<rect width="720" height="430" fill="#ff8f52" opacity="' + hot + '" style="mix-blend-mode:multiply"/>' : '') +
      (dim > 0 ? '<rect width="720" height="430" fill="url(#labDark)" opacity="' + dim.toFixed(2) + '"/>' : '') +
      '<rect width="720" height="430" fill="url(#labVig)"/>' +
      effectsSvg() +
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
      var v = val(k.id), band = rangeOf(k.id);
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
  function whyHtml(){
    var j = judge(), s = subj();
    var bad = j.lines.filter(function(l){ return l.st !== 'ok'; });
    bad.sort(function(a, b){ return off(b) - off(a); });
    var tone = !bad.length ? 'good' : (bad.length <= 2 ? 'warn' : 'bad');
    var main = !bad.length
      ? 'Все условия попали в оптимум. ' + s.ok
      : 'Сильнее всего исход решило условие «' + bad[0].label.toLowerCase() + '» — ' + fmt(bad[0].v, { unit: bad[0].unit }) + '. ' + bad[0].text.charAt(0).toUpperCase() + bad[0].text.slice(1) + '.';
    var rows = j.lines.map(function(l){
      return '<div class="why-row ' + l.st + '"><span class="why-dot"></span><div class="why-txt">' +
        '<b>' + esc(l.label) + ' · ' + esc(fmt(l.v, { unit: l.unit })) + '</b>' +
        '<span class="why-band">норма ' + l.band[0] + '–' + l.band[1] + (l.unit === '%' ? ' %' : (l.unit === '°C' ? ' °C' : (l.unit === 'ч' ? ' ч' : ''))) + '</span>' +
        '<p>' + (l.st === 'ok' ? 'в норме — объект не тратит силы на защиту' : esc(l.text)) + '</p></div></div>';
    }).join('');
    var hint = bad.length
      ? 'Что попробовать: сдвинь «' + bad[0].label.toLowerCase() + '» в зону ' + bad[0].band[0] + '–' + bad[0].band[1] + ' и посмотри, как изменится картинка.'
      : 'Попробуй сломать одно условие — и увидишь, что именно оно держит.';
    return '<div class="lab-verdict ' + tone + ' lab-why">' +
      '<div class="lv-top"><b>Почему так получилось?</b>' +
        '<span class="lv-score">' + j.okN + ' из ' + j.total + ' условий в норме</span></div>' +
      '<p class="lv-main">' + esc(main) + '</p>' +
      '<div class="why-list">' + rows + '</div>' +
      '<p class="why-hint">' + esc(hint) + '</p>' +
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
    if (window.CC_PROFILE){
      var pf = window.CC_PROFILE.get();
      if (pf && pf.stats.lab < 10) window.CC_PROFILE.award('lab:' + Date.now(), 10, 'lab');
    }
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
        '<div class="lab-tools">' +
          '<button class="lab-tool" data-tool="free">✨ Свободный режим</button>' +
          '<button class="lab-tool" data-tool="clock">⏱ Ускорить время</button>' +
          '<button class="lab-tool" data-tool="trials">🎯 Испытания</button>' +
          '<span class="lab-clock">t = 0 ч</span>' +
        '</div>' +
      '</div>' +
      '<div class="lab-body">' +
        '<div class="lab-left">' +
          '<p class="lab-free-note">✨ <b>Свободный режим.</b> Правильного ответа нет: крути ползунки как хочешь и смотри, что происходит. Оценка условий спрятана — только наблюдение.</p>' +
          '<div class="lab-stage">' + sceneSvg() + '</div>' +
          '<div class="lab-result">' + whyHtml() + '</div>' +
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
    if (box) box.innerHTML = whyHtml();
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
    var toolBtn = t.closest ? t.closest('[data-tool]') : null;
    if (toolBtn){
      var tl = toolBtn.getAttribute('data-tool');
      if (tl === 'free'){
        var free = host.classList.toggle('free-mode');
        toolBtn.classList.toggle('on', free);
        toast(free ? 'Свободный режим: смотри и пробуй без оценки' : 'Обычный режим: условия оцениваются');
      } else if (tl === 'trials'){
        if (window.CC_TRIALS_OPEN) window.CC_TRIALS_OPEN();
      } else if (tl === 'clock'){
        state.clockOn = !state.clockOn;
        toolBtn.classList.toggle('on', state.clockOn);
        host.classList.toggle('clock-run', state.clockOn);
        toast(state.clockOn ? 'Время ускорено: 1 секунда = 2 часа' : 'Время остановлено');
      }
      return;
    }
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

  /* ---------- свободный режим и ускоренное время ---------- */
  state.clockOn = false; state.clockT = 0;
  function clockText(){
    var el = host.querySelector('.lab-clock');
    if (el) el.textContent = 't = ' + state.clockT.toFixed(0) + ' ч';
  }
  function tick(){
    if (!state.clockOn) return;
    state.clockT += 2;
    var kn = knobs(), tk = null;
    for (var i = 0; i < kn.length; i++) if (kn[i].id === 'time') tk = kn[i];
    if (tk){
      var v = Math.min(tk.max, (state.vals[state.room].time || tk.min) + 2);
      state.vals[state.room].time = v;
      refreshVerdict(); refreshScene();
    }
    clockText();
    if (state.clockT >= 96) {
      state.clockOn = false;
      host.classList.remove('clock-run');
      var b = host.querySelector('[data-tool="clock"]');
      if (b) b.classList.remove('on');
      toast('Опыт выдержан: прошло 96 часов');
    }
  }
  setInterval(tick, 1000);

  /* ---------- API для испытаний ---------- */
  window.CC_LAB_API = {
    room: function(){ return state.room; },
    setRoom: function(id){
      if (!LAB[id]) return;
      state.room = id; initRoom(id); build();
    },
    knobs: function(){
      return knobs().map(function(k){ return { id:k.id, label:k.label, unit:k.unit, min:k.min, max:k.max, step:k.step, def:k.def }; });
    },
    subjects: function(){
      return room().subjects.map(function(s){ return { id:s.id, n:s.n, i:s.i, face:s.face, ok:s.ok }; });
    },
    subject: function(){
      var s = subj();
      return { id:s.id, n:s.n, i:s.i, face:s.face, ok:s.ok };
    },
    setSubject: function(id){ state.subj[state.room] = id; },
    range: function(kid){ return rangeOf(kid).slice(); },
    value: function(kid){ return val(kid); },
    setValue: function(kid, v){
      state.vals[state.room][kid] = v;
      var inp = host.querySelector('[data-knob="' + kid + '"] input');
      if (inp) inp.value = v;
    },
    judge: function(){
      var j = judge();
      return { okN: j.okN, total: j.total, tone: j.tone,
        lines: j.lines.map(function(l){ return { id:l.id, label:l.label, unit:l.unit, v:l.v, st:l.st, band:l.band.slice(), text:l.text }; }) };
    },
    scene: function(){ return sceneSvg(); },
    colony: function(){ return colonyCount(vibe()); },
    reset: function(){ knobs().forEach(function(k){ state.vals[state.room][k.id] = k.def; }); },
    toast: toast
  };

  window.buildLab = function(){
    if (!LAB[state.room]) state.room = LAB.order[0];
    build();
    if (state.clockOn) host.classList.add('clock-run');
    var fb = host.querySelector('[data-tool="free"]');
    if (fb && host.classList.contains('free-mode')) fb.classList.add('on');
    clockText();
  };
})();
