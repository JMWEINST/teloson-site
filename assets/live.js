/* Teloson · /live, below the floor: the day lights up as you read down it, and preflight checks each rule in turn. */
(function(){
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function each(l, fn){ Array.prototype.forEach.call(l, fn); }
  function ready(fn){ if(document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  ready(function(){
    /* a day on the floor */
    var day = document.querySelector(".dlist"), clock = document.getElementById("dfclock"), what = document.getElementById("dfwhat");
    if(day){
      var items = day.querySelectorAll("li");
      if(reduced){ each(items, function(li){ li.classList.add("lit"); }); }
      else {
        day.classList.add("live");
        day.insertAdjacentHTML("afterbegin", '<span class="rail" aria-hidden="true"><i></i><b></b></span>');
        var rail = day.querySelector(".rail"), fill = rail.querySelector("i"), dot = rail.querySelector("b"), tick = false, last = -2;
        var frame = function(){
          tick = false;
          var r = day.getBoundingClientRect(), mark = innerHeight * .58, p = Math.max(0, Math.min(1, (mark - r.top) / r.height)), now = -1;
          fill.style.transform = "scaleY(" + p.toFixed(4) + ")"; dot.style.transform = "translateY(" + (p * r.height).toFixed(1) + "px)";
          each(items, function(li, i){ var on = li.getBoundingClientRect().top < mark; li.classList.toggle("lit", on); if(on) now = i; });
          each(items, function(li, i){ li.classList.toggle("now", i === now); });
          if(now !== last){ last = now; var li = items[Math.max(0, now)]; if(clock && li){ clock.textContent = li.dataset.t; what.textContent = li.dataset.w; clock.parentNode.classList.remove("bump"); void clock.offsetWidth; clock.parentNode.classList.add("bump"); } }
        };
        window.addEventListener("scroll", function(){ if(!tick){ tick = true; requestAnimationFrame(frame); } }, { passive: true });
        window.addEventListener("resize", frame); frame();
      }
    }
    /* the rules: each limit is checked in turn, the way preflight checks them before every order */
    var book = document.querySelector(".rulebook .rb");
    if(book && !reduced && "IntersectionObserver" in window){
      var rows = book.querySelectorAll(".rule"), scan = document.createElement("div"), k = -1, seen = false;
      scan.className = "scan"; scan.setAttribute("aria-hidden", "true"); book.insertBefore(scan, book.firstChild);
      new IntersectionObserver(function(es){ seen = es[0].isIntersecting; }, { rootMargin: "80px 0px" }).observe(book);
      setInterval(function(){
        if(document.hidden || !seen) return;
        k = (k + 1) % rows.length; var r = rows[k];
        scan.classList.add("on"); scan.style.height = r.offsetHeight + "px"; scan.style.transform = "translateY(" + r.offsetTop + "px)";
        each(rows, function(x){ x.classList.toggle("chk", x === r); });
      }, 1500);
    }
  });
})();
