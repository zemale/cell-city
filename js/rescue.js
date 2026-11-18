/* Города внутри — спасатель растений: интерфейс */
(function(){
  'use strict';
  var DATA = window.CC_RESCUE;
  var host = document.getElementById('rescue');
  if (!DATA || !host) return;

  var SKEY = 'cc-rescue-v1';
  var state = { level: 'easy', i: 0, picked: null, right: 0, done: 0, solved: {}, filter: 'all', caseId: null };

  try {
    var saved = JSON.parse(localStorage.getItem(SKEY));
    if (saved && saved.solved) { state.solved = saved.solved; }
  } catch(e){}

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function level(){ for (var i=0;i<DATA.levels.length;i++) if (DATA.levels[i].id===state.level) return DATA.levels[i]; return DATA.levels[0]; }
  function filtered(){ return DATA.cases.filter(function(c){ return state.filter === 'all' || c.level === state.filter; }); }
  function cases(){ return filtered(); }
  function byId(id){ for (var i=0;i<DATA.cases.length;i++) if (DATA.cases[i].id===id) return DATA.cases[i]; return null; }
  function lvById(id){ for (var i=0;i<DATA.levels.length;i++) if (DATA.levels[i].id===id) return DATA.levels[i]; return DATA.levels[0]; }
  function caseNow(){ return state.caseId ? byId(state.caseId) : null; }
  function save(){ try { localStorage.setItem(SKEY, JSON.stringify({ solved: state.solved })); } catch(e){} }

  /* ---------- сцена растения ---------- */
  function leaf(x, y, ang, len, wide, droop, fill, dark){
    var dx = Math.cos(ang) * len, dy = Math.sin(ang) * len;
    var c1x = x + dx*0.3 - Math.sin(ang)*wide*droop, c1y = y + dy*0.3 + Math.cos(ang)*wide*droop;
    var c2x = x + dx*0.7 - Math.sin(ang)*wide*(1-droop*0.4), c2y = y + dy*0.7 + Math.cos(ang)*wide*(1-droop*0.4);
    return '<path d="M'+x.toFixed(1)+' '+y.toFixed(1)+' Q'+c1x.toFixed(1)+' '+c1y.toFixed(1)+' '+(x+dx).toFixed(1)+' '+(y+dy+droop*6).toFixed(1)+' Q'+c2x.toFixed(1)+' '+(c2y+wide*0.5).toFixed(1)+' '+x.toFixed(1)+' '+y.toFixed(1)+' Z" fill="'+fill+'" stroke="'+dark+'" stroke-width="1.1" stroke-linejoin="round"/>';
  }
  function scene(art){
    var wilt = art.wilt == null ? 0.3 : art.wilt;
    var tone = art.tone || 'green';
    var spots = art.spots || 'none';
    var damp = !!art.damp;

    var greens = {
      green: ['#79b978', '#4c8b52'],
      dry:   ['#c3b47a', '#8f8248'],
      pale:  ['#c9dcae', '#8fa879'],
      dark:  ['#5f8371', '#39544a']
    };
    var g = greens[tone] || greens.green;

    var bend = wilt * 46;
    var droop = wilt;
    var topY = 120 + wilt * 26;

    var s = '<svg viewBox="0 0 320 300" role="img" aria-label="Растение с признаками">';
    s += '<defs><linearGradient id="rcpot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8926a"/><stop offset="1" stop-color="#b1714e"/></linearGradient>' +
         '<radialGradient id="rcglow" cx="50%" cy="30%" r="70%"><stop offset="0" stop-color="#ffffff" stop-opacity=".85"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>';
    s += '<ellipse cx="160" cy="272" rx="108" ry="17" fill="#000" opacity=".07"/>';
    s += '<circle cx="160" cy="150" r="132" fill="url(#rcglow)" opacity=".7"/>';

    /* стебель */
    var sx = 160, sy = 236;
    s += '<path d="M'+sx+' '+sy+' C'+(sx+bend*0.3)+' '+(sy-52)+' '+(sx+bend*0.8)+' '+(topY+56)+' '+(sx+bend)+' '+topY+'" ' +
         'stroke="'+g[1]+'" stroke-width="7" fill="none" stroke-linecap="round"/>';

    var lw = 46 - wilt*8, lh = 30 - wilt*4;
    /* нижние листья */
    s += leaf(sx+bend*0.15, sy-46, Math.PI*0.92 + wilt*0.55, lw*1.15, lh, droop, g[0], g[1]);
    s += leaf(sx+bend*0.2, sy-58, Math.PI*0.08 - wilt*0.55, lw*1.15, lh, droop, g[0], g[1]);
    /* средние */
    s += leaf(sx+bend*0.5, sy-96, Math.PI*0.95 + wilt*0.7, lw*1.05, lh*0.95, droop, g[0], g[1]);
    s += leaf(sx+bend*0.55, sy-108, Math.PI*0.05 - wilt*0.7, lw*1.05, lh*0.95, droop, g[0], g[1]);
    /* верхние */
    s += leaf(sx+bend*0.85, sy-152, Math.PI*1.02 + wilt*0.85, lw*0.9, lh*0.85, droop, g[0], g[1]);
    s += leaf(sx+bend*0.9, sy-164, Math.PI*1.98 - wilt*0.85, lw*0.9, lh*0.85, droop, g[0], g[1]);
    /* макушка */
    s += '<ellipse cx="'+(sx+bend)+'" cy="'+topY+'" rx="'+(13-wilt*3)+'" ry="'+(17-wilt*4)+'" fill="'+g[0]+'" stroke="'+g[1]+'" stroke-width="1.1"/>';

    /* признаки */
    if (spots === 'burn'){
      s += '<g opacity=".85">' +
        '<ellipse cx="'+(sx-34)+'" cy="'+(sy-52)+'" rx="9" ry="6" fill="#a9713f" opacity=".75" transform="rotate(-18 '+(sx-34)+' '+(sy-52)+')"/>' +
        '<ellipse cx="'+(sx+38)+'" cy="'+(sy-116)+'" rx="8" ry="5" fill="#b47c46" opacity=".7" transform="rotate(14 '+(sx+38)+' '+(sy-116)+')"/>' +
        '<ellipse cx="'+(sx+bend+18)+'" cy="'+(sy-160)+'" rx="6" ry="4" fill="#a9713f" opacity=".65"/></g>';
    }
    if (spots === 'mosaic'){
      s += '<g opacity=".8">' +
        '<path d="M'+(sx-52)+' '+(sy-40)+' q14 -12 26 -3 q-9 11 -26 3Z" fill="#e8e58a"/>' +
        '<path d="M'+(sx+16)+' '+(sy-104)+' q16 -10 27 1 q-11 12 -27 -1Z" fill="#dfe27a"/>' +
        '<path d="M'+(sx-24)+' '+(sy-150)+' q13 -9 22 2 q-10 10 -22 -2Z" fill="#e6e894"/></g>';
    }
    if (spots === 'powder'){
      s += '<g opacity=".9" fill="#f4f6f2">' +
        '<ellipse cx="'+(sx-26)+'" cy="'+(sy-58)+'" rx="15" ry="8" transform="rotate(-16 '+(sx-26)+' '+(sy-58)+')"/>' +
        '<ellipse cx="'+(sx+30)+'" cy="'+(sy-112)+'" rx="12" ry="6.5" transform="rotate(12 '+(sx+30)+' '+(sy-112)+')"/>' +
        '<ellipse cx="'+(sx+bend-6)+'" cy="'+(sy-158)+'" rx="9" ry="5"/></g>';
    }
    if (spots === 'web'){
      s += '<g stroke="#e8ecef" stroke-width=".9" opacity=".9" fill="none">' +
        '<path d="M'+(sx-58)+' '+(sy-90)+' q34 -26 62 -4 M'+(sx-58)+' '+(sy-70)+' q38 -22 66 0 M'+(sx-52)+' '+(sy-104)+' q-6 26 4 44"/>' +
        '<path d="M'+(sx+8)+' '+(sy-146)+' q26 -18 46 -2 M'+(sx+10)+' '+(sy-132)+' q28 -14 44 2"/></g>';
    }
    if (damp){
      s += '<path d="M'+(sx-30)+' '+(sy+6)+' q30 8 60 0" stroke="#6f9bab" stroke-width="2.5" fill="none" opacity=".5"/>';
    }

    /* горшок */
    s += '<path d="M106 232 L214 232 L200 278 Q160 288 120 278 Z" fill="url(#rcpot)" stroke="#9a5f40" stroke-width="1.4"/>';
    s += '<rect x="100" y="222" width="120" height="16" rx="7" fill="#e2a077" stroke="#9a5f40" stroke-width="1.4"/>';
    s += '<ellipse cx="160" cy="231" rx="49" ry="7" fill="#584033" opacity="'+(damp?'.85':'.55')+'"/>';
    s += '</svg>';
    return s;
  }

  /* ---------- разметка ---------- */
  function chipsRow(){
    var items = [{ id:'all', ico:'🗂', name:'Все дела' }].concat(DATA.levels);
    return items.map(function(l){
      return '<button class="rc-lv'+(l.id===state.filter?' on':'')+'" data-filter="'+l.id+'">'+l.ico+' '+esc(l.name)+'</button>';
    }).join('');
  }

  function shortStory(s){
    s = String(s || '');
    if (s.length <= 104) return s;
    s = s.slice(0, 104).replace(/[,\s]+\S*$/, '');
    return s + '…';
  }

  function cardHTML(c){
    var l = lvById(c.level);
    var solved = !!state.solved[c.id];
    return '<button class="rc-card'+(solved?' solved':'')+'" data-open="'+c.id+'">' +
        '<span class="rc-card-top">' +
          '<span class="rc-card-lv lv-'+c.level+'">'+l.ico+' '+esc(l.name)+'</span>' +
          (solved ? '<span class="rc-card-mark">✅</span>' : '<span class="rc-card-mark new">новое</span>') +
        '</span>' +
        '<span class="rc-card-plant"><span class="ci">'+c.ico+'</span>'+esc(c.plant)+'</span>' +
        '<span class="rc-card-tag">'+esc(c.tag)+'</span>' +
        '<span class="rc-card-prev">'+esc(shortStory(c.story))+'</span>' +
      '</button>';
  }

  function renderList(){
    var all = DATA.cases, list = filtered();
    var solvedAll = all.filter(function(x){ return state.solved[x.id]; }).length;
    var pct = Math.round(solvedAll / all.length * 100);
    var html = '<div class="rc-wrap">' +
      '<div class="rc-head">' +
        '<div class="rc-title"><span class="rk">🌱</span><div><h2>Спасатель растений</h2>' +
          '<p>Выбери дело — внутри история, рисунок с признаками и варианты ответа.</p></div></div>' +
        '<div class="rc-levels">' + chipsRow() + '</div>' +
      '</div>' +
      '<div class="rc-progress"><span>Спасено ' + solvedAll + ' из ' + all.length + '</span>' +
        '<span class="rc-bar"><i style="width:'+pct+'%"></i></span>' +
        '<span class="rc-score">✅ ' + solvedAll + '</span></div>' +
      '<div class="rc-cards">' + list.map(cardHTML).join('') + '</div>' +
      '</div>';
    host.innerHTML = html;
  }

  function render(){
    var c = caseNow();
    if (!c){ renderList(); return; }
    var l = lvById(c.level), list = filtered(), pos = -1;
    for (var i=0;i<list.length;i++) if (list[i].id === c.id) pos = i;

    var html = '<div class="rc-wrap">' +
      '<div class="rc-head">' +
        '<div class="rc-title">' +
          '<button class="rc-back" data-back="1" aria-label="К списку дел">←</button>' +
          '<div><h2>' + c.ico + ' ' + esc(c.plant) + '</h2>' +
            '<p>' + l.ico + ' ' + esc(l.name) + ' · ' + esc(c.tag) + '</p></div>' +
        '</div>' +
        '<div class="rc-pos">' + (pos >= 0 && list.length > 1 ? ('Дело ' + (pos+1) + ' из ' + list.length) : '') + '</div>' +
      '</div>' +
      '<div class="rc-body">' +
        '<div class="rc-left">' +
          '<div class="rc-stage">' + scene(c.art || {}) + '</div>' +
          '<div class="rc-plate"><b>' + c.ico + ' ' + esc(c.plant) + '</b><span>' + esc(c.tag) + '</span></div>' +
        '</div>' +
        '<div class="rc-right">' +
          '<p class="rc-story">' + esc(c.story) + '</p>' +
          '<h3 class="rc-q">' + esc(c.q) + '</h3>' +
          '<div class="rc-opts">' + c.options.map(function(o, idx){
            var cls = 'rc-opt';
            if (state.picked !== null){
              if (o.ok) cls += ' ok';
              else if (idx === state.picked) cls += ' bad';
              else cls += ' dim';
            }
            return '<button class="'+cls+'" data-opt="'+idx+'"'+(state.picked!==null?' disabled':'')+'>' +
              '<span class="num">' + 'ABCD'[idx] + '</span><span>' + esc(o.t) + '</span></button>';
          }).join('') + '</div>' +
          (state.picked === null ? '' : feedback(c)) +
        '</div>' +
      '</div></div>';
    host.innerHTML = html;
  }

  function feedback(c){
    var picked = c.options[state.picked];
    var html = '<div class="rc-feedback">';
    html += '<div class="rc-line ' + (picked.ok ? 'good' : 'bad') + '"><b>' + (picked.ok ? 'Верно!' : 'Не совсем') + '</b>' + esc(picked.why) + '</div>';
    if (!picked.ok){
      var right = c.options.filter(function(o){ return o.ok; })[0];
      html += '<div class="rc-line good"><b>А правильный ответ</b>' + esc(right.t) + ' — ' + esc(right.why) + '</div>';
    }
    html += '<div class="rc-lesson"><b>Что происходит на самом деле.</b> ' + esc(c.lesson) + '</div>';
    var list = filtered(), pos = -1;
    for (var i=0;i<list.length;i++) if (list[i].id === c.id) pos = i;
    var hasNext = pos >= 0 && pos < list.length - 1;
    html += '<div class="rc-nav">';
    if (hasNext) html += '<button class="rc-next" data-next="1">Дальше: ' + esc(list[pos+1].plant) + ' →</button>';
    html += '<button class="rc-next ghost" data-back="1">↩ К списку дел</button>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  host.addEventListener('click', function(e){
    var t = e.target;
    var fl = t.closest ? t.closest('[data-filter]') : null;
    if (fl){
      state.filter = fl.getAttribute('data-filter');
      state.caseId = null; state.picked = null;
      render(); return;
    }
    var op = t.closest ? t.closest('[data-open]') : null;
    if (op){
      var pick = byId(op.getAttribute('data-open'));
      if (pick){
        state.caseId = pick.id; state.level = pick.level; state.picked = null; state.i = 0;
        render(); window.scrollTo(0, 0);
      }
      return;
    }
    var bk = t.closest ? t.closest('[data-back]') : null;
    if (bk){ state.caseId = null; state.picked = null; render(); window.scrollTo(0, 0); return; }
    var opt = t.closest ? t.closest('[data-opt]') : null;
    if (opt && state.picked === null && state.caseId){
      var idx = parseInt(opt.getAttribute('data-opt'), 10);
      var c = caseNow();
      state.picked = idx;
      if (c.options[idx].ok){ state.solved[c.id] = true; save(); }
      render();
      return;
    }
    var nx = t.closest ? t.closest('[data-next]') : null;
    if (nx && state.caseId){
      var list = filtered(), cur = caseNow(), p = -1;
      for (var j=0;j<list.length;j++) if (cur && list[j].id === cur.id) p = j;
      if (p >= 0 && p < list.length - 1){
        state.caseId = list[p+1].id; state.level = list[p+1].level; state.picked = null;
      } else {
        state.caseId = null; state.picked = null;
      }
      render(); window.scrollTo(0, 0);
      return;
    }
    if (t.closest && t.closest('[data-atlas]')){
      if (window.CC_ATLAS_OPEN) window.CC_ATLAS_OPEN();
      return;
    }
  });

  window.CC_RESCUE_OPEN = function(levelId){
    var app = document.querySelector('.app');
    if (app) app.classList.add('rescue-on');
    document.body.classList.add('rescue-open');
    if (levelId) state.filter = levelId;
    state.caseId = null; state.picked = null; state.i = 0;
    render();
    window.scrollTo(0, 0);
  };
  window.CC_RESCUE_CLOSE = function(){
    var app = document.querySelector('.app');
    if (app) app.classList.remove('rescue-on');
    document.body.classList.remove('rescue-open');
    window.scrollTo(0, 0);
  };
})();
