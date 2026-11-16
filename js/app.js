window.buildCellCity = function(){
  'use strict';
  var TW = 28, TH = 14;
  function iso(x, y, z){ z = z || 0; return [(x - y) * TW, (x + y) * TH - z]; }
  function f(n){ return Math.round(n * 10) / 10; }
  function P(a){ var o = [], i; for (i = 0; i < a.length; i++) o.push(f(a[i][0]) + ',' + f(a[i][1])); return o.join(' '); }
  function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function pg(a, fill, extra){ return '<polygon points="' + P(a) + '" fill="' + fill + '" ' + (extra || '') + '/>'; }
  function bil(b1, b2, t1, t2, u, v){ return lerp(lerp(b1, b2, u), lerp(t1, t2, u), v); }
  function rnd(a){ return Math.random(); }

  function faceWin(x1, y1, x2, y2, z0, h, cols, rows, fill, litChance){
    var b1 = iso(x1, y1, z0), b2 = iso(x2, y2, z0), t1 = iso(x1, y1, z0 + h), t2 = iso(x2, y2, z0 + h);
    var s = pg([b1, b2, t2, t1], fill);
    if (!cols) return s;
    for (var i = 0; i < cols; i++){
      for (var j = 0; j < rows; j++){
        var u = (i + 0.26) / cols, v = (j + 0.22) / rows;
        var wu = 0.48 / cols, hv = 0.42 / rows;
        var a = bil(b1, b2, t1, t2, u, v);
        var b = bil(b1, b2, t1, t2, u, v + hv);
        var c = bil(b1, b2, t1, t2, u + wu, v + hv);
        var d = bil(b1, b2, t1, t2, u + wu, v);
        var lit = Math.random() < (litChance == null ? 0.55 : litChance);
        s += '<polygon class="win' + (lit ? ' lit' : '') + '" style="animation-delay:' + (Math.random() * 7).toFixed(1) + 's" points="' + P([a, b, c, d]) + '"/>';
      }
    }
    return s;
  }

  function box(x, y, w, d, h, pal, win, opts){
    opts = opts || {};
    var z0 = opts.z0 || 0;
    var At = iso(x, y, z0 + h), Bt = iso(x + w, y, z0 + h), Ct = iso(x + w, y + d, z0 + h), Dt = iso(x, y + d, z0 + h);
    var s = '';
    s += faceWin(x, y + d, x + w, y + d, z0, h, win ? win[0] : 0, win ? win[1] : 0, pal.left, opts.lit);
    s += faceWin(x + w, y, x + w, y + d, z0, h, win ? win[0] : 0, win ? win[1] : 0, pal.right, opts.lit);
    s += pg([At, Bt, Ct, Dt], pal.roof, 'stroke="' + (pal.edge || 'rgba(120,80,60,.14)') + '" stroke-width="1"');
    return s;
  }

  function shadow(x, y, w, d){
    return pg([iso(x - 0.2, y - 0.2), iso(x + w + 0.35, y - 0.2), iso(x + w + 0.35, y + d + 0.35), iso(x - 0.2, y + d + 0.35)], 'rgba(95,65,70,.15)', 'class="shadow"');
  }

  function tag(x, y, z, name, city){
    var p = iso(x, y, z);
    var w = Math.max(name.length * 6.4 + 20, 42);
    return '<g class="tag" transform="translate(' + f(p[0]) + ',' + f(p[1]) + ')">' +
      '<rect x="' + f(-w / 2) + '" y="-24" width="' + f(w) + '" height="20" rx="8"/>' +
      '<text class="tag-name" y="-10">' + name + '</text></g>';
  }

  var PAL = {
    civic:   { roof: '#ffe4bd', left: '#e6a273', right: '#f4bb8c' },
    civic2:  { roof: '#ffeacb', left: '#eeb491', right: '#fbc9a4' },
    power:   { roof: '#ffd7cf', left: '#d0666c', right: '#e8837f' },
    factory: { roof: '#e2eaf8', left: '#98a6c7', right: '#b5c1dd' },
    post:    { roof: '#e7dcff', left: '#a08bd3', right: '#bdaae8' },
    waste:   { roof: '#dcf0e2', left: '#85b196', right: '#a3c8b0' },
    water:   { roof: '#d9edfb', left: '#84afd3', right: '#a2c7e6' },
    dispatch:{ roof: '#f3e2d0', left: '#c5a48a', right: '#daBda3' }
  };

  var nodes = [];
  function reg(key, id, svg, tagInfo){
    var t = tagInfo ? tag(tagInfo[0], tagInfo[1], tagInfo[2], tagInfo[3], tagInfo[4]) : '';
    nodes.push({ k: key, s: '<g class="bldg" data-id="' + id + '">' + t + svg + '</g>' });
  }

  var ground = '';
  ground += pg([iso(0.2, 0.2), iso(11.8, 0.2), iso(11.8, 11.8), iso(0.2, 11.8)], 'rgba(95,60,90,.13)');
  ground += pg([iso(0, 0), iso(12, 0), iso(12, 12), iso(0, 12)], 'url(#groundGrad)', 'class="island-top"');

  var roads = '';
  var rs = 'stroke="rgba(255,248,233,.95)" stroke-width="8" stroke-linecap="round" fill="none"';
  var ls = 'class="lane" stroke="rgba(198,158,118,.5)" stroke-width="1.5" stroke-linecap="round" fill="none"';
  [[[0.8, 11.2], [5.4, 6.6], [6.6, 5.4], [11.2, 0.8]], [[1.0, 5.2], [5.4, 5.2], [9.2, 5.2]], [[6.0, 1.0], [6.0, 5.1], [6.0, 11.0]]].forEach(function(pts){
    var d = pts.map(function(p, i){ var q = iso(p[0], p[1], 1); return (i ? 'L' : 'M') + f(q[0]) + ' ' + f(q[1]); }).join(' ');
    roads += '<path d="' + d + '" ' + rs + '/><path d="' + d + '" ' + ls + '/>';
  });

  // walls
  var wp = [[0.5, 0.5], [11.5, 0.5], [11.5, 11.5], [0.5, 11.5], [0.5, 0.5]];
  var wd = wp.map(function(p, i){ var q = iso(p[0], p[1], 6); return (i ? 'L' : 'M') + f(q[0]) + ' ' + f(q[1]); }).join(' ');
  var walls = '<path d="' + wd + '" fill="none" stroke="rgba(120,80,70,.18)" stroke-width="19" stroke-linejoin="round"/>';
  walls += '<path d="' + wd + '" class="wall" fill="none"/>';
  [[0.5, 0.5], [11.5, 0.5], [11.5, 11.5], [0.5, 11.5]].forEach(function(c){
    walls += box(c[0] - 0.33, c[1] - 0.33, 0.66, 0.66, 20, { roof: '#ffe9cc', left: '#d5b08b', right: '#e8c8a4' }, [1, 2], { lit: 0.85 });
  });
  walls += box(5.1, 11.15, 1.8, 0.7, 24, { roof: '#ffe0c0', left: '#c9987a', right: '#dfb491' }, null, { lit: 0.5 });
  walls += '<circle class="gate-light" cx="' + f(iso(6.0, 11.5, 26)[0]) + '" cy="' + f(iso(6.0, 11.5, 26)[1]) + '" r="3.2" fill="#ffd166"/>';
  walls += box(10.85, 5.1, 0.7, 1.8, 22, { roof: '#ffe0c0', left: '#c9987a', right: '#dfb491' }, null, { lit: 0.5 });
  reg(-99, 'membrane', walls, [6.0, 11.5, 30, 'Мембрана', 'стена и КПП']);

  // vacuole water tower
  var wt = shadow(1.1, 1.55, 1.3, 1.3);
  wt += box(1.2, 1.65, 0.55, 0.55, 6, { roof: '#c8e2f5', left: '#7aa4c8', right: '#96bede' }, null);
  wt += box(1.28, 1.73, 0.4, 0.4, 22, { roof: '#e6f2fb', left: '#8fb6d6', right: '#a9cbe8' }, null, { z0: 6 });
  wt += box(1.05, 1.5, 1.0, 1.0, 12, PAL.water, [2, 2], { z0: 28, lit: 0.5 });
  wt += pg([iso(1.05, 1.5, 40), iso(2.05, 1.5, 40), iso(1.55, 2.5, 40), iso(0.55, 2.0, 40)], 'none');
  wt += '<ellipse cx="' + f(iso(1.55, 2.0, 40)[0]) + '" cy="' + f(iso(1.55, 2.0, 40)[1]) + '" rx="13" ry="6" fill="#eaf7ff" opacity=".95"/>';
  wt += '<ellipse cx="' + f(iso(1.55, 2.0, 40)[0]) + '" cy="' + f(iso(1.55, 2.0, 40)[1]) + '" rx="6" ry="2.8" fill="#bfe0f5"/>';
  reg(2.0, 'vacuole', wt, [1.55, 2.0, 46, 'Вакуоль', 'водобашня']);

  // nucleus
  var muni = shadow(3.2, 3.2, 3.6, 3.6);
  muni += box(3.3, 3.3, 3.4, 3.4, 22, PAL.civic, [4, 3], { lit: 0.8 });
  muni += box(3.15, 3.15, 3.7, 3.7, 3, { roof: '#fff0d8', left: '#f3c9a2', right: '#ffdcb8' }, null, { z0: 22 });
  var rc = iso(5, 5, 0);
  var rx = 44, ry = 21, cyb = rc[1] - 25, cyt = cyb - 15;
  muni += '<path d="M' + f(rc[0] - rx) + ' ' + f(cyb) + ' A' + rx + ' ' + ry + ' 0 0 1 ' + f(rc[0] + rx) + ' ' + f(cyb) + '" fill="#e7b891"/>';
  muni += '<rect x="' + f(rc[0] - rx) + '" y="' + f(cyt) + '" width="' + (rx * 2) + '" height="' + f(cyb - cyt) + '" fill="#f2cba6"/>';
  for (var ci = 0; ci < 7; ci++){
    var ang = Math.PI * (0.16 + ci * 0.113);
    var px = rc[0] - rx * Math.cos(ang), py = cyb + ry * 0.55 * Math.sin(ang) - 2;
    var ch = 13 - Math.abs(ci - 3) * 1.1;
    muni += '<rect x="' + f(px - 2) + '" y="' + f(py - ch) + '" width="4" height="' + f(ch) + '" rx="2" fill="#fff5e6"/>';
  }
  muni += '<ellipse cx="' + f(rc[0]) + '" cy="' + f(cyt) + '" rx="' + rx + '" ry="' + ry + '" fill="#fff6e8"/>';
  muni += '<ellipse cx="' + f(rc[0]) + '" cy="' + f(cyt) + '" rx="' + (rx - 7) + '" ry="' + (ry - 3.5) + '" fill="#f6d8b6"/>';
  muni += '<path d="M' + f(rc[0] - rx + 2) + ' ' + f(cyt) + ' C' + f(rc[0] - rx + 6) + ' ' + f(cyt - 40) + ' ' + f(rc[0] + rx - 6) + ' ' + f(cyt - 40) + ' ' + f(rc[0] + rx - 2) + ' ' + f(cyt) + ' Z" fill="url(#domeGrad)" stroke="rgba(214,140,96,.35)" stroke-width="1"/>';
  for (var ri = 1; ri < 6; ri++){
    var t = ri / 6;
    var rxr = (rx - 2) * Math.cos(t * Math.PI / 2), ryr = 40 * Math.sin(t * Math.PI / 2);
    muni += '<path d="M' + f(rc[0] - rxr) + ' ' + f(cyt - ryr * 0.06) + ' Q' + f(rc[0]) + ' ' + f(cyt - ryr) + ' ' + f(rc[0] + rxr) + ' ' + f(cyt - ryr * 0.06) + '" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="1.1"/>';
  }
  muni += '<rect x="' + f(rc[0] - 2) + '" y="' + f(cyt - 50) + '" width="4" height="12" rx="2" fill="#f0dcc4"/>';
  muni += '<circle cx="' + f(rc[0]) + '" cy="' + f(cyt - 51) + '" r="3.4" fill="#ffd166"/>';
  muni += '<line x1="' + f(rc[0]) + '" y1="' + f(cyt - 54) + '" x2="' + f(rc[0]) + '" y2="' + f(cyt - 66) + '" stroke="#d3b79b" stroke-width="1.4"/>';
  muni += '<polygon points="' + f(rc[0]) + ',' + f(cyt - 66) + ' ' + f(rc[0] + 13) + ',' + f(cyt - 62) + ' ' + f(rc[0]) + ',' + f(cyt - 58) + '" fill="#ff8f6b"/>';
  reg(7.0, 'nucleus', muni, [5.0, 5.0, 46, 'Ядро', 'мэрия']);
  nodes[nodes.length - 1].s = nodes[nodes.length - 1].s.replace('class="tag"', 'class="tag"');

  // nucleolus
  var nlo = shadow(7.0, 4.4, 1.2, 1.1) + box(7.05, 4.45, 1.1, 1.0, 18, PAL.civic2, [2, 3], { lit: 0.8 });
  nlo += '<ellipse cx="' + f(iso(7.6, 4.95, 18)[0]) + '" cy="' + f(iso(7.6, 4.95, 18)[1]) + '" rx="10" ry="5" fill="#fff2dc" opacity=".9"/>';
  reg(10.2, 'nucleolus', nlo, [7.6, 4.95, 26, 'Ядрышко', 'чертёжный зал']);

  // mitochondria
  var pw = shadow(7.9, 1.9, 2.9, 2.9);
  var mc = iso(9.35, 3.35, 0);
  var mrx = 60, mry = 26, mb = mc[1] - 8, mt = mb - 34;
  pw += '<ellipse cx="' + f(mc[0]) + '" cy="' + f(mb) + '" rx="' + mrx + '" ry="' + mry + '" fill="#d9767a" opacity=".5"/>';
  pw += '<path d="M' + f(mc[0] - mrx) + ' ' + f(mt) + ' L' + f(mc[0] - mrx) + ' ' + f(mb) + ' A' + mrx + ' ' + mry + ' 0 0 1 ' + f(mc[0] + mrx) + ' ' + f(mb) + ' L' + f(mc[0] + mrx) + ' ' + f(mt) + '" fill="url(#morphGrad)"/>';
  pw += '<ellipse cx="' + f(mc[0]) + '" cy="' + f(mt) + '" rx="' + mrx + '" ry="' + mry + '" fill="#f6b3a8"/>';
  pw += '<ellipse cx="' + f(mc[0]) + '" cy="' + f(mt) + '" rx="' + (mrx - 8) + '" ry="' + (mry - 6) + '" fill="#fbd0c2"/>';
  for (var wi = 0; wi < 4; wi++){
    var wx = mc[0] - 36 + wi * 24;
    pw += '<rect class="win lit" x="' + f(wx) + '" y="' + f(mb - 22) + '" width="13" height="9" rx="2.5" style="animation-delay:' + (wi * 1.3).toFixed(1) + 's"/>';
  }
  pw += '<polygon points="' + f(mc[0] + 6) + ',' + f(mt - 4) + ' ' + f(mc[0] - 4) + ',' + f(mt + 14) + ' ' + f(mc[0] + 3) + ',' + f(mt + 14) + ' ' + f(mc[0] - 2) + ',' + f(mt + 30) + ' ' + f(mc[0] + 12) + ',' + f(mt + 8) + ' ' + f(mc[0] + 5) + ',' + f(mt + 8) + '" fill="#ffe08a" opacity=".95"/>';
  pw += '<rect x="' + f(mc[0] + 30) + '" y="' + f(mt - 44) + '" width="9" height="46" rx="3" fill="#c9636c"/>';
  pw += '<rect x="' + f(mc[0] + 28) + '" y="' + f(mt - 48) + '" width="13" height="6" rx="2" fill="#e8858a"/>';
  pw += '<circle class="smoke" cx="' + f(mc[0] + 34.5) + '" cy="' + f(mt - 56) + '" r="6"/>';
  pw += '<circle class="smoke" style="animation-delay:2.4s" cx="' + f(mc[0] + 34.5) + '" cy="' + f(mt - 56) + '" r="4.5"/>';
  pw += '<circle class="smoke" style="animation-delay:4.8s" cx="' + f(mc[0] + 34.5) + '" cy="' + f(mt - 56) + '" r="3.5"/>';
  reg(10.8, 'mito', pw, [9.35, 3.35, 44, 'Митохондрия', 'электростанция']);

  // golgi
  var gl = shadow(6.85, 6.85, 2.0, 2.0);
  gl += box(6.95, 6.95, 1.8, 1.8, 6, PAL.post, [2, 1], { lit: 0.55 });
  gl += box(7.1, 7.1, 1.6, 1.6, 6, { roof: '#f2e9ff', left: '#b29fe0', right: '#cbbcF0' }, [2, 1], { z0: 6, lit: 0.55 });
  gl += box(7.25, 7.25, 1.4, 1.4, 6, { roof: '#f9f4ff', left: '#c1aee8', right: '#d9cbf5' }, [2, 1], { z0: 12, lit: 0.55 });
  gl += box(8.6, 6.4, 0.5, 0.5, 13, { roof: '#efe8ff', left: '#a08bd3', right: '#bca9e0' }, null);
  gl += '<circle class="blink" cx="' + f(iso(8.85, 6.65, 14)[0]) + '" cy="' + f(iso(8.85, 6.65, 14)[1]) + '" r="2.6" fill="#ffd166"/>';
  reg(14.2, 'golgi', gl, [7.9, 7.9, 30, 'Гольджи', 'почта']);

  // ribosomes
  var f1 = shadow(1.9, 8.4, 1.5, 1.5) + box(2.0, 8.5, 1.3, 1.3, 14, PAL.factory, [2, 2], { lit: 0.65 }) + box(2.2, 8.7, 0.9, 0.9, 5, { roof: '#eff4fc', left: '#8b99ba', right: '#a6b3d1' }, null, { z0: 14 });
  reg(9.9, 'ribosome', f1, [2.65, 9.15, 30, 'Рибосома', 'завод']);
  var f2 = shadow(3.9, 9.1, 1.2, 1.2) + box(4.0, 9.2, 1.0, 1.0, 11, PAL.factory, [1, 2], { lit: 0.6 }) + box(4.15, 9.35, 0.7, 0.7, 4, { roof: '#eff4fc', left: '#8b99ba', right: '#a6b3d1' }, null, { z0: 11 });
  reg(12.2, 'ribosome', f2, [4.5, 9.7, 26, 'Рибосома', 'ещё один завод']);
  var f3 = shadow(8.1, 8.3, 1.6, 1.6) + box(8.2, 8.4, 1.4, 1.4, 16, PAL.factory, [2, 2], { lit: 0.65 }) + box(8.4, 8.6, 1.0, 1.0, 5, { roof: '#eff4fc', left: '#8b99ba', right: '#a6b3d1' }, null, { z0: 16 });
  reg(16.0, 'ribosome', f3, [8.9, 9.1, 32, 'Рибосома', 'завод']);

  // lysosome
  var ly = shadow(9.2, 9.0, 2.0, 1.9);
  ly += box(9.3, 9.1, 1.9, 1.8, 11, PAL.waste, [2, 2], { lit: 0.55 });
  ly += '<ellipse cx="' + f(iso(9.75, 9.55, 11)[0]) + '" cy="' + f(iso(9.75, 9.55, 11)[1]) + '" rx="9" ry="5" fill="#cfe8d8"/>';
  ly += '<ellipse cx="' + f(iso(10.55, 10.25, 11)[0]) + '" cy="' + f(iso(10.55, 10.25, 11)[1]) + '" rx="7.5" ry="4.2" fill="#bfdfc9"/>';
  ly += box(9.45, 9.25, 0.55, 0.55, 18, { roof: '#e6f4ea', left: '#799f88', right: '#93b9a1' }, null, { z0: 11 });
  reg(18.2, 'lysosome', ly, [10.25, 10.0, 30, 'Лизосома', 'утилизация']);

  // centrosome
  var ce = shadow(5.35, 9.3, 1.1, 1.1) + box(5.45, 9.4, 0.9, 0.9, 20, PAL.dispatch, [1, 3], { lit: 0.75 });
  var cp = iso(5.9, 9.85, 20);
  ce += '<line x1="' + f(cp[0]) + '" y1="' + f(cp[1]) + '" x2="' + f(cp[0]) + '" y2="' + f(cp[1] - 22) + '" stroke="#b39c85" stroke-width="2"/>';
  ce += '<circle class="blink" cx="' + f(cp[0]) + '" cy="' + f(cp[1] - 24) + '" r="3.2" fill="#ff8f6b"/>';
  reg(15.2, 'centrosome', ce, [5.9, 9.85, 46, 'Клеточный центр', 'диспетчерская']);

  // ER
  var er = '';
  [[[6.2, 3.0], [6.3, 5.6], [6.4, 7.8]], [[7.7, 4.2], [7.3, 6.0], [7.5, 8.0]], [[4.0, 6.6], [5.8, 7.2], [6.9, 8.1]]].forEach(function(line){
    var d = line.map(function(p, i){ var q = iso(p[0], p[1], 2); return (i ? 'L' : 'M') + f(q[0]) + ' ' + f(q[1]); }).join(' ');
    er += '<path d="' + d + '" fill="none" stroke="rgba(140,120,190,.22)" stroke-width="10" stroke-linecap="round"/>';
    er += '<path d="' + d + '" class="flow" fill="none" stroke="rgba(148,126,220,.8)" stroke-width="2.2" stroke-linecap="round"/>';
  });
  reg(19.5, 'er', er, [7.7, 4.2, 22, 'ЭПС', 'тоннели']);

  // deco
  var deco = '';
  [[0.95, 4.4], [1.45, 5.9], [2.5, 6.5], [10.6, 7.2], [10.1, 8.0], [3.3, 1.3], [4.3, 1.0], [9.9, 4.3], [1.1, 9.3], [1.9, 10.3], [11.0, 10.9]].forEach(function(t, i){
    var p = iso(t[0], t[1], 0);
    deco += '<g class="leaf" style="animation-delay:' + (i * 0.4).toFixed(1) + 's"><rect x="' + f(p[0] - 1) + '" y="' + f(p[1] - 9) + '" width="2" height="9" fill="#ad8a6a"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1] - 15) + '" r="7" fill="#8dc39a"/><circle cx="' + f(p[0] - 4) + '" cy="' + f(p[1] - 12) + '" r="5" fill="#a2d1ac"/><circle cx="' + f(p[0] + 4) + '" cy="' + f(p[1] - 12.5) + '" r="4.5" fill="#7cb98b"/></g>';
  });
  [[3.2, 4.9], [5.6, 3.8], [8.9, 6.2], [4.5, 10.3], [10.3, 2.7]].forEach(function(l){
    var p = iso(l[0], l[1], 0);
    deco += '<rect x="' + f(p[0] - 0.8) + '" y="' + f(p[1] - 12) + '" width="1.6" height="12" fill="#c4a88e"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1] - 13) + '" r="7" fill="#ffdf9e" opacity=".18"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1] - 13) + '" r="3" fill="#ffe2a8"/>';
  });
  nodes.push({ k: 200, s: deco });

  var cyt = '';
  [[2.7, 6.9], [4.7, 7.7], [8.7, 4.9], [9.7, 6.3], [2.9, 3.1], [7.3, 1.9]].forEach(function(c, i){
    var p = iso(c[0], c[1], 0);
    cyt += '<g class="bldg" data-id="cytoplasm"><circle class="blink" style="animation-delay:' + (i * 0.7).toFixed(1) + 's" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="4.5" fill="#b7a7e8" opacity=".5"/></g>';
  });
  nodes.push({ k: 300, s: cyt });

  nodes.sort(function(a, b){ return a.k - b.k; });

  var stars = '';
  for (var i = 0; i < 70; i++){
    stars += '<circle class="star" cx="' + f(-380 + Math.random() * 760) + '" cy="' + f(-140 + Math.random() * 300) + '" r="' + (Math.random() * 1.4 + 0.5).toFixed(1) + '"/>';
  }

  var defs = '<defs>' +
    '<linearGradient id="groundGrad" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#fdf5e6"/><stop offset="0.55" stop-color="#f8e9d0"/><stop offset="1" stop-color="#eed9b9"/></linearGradient>' +
    '<radialGradient id="domeGrad" cx="0.34" cy="0.22" r="0.9"><stop offset="0" stop-color="#fffaf0"/><stop offset="0.55" stop-color="#ffe3c0"/><stop offset="1" stop-color="#f4bd92"/></radialGradient>' +
    '<linearGradient id="morphGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8908c"/><stop offset="1" stop-color="#c05c63"/></linearGradient>' +
  '</defs>';

  var clouds = '';

  var svg = '<svg id="scene" viewBox="-355 -80 710 440" preserveAspectRatio="xMidYMid meet">' + defs + stars + clouds + ground + roads + nodes.map(function(n){ return n.s; }).join('') + '</svg>';
  document.getElementById('stage').innerHTML = svg;
  setTimeout(function(){
    if (window.CITY_SCENES && window.CITY_SCENES.layoutTags) window.CITY_SCENES.layoutTags();
  }, 60);

  var data = window.CITY_DATA, byId = {};
  data.organs.forEach(function(o){ byId[o.id] = o; });
  var panel = document.getElementById('panel'), chips = document.getElementById('chips'), hint = document.getElementById('hint');
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function renderPanel(o){
    panel.innerHTML = '<button class="panel-close" aria-label="Закрыть">\u00d7</button>' +
      '<span class="panel-kicker">' + esc(o.city) + '</span>' +
      '<h2>' + esc(o.name) + '</h2>' +
      '<p class="panel-lead">' + esc(o.lead) + '</p>' +
      '<div class="panel-section"><h3>Как устроено</h3><p>' + esc(o.detail) + '</p></div>' +
      '<div class="panel-section"><h3>В городе это\u2026</h3><p>' + esc(o.why) + '</p></div>' +
      '<div class="fact"><span class="fact-ico">\u2728</span><p>' + esc(o.fact) + '</p></div>';
  }
  function select(id){
    var o = byId[id];
    if (!o) return;
    renderPanel(o);
    panel.classList.add('open');
    hint.classList.add('hide');
    var all = document.querySelectorAll('.bldg');
    for (var i = 0; i < all.length; i++) all[i].classList.toggle('active', all[i].getAttribute('data-id') === id);
    var cs = document.querySelectorAll('.chip');
    for (var j = 0; j < cs.length; j++) cs[j].classList.toggle('active', cs[j].getAttribute('data-id') === id);
  }
  function closePanel(){
    panel.classList.remove('open');
    var a = document.querySelectorAll('.bldg.active');
    for (var i = 0; i < a.length; i++) a[i].classList.remove('active');
    var c = document.querySelectorAll('.chip.active');
    for (var j = 0; j < c.length; j++) c[j].classList.remove('active');
  }
  panel.onclick = function(e){ if (e.target.classList && e.target.classList.contains('panel-close')) closePanel(); };
  document.querySelectorAll('.bldg[data-id]').forEach(function(g){
    g.addEventListener('click', function(e){ e.stopPropagation(); select(g.getAttribute('data-id')); });
  });
  var stageEl = document.getElementById('stage');
  stageEl.onclick = function(e){
    var t = e.target;
    while (t && t !== stageEl){
      if (t.getAttribute && t.getAttribute('data-id')) return;
      t = t.parentNode;
    }
    closePanel();
  };
  chips.innerHTML = '';
  data.organs.forEach(function(o){
    var b = document.createElement('button');
    b.className = 'chip';
    b.setAttribute('data-id', o.id);
    b.textContent = o.cityShort;
    b.addEventListener('click', function(){ select(o.id); });
    chips.appendChild(b);
  });
  setTimeout(function(){ hint.classList.add('hide'); }, 9000);

  var toast = document.getElementById('toast'), tTimer;
  function say(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(tTimer);
    tTimer = setTimeout(function(){ toast.classList.remove('show'); }, 3400);
  }
};

window.buildCellCity();
