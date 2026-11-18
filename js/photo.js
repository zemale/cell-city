/* Города внутри — фото-диагноз: найди больное растение и определи, что с ним */
(function(){
  'use strict';
  var ART = window.CC_PLANT_ART;
  var host = document.getElementById('photo');
  if (!ART || !host) return;

  var SKEY = 'cc-photo-v1';
  var state = { round: 0, step: 1, pick: null, badTile: -1, note: '', solved: {} };
  try {
    var sv = JSON.parse(localStorage.getItem(SKEY));
    if (sv && sv.solved) state.solved = sv.solved;
  } catch(e){}

  var ROUNDS = [
    {
      id: 'ficus-powder',
      plants: ['Фикус', 'Монстера', 'Пеларгония', 'Хлорофитум'],
      sick: 0,
      art: { tone: 'green', wilt: 0.22, spots: 'powder' },
      options: [
        { t: 'Мучнистая роса', ok: true, why: 'Белый налёт пятнами, будто листья припудрили мукой, — это грибок.' },
        { t: 'Паутинный клещ', ok: false, why: 'Клещ оставляет тонкую паутинку и мелкие светлые точки, а не сплошной налёт.' },
        { t: 'Солнечный ожог', ok: false, why: 'От солнца листья буреют сухими пятнами, налёта при этом не бывает.' },
        { t: 'Нехватка воды', ok: false, why: 'Без воды листья вянут и сохнут по краям, но белыми не становятся.' }
      ],
      what: 'Убрать поражённые листья, протереть остальные и обработать фунгицидом. Проветривать комнату — грибок любит духоту.'
    },
    {
      id: 'orchid-web',
      plants: ['Орхидея', 'Фиалка', 'Роза', 'Бегония'],
      sick: 0,
      art: { tone: 'green', wilt: 0.34, spots: 'web' },
      options: [
        { t: 'Паутинный клещ', ok: true, why: 'Тонкая паутинка между листьями и тусклые точки — типичная работа клеща.' },
        { t: 'Мучнистая роса', ok: false, why: 'Роса даёт белый плотный налёт, а здесь видна именно паутинка.' },
        { t: 'Перелив', ok: false, why: 'От перелива желтеют нижние листья и пахнет сыростью из горшка, паутины нет.' },
        { t: 'Вирус мозаики', ok: false, why: 'Мозаика — это жёлто-зелёные разводы по листу, а не паутина.' }
      ],
      what: 'Смыть клеща тёплым душем, обработать акарицидом 2–3 раза с перерывом в неделю. Клещ боится влажного воздуха.'
    },
    {
      id: 'hydrangea-burn',
      plants: ['Гортензия', 'Папоротник', 'Сансевиерия', 'Алоэ'],
      sick: 0,
      art: { tone: 'green', wilt: 0.26, spots: 'burn' },
      options: [
        { t: 'Солнечный ожог', ok: true, why: 'Бурые сухие пятна с одной стороны — там, куда падало солнце.' },
        { t: 'Грибок', ok: false, why: 'Грибок даёт налёт или мокнущие пятна, а не сухие бурые подпалины.' },
        { t: 'Хлороз', ok: false, why: 'При хлорозе лист светлеет целиком, пятна не бурые и не сухие.' },
        { t: 'Засуха', ok: false, why: 'При засухе вянут все листья сразу, а не отдельные участки.' }
      ],
      what: 'Переставить в полутень, отрезать обожжённые части. Приучать к солнцу постепенно, а не выносить сразу.'
    },
    {
      id: 'lemon-chlorosis',
      plants: ['Лимон', 'Мирт', 'Калатея', 'Традесканция'],
      sick: 0,
      art: { tone: 'pale', wilt: 0.14 },
      options: [
        { t: 'Хлороз — не хватает железа', ok: true, why: 'Лист светлеет, а жилки остаются зелёными — классический признак нехватки железа.' },
        { t: 'Ожог', ok: false, why: 'Ожог — это отдельные бурые пятна, а тут побледнел весь лист.' },
        { t: 'Клещ', ok: false, why: 'Клещ оставляет точки и паутинку, но не делает лист равномерно бледным.' },
        { t: 'Перелив', ok: false, why: 'Перелив чаще желтит нижние листья и мягчит стебель, а не обесцвечивает верхние.' }
      ],
      what: 'Полить хелатом железа по листу, проверить воду — жёсткая вода мешает усвоению. Через неделю обычно зеленеет.'
    },
    {
      id: 'cactus-dry',
      plants: ['Кактус', 'Толстянка', 'Эхеверия', 'Алоэ'],
      sick: 0,
      art: { tone: 'dry', wilt: 0.72 },
      options: [
        { t: 'Пересушка', ok: true, why: 'Тело сморщилось и поникло, цвет ушёл в жёлто-серый — запас воды кончился.' },
        { t: 'Гниль корней', ok: false, why: 'При гнили наоборот: мягкое, водянистое тело и тёмное пятно у основания.' },
        { t: 'Мучнистая роса', ok: false, why: 'Роса — белый налёт сверху; здесь его нет.' },
        { t: 'Хлороз', ok: false, why: 'От нехватки железа лист светлеет, но не сморщивается.' }
      ],
      what: 'Полить и дать воде стечь, поставить в тень на пару дней. Кактус переносит засуху, но не бесконечно — раз в месяц воду всё же надо.'
    },
    {
      id: 'begonia-mosaic',
      plants: ['Бегония', 'Колеус', 'Пеларгония', 'Примула'],
      sick: 0,
      art: { tone: 'green', wilt: 0.18, spots: 'mosaic' },
      options: [
        { t: 'Вирус мозаики', ok: true, why: 'Жёлто-зелёные разводы и пятна неправильной формы по всему листу — похоже на вирус.' },
        { t: 'Ожог', ok: false, why: 'Ожог сухой и бурый, а тут пятна светлые, живые, без сухости.' },
        { t: 'Клещ', ok: false, why: 'Клещ оставляет мелкие точки и паутину, но не крупные пятна-разводы.' },
        { t: 'Нехватка света', ok: false, why: 'Без света растение вытягивается и бледнеет, но пятнами не покрывается.' }
      ],
      what: 'Вирус не лечится — растение лучше убрать от остальных, черенковать только здоровые побеги. Инструмент после работы продезинфицировать.'
    },
    {
      id: 'spathiphyllum-rootrot',
      plants: ['Спатифиллум', 'Аглаонема', 'Диффенбахия', 'Замиокулькас'],
      sick: 0,
      art: { tone: 'dark', wilt: 0.62, damp: true },
      options: [
        { t: 'Перелив и гниль корней', ok: true, why: 'Листья поникли, стали тёмными, земля сырая — корни задыхаются и гниют.' },
        { t: 'Засуха', ok: false, why: 'От засухи листья тоже поникают, но земля сухая, а не мокрая.' },
        { t: 'Ожог', ok: false, why: 'Ожог оставляет сухие бурые пятна, а тут вялость без пятен.' },
        { t: 'Мучнистая роса', ok: false, why: 'Роса даёт белый налёт — его здесь нет.' }
      ],
      what: 'Вынуть из горшка, обрезать тёмные мягкие корни, посадить в свежую землю и поливать реже — только когда верхний слой просох.'
    }
  ];

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function save(){
    try { localStorage.setItem(SKEY, JSON.stringify({ solved: state.solved })); } catch(e){}
  }
  function rnd(){ return ROUNDS[state.round]; }

  function tileArt(i){
    var r = rnd();
    if (i === r.sick) return r.art;
    return { tone: 'green', wilt: 0.08 + i * 0.05 };
  }
  function tileHTML(i){
    var r = rnd();
    var cls = 'ph-tile';
    if (state.step === 2 && i === r.sick) cls += ' found';
    else if (state.badTile === i) cls += ' bad';
    else if (state.step === 2) cls += ' dim';
    return '<button class="' + cls + '" data-tile="' + i + '">' +
      '<span class="ph-frame">' + ART(tileArt(i)) + '</span>' +
      '<span class="ph-name">' + esc(r.plants[i]) + '</span></button>';
  }

  function dxHTML(){
    var r = rnd();
    var html = '<div class="ph-dx"><h3 class="rc-q">Что с ' + esc(r.plants[r.sick].toLowerCase()) + '?</h3><div class="rc-opts">';
    r.options.forEach(function(o, i){
      var cls = 'rc-opt';
      if (state.pick !== null){
        if (o.ok) cls += ' ok';
        else if (i === state.pick) cls += ' bad';
        else cls += ' dim';
      }
      html += '<button class="' + cls + '" data-phopt="' + i + '"' + (state.pick !== null ? ' disabled' : '') + '>' +
        '<span class="num">' + 'ABCD'[i] + '</span><span>' + esc(o.t) + '</span></button>';
    });
    html += '</div>';
    if (state.pick !== null){
      var p = r.options[state.pick];
      html += '<div class="rc-feedback">';
      html += '<div class="rc-line ' + (p.ok ? 'good' : 'bad') + '"><b>' + (p.ok ? 'Верно!' : 'Не совсем') + '</b>' + esc(p.why) + '</div>';
      if (!p.ok){
        var right = r.options.filter(function(o){ return o.ok; })[0];
        html += '<div class="rc-line good"><b>Правильный диагноз</b>' + esc(right.t) + ' — ' + esc(right.why) + '</div>';
      }
      html += '<div class="rc-lesson"><b>Что делать.</b> ' + esc(r.what) + '</div>';
      html += '<div class="rc-nav">';
      html += '<button class="rc-next" data-phnext="1">' + (state.round < ROUNDS.length - 1 ? 'Дальше: фото ' + (state.round + 2) + ' →' : 'Готово →') + '</button>';
      html += '<button class="rc-next ghost" data-phback="1">↩ К списку дел</button>';
      html += '</div></div>';
    }
    html += '</div>';
    return html;
  }

  function render(){
    var done = 0;
    for (var k in state.solved) if (state.solved[k]) done++;
    var html = '<div class="ph-wrap">';
    html += '<div class="ph-head"><div class="ph-title">' +
      '<button class="rc-back" data-phback="1" aria-label="К списку дел">←</button>' +
      '<div><h2>📷 Фото-диагноз</h2><p>Четыре растения на снимке. Одно больное — найди его и поставь диагноз.</p></div></div>' +
      '<div class="ph-score">Фото ' + (state.round + 1) + ' из ' + ROUNDS.length + ' · ✅ ' + done + '</div></div>';
    html += '<div class="ph-ask"><b>Шаг 1.</b> ' + (state.step === 2 ? 'Больное найдено — теперь поставь диагноз.' : 'Нажми на больное растение.') + '</div>';
    html += '<div class="ph-grid">' + [0,1,2,3].map(tileHTML).join('') + '</div>';
    if (state.note) html += '<div class="ph-note">' + esc(state.note) + '</div>';
    if (state.step === 2) html += dxHTML();
    html += '</div>';
    host.innerHTML = html;
  }

  host.addEventListener('click', function(e){
    var t = e.target;
    var bk = t.closest ? t.closest('[data-phback]') : null;
    if (bk){ window.CC_PHOTO_CLOSE(); return; }
    var tl = t.closest ? t.closest('[data-tile]') : null;
    if (tl && state.step === 1){
      var i = parseInt(tl.getAttribute('data-tile'), 10);
      if (i === rnd().sick){
        state.step = 2; state.badTile = -1; state.pick = null; state.note = '';
      } else {
        state.badTile = i;
        state.note = 'Это растение здоровое: листья ровные, цвет обычный. Ищи налёт, пятна, паутинку или поникшие листья.';
      }
      render();
      return;
    }
    var op = t.closest ? t.closest('[data-phopt]') : null;
    if (op && state.pick === null){
      var idx = parseInt(op.getAttribute('data-phopt'), 10);
      state.pick = idx;
      if (rnd().options[idx].ok){ state.solved[rnd().id] = true; save(); }
      render();
      return;
    }
    var nx = t.closest ? t.closest('[data-phnext]') : null;
    if (nx){
      if (state.round < ROUNDS.length - 1){
        state.round++; state.step = 1; state.pick = null; state.badTile = -1; state.note = '';
        render(); window.scrollTo(0, 0);
      } else {
        window.CC_PHOTO_CLOSE();
      }
      return;
    }
  });

  window.CC_PHOTO_OPEN = function(){
    var app = document.querySelector('.app');
    if (app) { app.classList.add('photo-on'); app.classList.remove('rescue-on'); }
    document.body.classList.add('photo-open');
    document.body.classList.remove('rescue-open');
    render();
    window.scrollTo(0, 0);
  };
  window.CC_PHOTO_CLOSE = function(){
    var app = document.querySelector('.app');
    if (app) { app.classList.remove('photo-on'); app.classList.add('rescue-on'); }
    document.body.classList.remove('photo-open');
    document.body.classList.add('rescue-open');
    if (window.CC_RESCUE_OPEN) window.CC_RESCUE_OPEN();
    window.scrollTo(0, 0);
  };
})();
