// Teloson · client sign in: looks the account up and hands back the personal one-line install.
(function(){
  var API = "https://jiyujojygjufkfdkcycd.supabase.co/rest/v1/rpc/teloson_lookup";
  var KEY = "sb_publishable_YxqbAEU_h_R0GI-OqCpKhA_H-Z2mL2V";
  var d = document, form = d.getElementById("form"), status = d.getElementById("status"), go = d.getElementById("go");
  var signin = d.getElementById("signin"), welcome = d.getElementById("welcome"), cmdtext = d.getElementById("cmdtext"), copy = d.getElementById("copy"), command = "", t = 0;
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fail(msg){ status.textContent = msg; status.className = "status err"; go.disabled = false; }
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var code = form.code.value.replace(/\s+/g, "").toUpperCase(), email = form.email.value.trim();
    status.className = "status";
    if(!code) return fail("Enter the code from your welcome note.");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("That email does not look right.");
    go.disabled = true; status.textContent = "Checking…";
    fetch(API, { method: "POST", headers: { "apikey": KEY, "Content-Type": "application/json" }, body: JSON.stringify({ p_code: code, p_email: email, p_host: "web" }) })
    .then(function(r){ return r.json(); })
    .then(function(j){
      if(!j || !j.ok){ if(j && j.reason === "throttled") return fail("Too many attempts right now. Try again in a few minutes."); return fail("No account matches that code and email. Teloson is not a public service. If you were expecting an account, reply to the note we sent you."); }
      var first = (j.name || "").split(" ")[0];
      d.getElementById("hello").textContent = "Welcome, " + (first || "back") + ".";
      d.getElementById("mandate").textContent = j.mandate || "";
      var active = j.status === "active";
      d.getElementById("pill").classList.toggle("off", !active);
      d.getElementById("pilltext").textContent = active ? "Active" : j.status;
      d.getElementById("paused").hidden = active;
      var url = new URL("/install.sh", location.href).href;
      command = "curl -fsSL " + url + " | bash -s -- " + j.code + " " + j.email;
      cmdtext.innerHTML = '<span class="p">$</span>curl -fsSL ' + esc(url) + ' | bash -s -- <span class="v">' + esc(j.code) + '</span> <span class="v">' + esc(j.email) + '</span>';
      signin.hidden = true; welcome.hidden = false; status.textContent = ""; go.disabled = false; window.scrollTo({ top: 0 });
    })
    .catch(function(){ fail("Could not reach the account service. Check your connection and try again."); });
  });
  copy.addEventListener("click", function(){ var lab = copy.querySelector(".lab");
    function did(){ lab.textContent = "Copied"; clearTimeout(t); t = setTimeout(function(){ lab.textContent = "Copy"; }, 1600); }
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(command).then(did);
  });
  d.getElementById("signout").addEventListener("click", function(e){ e.preventDefault(); welcome.hidden = true; signin.hidden = false; form.reset(); form.code.focus(); });
})();
