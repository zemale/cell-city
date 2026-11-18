/* Города внутри — окуляр: микроскоп с подписями */
(function(){
  'use strict';
  var host = document.getElementById('eye');
  if (!host) return;

  var SYS = [
    { id:'cell',     name:'Клетка',     ico:'🏙', accent:'#7f9cf5', grad:['#8fa9ff','#5b78d6'], data:function(){ return window.CITY_DATA; } },
    { id:'plant',    name:'Растение',   ico:'🌿', accent:'#63a86b', grad:['#8ecf92','#3f7d4c'], data:function(){ return window.PLANT_DATA; } },
    { id:'animal',   name:'Животное',   ico:'🐾', accent:'#c98b4b', grad:['#e6b077','#a86a32'], data:function(){ return window.ANIMAL_DATA; } },
    { id:'human',    name:'Человек',    ico:'🫀', accent:'#cf6f8b', grad:['#ef9aae','#b04f6c'], data:function(){ return window.HUMAN_DATA; } },
    { id:'bacteria', name:'Бактерия',   ico:'🦠', accent:'#3f9aa8', grad:['#77c9d4','#2b7683'], data:function(){ return window.BACTERIA_DATA; } }
  ];
  var state = { sys:'cell', sel:null };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function current(){ for (var i=0;i<SYS.length;i++) if (SYS[i].id===state.sys) return SYS[i]; return SYS[0]; }
  function organs(){
    var d = current().data();
    if (!d || !d.organs) return [];
    return d.organs;
  }

  /* точки по золотому углу внутри круга */
  function layout(n){
    var pts = [], R = 112, cx = 200, cy = 200;
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++){
      var r = R * Math.sqrt((i + 0.75) / n);
      var a = i * golden - Math.PI/2;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.96, r: 26 - (i / Math.max(1,n)) * 8 });
    }
    return pts;
  }

  function field(){
    var list = organs(), pts = layout(list.length), g = current().grad;
    var s = '<svg viewBox="0 0 400 400" role="img" aria-label="Поле зрения микроскопа">';
    s += '<defs>' +
      '<radialGradient id="eyeBg" cx="50%" cy="46%" r="55%"><stop offset="0" stop-color="' + g[0] + '" stop-opacity=".30"/><stop offset="1" stop-color="#0a0e16" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="eyeBlob" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="' + g[1] + '" stop-opacity=".95"/></radialGradient>' +
      '<clipPath id="eyeClip"><circle cx="200" cy="200" r="150"/></clipPath>' +
      '</defs>';
    s += '<circle cx="200" cy="200" r="168" fill="#0d131f"/>';
    s += '<circle cx="200" cy="200" r="150" fill="#101b2b"/>';
    s += '<g clip-path="url(#eyeClip)">';
    s += '<circle cx="200" cy="205" r="150" fill="url(#eyeBg)"/>';
    /* сетка-шкала */
    s += '<g stroke="#2a3b57" stroke-width="1" opacity=".55">';
    for (var k = 1; k <= 4; k++){
      s += '<circle cx="200" cy="200" r="' + (k * 34) + '" fill="none" opacity="' + (k === 4 ? .3 : .55) + '"/>';
    }
    s += '<path d="M200 40 V360 M40 200 H360" opacity=".45"/>';
    s += '</g>';
    /* блики */
    s += '<ellipse cx="150" cy="140" rx="86" ry="58" fill="#ffffff" opacity=".05"/>';

    list.forEach(function(o, i){
      var p = pts[i], on = state.sel === o.id;
      var r = p.r * (on ? 1.16 : 1);
      s += '<g class="eye-org' + (on ? ' on' : '') + '" data-org="' + esc(o.id) + '" style="cursor:pointer">' +
        '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (r + 5).toFixed(1) + '" fill="' + g[1] + '" opacity="' + (on ? .45 : .16) + '"/>' +
        '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="url(#eyeBlob)" stroke="' + (on ? '#ffffff' : 'rgba(255,255,255,.35)') + '" stroke-width="' + (on ? 2 : 1) + '"/>' +
        '<text x="' + p.x.toFixed(1) + '" y="' + (p.y + 4).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#0e1726" font-family="Manrope,sans-serif">' + (i + 1) + '</text>' +
        '</g>';
    });
    s += '</g>';
    /* окулярная обвязка */
    s += '<circle cx="200" cy="200" r="150" fill="none" stroke="#384c6d" stroke-width="6"/>';
    s += '<circle cx="200" cy="200" r="158" fill="none" stroke="#1b2537" stroke-width="10"/>';
    s += '<path d="M200 26 v18 M200 356 v18 M26 200 h18 M356 200 h18" stroke="#4d6a94" stroke-width="3" stroke-linecap="round"/>';
    s += '</svg>';
    return s;
  }

  function legend(){
    var list = organs(), g = current().grad;
    return list.map(function(o, i){
      var on = state.sel === o.id;
      return '<button class="eye-item' + (on ? ' on' : '') + '" data-org="' + esc(o.id) + '">' +
        '<span class="n" style="background:' + g[0] + '">' + (i + 1) + '</span>' +
        '<span class="tx"><b>' + esc(o.name) + '</b>' + esc(o.short || o.cityShort || '') + '</span></button>';
    }).join('');
  }

  function note(){
    var list = organs(), sel = null;
    for (var i = 0; i < list.length; i++) if (list[i].id === state.sel) sel = list[i];
    if (!sel) return 'Нажми на точку в поле зрения или на подпись справа — покажу, что это и зачем.';
    var txt = sel.detail || sel.lead || sel.why || '';
    return '<b>' + esc(sel.name) + '</b> — ' + esc(txt);
  }

  function render(){
    host.innerHTML =
      '<div class="eye-top">' +
        '<div class="eye-title"><span>🔬</span>Окуляр · ' + esc(current().name) + '</div>' +
        '<div class="eye-pills">' + SYS.map(function(s){
          return '<button class="eye-pill' + (s.id === state.sys ? ' on' : '') + '" data-sys="' + s.id + '">' + s.ico + ' ' + esc(s.name) + '</button>';
        }).join('') + '</div>' +
        '<button class="eye-close" data-close="1">Закрыть ✕</button>' +
      '</div>' +
      '<div class="eye-main">' +
        '<div><div class="eye-scope">' + field() + '</div><p class="eye-hint">Крути колесико — приближение. Точки — органы и органеллы.</p></div>' +
        '<div class="eye-legend"><h3>Что видно в окуляре</h3>' + legend() + '<p class="eye-note">' + note() + '</p></div>' +
      '</div>';
  }

  host.addEventListener('click', function(e){
    var t = e.target;
    if (t.closest && t.closest('[data-close]')){ close(); return; }
    var p = t.closest ? t.closest('[data-sys]') : null;
    if (p){ state.sys = p.getAttribute('data-sys'); state.sel = null; render(); return; }
    var o = t.closest ? t.closest('[data-org]') : null;
    if (o){ var id = o.getAttribute('data-org'); state.sel = state.sel === id ? null : id; render(); return; }
  });

  function open(sysId){
    if (sysId) state.sys = sysId;
    state.sel = null;
    host.classList.add('on');
    document.body.classList.add('eye-open');
    render();
  }
  function close(){
    host.classList.remove('on');
    document.body.classList.remove('eye-open');
  }

  window.CC_EYE_OPEN = open;
  window.CC_EYE_CLOSE = close;
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
})();
