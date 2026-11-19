/* Города внутри — профиль, опыт, значки и питомец */
(function(){
  'use strict';
  var KEY = 'cc.profile.v1';
  var AVATARS = [];
  var PETS = [];
  var PET_KINDS = ['щенок', 'котёнок', 'хомяк', 'цыплёнок', 'рыбка'];
  for (var i = 1; i <= 6; i++) AVATARS.push('img/avatars/av-' + i + '.jpg');
  for (var j = 1; j <= 5; j++) PETS.push({ src: 'img/pets/pet-' + j + '.jpg', kind: PET_KINDS[j - 1], alt: 'Питомец ' + j });

  var LEVELS = [
    { xp: 0,    name: 'Новичок',          ico: '🌱' },
    { xp: 40,   name: 'Городской житель', ico: '🏘' },
    { xp: 110,  name: 'Исследователь',     ico: '🔎' },
    { xp: 220,  name: 'Экскурсовод',       ico: '🗣' },
    { xp: 380,  name: 'Микробиолог',       ico: '🔬' },
    { xp: 600,  name: 'Хранитель атласа',  ico: '📚' },
    { xp: 900,  name: 'Мэр города',        ico: '🎩' },
    { xp: 1300, name: 'Легенда атласа',    ico: '⭐' }
  ];

  var THEMES = [
    { id: 'sunset', name: 'Закат', lvl: 2 },
    { id: 'forest', name: 'Лес',   lvl: 4 },
    { id: 'space',  name: 'Космос', lvl: 6 }
  ];

  var FOOD = [
    { id: 'korm',  t: 'Корм',       ico: '🥣', ok: true,  why: 'То, что нужно: сытно и по делу.' },
    { id: 'water', t: 'Свежая вода', ico: '💧', ok: true,  why: 'Вода всегда нужна — питомец доволен.' },
    { id: 'candy', t: 'Конфета',    ico: '🍬', ok: false, why: 'Сладкое питомцам вредно — живот разболелся.' },
    { id: 'chips', t: 'Чипсы',      ico: '🍟', ok: false, why: 'Солёное и жирное — не еда для питомца.' }
  ];

  var state = load();
  var host = null, openFlag = false;

  function def(){
    return {
      name: '', petName: '', avatar: 0, pet: 0, xp: 0, done: {},
      stats: { photo: 0, rescue: 0, lab: 0, visit: 0 },
      feed: { last: '', streak: 0, best: 0, sickUntil: 0 },
      med: 0, theme: '', frame: false, setup: false
    };
  }
  function load(){
    var d = def();
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && typeof s === 'object'){
        if (s.name) d.name = String(s.name).slice(0, 24);
        if (s.petName) d.petName = String(s.petName).slice(0, 18);
        if (typeof s.avatar === 'number') d.avatar = s.avatar;
        if (typeof s.pet === 'number') d.pet = s.pet;
        if (typeof s.xp === 'number') d.xp = Math.max(0, s.xp | 0);
        if (s.done) d.done = s.done;
        if (s.stats) for (var k in d.stats) if (typeof s.stats[k] === 'number') d.stats[k] = s.stats[k];
        if (s.feed){
          if (s.feed.last) d.feed.last = s.feed.last;
          if (typeof s.feed.streak === 'number') d.feed.streak = s.feed.streak;
          if (typeof s.feed.best === 'number') d.feed.best = s.feed.best;
          if (typeof s.feed.sickUntil === 'number') d.feed.sickUntil = s.feed.sickUntil;
        }
        if (typeof s.med === 'number') d.med = s.med;
        if (s.theme) d.theme = s.theme;
        if (s.frame) d.frame = true;
        if (s.setup) d.setup = true;
      }
    } catch(e){}
    return d;
  }
  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){}
  }

  function today(){ return new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10); }
  function dayOffset(n){ return new Date(Date.now() + 3 * 3600 * 1000 - n * 86400000).toISOString().slice(0, 10); }
  function esc(s){
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function levelOf(xp){
    var n = 0;
    for (var i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].xp) n = i;
    return n;
  }
  function levelInfo(){
    var n = levelOf(state.xp), cur = LEVELS[n], next = LEVELS[n + 1] || null;
    var base = cur.xp, span = next ? next.xp - base : 1;
    var pct = next ? Math.min(100, Math.round((state.xp - base) / span * 100)) : 100;
    return { n: n, num: n + 1, name: cur.name, ico: cur.ico, next: next, pct: pct, left: next ? next.xp - state.xp : 0 };
  }

  function badges(){
    var st = state.stats;
    return [
      { id: 'photo-1',  ico: '📷', name: 'Первый кадр',        desc: 'Верный диагноз по фото',       got: st.photo >= 1 },
      { id: 'photo-5',  ico: '🔍', name: 'Намётанный глаз',    desc: '5 верных диагнозов',           got: st.photo >= 5 },
      { id: 'photo-12', ico: '🏆', name: 'Все фото разобраны', desc: '12 верных диагнозов',          got: st.photo >= 12 },
      { id: 'rescue-1', ico: '🌱', name: 'Спасатель',          desc: 'Спасено первое растение',      got: st.rescue >= 1 },
      { id: 'rescue-10', ico: '💚', name: 'Зелёный доктор',    desc: 'Спасено 10 растений',          got: st.rescue >= 10 },
      { id: 'lab-1',    ico: '🧪', name: 'Первый опыт',        desc: 'Запись в журнале лаборатории', got: st.lab >= 1 },
      { id: 'feed-3',   ico: '🥣', name: 'Заботливый',         desc: '3 дня подряд кормил питомца',  got: state.feed.best >= 3 },
      { id: 'feed-7',   ico: '❤️', name: 'Лучший друг',        desc: '7 дней подряд',                got: state.feed.best >= 7 },
      { id: 'visit-10', ico: '🧭', name: 'Путешественник',     desc: 'Осмотрено 10 объектов',        got: st.visit >= 10 },
      { id: 'level-5',  ico: '🎖', name: 'Микробиолог',        desc: 'Достигнут 5-й уровень',        got: levelOf(state.xp) >= 4 }
    ];
  }

  function toast(msg){
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.tm);
    toast.tm = setTimeout(function(){ t.classList.remove('show'); }, 3400);
  }

  function grant(xp, stat, key){
    if (key){
      if (state.done[key]) return false;
      state.done[key] = 1;
    }
    if (stat && state.stats[stat] != null) state.stats[stat]++;
    var before = levelOf(state.xp);
    state.xp += xp | 0;
    save();
    var after = levelOf(state.xp);
    if (after > before) toast(LEVELS[after].ico + ' Новый уровень: ' + LEVELS[after].name + '!');
    paintHeader();
    if (openFlag) render();
    return true;
  }
  function award(key, xp, stat){ return grant(xp, stat, key); }

  /* ---------- питомец ---------- */
  function mood(){
    if (state.feed.sickUntil > Date.now()) return 'sick';
    if (state.feed.last === today()) return 'happy';
    return 'sad';
  }
  function medCount(){
    return Math.max(0, Math.floor((state.stats.photo + state.stats.rescue) / 5) - state.med);
  }
  function feed(idx){
    var f = FOOD[idx];
    if (!f) return;
    var m = mood();
    if (m === 'happy'){ toast('Питомец уже накормлен сегодня 👌'); return; }
    if (m === 'sick'){ toast('Питомец болеет — сначала вылечи.'); return; }
    if (f.ok){
      var streak = state.feed.last === dayOffset(1) ? state.feed.streak + 1 : 1;
      state.feed.streak = streak;
      state.feed.best = Math.max(state.feed.best, streak);
      state.feed.last = today();
      state.feed.sickUntil = 0;
      save();
      grant(8, null);
      toast('Питомец накормлен! Серия: ' + streak + ' 🥣');
      render();
    } else {
      state.feed.sickUntil = Date.now() + 3 * 3600 * 1000;
      save();
      toast(f.why + ' Болеет 3 часа.');
      render();
    }
  }
  function heal(){
    if (medCount() <= 0){ toast('Аптечки нет. Она даётся за 5 верных диагнозов.'); return; }
    state.med++;
    state.feed.sickUntil = 0;
    save();
    toast('Вылечили аптечкой 💊');
    render();
  }

  /* ---------- разметка ---------- */
  function avatarHTML(){
    var src = state.avatar ? AVATARS[state.avatar - 1] : '';
    if (!src) return '<div class="pf-ava pf-ava-empty">🙂</div>';
    var cls = 'pf-ava' + (state.frame && levelOf(state.xp) >= 2 ? ' pf-frame' : '');
    return '<div class="' + cls + '"><img src="' + src + '" alt="Аватарка"></div>';
  }

  function headerCard(){
    var li = levelInfo();
    return '<div class="pf-head">' + avatarHTML() +
      '<div class="pf-id"><div class="pf-name">' + (state.name ? esc(state.name) : 'Без имени') + '</div>' +
      '<div class="pf-rank">' + li.ico + ' ' + li.name + ' · уровень ' + li.num + '</div>' +
      '<div class="pf-bar"><i style="width:' + li.pct + '%"></i></div>' +
      '<div class="pf-xp">' + state.xp + ' XP' + (li.next ? ' · до следующего ' + li.left : ' · максимум') + '</div></div>' +
      '<button class="pf-gear" data-pf="edit" aria-label="Настроить профиль">⚙</button></div>';
  }

  function petCard(){
    var p = PETS[state.pet - 1] || PETS[0];
    var m = mood();
    var moodText = m === 'happy' ? 'Доволен: сегодня покормлен 😊'
      : m === 'sick' ? 'Болеет. Нужна аптечка 💊'
      : 'Грустит — тебя не было. Покорми 🥺';
    var h = '<section class="pf-card pf-pet pf-' + m + '">';
    h += '<div class="pf-pet-top"><img src="' + p.src + '" alt="' + esc(p.alt) + '">' +
      '<div><h3>' + (state.petName ? esc(state.petName) : 'Твой питомец') + '</h3>' +
      '<p class="pf-kind">' + p.kind + '</p><p class="pf-mood">' + moodText + '</p>' +
      '<p class="pf-streak">Серия кормления: ' + state.feed.streak + ' · рекорд ' + state.feed.best + '</p></div></div>';
    if (m === 'happy'){
      h += '<div class="pf-fed">Приходи завтра — покормим снова.</div>';
    } else if (m === 'sick'){
      h += '<div class="pf-food"><button class="pf-fbtn" data-pf="heal"' + (medCount() ? '' : ' disabled') + '>💊 Аптечка (' + medCount() + ')</button></div>' +
        '<p class="pf-hint">Аптечка даётся за 5 верных диагнозов. Или подожди 3 часа.</p>';
    } else {
      h += '<div class="pf-food">';
      FOOD.forEach(function(f, i){
        h += '<button class="pf-fbtn" data-pf="feed" data-i="' + i + '"><span>' + f.ico + '</span>' + f.t + '</button>';
      });
      h += '</div><p class="pf-hint">Одна порция в день. Не то — питомец заболеет на 3 часа.</p>';
    }
    h += '</section>';
    return h;
  }

  function badgesCard(){
    var list = badges(), got = 0;
    list.forEach(function(b){ if (b.got) got++; });
    var h = '<section class="pf-card"><div class="pf-card-head"><h3>Значки</h3><span>' + got + '/' + list.length + '</span></div><div class="pf-badges">';
    list.forEach(function(b){
      h += '<div class="pf-badge' + (b.got ? ' got' : '') + '"><span class="ico">' + (b.got ? b.ico : '🔒') + '</span>' +
        '<b>' + b.name + '</b><small>' + b.desc + '</small></div>';
    });
    h += '</div></section>';
    return h;
  }

  function unlocksCard(){
    var li = levelInfo();
    var h = '<section class="pf-card"><div class="pf-card-head"><h3>Что открывается</h3><span>уровень ' + li.num + '</span></div><div class="pf-unlocks">';
    THEMES.forEach(function(t){
      var on = li.num >= t.lvl;
      h += '<button class="pf-unlock' + (on ? ' on' : '') + (state.theme === t.id ? ' sel' : '') + '" data-pf="theme" data-id="' + t.id + '"' + (on ? '' : ' disabled') + '>' +
        '<span>' + (on ? '🎨' : '🔒') + '</span><b>Тема «' + t.name + '»</b><small>' + (on ? 'Открыта' : 'С ' + t.lvl + ' уровня') + '</small></button>';
    });
    h += '<button class="pf-unlock' + (li.num >= 3 ? ' on' : '') + (state.frame ? ' sel' : '') + '" data-pf="frame"' + (li.num >= 3 ? '' : ' disabled') + '>' +
      '<span>' + (li.num >= 3 ? '🖼' : '🔒') + '</span><b>Золотая рамка</b><small>' + (li.num >= 3 ? 'Открыта' : 'С 3 уровня') + '</small></button>';
    h += '</div></section>';
    return h;
  }

  function statsCard(){
    var s = state.stats;
    return '<section class="pf-card"><div class="pf-card-head"><h3>Статистика</h3></div><div class="pf-stats">' +
      '<div><b>' + s.photo + '</b><span>фото-диагнозов</span></div>' +
      '<div><b>' + s.rescue + '</b><span>растений спасено</span></div>' +
      '<div><b>' + s.lab + '</b><span>опытов в журнале</span></div>' +
      '<div><b>' + s.visit + '</b><span>объектов изучено</span></div>' +
      '</div></section>';
  }

  function setupHTML(){
    var h = '<div class="pf-setup">';
    h += '<h2>Давай познакомимся</h2><p class="pf-sub">Имя придумываешь ты. Как тебя звать в городе?</p>';
    h += '<label class="pf-label" for="pfName">Имя</label><input id="pfName" class="pf-input" maxlength="24" placeholder="Например, София" value="' + esc(state.name) + '">';
    h += '<label class="pf-label">Аватарка</label><div class="pf-grid av">';
    AVATARS.forEach(function(src, i){
      h += '<button class="pf-pick' + (state.avatar === i + 1 ? ' sel' : '') + '" data-pf="avatar" data-i="' + (i + 1) + '"><img src="' + src + '" alt="Аватарка ' + (i + 1) + '"></button>';
    });
    h += '</div><label class="pf-label">Питомец</label><div class="pf-grid pet">';
    PETS.forEach(function(p, i){
      h += '<button class="pf-pick' + (state.pet === i + 1 ? ' sel' : '') + '" data-pf="pet" data-i="' + (i + 1) + '"><img src="' + p.src + '" alt="' + esc(p.alt) + '"><small>' + p.kind + '</small></button>';
    });
    h += '</div>';
    h += '<label class="pf-label" for="pfPetName">Как зовут питомца</label><input id="pfPetName" class="pf-input" maxlength="18" placeholder="Имя питомца" value="' + esc(state.petName || '') + '">';
    h += '<button class="pf-save" data-pf="save">Готово</button>';
    h += '<p class="pf-hint">Всё хранится только в этом браузере.</p>';
    h += '</div>';
    return h;
  }

  function render(){
    if (!host) return;
    var h = '<div class="pf-scrim" data-pf="close"></div><div class="pf-modal" role="dialog" aria-modal="true" aria-label="Профиль">' +
      '<button class="pf-close" data-pf="close" aria-label="Закрыть">×</button>';
    if (state.setup || !state.name){
      h += setupHTML();
    } else {
      h += '<div class="pf-body">' + headerCard() + petCard() + badgesCard() + unlocksCard() + statsCard() +
        '<button class="pf-reset" data-pf="reset">Сбросить профиль</button></div>';
    }
    h += '</div>';
    host.innerHTML = h;
    host.classList.add('open');
    openFlag = true;
    document.body.classList.add('pf-lock');
    var inp = document.getElementById('pfName');
    if (inp && !state.name) setTimeout(function(){ try { inp.focus(); } catch(e){} }, 120);
  }

  function close(){
    if (!host) return;
    host.classList.remove('open');
    host.innerHTML = '';
    openFlag = false;
    document.body.classList.remove('pf-lock');
  }

  function open(){
    if (!host){
      host = document.getElementById('profile');
      if (!host){
        host = document.createElement('div');
        host.id = 'profile'; host.className = 'profile';
        document.body.appendChild(host);
      }
    }
    render();
  }

  function paintHeader(){
    var btn = document.getElementById('profileBtn');
    if (!btn) return;
    var chip = btn.querySelector('.pf-chip');
    var lbl = btn.querySelector('.lbl');
    if (!chip) return;
    var li = levelInfo();
    var src = state.avatar ? AVATARS[state.avatar - 1] : '';
    chip.innerHTML = src ? '<img src="' + src + '" alt="">' : '🙂';
    if (lbl) lbl.textContent = state.name ? state.name : 'Профиль';
    btn.classList.toggle('has', !!state.name);
    btn.title = li.name + ' · ' + state.xp + ' XP';
  }

  function applyTheme(){
    var b = document.body;
    b.classList.remove('cc-theme-sunset', 'cc-theme-forest', 'cc-theme-space');
    if (state.theme) b.classList.add('cc-theme-' + state.theme);
  }

  function markPick(el){
    var grid = el.parentNode;
    if (!grid) return;
    var picks = grid.querySelectorAll('.pf-pick');
    for (var i = 0; i < picks.length; i++) picks[i].classList.toggle('sel', picks[i] === el);
  }

  function bind(){
    document.addEventListener('click', function(e){
      var t = e.target;
      var pbtn = t && t.closest ? t.closest('#profileBtn') : null;
      if (pbtn){ open(); return; }
      var el = t && t.closest ? t.closest('[data-pf]') : null;
      if (!el) return;
      var a = el.getAttribute('data-pf');
      if (a === 'close'){ close(); return; }
      if (a === 'avatar'){ state.avatar = parseInt(el.getAttribute('data-i'), 10); save(); markPick(el); return; }
      if (a === 'pet'){ state.pet = parseInt(el.getAttribute('data-i'), 10); save(); markPick(el); return; }
      if (a === 'feed'){ feed(parseInt(el.getAttribute('data-i'), 10)); return; }
      if (a === 'heal'){ heal(); return; }
      if (a === 'theme'){
        var id = el.getAttribute('data-id');
        state.theme = state.theme === id ? '' : id;
        save(); applyTheme(); render(); return;
      }
      if (a === 'frame'){ state.frame = !state.frame; save(); render(); return; }
      if (a === 'edit'){ state.setup = true; save(); render(); return; }
      if (a === 'save'){
        var n = document.getElementById('pfName');
        var pn = document.getElementById('pfPetName');
        var name = n ? n.value.trim().slice(0, 24) : '';
        if (!name){ toast('Напиши имя — без него профиль не соберётся'); if (n) n.focus(); return; }
        state.name = name;
        if (pn) state.petName = pn.value.trim().slice(0, 18);
        if (!state.avatar) state.avatar = 1;
        if (!state.pet) state.pet = 1;
        state.setup = false;
        save(); paintHeader(); render();
        toast('Привет, ' + name + '! Профиль готов 👌');
        return;
      }
      if (a === 'reset'){
        if (!window.confirm('Сбросить профиль, опыт и значки? Фото и питомцы останутся на сайте.')) return;
        state = def(); save(); applyTheme(); paintHeader(); render();
        return;
      }
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && openFlag) close();
    });
  }

  window.CC_PROFILE = {
    get: function(){ return state; },
    award: award,
    grant: function(xp, stat){ return grant(xp, stat); },
    open: open,
    close: close,
    toast: toast,
    mood: mood,
    level: levelInfo
  };

  function boot(){
    applyTheme();
    paintHeader();
    bind();
    if (!state.name && !localStorage.getItem('cc.pf.seen')){
      try { localStorage.setItem('cc.pf.seen', '1'); } catch(e){}
      setTimeout(open, 900);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
