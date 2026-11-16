/* Города внутри — сцена человека */
window.buildHumanCity = function(){
  'use strict';
  var K = window.CITY_SCENES;
  var iso = K.iso, f = K.f, pg = K.pg, ell = K.ell, line = K.line, box = K.box, shadow = K.shadow, tag = K.tag, smoke = K.smoke, stars = K.stars, roads = K.roads;

  var PAL = {
    brain:  { roof: '#f7e4f3', left: '#a98ac2', right: '#c8a9dd' },
    nerve:  { roof: '#eef0ff', left: '#7d7fbf', right: '#9d9fdd' },
    eye:    { roof: '#dff3ff', left: '#6fa8c8', right: '#93c8e2' },
    ear:    { roof: '#ffe9d6', left: '#c98f5f', right: '#e5b183' },
    voice:  { roof: '#ffe0ef', left: '#c1719e', right: '#e097bd' },
    heart:  { roof: '#ffd9d9', left: '#c94b62', right: '#e46b80' },
    lung:   { roof: '#e2f4fd', left: '#7faed2', right: '#a2cbe6' },
    food:   { roof: '#ffe9c3', left: '#c99050', right: '#e3b473' },
    gut:    { roof: '#f6e0c6', left: '#b07f4f', right: '#cb9d6c' },
    chem:   { roof: '#e9e2fb', left: '#8b77bb', right: '#a693d3' },
    filt:   { roof: '#d9f2ec', left: '#74b3a4', right: '#94cbbc' },
    bone:   { roof: '#fdf8ec', left: '#cfc3a8', right: '#e6dbc2' },
    muscle: { roof: '#ffe1d8', left: '#c67a63', right: '#dd9a85' },
    skin:   { roof: '#fbe6d8', left: '#c08f74', right: '#d9ae94' },
    hand:   { roof: '#f1ead9', left: '#b6a184', right: '#cdbc9e' }
  };

  var nodes = [];
  function reg(k, id, svg, t){
    nodes.push({ k: k, s: '<g class="bldg" data-id="' + id + '">' + svg + (t ? tag(t[0], t[1], t[2], t[3], t[4]) : '') + '</g>' });
  }
  function at(x, y, z){ return iso(x, y, z || 0); }

  // остров-тело
  var ground = '';
  ground += '<ellipse cx="0" cy="178" rx="338" ry="182" fill="rgba(70,54,64,.14)"/>';
  ground += '<ellipse class="island-top" cx="0" cy="158" rx="330" ry="172" fill="url(#groundGrad)"/>';
  ground += '<ellipse cx="0" cy="142" rx="286" ry="144" fill="url(#groundGrad2)" opacity=".55"/>';

  // кожа — стена с датчиками по периметру
  var skin = '';
  skin += '<ellipse class="wall" cx="0" cy="158" rx="322" ry="166" fill="none"/>';
  for (var si = 0; si < 22; si++){
    var ang = (si / 22) * Math.PI * 2;
    var sx = Math.cos(ang) * 318, sy = 158 + Math.sin(ang) * 162;
    skin += '<circle class="blink" style="animation-delay:' + (si * 0.18).toFixed(1) + 's" cx="' + f(sx) + '" cy="' + f(sy) + '" r="3.4" fill="#ffd9a8" stroke="#b8704f" stroke-width="1"/>';
  }
  skin += '<rect x="' + f(-26) + '" y="' + f(314) + '" width="52" height="16" rx="5" fill="#d9ae94" stroke="#b8704f" stroke-width="2"/>';
  skin += '<circle class="blink" cx="0" cy="322" r="3" fill="#ffe6b0"/>';
  reg(1, 'skin', skin, [1.4, 11.2, 10, 'Кожа', 'стена и термоизоляция']);

  // нервы — сеть связи, оптоволокно
  var nerves = '';
  var hub = at(3.2, 3.6, 0);
  [[5.4, 2.4], [2.2, 5.8], [5.2, 6.2], [4.2, 7.8], [8.4, 3.4], [8.7, 7.4]].forEach(function(p){
    var q = at(p[0], p[1], 0);
    nerves += '<path class="flow" d="M' + f(hub[0]) + ' ' + f(hub[1] - 6) + ' L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="#8d86c9" stroke-width="2.4" fill="none" opacity=".55"/>';
  });
  nerves += box(3.0, 3.4, 0.8, 0.8, 12, PAL.nerve, [2, 2]);
  var nh = at(3.4, 3.8, 12);
  nerves += '<circle cx="' + f(nh[0]) + '" cy="' + f(nh[1]) + '" r="4" fill="#c9c5ff" class="blink"/>';
  reg(2, 'nerves', nerves, [2.8, 3.2, 20, 'Нервы', 'сеть связи']);

  // мозг — мэрия и диспетчерская на холме
  var brain = '';
  var bc = at(5.4, 2.4, 0);
  brain += ell(bc[0], bc[1] + 8, 98, 46, 'rgba(208,180,168,.45)');
  brain += shadow(4.4, 1.4, 2.0, 2.0);
  brain += box(4.4, 1.4, 2.0, 2.0, 22, PAL.brain, [3, 2]);
  var bt = at(5.4, 2.4, 22);
  brain += ell(bt[0], bt[1], 28, 14, '#e8d0ef');
  brain += '<path d="M' + f(bt[0] - 26) + ' ' + f(bt[1] - 2) + ' Q' + f(bt[0]) + ' ' + f(bt[1] - 44) + ' ' + f(bt[0] + 26) + ' ' + f(bt[1] - 2) + '" fill="#c8a9dd"/>';
  brain += '<path d="M' + f(bt[0] - 20) + ' ' + f(bt[1] - 4) + ' Q' + f(bt[0]) + ' ' + f(bt[1] - 34) + ' ' + f(bt[0] + 20) + ' ' + f(bt[1] - 4) + '" fill="#ddc4ec" opacity=".8"/>';
  brain += box(6.0, 1.0, 0.6, 0.6, 38, PAL.brain, null);
  var ba = at(6.3, 1.3, 38);
  brain += '<line x1="' + f(ba[0]) + '" y1="' + f(ba[1]) + '" x2="' + f(ba[0]) + '" y2="' + f(ba[1] - 12) + '" stroke="#8a76b8" stroke-width="2"/>';
  brain += '<circle class="blink" cx="' + f(ba[0]) + '" cy="' + f(ba[1] - 14) + '" r="3.2" fill="#ffcf8a"/>';
  reg(3, 'brain', brain, [5.4, 2.4, 46, 'Мозг', 'мэрия и диспетчерская']);

  // речь — радиостанция с волнами
  var speech = '';
  speech += shadow(8.1, 3.1, 0.8, 0.8);
  speech += box(8.1, 3.1, 0.8, 0.8, 46, PAL.voice, [1, 3]);
  var sp = at(8.5, 3.5, 46);
  for (var wi = 1; wi <= 3; wi++){
    speech += '<circle class="blink" style="animation-delay:' + (wi * 0.5).toFixed(1) + 's" cx="' + f(sp[0]) + '" cy="' + f(sp[1]) + '" r="' + (10 + wi * 11) + '" fill="none" stroke="#c1719e" stroke-width="1.6" opacity="' + (0.45 - wi * 0.1) + '"/>';
  }
  speech += '<line x1="' + f(sp[0]) + '" y1="' + f(sp[1]) + '" x2="' + f(sp[0]) + '" y2="' + f(sp[1] - 18) + '" stroke="#8d4a72" stroke-width="2.4"/>';
  speech += '<circle class="blink" cx="' + f(sp[0]) + '" cy="' + f(sp[1] - 20) + '" r="4" fill="#ffb3d4"/>';
  reg(4, 'speech', speech, [8.5, 3.5, 58, 'Речь', 'радиостанция']);

  // глаза — обсерватория на краю
  var eyes = '';
  var ec = at(2.2, 5.8, 0);
  eyes += ell(ec[0], ec[1] + 4, 54, 26, 'rgba(190,206,214,.4)');
  eyes += box(1.7, 5.3, 1.0, 1.0, 16, PAL.eye, [2, 1]);
  var et = at(2.2, 5.8, 16);
  eyes += ell(et[0], et[1], 21, 10, '#a2cbe6');
  eyes += '<path d="M' + f(et[0] - 20) + ' ' + f(et[1] - 2) + ' Q' + f(et[0]) + ' ' + f(et[1] - 30) + ' ' + f(et[0] + 20) + ' ' + f(et[1] - 2) + '" fill="#93c8e2"/>';
  eyes += '<line x1="' + f(et[0]) + '" y1="' + f(et[1] - 12) + '" x2="' + f(et[0] + 30) + '" y2="' + f(et[1] - 30) + '" stroke="#4b7d9b" stroke-width="7" stroke-linecap="round"/>';
  eyes += '<circle cx="' + f(et[0] + 31) + '" cy="' + f(et[1] - 31) + '" r="4.4" fill="#dff3ff" opacity=".9"/>';
  reg(5, 'eyes', eyes, [2.0, 5.6, 30, 'Глаза', 'обсерватория']);

  // уши — акустическая вышка с тарелкой
  var ears = '';
  ears += shadow(9.3, 5.1, 0.8, 0.8);
  ears += box(9.3, 5.1, 0.8, 0.8, 26, PAL.ear, [1, 2]);
  var eh = at(9.7, 5.5, 26);
  ears += '<path d="M' + f(eh[0] - 20) + ' ' + f(eh[1]) + ' Q' + f(eh[0] - 2) + ' ' + f(eh[1] - 26) + ' ' + f(eh[0] + 22) + ' ' + f(eh[1] - 4) + '" fill="none" stroke="#c98f5f" stroke-width="4" stroke-linecap="round"/>';
  ears += '<line x1="' + f(eh[0]) + '" y1="' + f(eh[1] - 8) + '" x2="' + f(eh[0] + 8) + '" y2="' + f(eh[1] + 8) + '" stroke="#a06e43" stroke-width="3"/>';
  ears += '<circle class="blink" cx="' + f(eh[0] + 8) + '" cy="' + f(eh[1] + 10) + '" r="3" fill="#ffd08a"/>';
  reg(6, 'ears', ears, [9.6, 5.4, 34, 'Уши', 'акустическая вышка']);

  // сердце — насосная станция
  var heart = '';
  heart += shadow(4.6, 5.6, 1.6, 1.6);
  heart += box(4.6, 5.6, 1.6, 1.6, 20, PAL.heart, [2, 2]);
  var hc = at(5.4, 6.4, 20);
  heart += ell(hc[0], hc[1], 22, 11, '#e46b80');
  heart += ell(hc[0], hc[1] - 3, 16, 8, '#f58ea1');
  heart += '<circle class="blink" cx="' + f(hc[0]) + '" cy="' + f(hc[1] - 12) + '" r="4.6" fill="#ffe0a3"/>';
  var hp1 = at(4.6, 6.2, 10), hp2 = at(6.4, 6.6, 10);
  heart += '<path class="flow" d="M' + f(hp1[0] - 30) + ' ' + f(hp1[1]) + ' L' + f(hp1[0]) + ' ' + f(hp1[1]) + '" stroke="#e0657a" stroke-width="6" fill="none" stroke-linecap="round"/>';
  heart += '<path class="flow" d="M' + f(hp2[0]) + ' ' + f(hp2[1]) + ' L' + f(hp2[0] + 34) + ' ' + f(hp2[1] + 6) + '" stroke="#e0657a" stroke-width="6" fill="none" stroke-linecap="round"/>';
  for (var hi = 0; hi < 4; hi++){
    heart += '<circle class="blink" style="animation-delay:' + (hi * 0.4).toFixed(1) + 's" cx="' + f(hp1[0] - 24 + hi * 8) + '" cy="' + f(hp1[1] + 8 + hi * 2) + '" r="3" fill="#c94b62" opacity=".8"/>';
  }
  reg(7, 'heart', heart, [5.4, 6.4, 34, 'Сердце', 'насосная станция']);

  // лёгкие — две воздухоочистные башни
  var lungs = '';
  [[4.0, 7.6], [6.4, 7.6]].forEach(function(p, li){
    lungs += shadow(p[0], p[1], 1.0, 1.0);
    lungs += box(p[0], p[1], 1.0, 1.0, 30, PAL.lung, [1, 3]);
    var lt = at(p[0] + 0.5, p[1] + 0.5, 30);
    lungs += ell(lt[0], lt[1], 13, 6.5, '#cfe9f8');
    lungs += '<circle cx="' + f(lt[0]) + '" cy="' + f(lt[1]) + '" r="5" fill="#8fb6d4" class="blink" style="animation-delay:' + (li * 0.7).toFixed(1) + 's"/>';
    lungs += smoke(lt[0], lt[1] - 12, 2);
  });
  reg(8, 'lungs', lungs, [5.2, 7.6, 44, 'Лёгкие', 'воздухоочистная станция']);

  // желудок — пищевой комбинат
  var stomach = '';
  var sc = at(4.8, 8.9, 0);
  stomach += shadow(4.3, 8.4, 1.4, 1.4);
  stomach += box(4.3, 8.4, 1.4, 1.4, 16, PAL.food, [2, 2]);
  stomach += ell(sc[0], sc[1] - 18, 24, 13, '#e3b473');
  stomach += ell(sc[0], sc[1] - 22, 18, 9, '#f2cb92');
  stomach += '<path d="M' + f(sc[0] - 30) + ' ' + f(sc[1] - 6) + ' L' + f(sc[0] - 12) + ' ' + f(sc[1] - 6) + '" stroke="#c99050" stroke-width="5" stroke-linecap="round"/>';
  stomach += smoke(sc[0] + 8, sc[1] - 36, 3);
  reg(9, 'stomach', stomach, [4.8, 8.9, 30, 'Желудок', 'пищевой комбинат']);

  // кишечник — длинный конвейер
  var gut = '';
  var gpts = [[6.2, 9.0], [7.0, 9.6], [7.8, 9.2], [8.0, 10.0], [7.2, 10.3], [6.4, 10.0]];
  var gd = gpts.map(function(p, i){ var q = at(p[0], p[1], 4); return (i ? 'L' : 'M') + f(q[0]) + ' ' + f(q[1]); }).join(' ');
  gut += '<path d="' + gd + '" fill="none" stroke="#b07f4f" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>';
  gut += '<path class="flow" d="' + gd + '" fill="none" stroke="#f6e0c6" stroke-width="4" stroke-linejoin="round"/>';
  gpts.forEach(function(p){
    var q = at(p[0], p[1], 0);
    gut += '<rect x="' + f(q[0] - 2) + '" y="' + f(q[1] - 4) + '" width="4" height="10" fill="#9c6b40"/>';
  });
  reg(10, 'intestine', gut, [7.4, 9.8, 24, 'Кишечник', 'длинный конвейер']);

  // печень — химический завод
  var liver = '';
  liver += shadow(8.4, 7.0, 1.4, 1.2);
  liver += box(8.4, 7.0, 1.4, 1.2, 18, PAL.chem, [2, 2]);
  var lc = at(9.1, 7.6, 18);
  liver += ell(lc[0], lc[1], 20, 10, '#a693d3');
  liver += ell(lc[0], lc[1] - 4, 14, 7, '#c2b0e0');
  liver += box(8.8, 8.0, 0.6, 0.6, 26, PAL.chem, null);
  var lch = at(9.1, 8.3, 26);
  liver += smoke(lch[0], lch[1], 3);
  liver += '<line x1="' + f(lc[0] + 18) + '" y1="' + f(lc[1] + 4) + '" x2="' + f(lc[0] + 34) + '" y2="' + f(lc[1] + 12) + '" stroke="#8b77bb" stroke-width="4" opacity=".6"/>';
  reg(11, 'liver', liver, [8.9, 7.4, 34, 'Печень', 'химический завод']);

  // почки — водоочистные фильтры
  var kidneys = '';
  [[9.2, 9.0], [10.2, 8.4]].forEach(function(p, ki){
    kidneys += shadow(p[0], p[1], 0.9, 0.9);
    kidneys += box(p[0], p[1], 0.9, 0.9, 22, PAL.filt, [1, 2]);
    var kt = at(p[0] + 0.45, p[1] + 0.45, 22);
    kidneys += ell(kt[0], kt[1], 12, 6, '#c7e8e0');
    kidneys += '<circle cx="' + f(kt[0]) + '" cy="' + f(kt[1]) + '" r="3.6" fill="#74b3a4" class="blink" style="animation-delay:' + (ki * 0.5).toFixed(1) + 's"/>';
  });
  reg(12, 'kidneys', kidneys, [9.7, 8.8, 32, 'Почки', 'водоочистные фильтры']);

  // кости — несущий каркас
  var bones = '';
  var bx0 = 2.1, by0 = 8.9;
  for (var bi = 0; bi < 3; bi++){
    bones += box(bx0 + bi * 0.9, by0, 0.22, 0.22, 30, PAL.bone, null);
  }
  var top1 = at(bx0 + 0.11, by0 + 0.11, 30), top2 = at(bx0 + 1.91, by0 + 0.11, 30);
  bones += '<line x1="' + f(top1[0]) + '" y1="' + f(top1[1]) + '" x2="' + f(top2[0]) + '" y2="' + f(top2[1]) + '" stroke="#cfc3a8" stroke-width="4"/>';
  bones += '<line x1="' + f(top1[0]) + '" y1="' + f(top1[1]) + '" x2="' + f(top2[0]) + '" y2="' + f(top2[1] + 22) + '" stroke="#e6dbc2" stroke-width="2" opacity=".85"/>';
  bones += '<line x1="' + f(top1[0]) + '" y1="' + f(top1[1] + 12) + '" x2="' + f(top2[0]) + '" y2="' + f(top2[1] + 30) + '" stroke="#cfc3a8" stroke-width="2.4"/>';
  reg(13, 'bones', bones, [2.4, 8.9, 36, 'Кости', 'несущий каркас']);

  // мышцы — тягачи и краны
  var muscles = '';
  [[1.4, 7.0], [2.4, 6.4]].forEach(function(p, mi){
    var mc = at(p[0], p[1], 0);
    muscles += shadow(p[0], p[1], 0.5, 0.5);
    muscles += box(p[0], p[1], 0.5, 0.5, 26, PAL.muscle, null);
    muscles += '<line x1="' + f(mc[0]) + '" y1="' + f(mc[1] - 26) + '" x2="' + f(mc[0] + 26) + '" y2="' + f(mc[1] - 38) + '" stroke="#c67a63" stroke-width="3"/>';
    muscles += '<line x1="' + f(mc[0] + 26) + '" y1="' + f(mc[1] - 38) + '" x2="' + f(mc[0] + 26) + '" y2="' + f(mc[1] - 22) + '" stroke="#a55f4b" stroke-width="1.4"/>';
    muscles += '<rect x="' + f(mc[0] + 23) + '" y="' + f(mc[1] - 22) + '" width="6" height="5" fill="#dd9a85"/>';
  });
  muscles += box(1.6, 8.0, 0.9, 0.55, 7, PAL.muscle, [2, 1]);
  reg(14, 'muscles', muscles, [1.8, 7.0, 34, 'Мышцы', 'тягачи и краны']);

  // руки — мастерские у границы
  var hands = '';
  [[9.8, 10.4], [10.6, 9.9], [10.2, 10.9]].forEach(function(p, hi2){
    hands += shadow(p[0], p[1], 0.8, 0.8);
    hands += box(p[0], p[1], 0.8, 0.8, 12, PAL.hand, [2, 1]);
    var ht = at(p[0] + 0.4, p[1] + 0.4, 12);
    hands += '<path d="M' + f(ht[0] - 10) + ' ' + f(ht[1]) + ' L' + f(ht[0] - 4) + ' ' + f(ht[1] - 8) + ' L' + f(ht[0] + 2) + ' ' + f(ht[1]) + ' L' + f(ht[0] + 8) + ' ' + f(ht[1] - 8) + ' L' + f(ht[0] + 12) + ' ' + f(ht[1]) + ' Z" fill="#cdbc9e"/>';
    if (hi2 === 0) hands += '<circle class="blink" cx="' + f(ht[0]) + '" cy="' + f(ht[1] - 12) + '" r="2.6" fill="#ffd08a"/>';
  });
  reg(15, 'hands', hands, [10.2, 10.4, 26, 'Руки', 'мастерские']);

  // декор: деревья по краю
  var deco = '';
  [[1.0, 6.8], [10.9, 6.4], [4.0, 1.4], [6.9, 1.8], [3.2, 10.7], [9.4, 4.2]].forEach(function(t, di){
    var p = at(t[0], t[1], 0);
    deco += '<g class="leaf" style="animation-delay:' + (di * 0.4).toFixed(1) + 's"><rect x="' + f(p[0] - 1) + '" y="' + f(p[1] - 8) + '" width="2" height="8" fill="#a98a6c"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1] - 14) + '" r="6.5" fill="#8cbf93"/><circle cx="' + f(p[0] - 4) + '" cy="' + f(p[1] - 11) + '" r="4.4" fill="#a3d0a8"/></g>';
  });

  nodes.sort(function(a, b){ return a.k - b.k; });

  var defs = '<defs>' +
    '<linearGradient id="groundGrad" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#fff0e4"/><stop offset="0.55" stop-color="#f8dfcc"/><stop offset="1" stop-color="#eccab4"/></linearGradient>' +
    '<linearGradient id="groundGradNight" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#3a3154"/><stop offset="1" stop-color="#2a2440"/></linearGradient>' +
    '<linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0a887"/><stop offset="1" stop-color="#bf8468"/></linearGradient>' +
    '</defs>';

  var svg = K.svg(defs, stars() + ground + roads([[1.2, 2.4], [10.6, 2.6], [10.9, 10.2], [1.4, 10.4], [1.2, 2.4]], { stroke: 'rgba(255,246,235,.85)', lane: 'rgba(198,158,118,.42)' }) + nodes.map(function(n){ return n.s; }).join('') + deco, '-360 -95 720 480');
  K.mount(svg, window.HUMAN_DATA.organs);
};
