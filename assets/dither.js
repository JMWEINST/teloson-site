// Teloson · the dithered backdrop.
// One fixed WebGL2 canvas behind the whole page, drawn at one pixel per dither cell and scaled up with
// image-rendering: pixelated, so every gradient on the page prints as an ordered Bayer dither instead of
// a smooth wash. The colour choreography is a list of stops in page pixels, measured from the DOM:
// every [data-band] element is a ramp from data-from to data-to, everything in between holds, and
// [data-glow] elements add a slow radial glow. Sections that want the texture are transparent; the
// rest paint over it. If WebGL is missing, or on a phone, the html element gets .nogl and the CSS
// gradients on those same elements do the job without the texture.
(function () {
  var html = document.documentElement;
  var canvas = document.getElementById("dither");
  var mobile = window.matchMedia("(max-width: 899px)").matches || !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function off() { html.classList.remove("gl"); html.classList.add("nogl"); if (canvas) canvas.hidden = true; }
  if (!canvas || mobile) { off(); return; }
  // A machine with no GPU (headless audits, some VMs) renders WebGL on the CPU, where even this small
  // shader is a slideshow. Ask the driver once, remember the answer for the floor, and fall back to CSS.
  function softwareGL() {
    if (typeof window.__softGL === "boolean") return window.__softGL;
    var soft = false;
    try {
      var t = document.createElement("canvas"), g = t.getContext("webgl", { failIfMajorPerformanceCaveat: true });
      if (!g) soft = true;
      else { var dbg = g.getExtension("WEBGL_debug_renderer_info"); var r = dbg ? String(g.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ""; if (/swiftshader|llvmpipe|softpipe|software|mesa offscreen|basic render/i.test(r)) soft = true; var lose = g.getExtension("WEBGL_lose_context"); if (lose) lose.loseContext(); }
    } catch (e) { soft = true; }
    window.__softGL = soft; return soft;
  }
  // Start on the first sign of a person (a wheel, a pointer, a key), or after a pause for anyone who just
  // reads. Until then the CSS gradients underneath carry the page, and they fade out as the canvas fades in.
  var started = false;
  function start() {
    if (started) return; started = true;
    if (softwareGL()) { off(); return; }
    run();
  }
  ["pointermove", "wheel", "keydown", "scroll"].forEach(function (ev) { window.addEventListener(ev, start, { once: true, passive: true }); });
  window.addEventListener("load", function () { setTimeout(start, 1400); });
  function run() {
  var gl = null;
  try { gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power", preserveDrawingBuffer: false }); } catch (e) { gl = null; }
  if (!gl) { off(); return; }

  var VS = "#version 300 es\nvoid main(){ float x=float((gl_VertexID&1)<<2)-1.0; float y=float((gl_VertexID&2)<<1)-1.0; gl_Position=vec4(x,y,0.0,1.0); }";
  var FS = [
    "#version 300 es",
    "precision highp float;",
    "uniform vec2 uRes; uniform float uScroll; uniform float uTime; uniform float uQ;",
    "uniform float uStopY[16]; uniform float uStopL[16]; uniform int uN;",
    "uniform vec4 uGlow[4];",
    "uniform vec3 uC0, uC1, uC2, uC3, uC4;",
    "out vec4 o;",
    "float bayer8(ivec2 p){ int x=p.x&7, y=p.y&7, v=0; for(int i=0;i<3;i++){ int xb=(x>>i)&1, yb=(y>>i)&1; v=v*4+2*(xb^yb)+yb; } return (float(v)+0.5)/64.0; }",
    "float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }",
    "float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }",
    "float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<4;i++){ v+=a*vnoise(p); p*=2.03; a*=0.5; } return v; }",
    "float levelAt(float y){ if(uN<2) return uStopL[0]; if(y<=uStopY[0]) return uStopL[0]; for(int i=1;i<16;i++){ if(i>=uN) break; if(y<=uStopY[i]){ float t=(y-uStopY[i-1])/max(1.0,uStopY[i]-uStopY[i-1]); return mix(uStopL[i-1],uStopL[i],clamp(t,0.0,1.0)); } } return uStopL[uN-1]; }",
    "vec3 ramp(float q){ if(q<0.30) return mix(uC0,uC1,q/0.30); if(q<0.60) return mix(uC1,uC2,(q-0.30)/0.30); if(q<0.80) return mix(uC2,uC3,(q-0.60)/0.20); return mix(uC3,uC4,(q-0.80)/0.20); }",
    "void main(){",
    "  vec2 cell=floor(gl_FragCoord.xy);",
    "  float yPage=(uRes.y-cell.y-1.0)+uScroll;",
    "  vec2 np=vec2(cell.x,yPage)*0.0062;",
    "  float n1=fbm(np+vec2(uTime*0.012,0.0));",
    "  float n2=fbm(np*2.6+vec2(7.1,uTime*0.02));",
    "  float L=levelAt(yPage+(n1-0.5)*90.0);",
    "  L+=(n2-0.5)*0.06*smoothstep(0.0,0.08,L)*(1.0-smoothstep(0.86,1.0,L))+max(0.0,n2-0.56)*0.10*(1.0-smoothstep(0.0,0.1,L));",
    "  for(int g=0;g<4;g++){ vec4 G=uGlow[g]; if(G.w<=0.0) continue;",
    "    vec2 c=vec2(G.x+sin(uTime*0.13+float(g)*2.1)*G.z*0.10, G.y+cos(uTime*0.10+float(g)*1.3)*G.z*0.06);",
    "    vec2 d=(vec2(cell.x,yPage)-c)/G.z; d.y*=1.45; float r=dot(d,d);",
    "    L+=G.w*exp(-r*2.4); }",
    "  L=clamp(L,0.0,1.0);",
    "  float q=floor(L*uQ+bayer8(ivec2(cell)))/uQ;",
    "  o=vec4(ramp(clamp(q,0.0,1.0)),1.0);",
    "}"
  ].join("\n");
  function shader(type, src) { var sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(sh)); } return sh; }
  var prog;
  try {
    prog = gl.createProgram(); gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { off(); return; }
  gl.useProgram(prog);
  var U = {}; ["uRes", "uScroll", "uTime", "uQ", "uStopY", "uStopL", "uN", "uGlow", "uC0", "uC1", "uC2", "uC3", "uC4"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  function hex(h) { return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]; }
  var cs = getComputedStyle(html);
  function v(name, fb) { var x = cs.getPropertyValue(name).trim(); return x || fb; }
  gl.uniform3fv(U.uC0, hex(v("--black", "#070C16")));
  gl.uniform3fv(U.uC1, hex(v("--navy", "#1C2B45")));
  gl.uniform3fv(U.uC2, hex(v("--signal", "#4F76B0")));
  gl.uniform3fv(U.uC3, hex(v("--signal-light", "#8AA8D8")));
  gl.uniform3fv(U.uC4, hex(v("--paper", "#FBFAF7")));
  gl.uniform1f(U.uQ, 18.0);

  var CELL = 2; // css pixels per dither cell
  var W = 0, H = 0;
  function size() {
    var w = Math.max(1, Math.ceil(window.innerWidth / CELL)), h = Math.max(1, Math.ceil(window.innerHeight / CELL));
    if (w === W && h === H) return;
    W = w; H = h; canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(U.uRes, w, h);
  }
  var stopY = new Float32Array(16), stopL = new Float32Array(16), glow = new Float32Array(16), nStops = 0;
  function measure() {
    var sy = window.scrollY || window.pageYOffset || 0, docH = Math.max(html.scrollHeight, document.body.scrollHeight);
    var bands = Array.prototype.slice.call(document.querySelectorAll("[data-band]")).map(function (el) {
      var r = el.getBoundingClientRect();
      return { top: r.top + sy, bottom: r.bottom + sy, from: parseFloat(el.getAttribute("data-from") || "0"), to: parseFloat(el.getAttribute("data-to") || "1") };
    }).sort(function (a, b) { return a.top - b.top; });
    var ys = [], ls = [], last = bands.length ? bands[0].from : 0;
    ys.push(0); ls.push(last);
    bands.forEach(function (b) { ys.push(b.top); ls.push(b.from); ys.push(b.bottom); ls.push(b.to); last = b.to; });
    ys.push(docH + 10); ls.push(last);
    nStops = Math.min(16, ys.length);
    for (var i = 0; i < 16; i++) { stopY[i] = i < nStops ? ys[i] / CELL : 0; stopL[i] = i < nStops ? ls[i] : last; }
    gl.uniform1fv(U.uStopY, stopY); gl.uniform1fv(U.uStopL, stopL); gl.uniform1i(U.uN, nStops);
    var gs = Array.prototype.slice.call(document.querySelectorAll("[data-glow]")).slice(0, 4);
    for (var k = 0; k < 16; k++) glow[k] = 0;
    gs.forEach(function (el, k) {
      var r = el.getBoundingClientRect(), p = (el.getAttribute("data-glow") || "0.5,0,0.55,0.4").split(",").map(parseFloat);
      glow[k * 4] = (r.left + r.width * p[0]) / CELL; glow[k * 4 + 1] = (r.top + sy + r.height * p[1]) / CELL; glow[k * 4 + 2] = Math.max(40, r.width * p[2]) / CELL; glow[k * 4 + 3] = p[3];
    });
    gl.uniform4fv(U.uGlow, glow);
  }
  var t0 = performance.now(), raf = 0, dirty = true, lastScroll = -1;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    var sy = window.scrollY || window.pageYOffset || 0;
    if (reduced && !dirty && sy === lastScroll) return; // with reduced motion the glow holds still, so only redraw on scroll
    dirty = false; lastScroll = sy;
    gl.uniform1f(U.uScroll, sy / CELL);
    gl.uniform1f(U.uTime, reduced ? 0 : (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function relayout() { size(); measure(); dirty = true; }
  window.addEventListener("resize", relayout);
  window.addEventListener("load", function () { setTimeout(relayout, 60); setTimeout(relayout, 800); });
  if ("ResizeObserver" in window) { var ro = new ResizeObserver(function () { measure(); dirty = true; }); ro.observe(document.body); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); cancelAnimationFrame(raf); off(); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) dirty = true; });
  relayout();
  raf = requestAnimationFrame(frame);
  window.__dither = { relayout: relayout };
  requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add("gl"); if (window.__navMeasure) window.__navMeasure(); }); });
  }
})();
