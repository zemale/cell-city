/* Города внутри — сцена животного */
window.buildAnimalCity = function(){
  'use strict';
  var K = window.CITY_SCENES;
  var iso = K.iso, f = K.f, pg = K.pg, ell = K.ell, line = K.line, box = K.box, shadow = K.shadow, tag = K.tag, smoke = K.smoke, stars = K.stars, roads = K.roads;

  var PAL = {
    bone:  { roof: '#fbf5e8', left: '#d9cdb5', right: '#eee2ca' },
    heart: { roof: '#ffd6d6', left: '#c9455c', right: '#e0657a' },
    lung:  { roof: '#dff0fb', left: '#8fb6d4', right: '#aecfe8' },
    food:  { roof: '#ffe6c4', left: '#c9924f', right: '#e2b072' },
    filt:  { roof: '#d9f0ea', left: '#79b7a8', right: '#97cebf' },
    chem:  { roof: '#e8e0f7', left: '#8a76b8', right: '#a894d1' },
    skin:  { roof: '#f4dccb', left: '#c48a6b', right: '#dcab8a' },
    nerve: { roof: '#f0e6ff', left: '#7d6aa8', right: '#9b88c4' }
  };

  var nodes = [];
  function reg(k, id, svg, t){
    nodes.push({ k: k, s: '<g class="bldg" data-id="' + id + '">' + (t ? tag(t[0], t[1], t[2], t[3], t[4]) : '') + svg + '</g>' });
  }

  // остров — тело зверя
  var CX = 0, CY = 168, RX = 346, RY = 180;
  var ground = '';
  ground += '<ellipse cx="0" cy="182" rx="350" ry="184" fill="rgba(70,54,64,.13)"/>';
  ground += '<ellipse cx="0" cy="168" rx="' + RX + '" ry="' + RY + '" fill="url(#bodyGrad)"/>';
  ground += '<ellipse cx="-8" cy="158" rx="300" ry="150" fill="url(#bodyGrad2)" opacity=".6"/>';

  // дороги — кровеносные сосуды
  var vessels = '';
  var paths = [
    [[0.7, 9.4], [3.2, 7.9], [6.0, 7.4], [8.9, 7.9], [11.3, 9.4]],
    [[1.9, 5.0], [4.0, 6.6], [6.0, 7.4], [8.0, 6.7], [10.1, 5.2]],
    [[6.0, 2.4], [6.0, 4.8], [6.0, 7.4], [6.0, 9.6], [6.0, 11.0]]
  ];
  paths.forEach(function(pth, idx){
    var d = pth.map(function(q, i){ var t = iso(q[0], q[1], 1); return (i ? 'L' : 'M') + f(t[0]) + ' ' + f(t[1]); }).join(' ');
    vessels += '<path d="' + d + '" fill="none" stroke="rgba(255,248,240,.92)" stroke-width="9" stroke-linecap="round"/>';
    vessels += '<path d="' + d + '" fill="none" stroke="rgba(214,96,110,.28)" stroke-width="3.4" stroke-linecap="round"/>';
    if (idx < 2) vessels += '<path d="' + d + '" class="flow" fill="none" stroke="#f08a9b" stroke-width="1.6" stroke-linecap="round"/>';
  });

  // кожа — внешняя стена с башенками по кругу
  var skin = '';
  skin += '<ellipse cx="0" cy="168" rx="' + RX + '" ry="' + RY + '" fill="none" stroke="rgba(176,116,84,.38)" stroke-width="20"/>';
  skin += '<ellipse cx="0" cy="168" rx="' + RX + '" ry="' + RY + '" fill="none" class="wall" stroke-width="8"/>';
  for (var ki = 0; ki < 12; ki++){
    var ka = Math.PI * 2 * ki / 12 + 0.26;
    var kx = Math.cos(ka) * RX, ky = 168 + Math.sin(ka) * RY;
    skin += '<circle cx="' + f(kx) + '" cy="' + f(ky + 2) + '" r="9" fill="#c4855f"/>';
    skin += '<circle cx="' + f(kx) + '" cy="' + f(ky - 3) + '" r="6.4" fill="#d99b74"/>';
  }
  reg(-99, 'skin', skin, [0, 0, 0, '', '']);

  // кости — несущий каркас
  var bones = '';
  [[1.6, 7.2], [3.4, 4.4], [6.2, 3.2], [8.8, 4.8], [7.6, 8.8], [4.4, 9.4]].forEach(function(b){
    var p = iso(b[0], b[1], 0);
    bones += box(b[0], b[1], 0.34, 0.34, 22, PAL.bone, null);
    bones += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1] - 23) + '" r="3.4" fill="#fbf5e8"/>';
    bones += line(p[0], p[1] - 12, p[0] + 14, p[1] - 12, 'rgba(240,232,214,.75)', 4);
  });
  reg(4, 'bones', bones, [6.2, 3.2, 30, 'Кости', 'несущий каркас']);

  // мозг — мэрия на холме
  var brain = '';
  brain += shadow(1.4, 1.4, 2.6, 2.2);
  brain += box(1.4, 1.4, 2.6, 2.2, 6, { roof: '#f3ecff', left: '#b9a9d8', right: '#cfc1e8' }, null);
  brain += box(1.9, 1.9, 1.6, 1.4, 22, PAL.nerve, [2, 4], { lit: 0.8 });
  brain += box(1.75, 1.75, 1.9, 1.7, 2, { roof: '#efe6ff', left: '#a894cc', right: '#c2b0e0' }, null, { z0: 22 });
  var bc = iso(2.7, 2.6, 26);
  brain += ell(bc[0], bc[1], 15, 8, '#9d8ac6');
  brain += ell(bc[0] - 5, bc[1] - 4, 10, 7, '#b6a5da');
  brain += ell(bc[0] + 5, bc[1] - 3, 9, 6, '#8c78b2');
  brain += line(bc[0], bc[1] - 12, bc[0], bc[1] - 24, '#a894cc', 2.6);
  brain += '<circle class="blink" cx="' + f(bc[0]) + '" cy="' + f(bc[1] - 26) + '" r="3.2" fill="#d8c6ff"/>';
  reg(17, 'brain', brain, [2.7, 2.6, 44, 'Мозг', 'мэрия и диспетчерская']);

  // сердце — насосная станция
  var heart = '';
  var hb = iso(5.0, 6.0, 0);
  heart += shadow(4.0, 5.0, 2.6, 2.4);
  heart += box(4.1, 5.1, 2.4, 2.2, 12, PAL.heart, [2, 3], { lit: 0.75 });
  heart += box(4.25, 5.25, 2.1, 1.9, 1.2, { roof: '#ffe8e8', left: '#d4576e', right: '#ee7f92' }, null, { z0: 12 });
  var hc = iso(5.3, 6.2, 15);
  heart += ell(hc[0], hc[1], 17, 10, '#c9455c');
  heart += ell(hc[0] - 5, hc[1] - 5, 11, 8, '#e0657a');
  heart += ell(hc[0] + 6, hc[1] - 2, 9, 7, '#b83c52');
  heart += ell(hc[0], hc[1] - 12, 7, 5, '#f08a9b');
  heart += '<circle class="pulse" cx="' + f(hc[0]) + '" cy="' + f(hc[1] + 4) + '" r="6" fill="none" stroke="#ff9aa8" stroke-width="1.6"/>';
  var hp1 = iso(6.5, 6.6, 8), hp2 = iso(8.4, 6.4, 8), hp3 = iso(2.0, 6.6, 8);
  heart += '<path d="M' + f(hp1[0]) + ' ' + f(hp1[1]) + ' L' + f(hp2[0]) + ' ' + f(hp2[1]) + '" stroke="#c9455c" stroke-width="5" stroke-linecap="round"/>';
  heart += '<path d="M' + f(hp3[0]) + ' ' + f(hp3[1]) + ' L' + f(iso(4.2, 6.4, 8)[0]) + ' ' + f(iso(4.2, 6.4, 8)[1]) + '" stroke="#c9455c" stroke-width="5" stroke-linecap="round"/>';
  reg(9, 'heart', heart, [5.3, 6.2, 32, 'Сердце', 'насосная станция']);

  // лёгкие — воздухоочистка
  var lungs = '';
  [[3.2, 3.4], [7.0, 3.4]].forEach(function(l, i){
    lungs += shadow(l[0], l[1], 1.9, 1.9);
    lungs += box(l[0], l[1], 1.8, 1.8, 20, PAL.lung, [2, 4], { lit: 0.6 });
    lungs += box(l[0] - 0.15, l[1] - 0.15, 2.1, 2.1, 1.4, { roof: '#eaf7ff', left: '#a6c8e2', right: '#c4dff2' }, null, { z0: 20 });
    var c = iso(l[0] + 0.9, l[1] + 0.9, 22);
    lungs += '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="7" fill="#dff0fb" opacity=".9"/>';
    lungs += '<g class="fan" style="transform-origin:' + f(c[0]) + 'px ' + f(c[1]) + 'px"><rect x="' + f(c[0] - 1) + '" y="' + f(c[1] - 7) + '" width="2" height="14" fill="#8fb6d4"/><rect x="' + f(c[0] - 7) + '" y="' + f(c[1] - 1) + '" width="14" height="2" fill="#8fb6d4"/></g>';
  });
  var lt = iso(5.2, 4.3, 10);
  lungs += line(iso(4.1, 4.3, 10)[0], iso(4.1, 4.3, 10)[1], lt[0], lt[1], '#a6c8e2', 3);
  lungs += line(iso(7.9, 4.3, 10)[0], iso(7.9, 4.3, 10)[1], lt[0], lt[1], '#a6c8e2', 3);
  reg(11, 'lungs', lungs, [5.2, 4.2, 34, 'Лёгкие', 'воздухоочистка']);

  // желудок — пищевой комбинат
  var stomach = '';
  stomach += shadow(7.8, 6.6, 2.2, 2.0);
  stomach += box(7.9, 6.7, 2.0, 1.8, 10, PAL.food, [2, 3], { lit: 0.7 });
  stomach += box(8.2, 7.0, 1.4, 1.2, 5, { roof: '#fff0da', left: '#d9a869', right: '#eec38c' }, null, { z0: 10 });
  stomach += smoke(iso(8.9, 7.6, 17)[0], iso(8.9, 7.6, 17)[1], 4);
  stomach += box(8.4, 6.75, 0.5, 0.5, 10, { roof: '#ffe9cc', left: '#c9924f', right: '#e0b176' }, null, { z0: 15 });
  for (var si = 0; si < 3; si++){
    stomach += ell(iso(8.9, 7.6, 21 + si * 4)[0], iso(8.9, 7.6, 21 + si * 4)[1], 5 + si * 2, 3 + si, '#e2b072', 'opacity="' + (0.45 - si * 0.1) + '"');
  }
  reg(13, 'stomach', stomach, [8.9, 7.6, 26, 'Желудок', 'пищевой комбинат']);

  // кишечник — длинный конвейер
  var gut = '';
  var gpts = [[7.2, 9.6], [8.6, 9.0], [9.8, 9.6], [9.2, 10.3], [7.8, 10.3], [6.8, 9.9]];
  var gd = gpts.map(function(p, i){ var q = iso(p[0], p[1], 4); return (i ? 'L' : 'M') + f(q[0]) + ' ' + f(q[1]); }).join(' ');
  gut += '<path d="' + gd + '" fill="none" stroke="rgba(150,110,70,.3)" stroke-width="10" stroke-linecap="round"/>';
  gut += '<path d="' + gd + '" class="flow" fill="none" stroke="#ffb26b" stroke-width="5" stroke-linecap="round"/>';
  gpts.forEach(function(p){
    gut += box(p[0] - 0.25, p[1] - 0.25, 0.5, 0.5, 4, { roof: '#ffe0b8', left: '#b9813f', right: '#d7a05c' }, null);
  });
  reg(15, 'intestine', gut, [8.2, 9.9, 16, 'Кишечник', 'длинный конвейер']);

  // почки — водоочистные фильтры
  var kidneys = '';
  [[2.4, 8.6], [3.6, 8.9]].forEach(function(k){
    kidneys += shadow(k[0], k[1], 0.9, 0.9);
    kidneys += box(k[0], k[1], 0.85, 0.85, 9, PAL.filt, [1, 2], { lit: 0.7 });
    kidneys += ell(iso(k[0] + 0.42, k[1] + 0.42, 9)[0], iso(k[0] + 0.42, k[1] + 0.42, 9)[1], 8, 5, '#9ed2c5');
    var w = iso(k[0] + 0.42, k[1] + 0.42, 3);
    kidneys += line(w[0], w[1], w[0], w[1] + 9, '#8fc9bb', 2.4);
  });
  reg(7, 'kidneys', kidneys, [3.0, 8.75, 20, 'Почки', 'водоочистные фильтры']);

  // печень — химический завод
  var liver = '';
  liver += shadow(9.4, 3.2, 2.2, 2.0);
  liver += box(9.5, 3.3, 2.0, 1.8, 12, PAL.chem, [2, 3], { lit: 0.65 });
  var lc2 = iso(10.1, 3.8, 12);
  liver += ell(lc2[0], lc2[1], 10, 6, '#a894d1');
  liver += ell(lc2[0], lc2[1] - 6, 6.5, 4.4, '#c2b0e0');
  liver += box(9.7, 3.5, 0.7, 0.7, 5, { roof: '#f1ecff', left: '#9b88c4', right: '#b6a5da' }, null, { z0: 14 });
  liver += smoke(iso(10.05, 3.85, 21)[0], iso(10.05, 3.85, 21)[1], 3);
  reg(19, 'liver', liver, [10.4, 4.0, 28, 'Печень', 'химический завод']);

  // мышцы — краны и тягачи
  var muscles = '';
  [[1.2, 5.6], [9.6, 8.2], [10.4, 5.4]].forEach(function(m, i){
    var p = iso(m[0], m[1], 0);
    muscles += box(m[0], m[1], 0.9, 0.7, 5, { roof: '#fbe3d2', left: '#c98a66', right: '#e5ab84' }, null);
    muscles += line(p[0], p[1] - 6, p[0] + 12, p[1] - 26, '#d98f6a', 3);
    muscles += line(p[0] + 12, p[1] - 26, p[0] + 26, p[1] - 30, '#d98f6a', 2.4);
    muscles += line(p[0] + 26, p[1] - 30, p[0] + 26, p[1] - 18, 'rgba(180,120,90,.7)', 1.2);
    muscles += box(m[0] + 1.1, m[1] - 0.4, 0.5, 0.5, 0.9, { roof: '#ffe0b8', left: '#b9813f', right: '#d7a05c' }, null, { z0: 6 });
  });
  reg(6, 'muscles', muscles, [9.6, 8.2, 34, 'Мышцы', 'краны и тягачи']);

  // кровь — транспортная сеть
  var blood = '';
  [[-6.2, 6.4], [-3.0, 7.6], [1.4, 8.2], [5.6, 8.4], [8.6, 8.0]].forEach(function(b, i){
    var p = iso(b[0] + 6, b[1] - 4, 1);
    blood += '<circle class="blink" style="animation-delay:' + (i * 0.6).toFixed(1) + 's" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="4" fill="#e0657a" opacity=".75"/>';
  });
  reg(3, 'blood', blood, null);

  // декор: деревья
  var deco = '';
  [[0.9, 7.6], [10.8, 7.4], [5.6, 0.9], [2.6, 10.6], [9.0, 10.4], [11.0, 4.0]].forEach(function(t, i){
    var p = iso(t[0], t[1], 0);
    deco += '<g class="leaf" style="animation-delay:' + (i * 0.4).toFixed(1) + 's"><rect x="' + f(p[0] - 1) + '" y="' + f(p[1] - 8) + '" width="2" height="8" fill="#a98a6c"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1] - 14) + '" r="6.5" fill="#8cbf93"/><circle cx="' + f(p[0] - 4) + '" cy="' + f(p[1] - 11) + '" r="4.4" fill="#a3d0a8"/></g>';
  });
  nodes.push({ k: 200, s: deco });

  nodes.sort(function(a, b){ return a.k - b.k; });

  var defs = '<defs>' +
    '<linearGradient id="bodyGrad" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#ffefe2"/><stop offset="0.55" stop-color="#f7ddc8"/><stop offset="1" stop-color="#e8c4a8"/></linearGradient>' +
    '<linearGradient id="bodyGrad2" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#fff7ee"/><stop offset="1" stop-color="#f3d4bd"/></linearGradient>' +
    '<linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2a884"/><stop offset="1" stop-color="#c07f5e"/></linearGradient>' +
    '</defs>';

  var svg = K.svg(defs, stars() + ground + vessels + nodes.map(function(n){ return n.s; }).join(''), '-360 -95 720 480');
  K.mount(svg, window.ANIMAL_DATA.organs);
};
