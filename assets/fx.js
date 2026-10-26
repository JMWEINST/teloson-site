/* Teloson · small details. The footer mark that fills with dithered dots under the cursor, dotted halos that
   light up where you point, hairline frames around product visuals, and the list-tab rail with its pixel trail. */
(function(){
  var W = window, D = document, reduced = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = W.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  function $$(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function ready(fn){ if(D.readyState !== "loading") fn(); else D.addEventListener("DOMContentLoaded", fn); }

  /* ---------- the footer mark: outline at rest, dithered dots where the cursor is ---------- */
  function bigmark(box){
    var sym = D.getElementById("tl-lockup"), cv = box.querySelector("canvas"); if(!sym || !cv || reduced) return;
    var ctx = cv.getContext("2d"), Wd = 0, Hd = 0, dpr = 1, pitch = 6, cols = 0, rows = 0, cells = null, val = null, thr = null;
    var mx = -1e4, my = -1e4, over = false, raf = 0, last = 0, sweep = -1, swept = false;
    var rgb = (getComputedStyle(box).getPropertyValue("--bm-rgb") || "79,118,176").trim();
    function build(){
      var r = box.getBoundingClientRect(); if(!r.width) return;
      Wd = r.width; Hd = r.height; dpr = Math.min(2, W.devicePixelRatio || 1); cv.width = Math.round(Wd * dpr); cv.height = Math.round(Hd * dpr);
      pitch = Wd < 700 ? 4.5 : 6; cols = Math.ceil(Wd / pitch); rows = Math.ceil(Hd / pitch);
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 328.42 80.98" width="' + cols + '" height="' + rows + '" preserveAspectRatio="none">' +
        sym.innerHTML.replace(/fill:var\(--bar(-accent)?\)/g, "fill:#000") + "</svg>";
      var img = new Image();
      img.onload = function(){
        var oc = D.createElement("canvas"); oc.width = cols; oc.height = rows; var ox = oc.getContext("2d"); ox.drawImage(img, 0, 0, cols, rows);
        var d = ox.getImageData(0, 0, cols, rows).data, list = [];
        for(var y = 0; y < rows; y++) for(var x = 0; x < cols; x++) if(d[(y * cols + x) * 4 + 3] > 110) list.push(x, y);
        cells = new Float32Array(list); val = new Float32Array(list.length / 2); thr = new Float32Array(list.length / 2);
        for(var i = 0; i < val.length; i++){ var cx = cells[i * 2], cy = cells[i * 2 + 1]; thr[i] = (BAYER[(cy % 4) * 4 + (cx % 4)] + .5) / 16 * .8 + Math.random() * .2; }
        kick();
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }
    function kick(){ if(!raf) raf = requestAnimationFrame(frame); }
    function frame(now){
      raf = 0; if(!cells) return;
      var dt = last ? Math.min(48, now - last) : 16; last = now;
      var R = Math.max(130, Wd * .15), R2 = R * R, active = false, levels = [[],[],[],[],[],[]];
      if(sweep >= 0){ sweep += dt * 1.25; if(sweep > Wd + 200){ sweep = -1; } else active = true; }
      for(var i = 0; i < val.length; i++){
        var px = cells[i * 2] * pitch + pitch / 2, py = cells[i * 2 + 1] * pitch + pitch / 2, tgt = 0;
        if(over){ var dx = px - mx, dy = py - my, dd = dx * dx + dy * dy; if(dd < R2) tgt = 1 - Math.sqrt(dd) / R; }
        if(sweep >= 0){ var ds = Math.abs(px - sweep); if(ds < 140) tgt = Math.max(tgt, (1 - ds / 140) * .85); }
        var v = val[i], nv = tgt > v ? v + (tgt - v) * .24 : v + (tgt - v) * .045;
        if(nv < .003) nv = 0; val[i] = nv; if(nv > 0 || tgt > 0) active = true;
        if(nv > thr[i] * .92){ levels[Math.min(5, Math.floor(nv * 6))].push(px, py); }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, Wd, Hd);
      var s = pitch < 5 ? 1.8 : 2.3, h = s / 2;
      for(var l = 0; l < 6; l++){ var L = levels[l]; if(!L.length) continue;
        ctx.fillStyle = "rgba(" + rgb + "," + (.28 + l * .13).toFixed(2) + ")"; ctx.beginPath();
        for(var j = 0; j < L.length; j += 2) ctx.rect(L[j] - h, L[j + 1] - h, s, s); ctx.fill(); }
      if(active || over) kick(); else last = 0;
    }
    function pos(e){ var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }
    box.addEventListener("pointermove", function(e){ pos(e); over = true; kick(); });
    box.addEventListener("pointerdown", function(e){ pos(e); over = true; kick(); });
    box.addEventListener("pointerleave", function(){ over = false; kick(); });
    box.addEventListener("pointerup", function(e){ if(e.pointerType !== "mouse"){ over = false; kick(); } });
    if("IntersectionObserver" in W) new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting && !swept && cells){ swept = true; sweep = 0; kick(); } }); }, { threshold: .6 }).observe(box);
    var rt; W.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(build, 200); });
    build();
  }

  /* ---------- hairline frames and dotted halos that light up where you point ---------- */
  function halos(){
    $$(".fvis.halo").forEach(function(h){
      if(h.querySelector(":scope > .hspot")) return;
      var sp = D.createElement("span"); sp.className = "hspot"; sp.setAttribute("aria-hidden", "true");
      var fr = D.createElement("span"); fr.className = "hframe"; fr.setAttribute("aria-hidden", "true");
      h.insertBefore(sp, h.firstChild); h.insertBefore(fr, h.firstChild);
      if(!fine) return;
      var row = h.closest(".frow") || h, raf = 0, ex = 0, ey = 0;
      row.addEventListener("pointerenter", function(){ h.classList.add("hot"); });
      row.addEventListener("pointerleave", function(){ h.classList.remove("hot"); });
      row.addEventListener("pointermove", function(e){ ex = e.clientX; ey = e.clientY; if(raf) return;
        raf = requestAnimationFrame(function(){ raf = 0; var r = h.getBoundingClientRect(); h.style.setProperty("--mx", (ex - r.left + 64).toFixed(0) + "px"); h.style.setProperty("--my", (ey - r.top + 56).toFixed(0) + "px"); }); });
    });
  }

  /* ---------- list tabs: a rail with the active stretch, a pixel trail when it moves, and a colour sweep ---------- */
  function ltabs(box){
    var list = box.querySelector(".lt-list"); if(!list || list.querySelector(".lt-rail")) return;
    var tabs = $$(".lt", list), dark = !!box.closest(".dark");
    tabs.forEach(function(b){ var n = b.firstChild; if(n && n.nodeType === 3){ var s = D.createElement("span"); s.className = "lt-t"; s.textContent = n.textContent; b.replaceChild(s, n); } });
    var rail = D.createElement("span"); rail.className = "lt-rail"; rail.setAttribute("aria-hidden", "true"); rail.innerHTML = '<i class="seg"><b></b></i><canvas></canvas>';
    list.appendChild(rail); list.classList.add("has-rail");
    var seg = rail.querySelector(".seg"), cv = rail.querySelector("canvas"), ctx = cv.getContext("2d"), parts = [], raf = 0, prev = -1, dpr = Math.min(2, W.devicePixelRatio || 1), cap = box.querySelector(".lt-caption");
    var cols = dark ? ["138,168,216", "243,242,238", "79,118,176"] : ["79,118,176", "138,168,216", "28,43,69"];
    function size(){ cv.width = 44 * dpr; cv.height = Math.max(1, list.offsetHeight) * dpr; cv.style.height = list.offsetHeight + "px"; }
    function centre(k){ var b = tabs[k]; return b.offsetTop + b.offsetHeight / 2; }
    function burst(y0, y1){
      if(reduced) return; var n = 46 + Math.round(Math.abs(y1 - y0) / 3);
      for(var i = 0; i < n; i++){ var u = Math.random(); parts.push({ x: 22 + (Math.random() - .5) * 10, y: y0 + (y1 - y0) * u, vx: (Math.random() - .5) * .05, vy: (y1 - y0) * .0006 * Math.random(),
        t: -u * 260, life: 420 + Math.random() * 520, c: cols[Math.floor(Math.random() * 3)], s: Math.random() < .3 ? 3 : 2 }); }
      if(!raf) raf = requestAnimationFrame(draw);
    }
    var lastT = 0;
    function draw(now){
      raf = 0; var dt = lastT ? Math.min(40, now - lastT) : 16; lastT = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, 44, list.offsetHeight);
      parts = parts.filter(function(p){ p.t += dt; return p.t < p.life; });
      parts.forEach(function(p){ if(p.t < 0) return; p.x += p.vx * dt; p.y += p.vy * dt; var a = 1 - p.t / p.life;
        if(Math.random() < .18) return; // the flicker that makes it read as dither, not confetti
        ctx.fillStyle = "rgba(" + p.c + "," + (a * .95).toFixed(2) + ")"; ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, p.s, p.s); });
      if(parts.length) raf = requestAnimationFrame(draw); else { lastT = 0; ctx.clearRect(0, 0, 44, list.offsetHeight); }
    }
    function place(k){
      var b = tabs[k]; seg.style.top = b.offsetTop + 4 + "px"; seg.style.height = Math.max(12, b.offsetHeight - 8) + "px";
      var bi = seg.querySelector("b"); bi.style.animation = "none"; void bi.offsetWidth; bi.style.animation = "";
      var t = b.querySelector(".lt-t"); if(t && !reduced){ t.classList.remove("sw"); void t.offsetWidth; t.classList.add("sw"); }
      if(cap && !reduced){ cap.classList.remove("swap"); void cap.offsetWidth; cap.classList.add("swap"); }
      if(prev >= 0 && prev !== k) burst(centre(prev), centre(k));
      prev = k;
    }
    size(); W.addEventListener("resize", function(){ size(); if(prev >= 0) place(prev); });
    new MutationObserver(function(){ var k = tabs.findIndex(function(b){ return b.classList.contains("on"); }); if(k >= 0 && k !== prev) place(k); })
      .observe(list, { subtree: true, attributes: true, attributeFilter: ["class"] });
    var k0 = tabs.findIndex(function(b){ return b.classList.contains("on"); }); if(k0 >= 0) place(k0);
  }


  /* ---------- the films play only while you can see them ---------- */
  function films(){
    $$("video[data-film]").forEach(function(v){
      var btn = v.parentNode.querySelector(".film-play"), loaded = false, inView = false;
      function play(){ var pr = v.play(); if(pr && pr.catch) pr.catch(function(){ if(btn) btn.hidden = false; }); }
      if(btn) btn.addEventListener("click", function(){ btn.hidden = true; v.muted = true; play(); });
      if(reduced){ if(btn) btn.hidden = false; return; }
      if(!("IntersectionObserver" in W)){ play(); return; }
      new IntersectionObserver(function(es){ es.forEach(function(e){
        inView = e.isIntersecting;
        if(e.isIntersecting){ if(!loaded){ loaded = true; v.preload = "auto"; } if(v.paused && (!btn || btn.hidden)) play(); }
        else if(!v.paused) v.pause();
      }); }, { threshold: .2 }).observe(v);
      D.addEventListener("visibilitychange", function(){ if(D.hidden){ if(!v.paused) v.pause(); } else if(inView && (!btn || btn.hidden)) play(); });
    });
  }

  ready(function(){
    films();
    $$("[data-bigmark]").forEach(bigmark);
    halos();
    $$(".ltabs").forEach(ltabs);
  });
})();
