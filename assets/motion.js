// Teloson · the motion layer: smooth scroll, the pinned section, reveals, the inbox, the floor. Loaded deferred.
/* ================= the motion layer: smooth scroll, the pinned section, reveals, the inbox, the floor ================= */
/* runs once the libraries are in: DOMContentLoaded fires after the deferred scripts, and GSAP (desktop only) announces itself */
var booted = false;
function boot(){
  if(booted) return; booted = true;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var desktop = window.matchMedia("(min-width: 900px)").matches;
  function each(list, fn){ Array.prototype.forEach.call(list, fn); }
  function pad(n){ return String(n).padStart(2, "0"); }
  function raf2(fn){ requestAnimationFrame(function(){ requestAnimationFrame(fn); }); }

  /* ---------- smooth scroll, and ScrollTrigger riding on it ---------- */
  var lenis = null;
  if(window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if(window.Lenis && !reduced){
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -20 } });
    window.lenis = lenis;
    if(window.gsap && window.ScrollTrigger){ lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(function(t){ lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
    else (function loop(t){ lenis.raf(t); requestAnimationFrame(loop); })(performance.now());
  }

  /* ---------- the nav reads the section under it ---------- */
  (function(){
    var el = document.getElementById("topnav"), zones = [], tick = false;
    function measure(){ var sy = window.scrollY; zones = Array.prototype.map.call(document.querySelectorAll("[data-nav]"), function(s){ var r = s.getBoundingClientRect(); return { t: r.top + sy, b: r.bottom + sy, kind: s.getAttribute("data-nav") }; }); }
    function update(){
      tick = false; var y = window.scrollY + 46, light = false;
      for(var i = 0; i < zones.length; i++){ var z = zones[i]; if(y < z.t || y >= z.b) continue;
        light = z.kind === "light" || (z.kind === "up" && y > z.t + (z.b - z.t) * .72) || (z.kind === "down" && y < z.t + (z.b - z.t) * .3); break; }
      el.classList.toggle("light", light);
    }
    measure(); update();
    window.addEventListener("scroll", function(){ if(!tick){ tick = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", function(){ measure(); update(); });
    window.addEventListener("load", function(){ setTimeout(function(){ measure(); update(); }, 100); });
    if("ResizeObserver" in window) new ResizeObserver(function(){ measure(); }).observe(document.body);
    if(window.ScrollTrigger) ScrollTrigger.addEventListener("refresh", function(){ measure(); update(); if(window.__dither) window.__dither.relayout(); });
  })();

  /* ---------- three things the desk does: the text holds, the cards swap ---------- */
  (function(){
    var pin = document.getElementById("pin"), lis = document.querySelectorAll("#flist li"), cards = document.querySelectorAll("#fcards .fcard"), cur = 0, st = null;
    function activate(i){ if(i === cur) return; cur = i; each(lis, function(li, k){ li.classList.toggle("on", k === i); }); each(cards, function(c, k){ c.classList.toggle("on", k === i); }); }
    if(pin && desktop && window.ScrollTrigger && !reduced){
      st = ScrollTrigger.create({ trigger: pin, start: "center center", end: "+=" + Math.round(window.innerHeight * 2.2), pin: true, scrub: true, anticipatePin: 1,
        onUpdate: function(self){ activate(Math.min(2, Math.floor(self.progress * 3 + 1e-4))); } });
    }
    each(lis, function(li, i){ var h = li.querySelector("h3"); if(!h) return; h.addEventListener("click", function(){
      if(st){ var y = st.start + (st.end - st.start) * ((i + .5) / 3); if(lenis) lenis.scrollTo(y, { duration: .9 }); else window.scrollTo({ top: y, behavior: "smooth" }); }
      else activate(i);
    }); });
  })();

  /* ---------- reveals: short, eased out, once ---------- */
  function countUp(b){
    var tn = b.firstChild; if(!tn || tn.nodeType !== 3) return;
    var m = tn.textContent.match(/^([\d.]+)(.*)$/); if(!m) return;
    var target = parseFloat(m[1]), dec = (m[1].split(".")[1] || "").length, suf = m[2];
    if(!target || reduced) return;
    b.style.minWidth = b.offsetWidth + "px";
    var t0 = performance.now(), dur = 1100;
    tn.textContent = (0).toFixed(dec) + suf;
    requestAnimationFrame(function f(now){ var t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 4); tn.textContent = (target * e).toFixed(dec) + suf; if(t < 1) requestAnimationFrame(f); });
  }
  var REVEAL = ".hook h2, .hook .wrap > p, .stats > div, .built .lbl, .mark, .rooms h2, .tile, .sim > div, .capture, .trust h2, .tgrid > div, .talk, .path .head > *, .steps li, .faq > div > *, .request .grid > div, footer .col";
  if(window.gsap && window.ScrollTrigger && !reduced){
    var els = gsap.utils.toArray(REVEAL);
    gsap.set(els, { opacity: 0, y: 16 });
    ScrollTrigger.batch(els, { start: "top 92%", once: true, batchMax: 8, onEnter: function(b){ gsap.to(b, { opacity: 1, y: 0, duration: .5, ease: "power3.out", stagger: .05, overwrite: true, clearProps: "transform" }); } });
    var counts = function(sel){ var el = document.querySelector(sel); if(!el) return; ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: function(){ each(el.querySelectorAll("b"), countUp); } }); };
    counts(".stats"); counts(".talk .nums");
  } else if(!reduced && "IntersectionObserver" in window){
    /* the light version: the same short ease-out, driven by IntersectionObserver and CSS */
    var lite = Array.prototype.slice.call(document.querySelectorAll(REVEAL)), vh = window.innerHeight;
    lite = lite.filter(function(el){ return el.getBoundingClientRect().top > vh * .92; });
    lite.forEach(function(el){ el.style.opacity = "0"; el.style.transform = "translateY(14px)"; el.style.transition = "opacity 480ms cubic-bezier(.2,.8,.2,1), transform 520ms cubic-bezier(.2,.8,.2,1)"; });
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return; var el = e.target; io.unobserve(el); el.style.opacity = "1"; el.style.transform = "none"; setTimeout(function(){ el.style.transform = ""; el.style.transition = ""; }, 600); }); }, { rootMargin: "0px 0px -8% 0px" });
    lite.forEach(function(el){ io.observe(el); });
    var countIO = new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return; countIO.unobserve(e.target); each(e.target.querySelectorAll("b"), countUp); }); }, { rootMargin: "0px 0px -15% 0px" });
    [".stats", ".talk .nums"].forEach(function(s){ var el = document.querySelector(s); if(el) countIO.observe(el); });
  }
  if(fine) each(document.querySelectorAll(".stats > div, .tgrid > div, .steps li, .talk .nums > div"), function(c){ c.addEventListener("pointermove", function(e){ var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); }); });

  /* ---------- the inbox: plans, fills and halts arrive and type themselves out ---------- */
  var hero = document.querySelector(".hero"), heroSeen = true;
  new IntersectionObserver(function(es){ es.forEach(function(e){ heroSeen = e.isIntersecting; }); }, { threshold: .08 }).observe(hero);
  function live(){ return heroSeen && !document.hidden; }
  var ICON = { wa: '<span class="ai wa"><img src="img/whatsapp.svg" alt="WhatsApp"></span>', tg: '<span class="ai tg"><img src="img/telegram.svg" alt="Telegram"></span>', im: '<span class="ai im"><svg viewBox="0 0 24 24" aria-label="iMessage"><path d="M12 4c-4.6 0-8 3-8 6.6 0 2 1 3.7 2.6 4.9L5.5 19l3.9-1.5c.8.2 1.7.3 2.6.3 4.6 0 8-3 8-6.6S16.6 4 12 4Z"/></svg></span>', mail: '<span class="ai mail"><svg viewBox="0 0 24 24" aria-label="Email"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/></svg></span>' };
  var SEQ = [
    ["wa", "WhatsApp · 10:12", "Plan 0418 is waiting on you", ["US large cap, 2.1% of the book. Reasoning attached. ", { cd: "44:12" }, " left."]],
    ["tg", "Telegram · 10:14", "Filled, inside your limit", ["Plan 0418 filled 0.03% over mid. The receipt is in the audit trail."]],
    ["im", "iMessage · 12:05", "Plan 0419 is waiting on you", ["XOM, 1.2% of the book. ", { cd: "45:00" }, " left. Reply APPROVE 0419."]],
    ["mail", "Email · 14:20", "Halted for the day", ["The book slipped past your bad-day limit. Nothing was sold. You release it tomorrow."]],
    ["mail", "Email · 17:05", "Daily summary", ["Down 3.1% on the day, halted since 14:20. Nothing waiting on you."]],
    ["mail", "Email · 06:55", "Overnight check", ["Data is fresh, your keys work, and the floor opens at 09:30."]]
  ];
  var thread = document.getElementById("thread"), k = 0;
  function bubble(m){ var el = document.createElement("div"); el.className = "bubble enter"; el.innerHTML = ICON[m[0]] + '<div><span class="app">' + m[1] + '</span><b></b><span class="t"></span></div>'; return el; }
  function typeInto(el, parts, done){
    var pi = 0, ci = 0, cur = null;
    el.innerHTML = '<span class="caret"></span>';
    var caret = el.firstChild;
    (function step(){
      if(!live()){ setTimeout(step, 300); return; }
      if(pi >= parts.length){ caret.remove(); done(); return; }
      var p = parts[pi];
      if(typeof p !== "string"){ var sp = document.createElement("span"); sp.className = "num cd"; sp.textContent = p.cd; el.insertBefore(sp, caret); pi++; setTimeout(step, 90); return; }
      if(!cur){ cur = document.createTextNode(""); el.insertBefore(cur, caret); }
      cur.textContent += p[ci++];
      if(ci >= p.length){ pi++; ci = 0; cur = null; }
      setTimeout(step, 14 + Math.random() * 24);
    })();
  }
  function next(){
    if(!thread || k >= SEQ.length) return;
    if(!live()){ setTimeout(next, 500); return; }
    var m = SEQ[k++], el = bubble(m);
    while(thread.querySelectorAll(".bubble:not(.gone)").length >= 3){
      var old = thread.querySelector(".bubble:not(.gone)"); old.style.height = old.offsetHeight + "px"; old.offsetHeight; old.classList.add("gone");
      (function(o){ setTimeout(function(){ o.remove(); }, 380); })(old);
    }
    thread.appendChild(el); raf2(function(){ el.classList.remove("enter"); });
    setTimeout(function(){
      typeInto(el.querySelector("b"), [m[2]], function(){
        setTimeout(function(){ typeInto(el.querySelector(".t"), m[3], function(){ setTimeout(next, 2600); }); }, 260);
      });
    }, 320);
  }
  if(thread){
    if(reduced){ thread.innerHTML = ""; SEQ.slice(0, 3).forEach(function(m){ var el = bubble(m); el.classList.remove("enter"); el.querySelector("b").textContent = m[2]; el.querySelector(".t").innerHTML = m[3].map(function(p){ return typeof p === "string" ? p : '<span class="num cd">' + p.cd + '</span>'; }).join(""); thread.appendChild(el); }); }
    else window.addEventListener("load", function(){ setTimeout(function(){ thread.innerHTML = ""; next(); }, 900); });
    setInterval(function(){ if(!live()) return; each(thread.querySelectorAll(".cd"), function(c){ var p = c.textContent.split(":"), t = (+p[0]) * 60 + (+p[1]); if(t > 0) t--; c.textContent = pad(Math.floor(t / 60)) + ":" + pad(t % 60); }); }, 1000);
  }

  /* ---------- the floor log streams ---------- */
  (function(){
    var feed = document.querySelector("#floorlog .feed"); if(!feed || reduced) return;
    var LOG = ["Twelve wires fresh", "Size 2.1% of a 5% cap", "Limit set 0.15% above mid", "Sample of 412, holds", "Energy at 6.1% of an 8% line", "Heartbeat ok", "Delivered on WhatsApp", "Plan 0418 approved", "Filled 0.03% over mid", "Drawdown 0.4%, within limit", "Kill switch, no veto", "Plan 0419 tabled"];
    var lt = 10 * 3600 + 12 * 60 + 1, li = 0, busy = false;
    function hms(t){ t = ((t % 86400) + 86400) % 86400; return pad(Math.floor(t / 3600)) + ":" + pad(Math.floor(t / 60) % 60) + ":" + pad(t % 60); }
    setInterval(function(){
      if(!live() || busy) return; busy = true;
      lt += 1 + Math.floor(Math.random() * 6);
      var ln = document.createElement("span"); ln.className = "ln fi enter"; ln.innerHTML = '<span class="num">' + hms(lt) + '</span>' + LOG[li++ % LOG.length];
      feed.appendChild(ln); var h = feed.children[1].offsetTop - feed.children[0].offsetTop;
      feed.style.transition = "none"; feed.style.transform = "translateY(0)";
      raf2(function(){ ln.classList.remove("enter"); feed.style.transition = "transform 420ms cubic-bezier(.2,.8,.2,1)"; feed.style.transform = "translateY(-" + h + "px)"; });
      setTimeout(function(){ feed.style.transition = "none"; feed.style.transform = "translateY(0)"; if(feed.children.length > 3) feed.removeChild(feed.firstElementChild); busy = false; }, 460);
    }, 1900);
  })();

}
document.addEventListener("DOMContentLoaded", function(){
  var wantsGsap = window.matchMedia("(min-width: 900px)").matches;
  if(wantsGsap && !window.gsap && !window.__gsapFailed){ document.addEventListener("gsap-ready", boot, { once: true }); setTimeout(boot, 4000); }
  else boot();
});
