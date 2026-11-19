/* Города внутри — фото-диагноз: найди больное растение и определи, что с ним */
(function(){
  'use strict';
  var host = document.getElementById('photo');
  if (!host) return;

  var SKEY = 'cc-photo-v1';
  var state = { round: 0, step: 1, pick: null, badTile: -1, note: '', solved: {} };
  try {
    var sv = JSON.parse(localStorage.getItem(SKEY));
    if (sv && sv.solved) state.solved = sv.solved;
  } catch(e){}

  var ROUNDS = [
    {
      id: 'ficus-mite',
      plants: ['Калатея', 'Фикус', 'Хлорофитум', 'Традесканция'],
      sick: 1,
      options: [
        { t: 'Паутинный клещ', ok: true, why: 'Тонкая паутинка по листу и мелкие светлые точки — типичная работа клеща.' },
        { t: 'Мучнистая роса', ok: false, why: 'Роса даёт белый плотный налёт, будто листья припудрили мукой, а паутины не бывает.' },
        { t: 'Солнечный ожог', ok: false, why: 'От солнца листья буреют сухими пятнами с одной стороны, паутинки нет.' },
        { t: 'Нехватка воды', ok: false, why: 'Без воды листья вянут и сохнут по краям, но паутину не плетут.' }
      ],
      what: 'Смыть клеща тёплым душем, обработать акарицидом 2–3 раза с перерывом в неделю. Клещ боится влажного воздуха — проветривай и опрыскивай.'
    },
    {
      id: 'violet-powder',
      plants: ['Колеус', 'Спатифиллум', 'Фиалка', 'Аглаонема'],
      sick: 2,
      options: [
        { t: 'Мучнистая роса', ok: true, why: 'Белый налёт пятнами, будто листья припудрили мукой, — это грибок.' },
        { t: 'Паутинный клещ', ok: false, why: 'Клещ оставляет паутинку и мелкие точки, а не сплошной налёт.' },
        { t: 'Солнечный ожог', ok: false, why: 'От солнца листья буреют сухими пятнами, налёта при этом не бывает.' },
        { t: 'Перелив', ok: false, why: 'От перелива желтеют нижние листья и пахнет сыростью из горшка, налёта сверху нет.' }
      ],
      what: 'Убрать поражённые листья, протереть остальные и обработать фунгицидом. Проветривать комнату — грибок любит духоту.'
    },
    {
      id: 'geranium-burn',
      plants: ['Пеларгония', 'Алоэ', 'Кактус', 'Толстянка'],
      sick: 0,
      options: [
        { t: 'Солнечный ожог', ok: true, why: 'Бурые сухие пятна и подпалины по краям — там, куда падало солнце.' },
        { t: 'Грибок', ok: false, why: 'Грибок даёт налёт или мокнущие пятна, а не сухие бурые подпалины.' },
        { t: 'Хлороз', ok: false, why: 'При хлорозе лист светлеет целиком, пятна не бурые и не сухие.' },
        { t: 'Засуха', ok: false, why: 'При засухе вянут все листья сразу, а не отдельные участки.' }
      ],
      what: 'Переставить в полутень, отрезать обожжённые части. Приучать к солнцу постепенно, а не выносить сразу.'
    },
    {
      id: 'lemon-chlorosis',
      plants: ['Мирт', 'Фикус', 'Диффенбахия', 'Лимон'],
      sick: 3,
      options: [
        { t: 'Хлороз — не хватает железа', ok: true, why: 'Лист светлеет, а жилки остаются зелёными — классический признак нехватки железа.' },
        { t: 'Ожог', ok: false, why: 'Ожог — это отдельные бурые пятна, а тут побледнел весь лист.' },
        { t: 'Клещ', ok: false, why: 'Клещ оставляет точки и паутинку, но не делает лист равномерно бледным.' },
        { t: 'Перелив', ok: false, why: 'Перелив чаще желтит нижние листья и мягчит стебель, а не обесцвечивает верхние.' }
      ],
      what: 'Полить хелатом железа по листу, проверить воду — жёсткая вода мешает усвоению. Через неделю обычно зеленеет.'
    },
    {
      id: 'begonia-mosaic',
      plants: ['Калатея', 'Бегония', 'Колеус', 'Традесканция'],
      sick: 1,
      options: [
        { t: 'Вирус мозаики', ok: true, why: 'Жёлто-зелёные разводы и пятна неправильной формы по всему листу — похоже на вирус.' },
        { t: 'Ожог', ok: false, why: 'Ожог сухой и бурый, а тут пятна светлые, живые, без сухости.' },
        { t: 'Клещ', ok: false, why: 'Клещ оставляет мелкие точки и паутину, но не крупные пятна-разводы.' },
        { t: 'Нехватка света', ok: false, why: 'Без света растение вытягивается и бледнеет, но пятнами не покрывается.' }
      ],
      what: 'Вирус не лечится — растение лучше убрать от остальных, черенковать только здоровые побеги. Инструмент после работы продезинфицировать.'
    },
    {
      id: 'echeveria-rot',
      plants: ['Алоэ', 'Толстянка', 'Эхеверия', 'Кактус'],
      sick: 2,
      options: [
        { t: 'Перелив и гниль корней', ok: true, why: 'Серединка потемнела и размякла, розетка распадается — корни и основание гниют от лишней воды.' },
        { t: 'Засуха', ok: false, why: 'От засухи листья сморщиваются и сохнут, но не чернеют и не размокают.' },
        { t: 'Ожог', ok: false, why: 'Ожог оставляет сухие бурые пятна, а тут мягкая тёмная гниль у основания.' },
        { t: 'Мучнистая роса', ok: false, why: 'Роса даёт белый налёт — его здесь нет.' }
      ],
      what: 'Вынуть из горшка, обрезать тёмные мягкие корни, посадить в свежую землю и поливать реже — только когда верхний слой просох.'
    },
    {
      id: 'strawberry-grey',
      plants: ['Клубника', 'Спатифиллум', 'Хлорофитум', 'Орхидея'],
      sick: 0,
      options: [
        { t: 'Серая гниль', ok: true, why: 'Ягоды буреют, размягчаются и покрываются серым пушистым налётом — это грибок серой гнили.' },
        { t: 'Мучнистая роса', ok: false, why: 'Мучнистая роса белая и сухая, а тут налёт серый и ягоды мокнут.' },
        { t: 'Солнечный ожог', ok: false, why: 'Ожог сушит листья и ягоды, а не превращает их в мокрую кашу.' },
        { t: 'Нехватка воды', ok: false, why: 'Без воды ягоды сморщиваются и сохнут, а не гниют.' }
      ],
      what: 'Убрать загнившие ягоды и поражённые листья, проветривать, поливать под корень и не оставлять плоды лежать на сырой земле.'
    },
    {
      id: 'tomato-spot',
      plants: ['Калатея', 'Фикус', 'Томат', 'Алоэ'],
      sick: 2,
      options: [
        { t: 'Пятнистость листьев', ok: true, why: 'Бурые пятна с жёлтой каймой расползаются по листу — грибковая пятнистость.' },
        { t: 'Паутинный клещ', ok: false, why: 'Клещ даёт мелкие светлые точки и паутинку, а не крупные пятна с каймой.' },
        { t: 'Перелив', ok: false, why: 'От перелива желтеют нижние листья целиком, пятен с каймой не бывает.' },
        { t: 'Солнечный ожог', ok: false, why: 'Ожог сухой и бурый, но без жёлтой каймы вокруг пятна.' }
      ],
      what: 'Срезать поражённые листья, поливать под корень и не мочить листву, обработать фунгицидом. Томатам нужен воздух — не сажай их слишком плотно.'
    },
    {
      id: 'blackberry-rust',
      plants: ['Ежевика', 'Колеус', 'Спатифиллум', 'Хлорофитум'],
      sick: 0,
      options: [
        { t: 'Ржавчина', ok: true, why: 'Рыже-бурые порошистые пятна на листе — это споры ржавчинного гриба.' },
        { t: 'Мучнистая роса', ok: false, why: 'Мучнистая роса белая и мучнистая, а ржавчина рыжая и пылит.' },
        { t: 'Хлороз', ok: false, why: 'Хлороз обесцвечивает лист равномерно, но рыжих пятен не оставляет.' },
        { t: 'Солнечный ожог', ok: false, why: 'Ожог — сухие бурые участки, а тут пятна выпуклые и порошистые.' }
      ],
      what: 'Вырезать поражённые побеги, убрать опавшие листья, обработать фунгицидом. Поливай под корень — сырость на листьях помогает ржавчине.'
    },
    {
      id: 'oak-scorch',
      plants: ['Толстянка', 'Дуб', 'Мирт', 'Хлорофитум'],
      sick: 1,
      options: [
        { t: 'Солнечный ожог и нехватка воды', ok: true, why: 'Листья бурые и сухие по краям и между жилками — растение сгорело на солнце и недопило.' },
        { t: 'Ржавчина', ok: false, why: 'Ржавчина даёт рыжие пятна-подушечки, а тут лист высох целиком.' },
        { t: 'Тля', ok: false, why: 'Тля сидит колониями на молодых побегах, листья при ней липкие, а не сухие.' },
        { t: 'Мучнистая роса', ok: false, why: 'Роса — белый налёт сверху, а этот лист сухой и бурый.' }
      ],
      what: 'Молодое дерево в жару поливать и притенять, приствольный круг замульчировать. Обожжённые листья не обрывай — дерево само их сбросит.'
    },
    {
      id: 'hibiscus-spot',
      plants: ['Гибискус', 'Кактус', 'Диффенбахия', 'Калатея'],
      sick: 0,
      options: [
        { t: 'Пятнистость листьев', ok: true, why: 'Бурые пятна с сухой каймой и дыры на месте отмершей ткани — грибковая пятнистость.' },
        { t: 'Тля', ok: false, why: 'Тля не выедает дыры, она пьёт сок и оставляет липкий налёт.' },
        { t: 'Солнечный ожог', ok: false, why: 'Ожог идёт с края листа, а тут пятна разбросаны по всей пластине.' },
        { t: 'Перелив', ok: false, why: 'При переливе вянут и желтеют нижние листья, а дыр не появляется.' }
      ],
      what: 'Убрать поражённые листья, обработать фунгицидом, не опрыскивать на ночь — мокрая листва держит грибок.'
    },
    {
      id: 'corn-aphids',
      plants: ['Кукуруза', 'Орхидея', 'Мирт', 'Аглаонема'],
      sick: 0,
      options: [
        { t: 'Тля', ok: true, why: 'Колонии мелких зелёных насекомых рядками на листе — это тля.' },
        { t: 'Паутинный клещ', ok: false, why: 'Клеща глазом не видно, он оставляет паутинку и точки, а тут сами насекомые.' },
        { t: 'Мучнистая роса', ok: false, why: 'Роса — белый налёт, а здесь живые букашки на листе.' },
        { t: 'Хлороз', ok: false, why: 'Хлороз — пожелтение без насекомых, тут лист зелёный, но облеплен тлёй.' }
      ],
      what: 'Смыть тлю водой с мылом или обработать инсектицидом, через неделю повторить. Рядом посеять укроп и бархатцы — они приманивают божьих коровок.'
    }
  ];

  var CR = window.CC_PHOTO_CREDITS || [];
  function creditFor(file){
    for (var i = 0; i < CR.length; i++) if (CR[i].file === file) return CR[i];
    return null;
  }
  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function save(){
    try { localStorage.setItem(SKEY, JSON.stringify({ solved: state.solved })); } catch(e){}
  }
  function rnd(){ return ROUNDS[state.round]; }
  function imgPath(i){
    return 'img/photo/r' + (state.round + 1) + 'abcd'.charAt(i) + '.jpg';
  }

  function tileHTML(i){
    var r = rnd();
    var cls = 'ph-tile';
    if (state.step === 2 && i === r.sick) cls += ' found';
    else if (state.badTile === i) cls += ' bad';
    else if (state.step === 2) cls += ' dim';
    var alt = r.plants[i] + (i === r.sick ? ' — есть признаки болезни' : ' — здоровое растение');
    return '<button class="' + cls + '" data-tile="' + i + '">' +
      '<span class="ph-frame"><img src="' + imgPath(i) + '" alt="' + esc(alt) + '" loading="lazy" width="640" height="480"></span>' +
      '<span class="ph-name">' + esc(r.plants[i]) + '</span></button>';
  }

  function creditHTML(){
    var out = [];
    for (var i = 0; i < 4; i++){
      var f = imgPath(i), c = creditFor(f);
      if (!c || !c.artist) continue;
      var label = esc(c.artist) + (c.license ? ', ' + esc(c.license) : '');
      if (c.page) out.push('<a href="' + esc(c.page) + '" target="_blank" rel="noopener">' + label + '</a>');
      else out.push(label);
    }
    if (!out.length) return '';
    return '<div class="ph-credit">Фото: ' + out.join(' · ') + '</div>';
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
      html += '<div class="rc-line ' + (p.ok ? 'good' : 'bad') + '"><b>' + (p.ok ? 'Верно! ' : 'Не совсем. ') + '</b>' + esc(p.why) + '</div>';
      if (!p.ok){
        var right = r.options.filter(function(o){ return o.ok; })[0];
        html += '<div class="rc-line good"><b>Правильный диагноз: </b>' + esc(right.t) + ' — ' + esc(right.why) + '</div>';
      }
      html += '<div class="rc-lesson"><b>Что делать. </b>' + esc(r.what) + '</div>';
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
    html += creditHTML();
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
    if (window.CC_ATLAS_CLOSE) window.CC_ATLAS_CLOSE();
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
