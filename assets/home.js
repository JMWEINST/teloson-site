// Teloson · home page: the office seats, the honest performance chart, the practice sparkline, and the bad-day simulator.
(function(){
  var d = document, reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function each(l, f){ Array.prototype.forEach.call(l, f); }
  function rnd(seed){ return function(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  /* ---------- the office: 74 seats in seven departments, lit when working ---------- */
  var seats = d.getElementById("seats");
  if(seats){
    var DEPTS = [["d-data",16],["d-res",10],["d-risk",10],["d-exec",6],["d-pm",18],["d-dig",8],["d-mac",6]], all = [];
    DEPTS.forEach(function(dp){ var c = d.createElement("div"); c.className = "cl"; for(var i = 0; i < dp[1]; i++){ var s = d.createElement("i"); s.className = "s " + dp[0]; c.appendChild(s); all.push(s); } seats.appendChild(c); });
    var r = rnd(7); all.forEach(function(s){ if(r() < .36) s.classList.add("on"); });
    if(!reduced){ var vis = false; new IntersectionObserver(function(es){ vis = es[0].isIntersecting; }).observe(seats);
      setInterval(function(){ if(!vis || d.hidden) return; for(var k = 0; k < 4; k++){ all[Math.floor(Math.random() * all.length)].classList.toggle("on"); } }, 700); }
  }

  /* ---------- performance: the best signal hugging buy-and-hold, honestly ---------- */
  var pc = d.getElementById("perfchart");
  if(pc){
    var r2 = rnd(31), a = [], b = [], va = 0, vb = 0;
    for(var i = 0; i <= 60; i++){ var m = (r2() - .47) * 3.2; vb += m; va += m + (r2() - .5) * 1.6; a.push(va); b.push(vb); }
    var all2 = a.concat(b), mn = Math.min.apply(null, all2), mx = Math.max.apply(null, all2);
    function path(arr){ return arr.map(function(v, i){ return (i ? "L" : "M") + (i / 60 * 300).toFixed(1) + " " + (110 - (v - mn) / (mx - mn) * 96).toFixed(1); }).join(" "); }
    pc.innerHTML = '<path d="' + path(b) + '" fill="none" stroke="#8B94A7" stroke-width="1.6" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/><path class="pa" d="' + path(a) + '" fill="none" stroke="#4F76B0" stroke-width="2" vector-effect="non-scaling-stroke"/>';
    var pa = pc.querySelector(".pa"), L = pa.getTotalLength ? pa.getTotalLength() : 0;
    if(L && !reduced){ pa.style.strokeDasharray = L; pa.style.strokeDashoffset = L; new IntersectionObserver(function(es, o){ if(es[0].isIntersecting){ o.disconnect(); pa.style.transition = "stroke-dashoffset 2.4s cubic-bezier(.65,0,.35,1)"; pa.style.strokeDashoffset = 0; } }, { threshold: .4 }).observe(pc); }
  }

  /* ---------- practice sparkline ---------- */
  var sp = d.getElementById("spark");
  if(sp){
    var r3 = rnd(5), v = 0, pts = [];
    for(var j = 0; j <= 40; j++){ v += (r3() - .44) * 1.3; pts.push(v); }
    var mn3 = Math.min.apply(null, pts), mx3 = Math.max.apply(null, pts);
    var dd = pts.map(function(y, i){ return (i ? "L" : "M") + (i / 40 * 220).toFixed(1) + " " + (56 - (y - mn3) / (mx3 - mn3) * 50).toFixed(1); }).join(" ");
    sp.innerHTML = '<defs><linearGradient id="spg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4F76B0" stop-opacity=".22"/><stop offset="1" stop-color="#4F76B0" stop-opacity="0"/></linearGradient></defs><path d="' + dd + ' L220 60 L0 60 Z" fill="url(#spg)"/><path d="' + dd + '" fill="none" stroke="#4F76B0" stroke-width="1.8" vector-effect="non-scaling-stroke"/>';
  }

  /* ---------- a bad day ---------- */
  var svg = d.getElementById("daychart"); if(!svg) return;
  var path = []; (function(){ var vv = 0, rr = rnd(11); for(var i = 0; i <= 78; i++){ var t = i / 78; var drift = t < .72 ? -7.8 * t * t : -5.6 + (t - .72) * 8; vv = drift + (rr() - .5) * .35; path.push(vv); } path[0] = 0; })();
  var lim = { bad: 3, brake: 10 }, apps = ["WhatsApp", "email"], clockEl = d.getElementById("dayclock");
  var INK = "#F3F2EE", MUTE = "rgba(243,242,238,.38)", GRID = "rgba(243,242,238,.07)", RED = "#EF7B6D";
  function tstr(i){ var m = 9 * 60 + 30 + i * 5; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
  var DAY = null;
  function drawDay(){
    var W = 640, H = 280, L = 44, R = 14, T = 18, B = 30, yMin = -8, yMax = 1;
    var X = function(i){ return L + i / 78 * (W - L - R); }, Y = function(v){ return T + (yMax - v) / (yMax - yMin) * (H - T - B); };
    var badAt = -1, brakeAt = -1, halfAt = -1;
    for(var i = 0; i < path.length; i++){ if(badAt < 0 && path[i] <= -lim.bad) badAt = i; if(brakeAt < 0 && path[i] <= -lim.brake) brakeAt = i; if(halfAt < 0 && path[i] <= -lim.brake / 2) halfAt = i; }
    var haltAt = badAt, dA = "", dB = "";
    for(var j = 0; j < path.length; j++){ var p = (j ? "L" : "M") + X(j).toFixed(1) + " " + Y(path[j]).toFixed(1) + " "; if(haltAt < 0 || j <= haltAt) dA += p; if(haltAt >= 0 && j >= haltAt) dB += (j === haltAt ? "M" : "L") + X(j).toFixed(1) + " " + Y(path[j]).toFixed(1) + " "; }
    var s = '<defs><clipPath id="dayclip"><rect id="dayclip-r" x="0" y="0" width="' + (reduced ? W : 0) + '" height="' + H + '"/></clipPath><linearGradient id="dayfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8AA8D8" stop-opacity=".18"/><stop offset="1" stop-color="#8AA8D8" stop-opacity="0"/></linearGradient></defs>';
    [0, -2, -4, -6, -8].forEach(function(g){ s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(g) + '" y2="' + Y(g) + '" stroke="' + GRID + '"/><text class="ax" x="' + (L - 8) + '" y="' + (Y(g) + 4) + '" text-anchor="end">' + g + '%</text>'; });
    [0, 26, 52, 78].forEach(function(i){ s += '<text class="ax" x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="' + (i === 0 ? "start" : i === 78 ? "end" : "middle") + '">' + tstr(i) + '</text>'; });
    s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(-lim.bad) + '" y2="' + Y(-lim.bad) + '" stroke="' + RED + '" stroke-dasharray="4 4" opacity=".75"/><text class="ax" x="' + (W - R) + '" y="' + (Y(-lim.bad) - 6) + '" text-anchor="end" style="fill:' + RED + '">bad-day halt ' + lim.bad + '%</text>';
    if(lim.brake <= 8) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(-lim.brake) + '" y2="' + Y(-lim.brake) + '" stroke="' + INK + '" stroke-dasharray="4 4" opacity=".4"/><text class="ax" x="' + (W - R) + '" y="' + (Y(-lim.brake) - 6) + '" text-anchor="end">brake ' + lim.brake + '%</text>';
    var areaEnd = haltAt >= 0 ? haltAt : 78;
    s += '<g class="lines" clip-path="url(#dayclip)"><path d="' + dA + 'L' + X(areaEnd).toFixed(1) + ' ' + Y(yMin) + ' L' + X(0) + ' ' + Y(yMin) + ' Z" fill="url(#dayfill)"/><path d="' + dA + '" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
    if(dB) s += '<path d="' + dB + '" fill="none" stroke="' + MUTE + '" stroke-width="1.6" stroke-dasharray="3 4"/>';
    s += '</g>';
    if(haltAt >= 0) s += '<g class="pop' + (reduced ? ' on' : '') + '" id="haltmark"><circle class="ring" cx="' + X(haltAt) + '" cy="' + Y(path[haltAt]) + '" r="9" fill="none" stroke="' + RED + '" stroke-width="1.5"/><circle cx="' + X(haltAt) + '" cy="' + Y(path[haltAt]) + '" r="11" fill="rgba(239,123,109,.2)"/><circle cx="' + X(haltAt) + '" cy="' + Y(path[haltAt]) + '" r="5" fill="' + RED + '"/><text class="ax" x="' + (X(haltAt) + 14) + '" y="' + (Y(path[haltAt]) + 4) + '" style="fill:' + RED + '">halted ' + tstr(haltAt) + '</text></g>';
    s += '<g id="ph" style="opacity:0"><line x1="0" x2="0" y1="' + (T + 2) + '" y2="' + (H - B) + '" stroke="rgba(243,242,238,.3)" stroke-dasharray="2 3"/><circle r="5" cy="' + Y(0) + '" fill="' + INK + '" stroke="#0B1220" stroke-width="2.5"/></g>';
    svg.innerHTML = s;
    var via = !apps.length ? "nowhere (you switched every channel off)" : apps.length === 1 ? apps[0] : apps.slice(0, -1).join(", ") + " and " + apps[apps.length - 1];
    var ev = [{ at: 0, t: "09:31", c: "ok", b: "Session open.", r: "Wires fresh. The floor starts measuring." }];
    if(halfAt >= 0 && (haltAt < 0 || halfAt <= haltAt)) ev.push({ at: halfAt, t: tstr(halfAt), c: "warn", b: "Halfway to your brake.", r: "Book down " + (lim.brake / 2).toFixed(1) + "%. A heads-up went out on " + via + "." });
    if(haltAt >= 0 && brakeAt === haltAt) ev.push({ at: haltAt, t: tstr(haltAt), c: "halt", b: "Bad-day halt and emergency brake, both at " + lim.bad + "%.", r: "Everything halts until you release it yourself. Nothing is sold. You heard on " + via + ", and the message says why." });
    else {
      if(haltAt >= 0) ev.push({ at: haltAt, t: tstr(haltAt), c: "halt", b: "Bad-day halt at " + lim.bad + "%.", r: "Trading stops for the rest of the session. Nothing is sold. You heard on " + via + ", and again every two hours until you acknowledged it." });
      if(brakeAt >= 0) ev.push({ at: brakeAt, t: tstr(brakeAt), c: "halt", b: "Emergency brake at " + lim.brake + "%.", r: "Everything halts until you release it yourself. The message says why." });
    }
    if(haltAt < 0 && brakeAt < 0) ev.push({ at: 56, t: tstr(56), c: "ok", b: "Worst point of the day, " + Math.min.apply(null, path).toFixed(1) + "%.", r: "Inside your limits, so the floor kept working." });
    ev.push({ at: 78, t: "17:05", c: "ok", b: "Daily summary.", r: "Account value, the day's move, what is waiting on you, and " + (haltAt >= 0 || brakeAt >= 0 ? "that the floor is halted" : "that nothing is halted") + ". Sent on " + via + "." });
    d.getElementById("timeline").innerHTML = ev.map(function(e){ return '<li class="' + e.c + (reduced ? '' : ' dim') + '" data-at="' + e.at + '"><time>' + e.t + '</time><div><b>' + e.b + '</b> ' + e.r + '</div></li>'; }).join("");
    DAY = { X: X, Y: Y, W: W, haltAt: haltAt };
    if(!reduced && visible) play();
  }
  var visible = false, played = false, raf = 0;
  function play(){
    if(!DAY) return; cancelAnimationFrame(raf);
    var rect = d.getElementById("dayclip-r"), ph = d.getElementById("ph"), mark = d.getElementById("haltmark"), lis = d.querySelectorAll("#timeline li"), dot = ph.querySelector("circle");
    rect.setAttribute("width", 0); ph.style.opacity = 1; if(mark) mark.classList.remove("on"); each(lis, function(li){ li.classList.add("dim"); });
    var DUR = 7600, t0 = performance.now();
    (function frame(now){
      var t = Math.max(0, Math.min(1, (now - t0) / DUR)), idx = t * 78, x = DAY.X(idx), i0 = Math.floor(idx), i1 = Math.min(78, i0 + 1), v = path[i0] + (path[i1] - path[i0]) * (idx - i0);
      rect.setAttribute("width", x.toFixed(1)); ph.setAttribute("transform", "translate(" + x.toFixed(1) + ",0)"); dot.setAttribute("cy", DAY.Y(v).toFixed(1));
      dot.setAttribute("fill", DAY.haltAt >= 0 && idx > DAY.haltAt ? "rgba(243,242,238,.4)" : "#F3F2EE");
      if(clockEl) clockEl.textContent = tstr(Math.round(idx));
      if(mark && idx >= DAY.haltAt) mark.classList.add("on");
      each(lis, function(li){ if(idx >= +li.dataset.at) li.classList.remove("dim"); });
      if(t < 1) raf = requestAnimationFrame(frame); else setTimeout(function(){ ph.style.opacity = 0; if(clockEl) clockEl.textContent = "17:05"; }, 900);
    })(t0);
  }
  each(d.querySelectorAll(".seg"), function(seg){ seg.addEventListener("click", function(e){ var b = e.target.closest("button"); if(!b) return;
    each(seg.querySelectorAll("button"), function(x){ x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b ? "true" : "false"); });
    lim[seg.dataset.key] = +b.dataset.v; d.getElementById("v-" + seg.dataset.key).textContent = b.dataset.v + "%"; drawDay(); }); });
  d.getElementById("chips").addEventListener("click", function(e){ var b = e.target.closest("button"); if(!b) return; var on = b.classList.toggle("on"); b.setAttribute("aria-pressed", on ? "true" : "false");
    apps = Array.prototype.filter.call(this.children, function(x){ return x.classList.contains("on"); }).map(function(x){ return x.dataset.v; }); drawDay(); });
  drawDay();
  new IntersectionObserver(function(es){ es.forEach(function(e){ visible = e.isIntersecting; if(visible && !reduced && !played){ played = true; play(); } }); }, { threshold: .35 }).observe(svg);
})();
