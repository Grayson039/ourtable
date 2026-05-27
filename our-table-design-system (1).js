/**
 * Our Table — Shared Design System
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for color tokens, typography, spacing,
 * and every reusable UI component used across all screen files.
 *
 * USAGE (in any prototype HTML file):
 *   <script src="our-table-design-system.js"></script>
 *
 * All tokens and components live on the global `OT` object.
 * Pass OT.L (light theme) or OT.D (dark theme) as the first
 * argument to any component function.
 *
 * QUICK REFERENCE:
 *   OT.L / OT.D              — color theme objects
 *   OT.T                     — typography constants
 *   OT.S                     — spacing constants
 *   OT.R                     — border radius constants
 *   OT.c.statusBar(theme)    — iOS status bar
 *   OT.c.notch()             — iPhone Dynamic Island notch
 *   OT.c.navBar(theme, activeIdx, goFn) — bottom tab bar (0–4)
 *   OT.c.btn(theme, label, fn, variant, extra)
 *   OT.c.field(theme, id, type, label, placeholder, value)
 *   OT.c.input(theme, id, type, placeholder, value)
 *   OT.c.backBtn(theme, label, fn)
 *   OT.c.stepDots(theme, current, total)
 *   OT.c.divider(theme, text)
 *   OT.c.dietTag(theme, label, selected, onclick)
 *   OT.c.recipeCardLarge(theme, recipe, onClickFn)
 *   OT.c.recipeCardSmall(theme, recipe, onClickFn)
 *   OT.c.listItem(theme, item, checked, onClickFn)
 *   OT.nav(screens, startId, containerId, opts) — wires navigation
 * ─────────────────────────────────────────────────────────────
 */

(function (global) {
  'use strict';

  var T = {
    sans:  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    sz: { xs:'10px', sm:'11px', base:'13px', md:'15px', lg:'18px', xl:'22px', xxl:'28px' },
    wt: { reg:'400', med:'500', semi:'600', bold:'700', heavy:'800' }
  };

  var S = { xs:'6px', sm:'10px', md:'14px', lg:'18px', xl:'20px', xxl:'28px', section:'20px' };

  var R = { xs:'6px', sm:'10px', md:'14px', lg:'18px', xl:'22px', pill:'100px' };

  var L = {
    _name:'light', bg:'#FAF7F0', card:'#FFFFFF', text:'#1A1208', muted:'#7A6E62',
    primary:'#1B3A5C', secondary:'#E8A84A', hero2:'#F0C87A',
    chip:'rgba(0,0,0,0.05)', chipTx:'#3A3028', border:'rgba(0,0,0,0.10)',
    inputBg:'#FFFFFF', overlay:'rgba(0,0,0,0.50)', divider:'rgba(0,0,0,0.08)',
    success:'#22C55E', danger:'#EF4444'
  };

  var D = {
    _name:'dark', bg:'#0E1014', card:'#1C1E24', text:'#F2EDE8', muted:'#8A8078',
    primary:'#1B3A5C', secondary:'#E8A84A', hero2:'#C8882A',
    chip:'rgba(255,255,255,0.07)', chipTx:'#C8C0B8', border:'rgba(255,255,255,0.10)',
    inputBg:'#252830', overlay:'rgba(0,0,0,0.70)', divider:'rgba(255,255,255,0.08)',
    success:'#22C55E', danger:'#EF4444'
  };

  var c = {};

  c.notch = function () {
    return '<div style="height:14px;width:100%;position:relative;flex-shrink:0">' +
      '<div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);' +
      'width:116px;height:34px;background:#0D0D0D;border-radius:0 0 24px 24px"></div>' +
    '</div>';
  };

  c.statusBar = function (th) {
    var now=new Date(), h=now.getHours(), m=now.getMinutes();
    var ap=h>=12?'PM':'AM'; h=h%12||12;
    var t=h+':'+(m<10?'0':'')+m+' '+ap, col=th.text;
    return '<div style="height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 20px 0 18px;flex-shrink:0">' +
      '<div style="font-size:13px;font-weight:700;color:'+col+'">'+t+'</div>' +
      '<div style="display:flex;align-items:center;gap:6px">' +
        '<svg width="17" height="12" viewBox="0 0 17 12" fill="'+col+'">' +
          '<rect x="0" y="7" width="3" height="5" rx="1" opacity="0.3"/>' +
          '<rect x="4" y="4" width="3" height="8" rx="1" opacity="0.5"/>' +
          '<rect x="8" y="2" width="3" height="10" rx="1" opacity="0.7"/>' +
          '<rect x="12" y="0" width="3" height="12" rx="1"/>' +
        '</svg>' +
        '<svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="'+col+'" stroke-width="2.5" stroke-linecap="round">' +
          '<path d="M12 14.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="'+col+'" stroke="none"/>' +
          '<path d="M6.5 10.5C8 8.9 9.9 8 12 8s4 .9 5.5 2.5" opacity="0.6"/>' +
          '<path d="M2.5 7C5.2 4.1 8.4 2.5 12 2.5S18.8 4.1 21.5 7" opacity="0.3"/>' +
        '</svg>' +
        '<div style="display:flex;align-items:center">' +
          '<div style="width:22px;height:11px;border:1.5px solid '+col+';border-radius:3px;position:relative;overflow:hidden">' +
            '<div style="position:absolute;top:1px;bottom:1px;left:1px;width:74%;background:'+col+';border-radius:1px"></div>' +
          '</div>' +
          '<div style="width:2px;height:5px;background:'+col+';border-radius:0 1px 1px 0;margin-left:1px;opacity:0.6"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  };

  c.navBar = function (th, active, goFn) {
    var fn=goFn||'otGo';
    var tabs=[
      {id:'home',label:'Home',path:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'},
      {id:'search',label:'Search',path:'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z'},
      {id:'fridge',label:'Fridge',path:'M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4z M5 10h14'},
      {id:'list',label:'Grocery',path:'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0'},
      {id:'profile',label:'Me',path:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'}
    ];
    var html='<div style="position:absolute;bottom:0;left:0;right:0;background:'+th.card+';border-top:1px solid '+th.border+';display:flex;align-items:stretch;padding-bottom:16px;z-index:10">';
    tabs.forEach(function(tab,i){
      var on=i===active, col=on?th.primary:th.muted, sw=on?'2.2':'1.7';
      html+='<div onclick="'+fn+'(''+tab.id+'')" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 0 2px;cursor:pointer;gap:3px">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"><path d="'+tab.path+'"/></svg>' +
        '<div style="font-size:9px;font-weight:'+(on?'700':'500')+';color:'+col+';letter-spacing:0.02em">'+tab.label+'</div>' +
      '</div>';
    });
    return html+'</div>';
  };

  c.btn = function (th, label, fn, variant, extra) {
    var isPri=variant==='primary'||!variant;
    var bg=isPri?th.primary:'transparent', color=isPri?'white':th.text;
    var bdr=isPri?'none':'1.5px solid '+th.border;
    return '<button onclick="'+fn+'" style="width:100%;padding:14px;border-radius:'+R.lg+';background:'+bg+';color:'+color+';border:'+bdr+';font-size:14px;font-weight:600;cursor:pointer;font-family:'+T.sans+';letter-spacing:0.01em;'+(extra||'')+'">'+label+'</button>';
  };

  c.field = function (th, id, type, label, placeholder, value) {
    return '<div>' +
      '<div style="font-size:11px;font-weight:600;color:'+th.muted+';letter-spacing:0.05em;text-transform:uppercase;margin-bottom:5px">'+label+'</div>' +
      '<input id="'+id+'" type="'+type+'" placeholder="'+placeholder+'" value="'+(value||'')+'" style="width:100%;padding:12px 14px;border-radius:'+R.md+';background:'+th.inputBg+';border:1.5px solid '+th.border+';color:'+th.text+';font-size:13px;font-family:'+T.sans+';outline:none;box-sizing:border-box"/>' +
    '</div>';
  };

  c.input = function (th, id, type, placeholder, value) {
    return '<input id="'+id+'" type="'+type+'" placeholder="'+placeholder+'" value="'+(value||'')+'" style="width:100%;padding:12px 14px;border-radius:'+R.md+';background:'+th.inputBg+';border:1.5px solid '+th.border+';color:'+th.text+';font-size:13px;font-family:'+T.sans+';outline:none;box-sizing:border-box"/>';
  };

  c.backBtn = function (th, label, fn) {
    var onclick=fn||'otBack()';
    return '<button onclick="'+onclick+'" style="display:inline-flex;align-items:center;gap:4px;background:none;border:none;cursor:pointer;padding:6px 0;color:'+th.primary+';font-size:13px;font-weight:600;font-family:'+T.sans+'">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="'+th.primary+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>' +
      (label||'') +
    '</button>';
  };

  c.stepDots = function (th, current, total) {
    var html='<div style="display:flex;gap:5px;align-items:center">';
    for(var i=0;i<=total;i++){
      var on=i===current;
      html+='<div style="height:6px;width:'+(on?'18px':'6px')+';border-radius:3px;background:'+(on?th.primary:th.border)+';transition:all 0.25s"></div>';
    }
    return html+'</div>';
  };

  c.divider = function (th, text) {
    return '<div style="display:flex;align-items:center;gap:12px;margin:18px 0">' +
      '<div style="flex:1;height:1px;background:'+th.border+'"></div>' +
      '<div style="font-size:11px;color:'+th.muted+';font-weight:500">'+(text||'or')+'</div>' +
      '<div style="flex:1;height:1px;background:'+th.border+'"></div>' +
    '</div>';
  };

  c.dietTag = function (th, label, selected, onclick) {
    return '<div onclick="'+onclick+'" style="display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:'+R.pill+';cursor:pointer;border:1.5px solid '+(selected?th.primary:th.border)+';background:'+(selected?th.primary:'transparent')+';color:'+(selected?'white':th.text)+';font-size:11px;font-weight:'+(selected?'600':'500')+'">' +
      (selected?'<span style="font-size:9px;line-height:1">✓</span>':'') +
      label +
    '</div>';
  };

  c.recipeCardLarge = function (th, recipe, onClickFn) {
    var fn=onClickFn||'return false', color=recipe.heroColor||th.primary;
    return '<div onclick="'+fn+'" style="border-radius:'+R.xl+';overflow:hidden;background:'+color+';cursor:pointer;position:relative;height:180px;box-shadow:0 8px 24px rgba(0,0,0,0.15);margin:0 4px;flex-shrink:0">' +
      '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 60%)"></div>' +
      '<div style="position:absolute;bottom:0;left:0;right:0;padding:14px 16px">' +
        '<div style="font-size:16px;font-weight:700;color:white;font-family:'+T.serif+';line-height:1.25;margin-bottom:6px">'+(recipe.title||'Recipe')+'</div>' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<span style="font-size:11px;color:rgba(255,255,255,0.85)">'+(recipe.time||'')+'</span>' +
          (recipe.rating?'<span style="font-size:11px;color:rgba(255,255,255,0.85)"><span style="color:#FFD060">★</span> '+recipe.rating+'</span>':'') +
        '</div>' +
      '</div>' +
    '</div>';
  };

  c.recipeCardSmall = function (th, recipe, onClickFn) {
    var fn=onClickFn||'return false', color=recipe.heroColor||th.primary;
    return '<div onclick="'+fn+'" style="flex-shrink:0;width:120px;cursor:pointer">' +
      '<div style="width:120px;height:100px;border-radius:'+R.lg+';background:'+color+';margin-bottom:7px;position:relative;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,0.12)">' +
        '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 60%)"></div>' +
        '<div style="position:absolute;bottom:7px;left:7px;background:rgba(0,0,0,0.5);border-radius:'+R.pill+';padding:2px 7px;font-size:9px;color:white">'+(recipe.time||'')+'</div>' +
      '</div>' +
      '<div style="font-size:11px;font-weight:600;color:'+th.text+';line-height:1.3;white-space:pre-line">'+(recipe.title||'')+'</div>' +
    '</div>';
  };

  c.listItem = function (th, item, checked, onClickFn) {
    var fn=onClickFn||'return false';
    var name=(typeof item==='object')?(item.name||''):item;
    var qty=(typeof item==='object')?(item.qty||''):'';
    return '<div onclick="'+fn+'" style="display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid '+th.border+';cursor:pointer">' +
      '<div style="width:20px;height:20px;border-radius:6px;flex-shrink:0;border:2px solid '+(checked?th.primary:th.border)+';background:'+(checked?th.primary:'transparent')+';display:flex;align-items:center;justify-content:center">' +
        (checked?'<svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3 6-6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>':'') +
      '</div>' +
      '<div style="flex:1;font-size:13px;font-weight:500;color:'+(checked?th.muted:th.text)+';text-decoration:'+(checked?'line-through':'none')+'">'+name+'</div>' +
      (qty?'<div style="font-size:11px;color:'+th.muted+'">'+qty+'</div>':'') +
    '</div>';
  };

  function nav(screens, startId, containerId, opts) {
    opts=opts||{};
    var state={}, supplied=opts.state||{};
    for(var k in supplied){ if(supplied.hasOwnProperty(k)) state[k]=supplied[k]; }
    state.cur=startId; state.screen=startId; state.dark=state.dark||false;
    var history=[startId], mainScreens=opts.mainScreens||[startId];
    function getTheme(){ return state.dark?D:L; }
    function render(){
      var th=getTheme(), screenFn=screens[state.cur], html;
      if(typeof screenFn==='function'){
        try{ html=screenFn(th,state); }
        catch(e){
          html='<div style="height:100%;background:'+th.bg+';display:flex;align-items:center;justify-content:center;flex-direction:column;padding:24px;font-family:'+T.sans+'">' +
            '<div style="font-size:32px;margin-bottom:12px">⚠️</div>' +
            '<div style="font-size:14px;font-weight:700;color:'+th.text+';margin-bottom:6px">Render error</div>' +
            '<div style="font-size:11px;color:'+th.muted+';text-align:center">'+e.message+'</div>' +
          '</div>';
        }
      } else {
        html='<div style="height:100%;background:'+th.bg+';display:flex;align-items:center;justify-content:center;font-family:'+T.sans+'">' +
          '<div style="font-size:13px;color:'+th.muted+'">Screen not found: '+state.cur+'</div>' +
        '</div>';
      }
      var el=document.getElementById(containerId);
      if(el){ el.innerHTML=html; el.style.background=th.bg; }
      if(typeof opts.onRender==='function') opts.onRender(state,th);
    }
    function go(screenId){
      if(mainScreens.indexOf(screenId)>=0) history=[screenId];
      else history.push(screenId);
      state.cur=screenId; state.screen=screenId; render();
    }
    function back(){
      if(history.length>1){
        history.pop();
        var prev=history[history.length-1];
        state.cur=prev; state.screen=prev; render();
      }
    }
    global.otState=state; global.otGo=go; global.otBack=back;
    global.otRender=render;
    global.otToggleTheme=function(){ state.dark=!state.dark; render(); };
    render();
  }

  global.OT={ L:L, D:D, T:T, S:S, R:R, c:c, nav:nav };

}(window));
