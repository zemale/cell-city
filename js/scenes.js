/* Города внутри — общий движок сцен (растение и животное) */
(function(){
  'use strict';
  var TW = 28, TH = 14;
  function iso(x, y, z){ z = z || 0; return [(x - y) * TW, (x + y) * TH - z]; }
  function f(n){ return Math.round(n * 10) / 10; }
  function P(a){ var o = [], i; for (i = 0; i < a.length; i++) o.push(f(a[i][0]) + ',' + f(a[i][1])); return o.join(' '); }
  function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function pg(a, fill, extra){ return '<polygon points="' + P(a) + '" fill="' + fill + '" ' + (extra || '') + '/>'; }
  function bil(b1, b2, t1, t2, u, v){ return lerp(lerp(b1, b2, u), lerp(t1, t2, u), v); }
  function ell(cx, cy, rx, ry, fill, extra){ return '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '" ' + (extra || '') + '/>'; }
  function line(x1, y1, x2, y2, stroke, w, extra){
    return '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(x2) + '" y2="' + f(y2) + '" stroke="' + stroke + '" stroke-width="' + w + '" ' + (extra || '') + '/>';
  }

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

  // подписи видны всегда — расталкиваем их, если налезают друг на друга
  function layoutTags(){
    var stage = document.getElementById('stage');
    if (!stage) return;
    var svg = stage.querySelector('svg');
    if (!svg) return;
    var vb = svg.viewBox && svg.viewBox.baseVal;
    var box = svg.getBoundingClientRect();
    if (!vb || !vb.width || !box.width) return;
    var k = vb.width / box.width;
    var tags = [].slice.call(svg.querySelectorAll('.tag'));
    if (!tags.length) return;

    tags.forEach(function(t){
      if (t.dataset.ox == null){
        var m = /translate\(\s*([-\d.]+)[ ,]\s*([-\d.]+)\s*\)/.exec(t.getAttribute('transform') || '');
        t.dataset.ox = m ? m[1] : 0;
        t.dataset.oy = m ? m[2] : 0;
      }
      t.setAttribute('transform', 'translate(' + t.dataset.ox + ',' + t.dataset.oy + ')');
    });

    var bounds = svg.getBoundingClientRect();
    var placed = [];
    tags.forEach(function(t){
      var r = t.getBoundingClientRect();
      var w = r.width, h = r.height;
      var sx = r.left, sy = r.top;
      var ox = +t.dataset.ox, oy = +t.dataset.oy;
      var cands = [[0, 0], [0, -(h + 4)], [0, -2 * (h + 4)], [0, -3 * (h + 4)],
        [-(w * 0.5 + 4), 0], [w * 0.5 + 4, 0], [-(w * 0.5 + 4), -(h + 4)], [w * 0.5 + 4, -(h + 4)],
        [0, h + 4], [-(w * 0.5 + 4), h + 4], [w * 0.5 + 4, h + 4]];
      var pick = null;
      for (var i = 0; i < cands.length; i++){
        var nx = sx + cands[i][0], ny = sy + cands[i][1];
        if (ny < bounds.top + 2 || nx < bounds.left + 2 || nx + w > bounds.right - 2) continue;
        var rect = { l: nx, t: ny, r: nx + w, b: ny + h };
        var clash = false;
        for (var j = 0; j < placed.length; j++){
          var p = placed[j];
          if (!(rect.r <= p.l + 3 || rect.l >= p.r - 3 || rect.b <= p.t + 3 || rect.t >= p.b - 3)){ clash = true; break; }
        }
        if (!clash){ pick = { dx: cands[i][0], dy: cands[i][1], rect: rect }; break; }
      }
      if (!pick){
        var dy = -(h + 5) * (placed.length ? 1 : 0);
        pick = { dx: 0, dy: dy, rect: { l: sx, t: sy + dy, r: sx + w, b: sy + dy + h } };
      }
      placed.push(pick.rect);
      if (pick.dx || pick.dy){
        t.setAttribute('transform', 'translate(' + f(ox + pick.dx * k) + ',' + f(oy + pick.dy * k) + ')');
      }
    });
  }

  function smoke(cx, cy, n){
    var s = '';
    for (var i = 0; i < n; i++){
      s += '<circle class="smoke" style="animation-delay:' + (i * 1.5).toFixed(1) + 's" cx="' + f(cx) + '" cy="' + f(cy - i * 4) + '" r="' + (3 + i * 0.6) + '"/>';
    }
    return s;
  }

  var hintTimer;
  function wire(organs){
    var byId = {}, i;
    for (i = 0; i < organs.length; i++) byId[organs[i].id] = organs[i];
    var panel = document.getElementById('panel');
    var chips = document.getElementById('chips');
    var hint = document.getElementById('hint');
    var stage = document.getElementById('stage');

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
    function clearActive(){
      var a = document.querySelectorAll('.bldg.active'), c = document.querySelectorAll('.chip.active'), k;
      for (k = 0; k < a.length; k++) a[k].classList.remove('active');
      for (k = 0; k < c.length; k++) c[k].classList.remove('active');
    }
    function select(id){
      var o = byId[id];
      if (!o) return;
      renderPanel(o);
      panel.classList.add('open');
      hint.classList.add('hide');
      clearActive();
      var all = document.querySelectorAll('.bldg'), k;
      for (k = 0; k < all.length; k++) if (all[k].getAttribute('data-id') === id) all[k].classList.add('active');
      var cs = document.querySelectorAll('.chip');
      for (k = 0; k < cs.length; k++) if (cs[k].getAttribute('data-id') === id) cs[k].classList.add('active');
    }
    function closePanel(){ panel.classList.remove('open'); clearActive(); }

    panel.onclick = function(e){ if (e.target.classList && e.target.classList.contains('panel-close')) closePanel(); };
    stage.onclick = function(e){
      var t = e.target;
      while (t && t !== stage){
        if (t.getAttribute && t.getAttribute('data-id')){ select(t.getAttribute('data-id')); return; }
        t = t.parentNode;
      }
      closePanel();
    };

    chips.innerHTML = '';
    organs.forEach(function(o){
      var b = document.createElement('button');
      b.className = 'chip';
      b.setAttribute('data-id', o.id);
      b.textContent = o.cityShort;
      b.addEventListener('click', function(){ select(o.id); });
      chips.appendChild(b);
    });

    closePanel();
    hint.classList.remove('hide');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function(){ hint.classList.add('hide'); }, 9000);
  }

  function mount(svg, organs){
    document.getElementById('stage').innerHTML = svg;
    wire(organs);
    layoutTags();
    if (!mount.resizeBound){
      mount.resizeBound = true;
      window.addEventListener('resize', function(){
        clearTimeout(mount.timer);
        mount.timer = setTimeout(layoutTags, 160);
      });
    }
  }

  function svgWrap(defs, body, viewBox){
    return '<svg id="scene" viewBox="' + viewBox + '" preserveAspectRatio="xMidYMid meet">' + defs + body + '</svg>';
  }

  function stars(){
    var s = '';
    for (var i = 0; i < 70; i++){
      s += '<circle class="star" cx="' + f(-380 + Math.random() * 760) + '" cy="' + f(-150 + Math.random() * 300) + '" r="' + (Math.random() * 1.4 + 0.5).toFixed(1) + '"/>';
    }
    return s;
  }

  function roads(pts, opt){
    var rs = opt && opt.stroke ? opt.stroke : 'rgba(255,248,233,.95)';
    var ls = opt && opt.lane ? opt.lane : 'rgba(198,158,118,.5)';
    var d = pts.map(function(p, i){ var q = iso(p[0], p[1], 1); return (i ? 'L' : 'M') + f(q[0]) + ' ' + f(q[1]); }).join(' ');
    return '<path d="' + d + '" stroke="' + rs + '" stroke-width="8" stroke-linecap="round" fill="none"/>' +
           '<path d="' + d + '" class="lane" stroke="' + ls + '" stroke-width="1.5" stroke-linecap="round" fill="none"/>';
  }

  window.CITY_SCENES = { wire: wire, mount: mount, svg: svgWrap, stars: stars, roads: roads,
    iso: iso, f: f, P: P, pg: pg, bil: bil, ell: ell, line: line, box: box, shadow: shadow, tag: tag, smoke: smoke, layoutTags: layoutTags };
})();
