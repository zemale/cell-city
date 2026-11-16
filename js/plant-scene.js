/* Города внутри — сцена растения */
window.buildPlantCity = function(){
  'use strict';
  var K = window.CITY_SCENES;
  var iso = K.iso, f = K.f, pg = K.pg, ell = K.ell, line = K.line, box = K.box, shadow = K.shadow, tag = K.tag, smoke = K.smoke, stars = K.stars, roads = K.roads;

  var P = {
    stem:  { roof: '#e6f3d6', left: '#6fa87c', right: '#8dc497' },
    leaf:  { roof: '#cfeac9', left: '#6cab77', right: '#8ac78c' },
    sugar: { roof: '#eef5dc', left: '#8aab6e', right: '#aac88e' },
    water: { roof: '#d9edfb', left: '#7fa9d3', right: '#9dc4e6' },
    petal: { roof: '#ffe7f0', left: '#d98cae', right: '#f0aac6' },
    wood:  { roof: '#f1ddc3', left: '#b9906a', right: '#d1ac85' },
    seed:  { roof: '#f5edda', left: '#c3ac85', right: '#ddc9a6' },
    soil:  { roof: '#e7d3b6', left: '#a98a63', right: '#c2a37c' }
  };

  var nodes = [];
  function reg(k, id, svg, t){
    nodes.push({ k: k, s: '<g class="bldg" data-id="' + id + '">' + (t ? tag(t[0], t[1], t[2], t[3], t[4]) : '') + svg + '</g>' });
  }

  var ground = '';
  ground += pg([iso(0.2, 0.2), iso(11.8, 0.2), iso(11.8, 11.8), iso(0.2, 11.8)], 'rgba(58,84,52,.16)');
  ground += pg([iso(0, 0), iso(12, 0), iso(12, 12), iso(0, 12)], 'url(#groundGrad)', 'class="island-top"');

  var paths = '';
  paths += roads([[0.9, 10.9], [4.6, 7.2], [6.0, 5.8], [11.1, 0.9]], { stroke: 'rgba(255,251,235,.95)', lane: 'rgba(150,175,120,.45)' });
  paths += roads([[1.2, 5.2], [5.2, 5.2], [9.4, 5.2]], { stroke: 'rgba(255,251,235,.95)', lane: 'rgba(150,175,120,.45)' });
  paths += roads([[6.0, 1.2], [6.0, 5.4], [6.0, 11.0]], { stroke: 'rgba(255,251,235,.95)', lane: 'rgba(150,175,120,.45)' });

  // живая изгородь вместо каменной стены
  var hp = [[0.6, 0.6], [11.4, 0.6], [11.4, 11.4], [0.6, 11.4], [0.6, 0.6]];
  var hd = hp.map(function(p, i){ var q = iso(p[0], p[1], 5); return (i ? 'L' : 'M') + f(q[0]) + ' ' + f(q[1]); }).join(' ');
  var walls = '<path d="' + hd + '" fill="none" stroke="rgba(52,84,48,.2)" stroke-width="18" stroke-linejoin="round"/>';
  walls += '<path d="' + hd + '" class="wall" fill="none"/>';
  [[0.6, 0.6], [11.4, 0.6], [11.4, 11.4], [0.6, 11.4]].forEach(function(c){
    var q = iso(c[0], c[1], 8);
    walls += ell(q[0], q[1], 12, 9, '#7fb886');
    walls += ell(q[0] - 6, q[1] - 5, 8, 6, '#93c99a');
    walls += ell(q[0] + 6, q[1] - 4, 7, 5.5, '#6fa97a');
  });
  walls += box(5.05, 11.0, 1.9, 0.75, 14, P.wood, null, { lit: 0.7 });
  walls += ell(iso(6.0, 11.4, 15)[0], iso(6.0, 11.4, 15)[1], 13, 5, '#e8d6bb');
  reg(-99, 'membraneless', walls, [6.0, 11.4, 22, 'Живая изгородь', 'внешняя граница']);

  // корень — водозабор
  var roots = '';
  [[[1.0, 8.6], [0.4, 9.6], [1.3, 10.3]], [[2.4, 8.5], [3.2, 9.2], [2.8, 10.4]], [[1.6, 9.9], [2.1, 10.7], [1.9, 11.3]], [[2.9, 9.6], [3.7, 10.1], [3.5, 10.9]]].forEach(function(r){
    var d = r.map(function(p, i){ var q = iso(p[0], p[1], 1); return (i ? 'Q' : 'M') + f(q[0]) + ' ' + f(q[1]); }).join(' ');
    roots += '<path d="' + d + '" fill="none" stroke="#b08d63" stroke-width="3.4" stroke-linecap="round" opacity=".85"/>';
    roots += '<path d="' + d + '" fill="none" stroke="#c9a884" stroke-width="1.4" stroke-linecap="round"/>';
  });
  var rt = roots + shadow(1.0, 8.9, 2.1, 1.9);
  rt += box(1.1, 9.0, 2.0, 1.8, 6, P.wood, [2, 1], { lit: 0.6 });
  rt += box(1.5, 9.4, 1.2, 1.0, 4.5, { roof: '#d6ebf8', left: '#7ea8ca', right: '#9cc2df' }, null, { z0: 6 });
  var rp = iso(2.1, 9.9, 10);
  rt += line(rp[0], rp[1], rp[0], rp[1] + 14, '#8fb6d6', 5, 'stroke-linecap="round"');
  rt += '<circle class="blink" cx="' + f(rp[0]) + '" cy="' + f(rp[1] + 2) + '" r="3" fill="#69a8d8"/>';
  reg(9.5, 'root', rt, [2.1, 9.9, 18, 'Корень', 'водозабор']);

  // ксилема — водовод
  var xy = shadow(1.8, 5.9, 1.9, 1.9);
  xy += box(1.9, 6.0, 1.7, 1.7, 10, P.water, [2, 2], { lit: 0.55 });
  xy += box(1.72, 5.82, 2.06, 2.06, 3.4, { roof: '#eaf6ff', left: '#93b9da', right: '#b0d2ec' }, null, { z0: 10 });
  var xa = iso(1.9, 6.0, 13), xb = iso(1.0, 6.0, 13);
  xy += '<path d="M' + f(xa[0]) + ' ' + f(xa[1]) + ' L' + f(xb[0]) + ' ' + f(xb[1]) + '" stroke="#7fb6dd" stroke-width="4" stroke-linecap="round"/>';
  var pipe = [[2.75, 6.85, 30], [4.2, 6.6, 30], [5.0, 5.9, 30]];
  var pd = pipe.map(function(p, i){ var q = iso(p[0], p[1], p[2]); return (i ? 'L' : 'M') + f(q[0]) + ' ' + f(q[1]); }).join(' ');
  xy += '<path d="' + pd + '" fill="none" stroke="rgba(120,160,200,.55)" stroke-width="9" stroke-linecap="round"/>';
  xy += '<path d="' + pd + '" class="flow" fill="none" stroke="#8fc6ee" stroke-width="3" stroke-linecap="round"/>';
  reg(11.5, 'xylem', xy, [2.55, 6.65, 24, 'Ксилема', 'водовод']);

  // стебель — центральная башня
  var st = shadow(5.0, 5.0, 2.2, 2.2);
  st += box(5.1, 5.1, 2.0, 2.0, 42, P.stem, [3, 7], { lit: 0.7 });
  [10, 22, 34].forEach(function(h, i){
    st += box(4.96, 4.96, 2.28, 2.28, 1.5, { roof: '#d3ecd0', left: '#84b98d', right: '#a2cfa6' }, null, { z0: h });
  });
  var cr = iso(6.1, 6.1, 44);
  st += ell(cr[0], cr[1] + 4, 20, 8, '#7fb98a');
  st += ell(cr[0] - 8, cr[1] - 2, 12, 9, '#8fc99a');
  st += ell(cr[0] + 8, cr[1] - 1, 11, 8, '#77b183');
  st += ell(cr[0], cr[1] - 8, 13, 9, '#9ed3a4');
  st += ell(cr[0], cr[1] - 12, 6, 4, '#b7e2b8');
  reg(13, 'stem', st, [6.1, 6.1, 58, 'Стебель', 'центральная башня']);

  // лист — солнечная электростанция
  var lf = shadow(8.0, 1.7, 2.7, 2.3);
  lf += box(8.1, 1.8, 2.5, 2.1, 5.5, P.leaf, [3, 1], { lit: 0.65 });
  [[8.35, 2.05], [9.45, 2.05], [8.35, 3.05], [9.45, 3.05]].forEach(function(s){
    lf += box(s[0], s[1], 0.86, 0.78, 0.35, { roof: '#2f6b52', left: '#215741', right: '#2a6149' }, null, { z0: 5.5 });
  });
  var lc = iso(9.35, 2.9, 6);
  lf += '<ellipse transform="rotate(-22 ' + f(lc[0]) + ' ' + f(lc[1]) + ')" cx="' + f(lc[0]) + '" cy="' + f(lc[1]) + '" rx="27" ry="12" fill="#8cc996" opacity=".95"/>';
  lf += '<ellipse transform="rotate(-22 ' + f(lc[0]) + ' ' + f(lc[1]) + ')" cx="' + f(lc[0]) + '" cy="' + f(lc[1]) + '" rx="21" ry="7" fill="#a7d9ab"/>';
  var lv = iso(8.6, 2.3, 6);
  lf += '<ellipse transform="rotate(38 ' + f(lv[0]) + ' ' + f(lv[1]) + ')" cx="' + f(lv[0]) + '" cy="' + f(lv[1]) + '" rx="16" ry="8" fill="#7dbd8b"/>';
  reg(17, 'leaf', lf, [9.35, 2.9, 20, 'Лист', 'солнечная станция']);

  // хлоропласт — фабрика сахара
  var ch = shadow(9.2, 6.1, 2.2, 2.0);
  ch += box(9.3, 6.2, 2.0, 1.8, 13, P.sugar, [2, 3], { lit: 0.7 });
  ch += box(9.5, 7.4, 0.5, 0.5, 8, P.wood, null, { z0: 13 });
  ch += box(9.45, 7.35, 0.6, 0.6, 0.9, { roof: '#dcc4a4', left: '#a9895f', right: '#c2a077' }, null, { z0: 21 });
  ch += smoke(iso(9.75, 7.65, 23)[0], iso(9.75, 7.65, 23)[1], 4);
  ch += box(9.55, 6.35, 0.6, 0.55, 2.2, { roof: '#d9ecc4', left: '#7f9c62', right: '#9cb87c' }, null, { z0: 13 });
  reg(19, 'chloroplast', ch, [10.3, 7.1, 30, 'Хлоропласт', 'фабрика сахара']);

  // флоэма — конвейер еды
  var ph = shadow(6.2, 8.5, 3.3, 1.1);
  ph += box(6.3, 8.6, 3.2, 1.0, 3.4, { roof: '#f3e2c6', left: '#c0a077', right: '#d9bb92' }, [4, 1], { lit: 0.5 });
  var c1 = iso(6.5, 9.1, 4.2), c2 = iso(9.3, 9.1, 4.2);
  ph += line(c1[0], c1[1], c2[0], c2[1], 'rgba(120,95,65,.35)', 7, 'stroke-linecap="round"');
  ph += line(c1[0], c1[1], c2[0], c2[1], '#ffb26b', 3, 'class="flow" stroke-linecap="round"');
  [[6.8, 9.05], [7.6, 9.05], [8.4, 9.05]].forEach(function(c){
    ph += box(c[0], c[1], 0.34, 0.34, 0.5, { roof: '#ffd9a8', left: '#d99b5c', right: '#efb47a' }, null, { z0: 4.5 });
  });
  reg(15, 'phloem', ph, [7.9, 9.15, 12, 'Флоэма', 'конвейер еды']);

  // устьица — воздушные ворота
  var sto = '';
  [[10.55, 3.7], [10.55, 5.0]].forEach(function(s, i){
    sto += shadow(s[0], s[1], 0.6, 0.6);
    sto += box(s[0], s[1], 0.55, 0.55, 9, { roof: '#e9f6ee', left: '#7fae95', right: '#a0c9b2' }, [1, 2], { lit: 0.8 });
  });
  var g1 = iso(10.8, 3.95, 9), g2 = iso(10.8, 5.25, 9);
  sto += '<path d="M' + f(g1[0]) + ' ' + f(g1[1]) + ' Q' + f((g1[0] + g2[0]) / 2) + ' ' + f(g1[1] - 14) + ' ' + f(g2[0]) + ' ' + f(g2[1]) + '" fill="none" stroke="#a9d3bd" stroke-width="3"/>';
  sto += '<circle class="blink" cx="' + f((g1[0] + g2[0]) / 2) + '" cy="' + f(g1[1] - 12) + '" r="3.4" fill="#7fd0a8"/>';
  [[10.2, 3.4], [10.0, 4.2], [10.3, 4.9]].forEach(function(m, i){
    var q = iso(m[0], m[1], 6);
    sto += '<circle class="smoke" style="animation-delay:' + (i * 1.2).toFixed(1) + 's" cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="3"/>';
  });
  reg(21, 'stomata', sto, [10.8, 4.4, 20, 'Устьица', 'воздушные ворота']);

  // цветок — рекламное агентство
  var fl = shadow(2.6, 2.0, 1.9, 1.9);
  fl += box(2.7, 2.1, 1.8, 1.8, 15, P.petal, [2, 4], { lit: 0.75 });
  fl += box(2.55, 1.95, 2.1, 2.1, 1.4, { roof: '#fff1f6', left: '#e7aec4', right: '#f8c9db' }, null, { z0: 15 });
  var fc = iso(3.6, 3.0, 17);
  fl += line(fc[0], fc[1], fc[0], fc[1] - 14, '#7ba879', 3);
  for (var pi = 0; pi < 6; pi++){
    var ang = Math.PI * 2 * pi / 6;
    fl += ell(fc[0] + Math.cos(ang) * 8, fc[1] - 16 + Math.sin(ang) * 8, 7, 6.5, pi % 2 ? '#f7b5cd' : '#ffcbdd');
  }
  fl += ell(fc[0], fc[1] - 16, 5.2, 4.6, '#ffd166');
  fl += ell(fc[0], fc[1] - 16, 2.4, 2.1, '#e8a33d');
  reg(23, 'flower', fl, [3.6, 3.0, 40, 'Цветок', 'рекламное агентство']);

  // семя — капсула будущего
  var sd = '';
  var sc = iso(5.6, 10.4, 7);
  sd += shadow(4.7, 9.8, 1.9, 1.3);
  sd += ell(sc[0], sc[1], 27, 14, 'url(#seedGrad)');
  sd += '<path d="M' + f(sc[0] - 27) + ' ' + f(sc[1]) + ' Q' + f(sc[0]) + ' ' + f(sc[1] + 12) + ' ' + f(sc[0] + 27) + ' ' + f(sc[1]) + '" fill="none" stroke="rgba(120,95,60,.25)" stroke-width="2"/>';
  sd += line(sc[0], sc[1] - 14, sc[0], sc[1] + 14, 'rgba(120,95,60,.18)', 1.4);
  sd += line(sc[0], sc[1] - 15, sc[0], sc[1] - 27, '#7fae7f', 2.4);
  sd += ell(sc[0] - 4, sc[1] - 29, 7, 4.4, '#9ed3a4', 'transform="rotate(-24 ' + f(sc[0] - 4) + ' ' + f(sc[1] - 29) + ')"');
  sd += ell(sc[0] + 4, sc[1] - 29, 6, 4, '#8ac78f', 'transform="rotate(24 ' + f(sc[0] + 4) + ' ' + f(sc[1] - 29) + ')"');
  reg(7, 'seed', sd, [5.6, 10.4, 20, 'Семя', 'капсула будущего']);

  // камбий — строительная контора
  var cb = '';
  cb += shadow(9.3, 9.3, 1.6, 1.6);
  [[9.4, 9.4], [10.4, 9.4], [9.4, 10.4], [10.4, 10.4]].forEach(function(c){
    cb += line(iso(c[0], c[1], 0)[0], iso(c[0], c[1], 0)[1], iso(c[0], c[1], 10)[0], iso(c[0], c[1], 10)[1], '#c9a884', 3);
  });
  [3.5, 6.5, 9.5].forEach(function(h){
    var a = iso(9.4, 9.4, h), b = iso(10.4, 9.4, h), c = iso(10.4, 10.4, h), d = iso(9.4, 10.4, h);
    cb += pg([a, b, c, d], 'none', 'stroke="#d8bd9c" stroke-width="2"');
  });
  var m0 = iso(11.0, 11.0, 0);
  cb += line(m0[0], m0[1], m0[0], m0[1] - 40, '#e0a96b', 3.4);
  cb += line(m0[0], m0[1] - 38, m0[0] - 30, m0[1] - 38, '#e0a96b', 2.6);
  cb += line(m0[0] - 28, m0[1] - 38, m0[0] - 28, m0[1] - 24, '#c9955c', 1.2);
  cb += box(m0[0] - 31, m0[1] - 26, 6, 6, 4, { roof: '#f2d9b8', left: '#c9a17a', right: '#e0bd96' }, null);
  reg(11, 'cambium', cb, [9.9, 9.9, 44, 'Камбий', 'стройконтора']);

  // деревья и фонарики
  var deco = '';
  [[0.95, 4.2], [1.5, 5.7], [2.6, 6.6], [10.5, 7.0], [10.0, 7.9], [3.4, 1.2], [4.6, 1.0], [9.8, 4.2], [1.1, 9.1], [4.2, 8.4]].forEach(function(t, i){
    var p = iso(t[0], t[1], 0);
    deco += '<g class="leaf" style="animation-delay:' + (i * 0.4).toFixed(1) + 's"><rect x="' + f(p[0] - 1) + '" y="' + f(p[1] - 9) + '" width="2" height="9" fill="#ad8a6a"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1] - 16) + '" r="7.5" fill="#7fbd88"/><circle cx="' + f(p[0] - 4) + '" cy="' + f(p[1] - 12) + '" r="5" fill="#95cd9c"/><circle cx="' + f(p[0] + 4) + '" cy="' + f(p[1] - 13) + '" r="4.6" fill="#6faa7a"/></g>';
  });
  [[3.0, 4.7], [5.6, 3.6], [8.6, 5.9], [4.6, 10.3], [7.2, 6.6]].forEach(function(l){
    var p = iso(l[0], l[1], 0);
    deco += '<rect x="' + f(p[0] - 0.8) + '" y="' + f(p[1] - 12) + '" width="1.6" height="12" fill="#c4a88e"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1] - 13) + '" r="7" fill="#ffdf9e" opacity=".18"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1] - 13) + '" r="3" fill="#ffe2a8"/>';
  });
  nodes.push({ k: 200, s: deco });

  nodes.sort(function(a, b){ return a.k - b.k; });

  var defs = '<defs>' +
    '<linearGradient id="groundGrad" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#eef8e2"/><stop offset="0.55" stop-color="#dcf0cd"/><stop offset="1" stop-color="#c2e0b2"/></linearGradient>' +
    '<linearGradient id="groundGradNight" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#2c3b3a"/><stop offset="0.55" stop-color="#243430"/><stop offset="1" stop-color="#1d2a28"/></linearGradient>' +
    '<linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ed0a0"/><stop offset="1" stop-color="#6ba875"/></linearGradient>' +
    '<radialGradient id="seedGrad" cx="0.36" cy="0.24" r="0.9"><stop offset="0" stop-color="#fbf3e0"/><stop offset="0.6" stop-color="#e8d8b8"/><stop offset="1" stop-color="#cdb691"/></radialGradient>' +
    '</defs>';

  var svg = K.svg(defs, stars() + ground + paths + nodes.map(function(n){ return n.s; }).join(''), '-360 -95 720 480');
  K.mount(svg, window.PLANT_DATA.organs);
};
