// Teloson · the page: the desk screens, the phone, the rooms, the bad day, the forms. Loaded deferred.
(function(){
  var rmq = window.matchMedia("(prefers-reduced-motion: reduce)"), reduced = rmq.matches;
  if(rmq.addEventListener) rmq.addEventListener("change", function(e){ reduced = e.matches; });

  /* ---------- the desk, drawn in html at 1180×720 and scaled to fit ---------- */
  var SCRIPT = [
    ["Headline Scanner","data","FOMC minutes at 14:00. Wire freshness ok, 12 sources live."],
    ["Live Tape","data","SPY +0.32% on the session. Breadth 61% up, spreads normal."],
    ["Allocation","pm","US large cap is 2.1% under the mandate. Proposing a fill at 0.15% above mid, good for 45 minutes."],
    ["Signal Validation","val","Sample 412 observations, out-of-sample holds. <em>veto=no</em>"],
    ["Position Sizing","risk","Would be 2.1% of the book against a 5% cap. <em>veto=no</em>"],
    ["Drawdown Control","risk","Book is down 0.4% against a 10% brake. <em>veto=no</em>"],
    ["Kill Switch","risk","Nothing armed. <em>veto=no</em>"],
    ["Desk","tl","Plan 0418 tabled. 74 seats heard, 0 vetoes. It is on your desk with the reasoning attached. 45:00 on the clock."]
  ];
  var AV = { data:"DA", val:"RV", risk:"RC", pm:"PM", exec:"EX", tl:"TL" };
  function msg(m){ return '<div class="msg"><div class="av '+m[1]+'">'+AV[m[1]]+'</div><div><div class="who"><b>'+m[0]+'</b><span>'+({data:"data & intelligence",val:"research & validation",risk:"risk & compliance",pm:"portfolio management",exec:"trading & execution",tl:"the desk"})[m[1]]+'</span></div><div class="txt">'+m[2]+'</div></div></div>'; }
  function planHTML(secs, r){
    if(secs < 0) return '<div class="plan empty">No plan on the table. The floor is watching. Nothing waits on you.</div>';
    var mm = String(Math.floor(secs/60)).padStart(2,"0"), ss = String(secs%60).padStart(2,"0");
    return '<div class="plan arrive"><div class="t"><b>PLAN '+r.id+' · BUY</b><i>'+mm+':'+ss+'</i></div><div class="d">'+r.what+'<br>Room convened: 74 seats heard, 0 vetoes. Reasoning attached.</div><div class="btns"><span class="ok">Approve</span><span class="rj">Reject</span></div></div>';
  }
  var ICON = {"wa": "<span class=\"ai wa\"><img src=\"img/whatsapp.svg\" alt=\"WhatsApp\"></span>", "tg": "<span class=\"ai tg\"><img src=\"img/telegram.svg\" alt=\"Telegram\"></span>", "im": "<span class=\"ai im\"><svg viewBox=\"0 0 24 24\" aria-label=\"iMessage\"><path d=\"M12 4c-4.6 0-8 3-8 6.6 0 2 1 3.7 2.6 4.9L5.5 19l3.9-1.5c.8.2 1.7.3 2.6.3 4.6 0 8-3 8-6.6S16.6 4 12 4Z\"/></svg></span>", "mail": "<span class=\"ai mail\"><svg viewBox=\"0 0 24 24\" aria-label=\"Email\"><rect x=\"3\" y=\"5.5\" width=\"18\" height=\"13\" rx=\"2.5\"/><path d=\"m3.5 7 8.5 6 8.5-6\"/></svg></span>"};
  var LIMITS = '<div class="lim"><span class="h">Limit</span><span class="h">Signed</span><span class="h">Running</span><span>Emergency brake</span><span class="n">10%</span><span class="n ok">10%</span><span>Position cap</span><span class="n">5%</span><span class="n ok">5%</span><span>Bad-day halt</span><span class="n">3%</span><span class="n ok">3%</span><span>Daily orders</span><span class="n">20</span><span class="n ok">3 so far</span></div>';
  var LIMITS_BIG = '<div class="lim big"><span class="h">Limit</span><span class="h">Signed</span><span class="h">Running</span>'+
    '<span>Emergency brake</span><span class="n">10%</span><span class="n ok">10%</span><span>Position cap</span><span class="n">5%</span><span class="n ok">5%</span><span>Bad-day halt</span><span class="n">3%</span><span class="n ok">3%</span><span>Exit flag</span><span class="n">8%</span><span class="n ok">8%</span><span>Losing streak</span><span class="n">3 then 5</span><span class="n ok">3 then 5</span><span>Daily orders</span><span class="n">20</span><span class="n ok">20</span><span>Daily dollars</span><span class="n">$25,000</span><span class="n ok">$25,000</span><span>Appetite</span><span class="n">40 / 100</span><span class="n ok">40 / 100</span><span>Chat orders</span><span class="n">off</span><span class="n ok">off</span></div>'+
    '<div class="log"><div><span>2026-08-21</span>Questionnaire signed and countersigned. Limits loaded from profiles/your-mandate.json.</div><div><span>2026-09-03</span>Appetite 35 → 40, changed by you. Shown beside the signed value until you sign again.</div><div><span>today</span>Every limit checked before each order. Nothing running differs from what you signed.</div></div>';
  var BIGCHAT = '<div class="body1"><div class="card"><div class="hd"><div class="hd-t">Desk Chat</div><div class="rt">the floor, talking to itself · 74 seats</div></div><div class="bd"><div class="chat" data-chat="big"></div></div></div></div>';
  var MAINS = {
    chat: '<div class="card"><div class="hd"><div class="hd-t">Desk Chat</div><div class="rt">the floor, talking to itself</div></div><div class="bd"><div class="chat" data-chat="full"></div></div></div><div class="composer"><div>Talk to the desk…  type @ to address someone directly</div><span>Send</span></div>',
    limits: '<div class="card blue"><div class="hd"><div class="hd-t">Your limits</div><div class="rt">what you signed for, and what is running</div></div>' + LIMITS_BIG + '</div><div></div>'
  };
  function deskHTML(view){
    if(view === "biglimits") return '<div class="desk ui biglimits"><div class="top"><div class="brandname"><i></i>TELOSON</div><div class="stat"><div class="l">Net Asset Value</div><div class="v">$248,910.42</div></div><div class="mode"><span class="on">Approve first</span><span>Practice</span></div></div><div class="body1"><div class="card blue"><div class="hd"><div class="hd-t">Your limits</div><div class="rt">signed · running</div></div><div class="lim"><span class="h">Limit</span><span class="h">Signed</span><span class="h">Running</span><span>Emergency brake</span><span class="n">10%</span><span class="n ok">10%</span><span>Position cap</span><span class="n">5%</span><span class="n ok">5%</span><span>Bad-day halt</span><span class="n">3%</span><span class="n ok">3%</span><span>Exit flag</span><span class="n">8%</span><span class="n ok">8%</span><span>Daily orders</span><span class="n">20</span><span class="n ok">20</span><span>Chat orders</span><span class="n">off</span><span class="n ok">off</span></div></div></div></div>';
    if(view === "bigchat") return '<div class="desk ui bigchat"><div class="top"><div class="brandname"><i></i>TELOSON</div><div class="stat"><div class="l">Net Asset Value</div><div class="v">$248,910.42</div></div><div class="stat"><div class="l">Positions</div><div class="v">9</div></div><div class="mkt"><span class="on">NYSE</span><span class="on">NASDAQ</span><span class="on">CRYPTO</span></div><div class="mode"><span class="on">Approve first</span><span>Practice</span></div></div>' + BIGCHAT + '</div>';
    var on = view === "limits" ? "Account" : "Live Chat";
    var nav = function(n){ return '<div class="nav'+(n === on ? ' on' : '')+'">'+n+'</div>'; };
    return '<div class="desk ui">'+
    '<div class="top"><div class="brandname"><i></i>TELOSON</div>'+
    '<div class="stat"><div class="l">Net Asset Value</div><div class="v">$248,910.42</div></div><div class="stat"><div class="l">Buying Power</div><div class="v">$61,204.10</div></div><div class="stat"><div class="l">Positions</div><div class="v">9</div></div>'+
    '<div class="mkt"><span class="on">NYSE</span><span class="on">NASDAQ</span><span class="on">CME</span><span>LSE</span><span class="on">CRYPTO</span></div>'+
    '<div class="mode"><span class="on">Approve first</span><span>Practice</span></div></div>'+
    '<div class="body"><div class="side"><div class="grp">Floor</div>'+nav("Live Chat")+nav("The Office")+nav("The Team")+nav("Breakout Rooms")+nav("Archive")+
    '<div class="grp">Markets</div>'+nav("Market Data")+nav("News Wire")+'<div class="grp">Research</div>'+nav("Idea Board")+nav("Strategies")+
    '<div class="grp">Portfolio</div>'+nav("Account")+nav("Performance")+nav("Audit Trail")+'<div class="nav propose">Propose a trade</div></div>'+
    '<div class="main">'+MAINS[view]+'</div>'+
    '<div class="right"><div class="card amber"><div class="hd"><div class="hd-t">Waiting on you</div><div class="rt">plans that need your approval</div></div><div class="plan-slot"></div></div>'+
    '<div class="card blue"><div class="hd"><div class="hd-t">Your limits</div><div class="rt">what you signed for</div></div>'+LIMITS+'</div>'+
    '<div class="card"><div class="hd"><div class="hd-t">Alerts</div><div class="rt">what it told you</div></div><div class="al"><div><span>10:12</span><i><b>Plan 0418 waiting on you.</b> Sent by WhatsApp and email.</i></div><div><span>09:31</span><i><b>Session open.</b> Wires fresh, 12 live.</i></div><div><span>06:55</span><i><b>Overnight data checked.</b> Nothing stale.</i></div></div></div></div></div></div>';
  }
  document.querySelectorAll("[data-view]").forEach(function(el){ el.innerHTML = deskHTML(el.dataset.view); el.firstChild.style.transform = el.dataset.m; });
  var lb = document.getElementById("limits-big"); if(lb) lb.innerHTML = LIMITS_BIG;
  /* the ui plane follows the photo exactly, including when the photo is cropped to cover its card */
  function fit(){ document.querySelectorAll(".shot").forEach(function(sh){
    var pl = sh.querySelector(".plane"), img = sh.querySelector("img"); if(!pl || !img) return;
    var w = +img.getAttribute("width") || +sh.dataset.w, h = +img.getAttribute("height") || w, W = sh.clientWidth, H = sh.clientHeight;
    var cover = getComputedStyle(img).objectFit === "cover";
    var s = cover ? Math.max(W / w, H / h) : W / w, ox = cover ? (W - w * s) / 2 : 0, oy = cover ? (H - h * s) / 2 : 0;
    pl.style.transform = "translate(" + ox.toFixed(2) + "px," + oy.toFixed(2) + "px) scale(" + s + ")";
  }); }
  fit(); window.addEventListener("resize", fit); window.addEventListener("load", fit);
  if(window.ResizeObserver){ var ro = new ResizeObserver(function(){ fit(); }); document.querySelectorAll(".shot").forEach(function(sh){ ro.observe(sh); }); }

  /* ---------- small helpers for everything that moves ---------- */
  var seen = new WeakMap();
  var seenIO = new IntersectionObserver(function(es){ es.forEach(function(e){ seen.set(e.target, e.isIntersecting); e.target.classList.toggle("seen", e.isIntersecting); }); }, { rootMargin: "160px 0px" });
  function watch(el){ if(el) seenIO.observe(el); }
  function live(el){ return !document.hidden && !!seen.get(el); }
  function every(el, ms, fn){ if(!el) return; watch(el); setInterval(function(){ if(live(el)) fn(); }, ms); }
  function raf2(fn){ requestAnimationFrame(function(){ requestAnimationFrame(fn); }); }
  function pad(n){ return String(n).padStart(2, "0"); }
  function hm(m){ m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m/60)) + ":" + pad(m % 60); }
  function hms(t){ t = ((t % 86400) + 86400) % 86400; return pad(Math.floor(t/3600)) + ":" + pad(Math.floor(t/60) % 60) + ":" + pad(t % 60); }
  function each(list, fn){ Array.prototype.forEach.call(list, fn); }
  /* newest on top: the rest slide down and the one at the bottom leaves */
  function pushTop(box, html, max){
    var olds = Array.prototype.slice.call(box.children), tops = olds.map(function(c){ return c.offsetTop; });
    box.insertAdjacentHTML("afterbegin", html);
    var nu = box.firstElementChild;
    if(!reduced){
      olds.forEach(function(c, i){ var d = c.offsetTop - tops[i]; if(d){ c.style.transition = "none"; c.style.transform = "translateY(" + (-d) + "px)"; } });
      box.offsetHeight;
      olds.forEach(function(c){ c.style.transition = ""; c.style.transform = ""; });
      raf2(function(){ nu.classList.remove("enter"); });
    } else nu.classList.remove("enter");
    Array.prototype.slice.call(box.children, max).forEach(function(x){ if(x.classList.contains("leave")) return; x.classList.add("leave"); setTimeout(function(){ if(x.parentNode) x.parentNode.removeChild(x); }, 480); });
    return nu;
  }
  /* newest at the bottom: the list scrolls up one and the top one leaves */
  function pushBottom(box, html, max){
    box.insertAdjacentHTML("beforeend", html);
    var nu = box.lastElementChild;
    if(box.children.length <= max || reduced){ while(box.children.length > max) box.removeChild(box.firstElementChild); nu.classList.remove("enter"); return nu; }
    var first = box.firstElementChild, shift = box.children[1].offsetTop - first.offsetTop;
    first.classList.add("leave");
    box.style.transition = "transform 620ms cubic-bezier(.23,1,.32,1)"; box.style.transform = "translateY(" + (-shift) + "px)";
    raf2(function(){ nu.classList.remove("enter"); });
    setTimeout(function(){ box.style.transition = "none"; box.style.transform = ""; if(first.parentNode) box.removeChild(first); box.offsetHeight; box.style.transition = ""; }, 660);
    return nu;
  }
  /* the desk chat: a new message lands and the conversation glides up to make room */
  function chatPush(c, html, keep){
    c.insertAdjacentHTML("beforeend", html);
    if(reduced){ while(c.children.length > keep) c.removeChild(c.firstElementChild); return; }
    var nu = c.lastElementChild, h = nu.offsetHeight + (parseFloat(getComputedStyle(c).rowGap) || 0);
    c.style.transition = "none"; c.style.transform = "translateY(" + h + "px)"; c.offsetHeight;
    c.style.transition = "transform 680ms cubic-bezier(.23,1,.32,1)"; c.style.transform = "";
    setTimeout(function(){ while(c.children.length > keep) c.removeChild(c.firstElementChild); }, 720);
  }

  /* ---------- the conversation loops: the floor talks, a plan gets tabled, the clock runs, you decide, the next one starts ---------- */
  var ROUNDS = [
    { id: "0418", what: "US large cap · 2.1% of book · limit 0.15% above mid", script: SCRIPT, reject: false,
      verdict: '<div class="plan empty verdict ok">Approved by you at 10:14. Sent to your broker.</div>',
      after: [["Order Router","exec","Sent to your broker. Limit 0.15% above mid."],["Fill Quality","exec","Filled 0.03% over mid, inside the limit. Receipt is in the audit trail."]] },
    { id: "0419", what: "XOM · energy · 1.2% of book · limit at mid", reject: true, script: [
      ["Headline Scanner","data","Brent +1.8% on OPEC talk. 12 sources live, all fresh."],
      ["Idea Scout","val","Energy carry is back on the board. XOM, conviction 72."],
      ["Allocation","pm","Energy is 1.2% under the mandate. Proposing XOM at mid, good for 45 minutes."],
      ["Signal Validation","val","Sample 288, holds out of sample, weaker than last month. <em>veto=no</em>"],
      ["Sector Exposure","risk","Energy would be 6.1% against an 8% cap. <em>veto=no</em>"],
      ["Kill Switch","risk","Nothing armed. <em>veto=no</em>"],
      ["Desk","tl","Plan 0419 tabled. 74 seats heard, 0 vetoes. On your desk with the reasoning. 45:00 on the clock."]],
      verdict: '<div class="plan empty verdict">You rejected plan 0419 at 10:31. Nothing was sent.</div>',
      after: [["Desk","tl","Plan 0419 rejected by you. Nothing sent. Your reason is logged."],["Idea Scout","val","Noted. Energy carry goes back in the drawer for now."]] }
  ];
  var chats = document.querySelectorAll(".chat"), planSlots = document.querySelectorAll(".plan-slot"), notis = document.getElementById("lock-notis");
  var round = 0, step = 0, secs = -1, phase = "talk", slotHTML = null, timer;
  function R(){ return ROUNDS[round % ROUNDS.length]; }
  function clock(s){ return pad(Math.floor(s/60)) + ":" + pad(s % 60); }
  function render(){
    var r = R();
    planSlots.forEach(function(p){
      if(slotHTML){ if(p.dataset.state !== "verdict"){ p.innerHTML = slotHTML; p.dataset.state = "verdict"; } return; }
      if(secs < 0){ if(p.dataset.state !== "empty"){ p.innerHTML = planHTML(-1, r); p.dataset.state = "empty"; } return; }
      if(p.dataset.state !== r.id){ p.innerHTML = planHTML(secs, r); p.dataset.state = r.id; return; }
      var t = p.querySelector(".t i"); if(t) t.textContent = clock(secs);
    });
  }
  function say(m){ chats.forEach(function(c){ chatPush(c, msg(m), c.dataset.chat === "full" ? 8 : c.dataset.chat === "big" ? 5 : 4); }); }
  function later(ms){ clearTimeout(timer); timer = setTimeout(tick, ms); }
  function tick(){
    var r = R(), next = reduced ? 2600 : 1900;
    if(phase === "talk"){
      say(r.script[step++]);
      if(step === r.script.length){ phase = "clock"; secs = 45*60; render(); }
      return later(next);
    }
    if(phase === "clock"){
      if(secs > 45*60 - 14){ secs--; render(); return later(1000); }
      document.querySelectorAll(".plan-slot " + (r.reject ? ".rj" : ".ok")).forEach(function(b){ b.classList.add("press"); });
      phase = "verdict"; return later(460);
    }
    if(phase === "verdict"){ slotHTML = r.verdict; render(); phase = "after"; step = 0; return later(900); }
    if(phase === "after"){
      if(step < r.after.length){ say(r.after[step++]); return later(next); }
      phase = "rest"; return later(2600);
    }
    round++; step = 0; secs = -1; slotHTML = null; phase = "talk"; render(); later(1200);
  }
  (function(){ var d = new Date(), ld = document.getElementById("lock-date"); if(ld) ld.textContent = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }); })();
  render();
  var started = false;
  function go(){ if(!started){ started = true; tick(); } }
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) go(); }); }, { threshold: 0.15 });
  document.querySelectorAll("#mac, .feature .vis").forEach(function(el){ io.observe(el); });
  if(location.hash) go();
  document.addEventListener("visibilitychange", function(){ if(document.hidden){ clearTimeout(timer); } else if(started){ later(600); } });

  /* ---------- the phone: messages keep arriving through the day, older ones slide down and leave ---------- */
  var NOTIS = [
    ["wa","WhatsApp","Plan 0418 is waiting on you","US large cap, 2.1% of the book. 45:00 on the clock.", 612],
    ["mail","Email","Filled: plan 0418","0.03% over mid, inside your limit. Receipt is in the audit trail.", 614],
    ["tg","Telegram","Heads-up from the floor","The book is down 1.5%, halfway to your bad-day limit.", 700],
    ["im","iMessage","Plan 0419 is waiting on you","XOM, 1.2% of the book. Reply APPROVE 0419.", 725],
    ["wa","WhatsApp","Plan 0419 expired","You did nothing, so nothing happened. That is fine.", 770],
    ["tg","Telegram","Stop-loss flag on XOM","8% under entry. The floor wants your eyes on it.", 810],
    ["mail","Email","Halted for the day","Bad-day limit reached. Nothing was sold. You release it tomorrow.", 860],
    ["im","iMessage","Daily summary","Down 3.1% on the day, halted since 14:20. Nothing waiting on you.", 1025]
  ];
  var lockEl = document.querySelector(".lock"), lockTime = lockEl && lockEl.querySelector(".time"), ni = 0, clearing = false;
  function notiHTML(n, enter){ return '<div class="noti fi' + (enter ? ' enter' : '') + '" data-m="' + n[4] + '">' + ICON[n[0]] + '<div><div class="h"><span>' + n[1] + '</span><span class="ago">now</span></div><b>' + n[2] + '</b>' + n[3] + '</div></div>'; }
  function ages(now){ each(notis.querySelectorAll(".noti"), function(x){ var d = now - (+x.dataset.m); x.querySelector(".ago").textContent = d < 1 ? "now" : d < 60 ? d + "m ago" : Math.floor(d/60) + "h ago"; }); }
  function setLockTime(m){ if(!lockTime) return; var t = hm(m); if(lockTime.textContent === t) return; lockTime.style.opacity = .35; setTimeout(function(){ lockTime.textContent = t; lockTime.style.opacity = ""; }, 160); }
  function nextNoti(silent){
    if(!notis || clearing) return;
    if(ni >= NOTIS.length){
      /* the end of the day: you read them, they clear, and tomorrow starts */
      clearing = true;
      var kids = Array.prototype.slice.call(notis.children);
      kids.forEach(function(x, i){ setTimeout(function(){ x.classList.add("leave"); }, i * 110); });
      setTimeout(function(){ notis.innerHTML = ""; ni = 0; clearing = false; setLockTime(NOTIS[0][4] - 3); }, 700 + kids.length * 110);
      return;
    }
    var n = NOTIS[ni++];
    if(silent){ notis.insertAdjacentHTML("afterbegin", notiHTML(n, false)); if(lockTime) lockTime.textContent = hm(n[4]); }
    else { setLockTime(n[4]); pushTop(notis, notiHTML(n, true), 5); lockEl.classList.add("wake"); setTimeout(function(){ lockEl.classList.remove("wake"); }, 180); }
    ages(n[4]);
  }
  if(notis){ nextNoti(true); nextNoti(true); every(lockEl, 3000, function(){ nextNoti(false); }); }

  /* ---------- a bad day ---------- */
  var path = []; (function(){ var v = 0, seed = 11; function r(){ seed = (seed*16807)%2147483647; return (seed-1)/2147483646; }
    for(var i = 0; i <= 78; i++){ var t = i/78; var drift = t < 0.72 ? -7.8*t*t : -5.6 + (t-0.72)*8.0; v = drift + (r()-0.5)*0.35; path.push(v); } path[0] = 0; })();
  var lim = { bad: 3, brake: 10 }, apps = ["WhatsApp","email"];
  function tstr(i){ var m = 9*60 + 30 + i*5; return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"); }
  function drawDay(){
    var svg = document.getElementById("daychart"), W = 640, H = 300, L = 44, R = 12, T = 18, B = 34;
    var yMin = -8, yMax = 1; var X = function(i){ return L + i/78*(W-L-R); }, Y = function(v){ return T + (yMax - v)/(yMax - yMin)*(H-T-B); };
    var badAt = -1, brakeAt = -1, halfAt = -1;
    for(var i = 0; i < path.length; i++){ if(badAt < 0 && path[i] <= -lim.bad) badAt = i; if(brakeAt < 0 && path[i] <= -lim.brake) brakeAt = i; if(halfAt < 0 && path[i] <= -lim.brake/2) halfAt = i; }
    var haltAt = badAt >= 0 ? badAt : -1;
    var d = "", d2 = "";
    for(var j = 0; j < path.length; j++){ var p = (j ? "L" : "M") + X(j).toFixed(1) + " " + Y(path[j]).toFixed(1) + " "; if(haltAt < 0 || j <= haltAt) d += p; if(haltAt >= 0 && j >= haltAt) d2 += (j === haltAt ? "M" : "L") + X(j).toFixed(1) + " " + Y(path[j]).toFixed(1) + " "; }
    var s = '<defs><clipPath id="dayclip"><rect id="dayclip-r" x="0" y="0" width="' + (reduced ? W : 0) + '" height="' + H + '"/></clipPath></defs>';
    [0,-2,-4,-6,-8].forEach(function(g){ s += '<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(g)+'" y2="'+Y(g)+'" stroke="rgba(28,43,69,.1)"/><text class="ax" x="'+(L-8)+'" y="'+(Y(g)+4)+'" text-anchor="end">'+g+'%</text>'; });
    [0,26,52,78].forEach(function(i){ s += '<text class="ax" x="'+X(i)+'" y="'+(H-12)+'" text-anchor="middle">'+tstr(i)+'</text>'; });
    s += '<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(-lim.bad)+'" y2="'+Y(-lim.bad)+'" stroke="#D25B4D" stroke-dasharray="4 4" opacity=".7"/><text class="ax" x="'+(W-R)+'" y="'+(Y(-lim.bad)-5)+'" text-anchor="end" fill="#D25B4D">bad day '+lim.bad+'%</text>';
    if(lim.brake <= 8) s += '<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(-lim.brake)+'" y2="'+Y(-lim.brake)+'" stroke="#1C2B45" stroke-dasharray="4 4" opacity=".5"/><text class="ax" x="'+(W-R)+'" y="'+(Y(-lim.brake)-5)+'" text-anchor="end">brake '+lim.brake+'%</text>';
    s += '<g class="lines" clip-path="url(#dayclip)"><path d="'+d+'" fill="none" stroke="#1C2B45" stroke-width="2.2" stroke-linejoin="round"/>';
    if(d2) s += '<path d="'+d2+'" fill="none" stroke="#7E8798" stroke-width="1.6" stroke-dasharray="3 4"/>';
    s += '</g>';
    if(haltAt >= 0) s += '<g class="pop' + (reduced ? ' on' : '') + '" id="haltmark"><circle class="ring" cx="'+X(haltAt)+'" cy="'+Y(path[haltAt])+'" r="9" fill="none" stroke="#D25B4D" stroke-width="1.5"/><circle cx="'+X(haltAt)+'" cy="'+Y(path[haltAt])+'" r="11" fill="rgba(210,91,77,.18)"/><circle cx="'+X(haltAt)+'" cy="'+Y(path[haltAt])+'" r="5" fill="#D25B4D"/><text class="ax" x="'+(X(haltAt)+14)+'" y="'+(Y(path[haltAt])+4)+'" fill="#D25B4D">halted '+tstr(haltAt)+'</text></g>';
    s += '<g class="ph" id="ph" style="opacity:0"><line x1="0" x2="0" y1="'+(T+2)+'" y2="'+(H-B)+'" stroke="rgba(28,43,69,.35)" stroke-dasharray="2 3"/><circle r="4.5" cy="'+Y(0)+'" fill="#1C2B45" stroke="#fff" stroke-width="2"/><text class="ax" y="'+(T-5)+'" text-anchor="middle">09:30</text></g>';
    svg.innerHTML = s;
    var via = !apps.length ? "nowhere (you switched every channel off)"
      : apps.length === 1 ? apps[0] : apps.slice(0, -1).join(", ") + " and " + apps[apps.length - 1];
    var ev = [];
    ev.push({ at:0, t:"09:31", c:"ok", b:"Session open.", r:"Wires fresh. The floor starts measuring." });
    if(halfAt >= 0 && (haltAt < 0 || halfAt <= haltAt)) ev.push({ at:halfAt, t:tstr(halfAt), c:"warn", b:"Halfway to your brake.", r:"Book down "+(lim.brake/2).toFixed(1)+"%. A heads-up went out on "+via+"." });
    if(haltAt >= 0 && brakeAt === haltAt) ev.push({ at:haltAt, t:tstr(haltAt), c:"halt", b:"Bad-day halt and emergency brake, both at "+lim.bad+"%.", r:"Everything halts until you release it yourself. Nothing is sold. You heard on "+via+", and the message says why." });
    else {
      if(haltAt >= 0) ev.push({ at:haltAt, t:tstr(haltAt), c:"halt", b:"Bad-day halt at "+lim.bad+"%.", r:"Trading stops for the rest of the session. Nothing is sold. You heard on "+via+", and again every two hours until you acknowledged it." });
      if(brakeAt >= 0) ev.push({ at:brakeAt, t:tstr(brakeAt), c:"halt", b:"Emergency brake at "+lim.brake+"%.", r:"Everything halts until you release it yourself. The message says why." });
    }
    if(haltAt < 0 && brakeAt < 0) ev.push({ at:56, t:tstr(56), c:"ok", b:"Worst point of the day, "+Math.min.apply(null, path).toFixed(1)+"%.", r:"Inside your limits, so the floor kept working." });
    ev.push({ at:78, t:"17:05", c:"ok", b:"Daily summary.", r:"Account value, the day's move, what is waiting on you, and "+(haltAt >= 0 || brakeAt >= 0 ? "that the floor is halted" : "that nothing is halted")+". Sent on "+via+"." });
    var tl = document.getElementById("timeline"); tl.innerHTML = ev.map(function(e){ return '<li class="'+e.c+(reduced ? '' : ' dim')+'" data-at="'+e.at+'"><time>'+e.t+'</time><div><b>'+e.b+'</b> '+e.r+'</div></li>'; }).join("");
    DAY = { X: X, Y: Y, W: W, haltAt: haltAt };
    if(!reduced && dayVisible) playDay();
  }
  /* the day plays out left to right: the line draws, the clock runs, events light up as they happen */
  var DAY = null, dayVisible = false, dayPlayed = false, dayRaf = 0, dayT1 = 0, dayT2 = 0, dayPending = false;
  function playDay(){
    if(!DAY) return;
    cancelAnimationFrame(dayRaf); clearTimeout(dayT1); clearTimeout(dayT2);
    var svg = document.getElementById("daychart"), rect = document.getElementById("dayclip-r"), ph = document.getElementById("ph"), mark = document.getElementById("haltmark"), lines = svg.querySelector(".lines"), lis = document.querySelectorAll("#timeline li");
    var dot = ph.querySelector("circle"), lab = ph.querySelector("text");
    rect.setAttribute("width", 0); lines.style.opacity = 1; ph.style.opacity = 1; if(mark) mark.classList.remove("on");
    each(lis, function(li){ li.classList.add("dim"); });
    var DUR = 7200, t0 = performance.now();
    function frame(now){
      var t = Math.max(0, Math.min(1, (now - t0) / DUR)), idx = t * 78, x = DAY.X(idx);
      var i0 = Math.floor(idx), i1 = Math.min(78, i0 + 1), v = path[i0] + (path[i1] - path[i0]) * (idx - i0);
      rect.setAttribute("width", x.toFixed(1));
      ph.setAttribute("transform", "translate(" + x.toFixed(1) + ",0)");
      dot.setAttribute("cy", DAY.Y(v).toFixed(1));
      dot.setAttribute("fill", DAY.haltAt >= 0 && idx > DAY.haltAt ? "#7E8798" : "#1C2B45");
      lab.textContent = tstr(Math.round(idx)); lab.setAttribute("text-anchor", x > DAY.W - 40 ? "end" : "middle");
      if(mark && idx >= DAY.haltAt) mark.classList.add("on");
      each(lis, function(li){ if(idx >= +li.dataset.at) li.classList.remove("dim"); });
      if(t < 1) dayRaf = requestAnimationFrame(frame);
      else { dayT1 = setTimeout(function(){ ph.style.opacity = 0; }, 900); dayPending = true; } /* plays again only when it comes back into view or a setting changes */
    }
    dayRaf = requestAnimationFrame(frame);
  }
  function replayDay(){
    if(!dayVisible || document.hidden){ dayPending = true; return; }
    var lines = document.querySelector("#daychart .lines"), mark = document.getElementById("haltmark");
    lines.style.opacity = 0; if(mark) mark.classList.remove("on");
    dayT1 = setTimeout(playDay, 420);
  }
  document.querySelectorAll(".seg").forEach(function(seg){ seg.addEventListener("click", function(e){ var b = e.target.closest("button"); if(!b) return; seg.querySelectorAll("button").forEach(function(x){ x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b ? "true" : "false"); }); lim[seg.dataset.key] = +b.dataset.v; document.getElementById("v-"+seg.dataset.key).textContent = b.dataset.v+"%"; drawDay(); }); });
  document.getElementById("chips").addEventListener("click", function(e){ var b = e.target.closest("button"); if(!b) return; var on = b.classList.toggle("on"); b.setAttribute("aria-pressed", on ? "true" : "false"); apps = Array.prototype.filter.call(this.children, function(x){ return x.classList.contains("on"); }).map(function(x){ return x.dataset.v; }); drawDay(); });
  drawDay();
  new IntersectionObserver(function(es){ es.forEach(function(e){ dayVisible = e.isIntersecting; if(dayVisible && !reduced && (!dayPlayed || dayPending)){ dayPlayed = true; dayPending = false; playDay(); } }); }, { threshold: 0.35 }).observe(document.querySelector(".chart"));

  /* ---------- copy the command ---------- */
  var copy = document.getElementById("copy"), cmdText = "curl -fsSL https://teloson.com/install.sh | bash -s -- TL-XXXX-XXXX-XXXX you@example.com", copyTimer;
  copy.addEventListener("click", function(){
    function did(){ copy.textContent = "Copied"; clearTimeout(copyTimer); copyTimer = setTimeout(function(){ copy.textContent = "Copy example"; }, 1600); }
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(cmdText).then(did, function(){}); }
  });

  /* ---------- the short pills hand off to the full form ---------- */
  each(document.querySelectorAll("#capture, [data-capture]"), function(f){ f.addEventListener("submit", function(e){ e.preventDefault(); var inp = f.querySelector("input[type=email]"), v = inp ? inp.value.trim() : ""; document.getElementById("f-email").value = v; var target = document.getElementById("invite"); if(window.lenis) window.lenis.scrollTo(target, { offset: -16 }); else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); setTimeout(function(){ document.getElementById(v ? "f-name" : "f-email").focus({ preventScroll: true }); }, 700); }); });


  /* ---------- request an account ---------- */
  var ENDPOINT = "https://jiyujojygjufkfdkcycd.supabase.co/rest/v1/teloson_interest";
  var KEY = "sb_publishable_YxqbAEU_h_R0GI-OqCpKhA_H-Z2mL2V";
  /* a second route to a human. Set CONTACT to the address that should be published; empty hides the link and the fallback text. */
  var CONTACT = "";
  function contactTail(){ return CONTACT ? ', or write to <a href="mailto:' + CONTACT + '">' + CONTACT + '</a>' : ''; }
  (function(){ var cl = document.getElementById("contact-link"); if(cl && CONTACT){ cl.href = "mailto:" + CONTACT; cl.textContent = "Write to us: " + CONTACT; cl.hidden = false; } })();
  var form = document.getElementById("interest"), status = document.getElementById("f-status"), submit = document.getElementById("f-submit"), done = document.getElementById("done");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var name = form.name.value.trim(), email = form.email.value.trim(), loc = form.location.value.trim(), note = form.note.value.trim();
    status.className = "status";
    if(form.company.value){ status.innerHTML = "That did not send: a hidden field was filled in, usually by an autofill tool. Clear the form and try again" + contactTail() + "."; status.className = "status err"; return; }
    if(!name){ status.textContent = "Please add your name."; status.className = "status err"; form.name.focus(); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ status.textContent = "That email does not look right."; status.className = "status err"; form.email.focus(); return; }
    submit.disabled = true; status.textContent = "Sending…";
    fetch(ENDPOINT, { method: "POST", headers: { "apikey": KEY, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({ name: name, email: email, location: loc || null, note: note || null, source: window.location.hostname || "teloson.com" }) })
    .then(function(r){ if(!r.ok) throw new Error("HTTP " + r.status); form.style.display = "none"; done.style.display = "block"; })
    .catch(function(){ submit.disabled = false; status.innerHTML = (typeof PREVIEW !== "undefined") ? "This is the preview copy; the form sends on teloson.com." : "That did not go through. Please try again in a moment" + contactTail() + "."; status.className = "status err"; });
  });

  /* ================= life: the windows keep working ================= */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  /* a thing happens once, when its element first comes into view */
  function reveal(el, delay, onin){ if(!el || !onin) return; if(reduced){ onin(); return; } var o = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ o.disconnect(); onin(); } }); }, { threshold: .2 }); o.observe(el); }

  /* the hero desk's alerts keep coming */
  var ALERTS = [["10:14", "<b>Filled, plan 0418.</b> 0.03% over mid."], ["10:31", "<b>Plan 0419 waiting on you.</b> Sent by Telegram."], ["11:02", "<b>Limits checked.</b> Nothing differs from what you signed."], ["12:05", "<b>Wires refreshed.</b> 12 of 12 live."], ["12:50", "<b>Plan 0419 expired.</b> Nothing happened."], ["09:31", "<b>Session open.</b> Wires fresh, 12 live."], ["10:12", "<b>Plan 0418 waiting on you.</b> Sent by WhatsApp and email."]];
  var ai = 0;
  each(document.querySelectorAll(".desk .al"), function(al){ al.style.height = al.offsetHeight + "px"; each(al.children, function(c){ c.classList.add("fi"); }); });
  every(document.getElementById("mac"), 4300, function(){ var a = ALERTS[ai++ % ALERTS.length]; each(document.querySelectorAll(".desk .al"), function(al){ pushTop(al, '<div class="fi enter"><span>' + a[0] + '</span><i>' + a[1] + '</i></div>', 3); }); });
  /* the account value moves */
  var navs = []; each(document.querySelectorAll(".desk .stat"), function(st){ var l = st.querySelector(".l"); if(l && l.textContent === "Net Asset Value") navs.push(st.querySelector(".v")); });
  var navVal = 248910.42;
  setInterval(function(){
    if(document.hidden) return;
    var dv = (Math.random() - .47) * 96; navVal += dv;
    var txt = "$" + navVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    navs.forEach(function(v){ v.textContent = txt; v.classList.remove("up", "dn"); v.classList.add(dv >= 0 ? "up" : "dn"); setTimeout(function(){ v.classList.remove("up", "dn"); }, 280); });
  }, 2300);

  /* ---------- the limits screen checks each line in turn ---------- */
  each(document.querySelectorAll(".desk.biglimits .lim"), function(lim){
    var cells = lim.querySelectorAll(":scope > span"), rows = [];
    for(var i = 3; i + 2 < cells.length; i += 3) rows.push([cells[i], cells[i + 1], cells[i + 2]]);
    if(!rows.length) return;
    var scan = document.createElement("div"); scan.className = "scan"; lim.insertBefore(scan, lim.firstChild);
    var rt = lim.parentNode.querySelector(".hd .rt"), k = -1;
    function place(){ var r = rows[Math.max(0, k)][0]; scan.style.height = (r.offsetHeight + 16) + "px"; scan.style.transform = "translateY(" + (r.offsetTop - 8) + "px)"; }
    every(lim, 1250, function(){
      k = (k + 1) % rows.length; place();
      var c = rows[k][2]; c.classList.add("hit"); setTimeout(function(){ c.classList.remove("hit"); }, 700);
      if(rt) rt.textContent = "checking " + (k + 1) + " of " + rows.length;
    });
  });

  /* ---------- the rest of the building: every window is live ---------- */
  var strip = document.querySelector(".strip"), track = strip && strip.querySelector(".track"), TILE = ["office", "news", "ideas", "perf", "audit", "practice", "rooms"];
  var tiles0 = track ? Array.prototype.slice.call(track.children) : [];
  tiles0.forEach(function(t, i){ t.classList.add("t-" + TILE[i]); });
  function win(name){ var t = strip.querySelector(".t-" + name + " .win"); return t; }
  function wins(name){ return strip.querySelectorAll(".t-" + name + " .win"); }
  if(strip){
    /* office seats */
    var ow = win("office"), os = ow && ow.querySelector(".seats"), veto = [0,1,2,3,5,10,11,12,13,14,15,16,25,50];
    if(os){ os.removeAttribute("id"); for(var si = 0; si < 40; si++){ var se = document.createElement("i"); if(veto.indexOf(si) >= 0) se.className = "veto"; else if(si % 3 !== 1) se.className = "on"; os.appendChild(se); } }
    /* news: rows in a clipped feed */
    var nw = win("news");
    if(nw){ var nrows = nw.querySelectorAll(".row"); var nclip = document.createElement("div"); nclip.className = "feed-clip"; var nfeed = document.createElement("div"); nfeed.className = "feed"; nclip.appendChild(nfeed); nw.insertBefore(nclip, nrows[0]); for(var q = 0; q < 3; q++){ nrows[q].classList.add("fi"); nrows[q].dataset.age = [2, 9, 14][q]; nfeed.appendChild(nrows[q]); } nrows[3].querySelector(".u").classList.add("live"); }
    /* audit: rows in a clipped feed that scrolls up */
    var aw = win("audit");
    if(aw){ var arows = aw.querySelectorAll(".row"); var aclip = document.createElement("div"); aclip.className = "feed-clip"; var afeed = document.createElement("div"); afeed.className = "feed fb"; aclip.appendChild(afeed); aw.appendChild(aclip); each(arows, function(r){ r.classList.add("fi"); afeed.appendChild(r); }); }
    /* ideas: bars become scalable */
    each(win("ideas") ? win("ideas").querySelectorAll(".bar i") : [], function(b){ var v = parseFloat(b.style.width) / 100 || .5; b.dataset.v = v; b.style.width = ""; b.style.transform = "scaleX(" + v + ")"; });
    /* performance: a live line against buy-and-hold */
    var pw = win("perf");
    if(pw){ var psvg = pw.querySelector("svg"); psvg.innerHTML = '<g class="pg"><path class="pb" fill="none" stroke="#8b93a1" stroke-width="1.5" stroke-dasharray="4 6"/><path class="pa" fill="none" stroke="#4d8bff" stroke-width="2" stroke-linejoin="round"/><circle class="perf-dot" r="3" fill="#4d8bff"/></g>'; }
    /* practice */
    var prw = win("practice"); if(prw){ var pu = prw.querySelector(".u"); if(pu) pu.classList.add("live"); }

    each(strip.querySelectorAll(".feed-clip"), function(cl){ cl.style.height = cl.firstElementChild.offsetHeight + "px"; });
    watch(strip);

    every(strip, 380, function(){ var k = Math.floor(Math.random() * 40); each(strip.querySelectorAll(".t-office .seats"), function(s){ var e = s.children[k]; if(e && !e.classList.contains("veto")) e.classList.toggle("on"); }); });

    var HEADS = ["10y yield slips 4bp", "Retail sales beat estimates", "Gold firmer into the close", "ECB holds rates, sounds patient", "Jobless claims come in lower", "Copper at a 3-month high", "Fed minutes at 14:00", "NVDA guides above street", "Brent +1.8% on OPEC talk"], hk = 0;
    function ago(m){ return m < 1 ? "now" : m + "m"; }
    every(strip, 3300, function(){
      var h = HEADS[hk++ % HEADS.length];
      each(strip.querySelectorAll(".t-news .feed"), function(f){ each(f.children, function(r){ r.dataset.age = (+r.dataset.age || 0) + 2 + Math.floor(Math.random() * 3); r.querySelector("span").textContent = ago(+r.dataset.age); }); pushTop(f, '<div class="row fi enter" data-age="0"><b>' + h + '</b><span>now</span></div>', 3); });
    });

    var ideaTick = 0, TLT = [["rejected", "d"], ["in review", ""], ["rejected", "d"]];
    every(strip, 2600, function(){
      ideaTick++;
      var vals = [];
      each(win("ideas") ? win("ideas").querySelectorAll(".bar i") : [], function(b, i){ var v = Math.min(.92, Math.max(.24, (+b.dataset.v) + (Math.random() - .5) * .22)); b.dataset.v = v; vals[i] = v; });
      each(wins("ideas"), function(w){ each(w.querySelectorAll(".bar i"), function(b, i){ b.style.transform = "scaleX(" + vals[i] + ")"; }); if(ideaTick % 3 === 0){ var st = TLT[(ideaTick / 3) % TLT.length], rows = w.querySelectorAll(".row"), last = rows[rows.length - 1], sp = last.querySelector("span"); sp.textContent = st[0]; sp.className = st[1]; last.classList.add("flash"); setTimeout(function(){ last.classList.remove("flash"); }, 140); } });
    });

    /* performance: honest, so the blue line hovers around buy-and-hold rather than running away from it */
    var bh = [62, 57, 59, 51, 53, 46, 48, 41, 43, 36, 38, 32], oos = [62, 59, 62, 55, 58, 51, 55, 48, 52, 45, 49, 43], STEP = 20, PT = 1500;
    function perfPaths(){
      var a = "", b = "";
      for(var i = 0; i < 12; i++){ var x = i * STEP - 10; a += (i ? "L" : "M") + x + " " + oos[i].toFixed(1) + " "; b += (i ? "L" : "M") + x + " " + bh[i].toFixed(1) + " "; }
      each(strip.querySelectorAll(".t-perf svg"), function(svg){ svg.querySelector(".pa").setAttribute("d", a); svg.querySelector(".pb").setAttribute("d", b); var dot = svg.querySelector(".perf-dot"); dot.setAttribute("cx", 11 * STEP - 10); dot.setAttribute("cy", oos[11].toFixed(1)); });
    }
    perfPaths();
    every(strip, PT, function(){
      var nb = bh[11] + (Math.random() - .5) * 18 - (bh[11] - 40) * .16;
      var gap = (oos[11] - bh[11]) * .75 + (Math.random() - .3) * 5;
      bh.shift(); bh.push(Math.max(12, Math.min(66, nb))); oos.shift(); oos.push(Math.max(12, Math.min(72, bh[11] + Math.max(-4, gap))));
      perfPaths();
      if(!reduced) each(strip.querySelectorAll(".t-perf .pg"), function(g){ if(g.animate) g.animate([{ transform: "translateX(0px)" }, { transform: "translateX(-" + STEP + "px)" }], { duration: PT, easing: "linear", fill: "forwards" }); });
    });

    var AUDIT = [["10:43 plan 0419 tabled", "desk", ""], ["10:43 sent on WhatsApp", "notify", ""], ["10:51 rejected 0419", "you", ""], ["11:02 limits checked", "risk", ""], ["11:40 heads-up sent", "notify", ""], ["14:20 halt · bad day", "risk", "d"], ["17:05 summary sent", "notify", ""], ["10:12 plan 0418 tabled", "desk", ""], ["10:14 approved 0418", "you", ""], ["10:14 order sent", "exec", ""], ["10:14 filled 0.03% over", "fill quality", ""]], ak = 0;
    every(strip, 2700, function(){ var a = AUDIT[ak++ % AUDIT.length]; each(strip.querySelectorAll(".t-audit .feed"), function(f){ pushBottom(f, '<div class="row fi enter"><b>' + a[0] + '</b><span' + (a[2] ? ' class="' + a[2] + '"' : '') + '>' + a[1] + '</span></div>', 4); }); });

    var pk = 0;
    every(strip, 1500, function(){ pk = (pk + 1) % 4; each(wins("practice"), function(w){ var r = w.querySelectorAll(".row")[pk]; if(!r) return; r.classList.add("flash"); setTimeout(function(){ r.classList.remove("flash"); }, 160); }); });

    every(strip, 2200, function(){
      var k = Math.floor(Math.random() * 3), cur = null;
      each(wins("rooms"), function(w){ var r = w.querySelectorAll(".row")[k]; if(!r) return; var sp = r.querySelector("span"); if(cur === null){ var n = parseInt(sp.textContent, 10) + (Math.random() < .5 ? -1 : 1); cur = Math.max(3, Math.min(9, n)); } sp.textContent = cur + " seats"; r.classList.add("flash"); setTimeout(function(){ r.classList.remove("flash"); }, 160); });
    });
  }

  /* ---------- the install line types itself ---------- */
  var pre = document.querySelector(".cmd pre");
  if(pre){
    if(reduced){ reveal(document.querySelector(".cmd")); }
    else {
      var segs = Array.prototype.map.call(pre.childNodes, function(n){ return { c: n.nodeType === 1 ? n.className : "", t: n.textContent }; });
      var total = segs.reduce(function(a, sg){ return a + sg.t.length; }, 0);
      var esc = function(t){ return t.replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
      var upto = function(n){ var out = "", left = n; segs.forEach(function(sg){ if(left <= 0) return; var part = sg.t.slice(0, left); left -= part.length; out += sg.c ? '<span class="' + sg.c + '">' + esc(part) + '</span>' : esc(part); }); return out; };
      pre.innerHTML = '<span class="ghost">' + pre.innerHTML + '</span><span class="typed" aria-hidden="true"><span class="caret"></span></span>';
      pre.classList.add("typing");
      var typed = pre.querySelector(".typed");
      reveal(document.querySelector(".cmd"), 0, function(){
        var n = 0;
        setTimeout(function step(){
          n++; typed.innerHTML = upto(n) + '<span class="caret"></span>';
          if(n < total) setTimeout(step, n < 2 ? 280 : 14 + Math.random() * 30);
          else { pre.classList.remove("typing"); typed.parentNode.removeChild(typed); pre.querySelector(".ghost").insertAdjacentHTML("beforeend", '<span class="caret"></span>'); }
        }, 500);
      });
    }
  }

  /* ---------- questions open and close smoothly (mouse and touch; the keyboard stays instant) ---------- */
  each(document.querySelectorAll(".faq details"), function(d){
    var s = d.querySelector("summary"), a = d.querySelector(".a"), anim = null;
    s.addEventListener("click", function(e){
      if(reduced || !a.animate || e.detail === 0) return;
      e.preventDefault();
      if(anim){ anim.cancel(); anim = null; }
      var ease = "cubic-bezier(.23,1,.32,1)";
      if(!d.open){ d.open = true; var h = a.offsetHeight; anim = a.animate([{ height: "0px", paddingBottom: "0px", opacity: 0 }, { height: h + "px", paddingBottom: "22px", opacity: 1 }], { duration: 360, easing: ease }); anim.onfinish = function(){ anim = null; }; }
      else { var h2 = a.offsetHeight; anim = a.animate([{ height: h2 + "px", paddingBottom: "22px", opacity: 1 }, { height: "0px", paddingBottom: "0px", opacity: 0 }], { duration: 260, easing: ease }); anim.onfinish = function(){ d.open = false; anim = null; }; }
    });
  });
})();
