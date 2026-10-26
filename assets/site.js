// Teloson · site behaviour shared by every page: the nav, smooth scroll, reveals, the vignette player that runs the
// product moments, tabs, carousels, the FAQ, the install command, and the request form.
(function(){
  var d = document, html = d.documentElement, W = window;
  var rmq = W.matchMedia("(prefers-reduced-motion: reduce)"), reduced = rmq.matches;
  if(reduced) html.classList.add("noanim");
  function $(s, r){ return (r || d).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function on(el, ev, fn, o){ if(el) el.addEventListener(ev, fn, o || false); }

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  function startLenis(){
    if(reduced || !W.Lenis || !W.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    lenis = new W.Lenis({ lerp: 0.11, wheelMultiplier: 0.95, smoothWheel: true, anchors: { offset: -96 } });
    W.lenis = lenis;
    function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
  if(W.Lenis) startLenis(); else on(W, "load", startLenis);

  /* ---------- nav: dropdowns, theme under the bar, the mobile sheet ---------- */
  var nav = $(".nav"), fine = W.matchMedia("(hover:hover) and (pointer:fine)").matches;
  $$(".nav .dd").forEach(function(dd){
    var btn = $(".lk", dd), t = 0;
    function open(){ clearTimeout(t); $$(".nav .dd.open").forEach(function(o){ if(o !== dd) o.classList.remove("open"); }); dd.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
    function close(){ dd.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    if(fine){ on(dd, "pointerenter", open); on(dd, "pointerleave", function(){ t = setTimeout(close, 140); }); }
    on(btn, "click", function(e){ e.preventDefault(); dd.classList.contains("open") ? close() : open(); });
  });
  on(d, "keydown", function(e){ if(e.key === "Escape"){ $$(".nav .dd.open").forEach(function(o){ o.classList.remove("open"); }); closeSheet(); } });
  on(d, "click", function(e){ if(!e.target.closest(".nav .dd")) $$(".nav .dd.open").forEach(function(o){ o.classList.remove("open"); }); });
  var sheet = $(".sheet");
  function closeSheet(){ if(sheet){ sheet.classList.remove("open"); html.style.overflow = ""; } }
  on($(".nav .burger"), "click", function(){ if(!sheet) return; sheet.classList.add("open"); html.style.overflow = "hidden"; });
  on(sheet && $(".x", sheet), "click", closeSheet);
  $$(".sheet a").forEach(function(a){ on(a, "click", closeSheet); });

  var zones = [];
  function measureZones(){ var sy = W.scrollY; zones = $$("[data-nav]").map(function(el){ var r = el.getBoundingClientRect(); return { top: r.top + sy, h: r.height, k: el.getAttribute("data-nav") }; }); }
  function navTheme(){
    if(!nav) return;
    var y = W.scrollY + (parseFloat(getComputedStyle(nav).top) || 52) + 23, light = false;
    for(var i = 0; i < zones.length; i++){ var z = zones[i]; if(y >= z.top && y < z.top + z.h){
      light = z.k === "light" ? true : z.k === "dark" ? false : z.k === "up" ? (y > z.top + z.h * .55) : (y < z.top + z.h * .45); } }
    nav.classList.toggle("light", light);
  }
  measureZones(); navTheme();
  on(W, "scroll", navTheme, { passive: true });
  on(W, "resize", function(){ measureZones(); navTheme(); });
  on(W, "load", function(){ measureZones(); navTheme(); });
  if("ResizeObserver" in W) new ResizeObserver(function(){ measureZones(); navTheme(); }).observe(d.body);

  /* ---------- reveals ---------- */
  var rio = "IntersectionObserver" in W ? new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); rio.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }) : null;
  $$(".rv, .phases").forEach(function(el){ if(reduced || !rio) el.classList.add("in"); else rio.observe(el); });
  // stagger children marked .rv-kids
  $$(".rv-kids").forEach(function(g){ $$(":scope > *", g).forEach(function(c, i){ c.classList.add("rv"); c.style.setProperty("--d", (i * 70) + "ms"); if(reduced || !rio) c.classList.add("in"); else rio.observe(c); }); });

  /* ---------- the vignette player ---------- */
  function fmtNum(v, el){ var dec = +(el.dataset.dec || 0), pre = el.dataset.pre || "", suf = el.dataset.suf || "";
    return pre + v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; }
  /* rolling digits: every digit is a column that spins into place, like a real trading app */
  function rollPrep(n, from, to){
    var a = fmtNum(from, n), b = fmtNum(to, n);
    if(a.replace(/\d/g, "0").length !== b.replace(/\d/g, "0").length) a = b.replace(/\d/g, "0");
    var h = "";
    for(var i = 0; i < b.length; i++){ var ch = b.charAt(i), c0 = a.charAt(i);
      if(/\d/.test(ch)){ var col = ""; for(var k = 0; k < 10; k++) col += "<i>" + k + "</i>"; h += '<span class="od" data-to="' + ch + '" data-from="' + (/\d/.test(c0) ? c0 : 0) + '"><span class="odc" style="transform:translateY(-' + (/\d/.test(c0) ? c0 : 0) + '0%)">' + col + "</span></span>"; }
      else h += '<span class="os">' + ch + "</span>"; }
    n.innerHTML = h; n.setAttribute("aria-label", b);
  }
  function rollGo(n, dur){
    void n.offsetHeight;
    $$(".od", n).forEach(function(o, i){ var c = o.firstChild; c.style.transition = "transform " + Math.max(600, dur * .75) + "ms cubic-bezier(.25,1.25,.4,1) " + (i * 45) + "ms"; c.style.transform = "translateY(-" + o.dataset.to + "0%)"; });
  }
  function Player(root){
    this.root = root; this.timers = []; this.running = false; this.visible = false; this.pending = false;
    this.loop = +(root.dataset.loop || 0);
    $$("[data-type]", root).forEach(function(n){ if(!n.dataset.full) n.dataset.full = n.dataset.type || n.textContent; });
    $$("[data-swap]", root).forEach(function(n){ if(!n.dataset.orig) n.dataset.orig = n.innerHTML; });
    $$("[data-clock]", root).forEach(function(n){ n.dataset.secs = n.dataset.clock; n.textContent = clock(+n.dataset.clock); });
  }
  function clock(s){ s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  Player.prototype.later = function(ms, fn){ this.timers.push(setTimeout(fn, ms)); };
  Player.prototype.reset = function(){
    this.timers.forEach(clearTimeout); this.timers = [];
    var r = this.root;
    $$("[data-at]", r).forEach(function(n){ n.classList.remove("in"); });
    $$("[data-out]", r).forEach(function(n){ n.classList.remove("gone"); });
    $$("[data-cls]", r).forEach(function(n){ n.dataset.cls.split(";").forEach(function(p){ var k = p.split(":")[1]; if(k) k.split(" ").forEach(function(c){ n.classList.remove(c.replace(/^-/, "")); }); }); });
    $$("[data-type]", r).forEach(function(n){ n.textContent = ""; n.classList.remove("caret"); });
    $$("[data-swap]", r).forEach(function(n){ n.innerHTML = n.dataset.orig; });
    $$("[data-tick]", r).forEach(function(n){ var a = n.dataset.tick.split(":"); n.textContent = fmtNum(+a[0], n); });
    $$("[data-clock]", r).forEach(function(n){ clearInterval(n._iv); n.dataset.secs = n.dataset.clock; n.textContent = clock(+n.dataset.clock); });
    $$("[data-w]", r).forEach(function(n){ n.style.width = n.dataset.w0 || "0%"; });
  };
  Player.prototype.final = function(){
    var r = this.root;
    $$("[data-at]", r).forEach(function(n){ n.classList.add("in"); });
    $$("[data-out]", r).forEach(function(n){ n.classList.add("gone"); });
    $$("[data-type]", r).forEach(function(n){ n.textContent = n.dataset.full; });
    $$("[data-cls]", r).forEach(function(n){ n.dataset.cls.split(";").forEach(function(p){ var k = p.split(":")[1]; if(k && p.split(":")[2] !== "tmp") k.split(" ").forEach(function(c){ if(c.charAt(0) === "-") n.classList.remove(c.slice(1)); else n.classList.add(c); }); }); });
    $$("[data-swap]", r).forEach(function(n){ var a = n.dataset.swap.split("|"); n.innerHTML = a[a.length - 1].replace(/^\d+:/, ""); });
    $$("[data-tick]", r).forEach(function(n){ var a = n.dataset.tick.split(":"); n.textContent = fmtNum(+a[1], n); });
    $$("[data-w]", r).forEach(function(n){ n.style.width = n.dataset.w; });
  };
  Player.prototype.run = function(){
    var self = this, r = this.root; this.reset(); this.running = true;
    $$("[data-at]", r).forEach(function(n){
      var at = +n.dataset.at;
      self.later(at, function(){ n.classList.add("in");
        if(n.hasAttribute("data-type")) self.type(n);
        $$("[data-type]", n).forEach(function(c){ if(!c.hasAttribute("data-at")) self.type(c); });
        if(n.hasAttribute("data-clock")) self.clockGo(n);
        $$("[data-clock]", n).forEach(function(c){ self.clockGo(c); });
      });
    });
    $$("[data-type]:not([data-at])", r).forEach(function(n){ if(!n.closest("[data-at]")) self.later(+(n.dataset.typeAt || 0), function(){ self.type(n); }); });
    $$("[data-clock]:not([data-at])", r).forEach(function(n){ if(!n.closest("[data-at]")) self.clockGo(n); });
    $$("[data-out]", r).forEach(function(n){ self.later(+n.dataset.out, function(){ n.classList.add("gone"); }); });
    $$("[data-cls]", r).forEach(function(n){ n.dataset.cls.split(";").forEach(function(p){ var a = p.split(":"), at = +a[0], k = a[1], tmp = a[2] === "tmp"; if(!k) return;
      self.later(at, function(){ k.split(" ").forEach(function(c){ if(c.charAt(0) === "-") n.classList.remove(c.slice(1)); else n.classList.add(c); }); if(tmp) self.later(220, function(){ k.split(" ").forEach(function(c){ n.classList.remove(c); }); }); }); }); });
    $$("[data-swap]", r).forEach(function(n){ n.dataset.swap.split("|").forEach(function(p){ var m = p.match(/^(\d+):([\s\S]*)$/); if(m) self.later(+m[1], function(){ n.innerHTML = m[2]; }); }); });
    $$("[data-tick]", r).forEach(function(n){ var a = n.dataset.tick.split(":"), from = +a[0], to = +a[1], dur = +(a[2] || 1200), at = +(a[3] || 0);
      rollPrep(n, from, to); self.later(at, function(){ rollGo(n, dur); }); });
    $$("[data-w]", r).forEach(function(n){ self.later(+(n.dataset.wAt || 300), function(){ n.style.width = n.dataset.w; }); });
    if(this.loop) this.later(this.loop, function(){ self.running = false; if(self.visible && !d.hidden) self.run(); else self.pending = true; });
  };
  Player.prototype.type = function(n){
    var full = n.dataset.full || "", i = 0, sp = +(n.dataset.speed || 26), self = this;
    n.textContent = ""; n.classList.add("caret");
    (function step(){ if(i > full.length){ n.classList.remove("caret"); return; } n.textContent = full.slice(0, i++); self.timers.push(setTimeout(step, sp + (full.charAt(i - 1) === " " ? sp * .6 : 0))); })();
  };
  Player.prototype.clockGo = function(n){ clearInterval(n._iv); n._iv = setInterval(function(){ var s = +n.dataset.secs - 1; n.dataset.secs = s; n.textContent = clock(s); if(s <= 0) clearInterval(n._iv); }, 1000); };
  var players = [];
  var vio = "IntersectionObserver" in W ? new IntersectionObserver(function(es){ es.forEach(function(e){ var p = e.target._player; p.visible = e.isIntersecting;
    if(e.isIntersecting && (!p.started || p.pending)){ p.started = true; p.pending = false; p.run(); } }); }, { threshold: 0.28 }) : null;
  $$(".vg").forEach(function(root){ var p = new Player(root); root._player = p; players.push(p);
    if(reduced || !vio) p.final(); else if(root.hasAttribute("data-manual")) {} else vio.observe(root); });
  W.__vg = { replay: function(root){ var p = root && root._player; if(p){ if(reduced) p.final(); else { p.started = true; p.run(); } } } };

  /* ---------- list tabs: the list drives the window, and advances on its own ---------- */
  $$(".ltabs").forEach(function(box){
    var tabs = $$(".lt", box), panes = $$(".lt-pane", box), cap = $(".lt-caption", box), i = 0, t = 0, dur = +(box.dataset.dur || 7000), seen = false;
    box.style.setProperty("--lt-dur", dur + "ms");
    function show(k, user){ i = k; tabs.forEach(function(b, j){ b.classList.toggle("on", j === k); b.setAttribute("aria-selected", j === k ? "true" : "false"); });
      panes.forEach(function(p, j){ p.classList.toggle("on", j === k); if(j === k){ var v = p.querySelector(".vg") || (p.classList.contains("vg") ? p : null); if(v) W.__vg.replay(v); } });
      if(cap) cap.textContent = tabs[k].dataset.cap || "";
      clearTimeout(t); if(!reduced && !user) t = setTimeout(function(){ show((i + 1) % tabs.length); }, dur);
      if(user){ tabs[k].classList.remove("on"); void tabs[k].offsetWidth; tabs[k].classList.add("on"); t = setTimeout(function(){ show((i + 1) % tabs.length); }, dur * 1.6); } }
    tabs.forEach(function(b, j){ on(b, "click", function(){ show(j, true); }); });
    if(vio) new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting && !seen){ seen = true; show(0); } }); }, { threshold: .3 }).observe(box); else show(0);
  });

  /* ---------- segmented tabs ---------- */
  $$("[data-segtabs]").forEach(function(box){
    var btns = $$(".segtabs button", box), panes = $$(".segpane", box);
    btns.forEach(function(b, j){ on(b, "click", function(){ btns.forEach(function(x, k){ x.classList.toggle("on", k === j); x.setAttribute("aria-selected", k === j ? "true" : "false"); });
      panes.forEach(function(p, k){ p.classList.toggle("on", k === j); if(k === j){ $$(".vg", p).forEach(function(v){ W.__vg.replay(v); }); } }); }); });
  });

  /* ---------- carousels ---------- */
  $$("[data-hs]").forEach(function(b){ on(b, "click", function(){ var box = d.getElementById(b.getAttribute("aria-controls")); if(!box) return; var c = box.firstElementChild, step = c ? c.getBoundingClientRect().width + 16 : 340;
    box.scrollBy({ left: b.dataset.hs === "next" ? step : -step, behavior: reduced ? "auto" : "smooth" }); }); });

  /* ---------- faq opens smoothly ---------- */
  $$(".qa details").forEach(function(det){
    var sum = $("summary", det), a = $(".a", det), anim = null;
    on(sum, "click", function(e){ if(reduced || !a.animate) return; e.preventDefault(); if(anim) anim.cancel();
      if(det.open){ var h = a.offsetHeight; anim = a.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 260, easing: "cubic-bezier(.65,0,.35,1)" }); anim.onfinish = function(){ det.open = false; anim = null; }; }
      else { det.open = true; var h2 = a.offsetHeight; anim = a.animate([{ height: "0px", opacity: 0 }, { height: h2 + "px", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.16,1,.3,1)" }); anim.onfinish = function(){ anim = null; }; } });
  });

  /* ---------- copy buttons ---------- */
  $$("[data-copy]").forEach(function(b){ var lab = $(".lab", b) || b, orig = lab.textContent;
    on(b, "click", function(){ var txt = b.dataset.copy; if(navigator.clipboard) navigator.clipboard.writeText(txt).then(function(){ lab.textContent = "Copied"; setTimeout(function(){ lab.textContent = orig; }, 1600); }); }); });

  /* ---------- the install line types itself once ---------- */
  $$("[data-typeline]").forEach(function(pre){ if(reduced || !rio) return; var full = pre.innerHTML; pre.innerHTML = '<span class="p">$</span>';
    var text = pre.dataset.typeline, i = 0, started = false;
    new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting && !started){ started = true;
      (function step(){ if(i > text.length){ pre.innerHTML = full; return; } pre.innerHTML = '<span class="p">$</span>' + text.slice(0, i).replace(/&/g, "&amp;").replace(/</g, "&lt;") + '<span class="caret"></span>'; i += 2; setTimeout(step, 22); })(); } }); }, { threshold: .6 }).observe(pre); });

  /* ---------- email capsules hand off to the request page ---------- */
  var onRequest = !!$("#interest");
  $$("form[data-capture]").forEach(function(f){ on(f, "submit", function(e){ e.preventDefault(); var v = ($("input[type=email]", f) || {}).value || "";
    if(onRequest){ var em = $("#f-email"); if(em) em.value = v.trim(); var target = $("#request-form"); if(lenis) lenis.scrollTo(target, { offset: -110 }); else target.scrollIntoView({ behavior: "smooth" }); setTimeout(function(){ var n = $(v ? "#f-name" : "#f-email"); if(n) n.focus({ preventScroll: true }); }, 700); return; }
    location.href = "/request/" + (v.trim() ? "?email=" + encodeURIComponent(v.trim()) : ""); }); });

  /* ---------- request an account ---------- */
  var ENDPOINT = "https://jiyujojygjufkfdkcycd.supabase.co/rest/v1/teloson_interest", KEY = "sb_publishable_YxqbAEU_h_R0GI-OqCpKhA_H-Z2mL2V";
  var form = $("#interest");
  if(form){
    var q = new URLSearchParams(location.search), pre = q.get("email"); if(pre && form.email) form.email.value = pre;
    var status = $("#f-status"), submit = $("#f-submit"), done = $("#done");
    on(form, "submit", function(e){
      e.preventDefault();
      var name = form.name.value.trim(), email = form.email.value.trim(), loc = (form.location || {}).value || "", note = (form.note || {}).value || "", size = (form.size || {}).value || "";
      status.className = "status";
      if(form.company && form.company.value){ status.textContent = "That did not send: a hidden field was filled in, usually by an autofill tool. Clear the form and try again."; status.className = "status err"; return; }
      if(!name){ status.textContent = "Please add your name."; status.className = "status err"; form.name.focus(); return; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ status.textContent = "That email does not look right."; status.className = "status err"; form.email.focus(); return; }
      submit.disabled = true; status.textContent = "Sending…";
      var noteAll = [note.trim(), size ? "Account size: " + size : ""].filter(Boolean).join("\n");
      fetch(ENDPOINT, { method: "POST", headers: { "apikey": KEY, "Content-Type": "application/json", "Prefer": "return=minimal" },
        body: JSON.stringify({ name: name, email: email, location: loc.trim() || null, note: noteAll || null, source: (location.hostname || "teloson.com") + location.pathname }) })
      .then(function(r){ if(!r.ok) throw new Error("HTTP " + r.status); form.style.display = "none"; done.classList.add("on"); })
      .catch(function(){ submit.disabled = false; status.textContent = "That did not go through. Please try again in a moment."; status.className = "status err"; });
    });
  }


  /* ---------- seats and twinkling desks ---------- */
  function rndf(seed){ return function(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  $$("[data-seats]").forEach(function(box){ var DEPTS = [["d-data",16],["d-res",10],["d-risk",10],["d-exec",6],["d-pm",18],["d-dig",8],["d-mac",6]], all = [], r = rndf(9);
    DEPTS.forEach(function(dp){ var c = d.createElement("div"); c.className = "cl"; for(var i = 0; i < dp[1]; i++){ var s = d.createElement("i"); s.className = "s " + dp[0]; if(r() < .36) s.classList.add("on"); c.appendChild(s); all.push(s); } box.appendChild(c); });
    box._items = all; box.setAttribute("data-twinkle-items", "1"); });
  $$("[data-twinkle], [data-seats]").forEach(function(box){
    var items = box._items || $$(".av", box), vis = false; if(!items.length) return;
    var cls = box._items ? "on" : "tw", r = rndf(13); items.forEach(function(x){ if(r() < .38) x.classList.add(cls); });
    if(reduced || !("IntersectionObserver" in W)) return;
    new IntersectionObserver(function(es){ vis = es[0].isIntersecting; }).observe(box);
    setInterval(function(){ if(!vis || d.hidden) return; for(var k = 0; k < 3; k++) items[Math.floor(Math.random() * items.length)].classList.toggle(cls); }, 650);
  });


  /* ---------- small charts drawn from a seed ---------- */
  $$("svg[data-spark]").forEach(function(sv){ var r = rndf(+sv.dataset.spark || 5), v = 0, pts = [], n = 60; for(var j = 0; j <= n; j++){ v += (r() - .45) * 1.2; pts.push(v); }
    var mn = Math.min.apply(null, pts), mx = Math.max.apply(null, pts), vb = sv.viewBox.baseVal, W2 = vb.width, H2 = vb.height;
    var dd = pts.map(function(y, i){ return (i ? "L" : "M") + (i / n * W2).toFixed(1) + " " + (H2 - 6 - (y - mn) / (mx - mn) * (H2 - 16)).toFixed(1); }).join(" ");
    var bp = []; var r2 = rndf((+sv.dataset.spark || 5) + 3); for(var k = 0; k <= n; k++){ bp.push(pts[k] + (r2() - .5) * 1.1 - k * .004); }
    var mn2 = Math.min.apply(null, bp.concat(pts)), mx2 = Math.max.apply(null, bp.concat(pts));
    dd = pts.map(function(y, i){ return (i ? "L" : "M") + (i / n * W2).toFixed(1) + " " + (H2 - 6 - (y - mn2) / (mx2 - mn2) * (H2 - 16)).toFixed(1); }).join(" ");
    var db = bp.map(function(y, i){ return (i ? "L" : "M") + (i / n * W2).toFixed(1) + " " + (H2 - 6 - (y - mn2) / (mx2 - mn2) * (H2 - 16)).toFixed(1); }).join(" ");
    sv.innerHTML = '<defs><linearGradient id="sg' + sv.dataset.spark + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8AA8D8" stop-opacity=".25"/><stop offset="1" stop-color="#8AA8D8" stop-opacity="0"/></linearGradient></defs><path d="' + db + '" fill="none" stroke="rgba(139,148,167,.8)" stroke-width="1.5" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/><path d="' + dd + ' L' + W2 + ' ' + H2 + ' L0 ' + H2 + ' Z" fill="url(#sg' + sv.dataset.spark + ')"/><path d="' + dd + '" fill="none" stroke="#8AA8D8" stroke-width="2" vector-effect="non-scaling-stroke"/>'; });
  $$("svg[data-oos]").forEach(function(sv){ var r = rndf(21), n = 80, split = 48, a = 0, b = 0, s1 = [], s2 = [], t1 = [], t2 = [];
    /* in sample the signal looks brilliant; at the split both lines are rebased to the same point, and out of sample buy-and-hold pulls ahead */
    for(var i = 0; i <= split; i++){ var m = (r() - .48) * 1.6; b += m + .32; a += m + .95 + (r() - .5) * .5; s1.push(a); s2.push(b); }
    var ta = a, tb = a; t1.push(ta); t2.push(tb);
    for(var k = split + 1; k <= n; k++){ var m2 = (r() - .5) * 1.7; tb += m2 + .42; ta += m2 * 1.15 + .02 + (r() - .5) * .9; t1.push(ta); t2.push(tb); }
    var all = s1.concat(s2, t1, t2), mn = Math.min.apply(null, all), mx = Math.max.apply(null, all), W2 = 520, H2 = 200;
    function P(arr, off){ return arr.map(function(y, i){ return (i ? "L" : "M") + ((i + off) / n * W2).toFixed(1) + " " + (H2 - 10 - (y - mn) / (mx - mn) * (H2 - 24)).toFixed(1); }).join(" "); }
    var sx = (split / n * W2).toFixed(1), dash = 'fill="none" stroke="#8B94A7" stroke-width="1.6" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"', sig = 'fill="none" stroke="#4F76B0" stroke-width="2.2" vector-effect="non-scaling-stroke"';
    sv.innerHTML = '<rect x="' + sx + '" y="0" width="' + (W2 - sx) + '" height="' + H2 + '" fill="rgba(79,118,176,.06)"/><line x1="' + sx + '" x2="' + sx + '" y1="0" y2="' + H2 + '" stroke="rgba(20,30,51,.25)" stroke-dasharray="3 3"/>' +
      '<path d="' + P(s2, 0) + '" ' + dash + '/><path d="' + P(t2, split) + '" ' + dash + '/><path d="' + P(s1, 0) + '" ' + sig + '/><path d="' + P(t1, split) + '" ' + sig + '/>'; });


  /* ---------- blog filter ---------- */
  var bbtns = $$("[data-bf]"), bitems = $$(".featured[data-cat], .post-card[data-cat]");
  if(bbtns.length){ bbtns.forEach(function(b){ on(b, "click", function(){ var c = b.dataset.bf; bbtns.forEach(function(x){ x.classList.toggle("on", x === b); }); bitems.forEach(function(it){ it.classList.toggle("hide", c !== "all" && it.dataset.cat !== c); it.classList.add("in"); }); }); }); }

  /* ---------- integrations filter ---------- */
  var ibtns = $$("[data-f]"), isearch = $("[data-isearch]"), ititle = $("[data-ititle]"), icards = $$(".icard[data-cat]");
  if(ibtns.length){ var cur = "all";
    function ifilter(){ var q = (isearch && isearch.value || "").trim().toLowerCase(); icards.forEach(function(c){ var ok = (cur === "all" || c.dataset.cat === cur) && (!q || c.dataset.name.indexOf(q) > -1 || c.textContent.toLowerCase().indexOf(q) > -1); c.classList.toggle("hide", !ok); }); }
    ibtns.forEach(function(b){ on(b, "click", function(){ cur = b.dataset.f; ibtns.forEach(function(x){ x.classList.toggle("on", x === b); }); if(ititle) ititle.textContent = b.textContent.trim(); ifilter(); }); });
    on(isearch, "input", ifilter);
    var h = location.hash.replace("#", ""), map = { reasoning: "reasoning", broker: "broker", wires: "wires", alerts: "alerts", mac: "mac" }; if(map[h]){ var bb = $('[data-f="' + map[h] + '"]'); if(bb) bb.click(); }
  }


  /* ---------- docs: the table of contents follows the reader, and search jumps to a section ---------- */
  var toc = $$(".docs .toc a");
  if(toc.length){ var secs = toc.map(function(a){ return d.getElementById(a.getAttribute("href").slice(1)); });
    on(W, "scroll", function(){ var y = W.scrollY + 160, k = 0; secs.forEach(function(s, i){ if(s && s.getBoundingClientRect().top + W.scrollY <= y) k = i; }); toc.forEach(function(a, i){ a.classList.toggle("on", i === k); }); }, { passive: true });
    var ds = $("[data-dsearch]"); if(ds){ on(d, "keydown", function(e){ if(e.key === "/" && d.activeElement !== ds){ e.preventDefault(); ds.focus(); } });
      on(ds, "keydown", function(e){ if(e.key !== "Enter") return; var q = ds.value.trim().toLowerCase(); if(!q) return; var hit = $$(".docbody h2, .docbody p, .docbody td").find(function(n){ return n.textContent.toLowerCase().indexOf(q) > -1; });
        if(hit){ if(lenis) lenis.scrollTo(hit, { offset: -130 }); else hit.scrollIntoView({ behavior: "smooth", block: "center" }); hit.style.transition = "background-color 600ms"; hit.style.backgroundColor = "rgba(79,118,176,.12)"; setTimeout(function(){ hit.style.backgroundColor = ""; }, 1600); } }); }
  }

  /* ---------- small things ---------- */
  $$("[data-year]").forEach(function(n){ n.textContent = new Date().getFullYear(); });
  $$("[data-today]").forEach(function(n){ n.textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); });
})();
