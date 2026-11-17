/* Бактерия — сцена */
window.buildBacteriaCity = function(){
  var K = window.CITY_SCENES;
  var iso = K.iso, f = K.f, pg = K.pg, ell = K.ell;
  var nodes = [];

  var ground = pg([iso(0,0), iso(11,0), iso(11,11), iso(0,11)], 'url(#bactGrad)', 'class="island-top"');
  var c = iso(5.5, 5.5);
  var rings = '<g class="ring">' +
    '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="182" ry="96" fill="none" stroke="url(#capsGrad)" stroke-width="10" opacity=".55"/>' +
    '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="158" ry="82" fill="none" stroke="url(#wallGrad)" stroke-width="7" opacity=".8" stroke-dasharray="14 8"/>' +
    '</g>';

  var pal = {
    cap:  { left:'#8fd6c4', right:'#5fb9a6', roof:'#c8f2e6' },
    wall: { left:'#c9b8ea', right:'#a795d4', roof:'#e7dcff' },
    mem:  { left:'#ffc59a', right:'#f2a774', roof:'#ffe1c4' },
    nuc:  { left:'#f6a6b8', right:'#e5839a', roof:'#ffd3dd' },
    pl:   { left:'#a8d8f0', right:'#7fbde0', roof:'#d6efff' },
    rib:  { left:'#f7d488', right:'#e8bd63', roof:'#ffeec2' },
    cyt:  { left:'#b9e3b0', right:'#93cb8a', roof:'#dcf6d4' },
    pili: { left:'#d7b0e8', right:'#bc8fd4', roof:'#f0dcff' },
    flg:  { left:'#8fb2f0', right:'#6c94dd', roof:'#d2e2ff' },
    grn:  { left:'#e8c9a0', right:'#cfa87a', roof:'#fbe6c8' }
  };

  function site(id, x, y, w, d, h, p, name, win){
    var s = '';
    if (id === 'flagellum'){
      var b = iso(x + w/2, y + d/2, 8);
      s += '<path class="flag" d="M' + f(b[0]) + ',' + f(b[1]) + ' q 34,-10 56,10 t 58,-14 t 62,8" fill="none" stroke="#8fb2f0" stroke-width="7" stroke-linecap="round"/>';
      s += '<path d="M' + f(b[0]) + ',' + f(b[1]) + ' q 34,-10 56,10 t 58,-14 t 62,8" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" opacity="0"/>';
    }
    s += K.shadow(x, y, w, d);
    s += K.box(x, y, w, d, h, p, win || [2, 3], { lit: 0.4 });
    s += K.tag(x + w/2, y + d/2, h + 6, name);
    nodes.push({ k: x + y + 0.35, s: '<g class="bldg" data-id="' + id + '">' + s + '</g>' });
  }

  site('capsule', 0.5, 0.5, 2.1, 2.1, 56, pal.cap, 'Капсула');
  site('wall', 7.9, 0.6, 2.0, 2.0, 48, pal.wall, 'Стенка');
  site('membrane', 5.1, 0.9, 1.7, 1.7, 40, pal.mem, 'Мембрана');
  site('nucleoid', 4.2, 3.0, 2.9, 2.2, 54, pal.nuc, 'Нуклеоид', [3, 3]);
  site('plasmid', 1.4, 3.4, 1.6, 1.6, 30, pal.pl, 'Плазмида', [2, 2]);
  site('ribosome', 7.5, 3.6, 1.4, 1.4, 27, pal.rib, 'Рибосома', [1, 2]);
  site('granule', 1.1, 6.3, 1.5, 1.5, 24, pal.grn, 'Гранулы', [1, 1]);
  site('cytoplasm', 4.0, 6.8, 2.5, 1.9, 20, pal.cyt, 'Цитоплазма', [3, 1]);
  site('pili', 7.6, 6.6, 1.4, 1.4, 34, pal.pili, 'Пили', [1, 2]);
  site('flagellum', 8.4, 8.4, 1.5, 1.5, 36, pal.flg, 'Жгутик');

  nodes.sort(function(a, b){ return a.k - b.k; });

  var defs = '<defs>' +
    '<radialGradient id="bactGrad" cx="0.4" cy="0.3" r="0.85"><stop offset="0" stop-color="#e9fbf5"/><stop offset="0.6" stop-color="#d3f0e6"/><stop offset="1" stop-color="#b9e2d6"/></radialGradient>' +
    '<linearGradient id="capsGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9adfd0"/><stop offset="1" stop-color="#6cc3b0"/></linearGradient>' +
    '<linearGradient id="wallGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cbb9f0"/><stop offset="1" stop-color="#9f8bd8"/></linearGradient>' +
    '</defs>';

  var svg = K.svg(defs, K.stars() + ground + rings + nodes.map(function(n){ return n.s; }).join(''), '-360 -95 720 480');
  K.mount(svg, window.BACTERIA_DATA.organs);
};
