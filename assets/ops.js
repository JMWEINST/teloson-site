(function(){
  var API = "https://jiyujojygjufkfdkcycd.supabase.co/rest/v1/rpc/";
  var KEY = "sb_publishable_YxqbAEU_h_R0GI-OqCpKhA_H-Z2mL2V";
  var ops = "", data = null;
  var $ = function(id){ return document.getElementById(id); };
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function rpc(fn, body){ return fetch(API + fn, { method: "POST", headers: { "apikey": KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(function(r){ return r.json(); }); }
  var toastT; function toast(msg){ var t = $("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.remove("on"); }, 1800); }
  function when(iso){ var d = new Date(iso); return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); }
  function copy(text){ if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function(){ toast("Copied"); }, function(){ toast("Copy blocked by the browser"); }); }

  // ---- mandates ----
  // The desk refuses to run while an item in unimplemented[] is not marked
  // disclosed_to_client. Show it here so it is never a surprise at install time.
  function undisclosed(c){ return ((c.profile && c.profile.unimplemented) || []).filter(function(u){ return u && u.disclosed_to_client !== true; }); }
  function mandateState(c){
    if(!c.profile) return "<span style='color:var(--ink-3)'>no mandate attached: the installer will refuse</span>";
    var u = undisclosed(c), p = c.profile;
    var bits = [p.status === "active" ? "countersigned" : "awaiting countersignature (practice only)"];
    if(u.length) bits.push("<b>" + u.length + " item" + (u.length === 1 ? "" : "s") + " to disclose</b>: " + u.map(function(x){ return esc(x.instruction); }).join("; "));
    if(!c.identity) bits.push("no contact details");
    return "<span style='color:var(--ink-3)'>" + bits.join(" · ") + "</span>";
  }
  function readMandate(file, mandate){
    return new Promise(function(res, rej){
      var r = new FileReader();
      r.onload = function(){
        var p; try { p = JSON.parse(r.result); } catch(e){ return rej("That file is not valid JSON."); }
        if(!p || p.account_role !== "client" || !p.client_id) return rej("That is not a client mandate (account_role must be client).");
        if(mandate && p.client_id !== mandate) return rej("The mandate's client_id is \"" + p.client_id + "\", not \"" + mandate + "\".");
        p.identity_file = "profiles/" + p.client_id + ".identity.json";
        res(p);
      };
      r.onerror = function(){ rej("Could not read that file."); };
      r.readAsText(file);
    });
  }
  function identityFor(mandate, name, email, mobile, tz){
    var i = { client_id: mandate, legal_name: (name || "").trim(), email: (email || "").trim().toLowerCase(), timezone: (tz || "").trim() || "America/New_York" };
    if((mobile || "").trim()) i.mobile = mobile.trim();
    return i;
  }
  var picker = document.createElement("input"); picker.type = "file"; picker.accept = ".json,application/json"; picker.hidden = true; document.body.appendChild(picker);
  var attachFor = null;
  picker.addEventListener("change", function(){
    var c = data.clients.filter(function(x){ return x.id === attachFor; })[0]; var f = picker.files[0]; picker.value = "";
    if(!c || !f) return;
    readMandate(f, c.mandate).then(function(p){
      var ident = c.identity || identityFor(c.mandate, c.name, c.email, "", "");
      return rpc("teloson_ops_client", { p_key: ops, p_action: "update", p_client: { id: c.id, profile: p, identity: ident } });
    }).then(function(){ toast("Mandate attached"); load(); }, function(msg){ toast(String(msg)); });
  });

  // ---- sign in ----
  try { var saved = localStorage.getItem("teloson-ops"); if(saved) { ops = saved; open(); } } catch(e){}
  $("keyform").addEventListener("submit", function(e){
    e.preventDefault(); ops = $("key").value.trim(); if(!ops) return;
    $("keygo").disabled = true; $("keystatus").className = "status"; $("keystatus").textContent = "Checking…";
    load().then(function(ok){
      $("keygo").disabled = false;
      if(!ok){ $("keystatus").textContent = "That key did not open anything."; $("keystatus").className = "status err"; return; }
      if($("remember").checked){ try { localStorage.setItem("teloson-ops", ops); } catch(e){} }
      $("keystatus").textContent = ""; show();
    });
  });
  $("signout").addEventListener("click", function(e){ e.preventDefault(); try { localStorage.removeItem("teloson-ops"); } catch(err){} location.reload(); });
  function open(){ load().then(function(ok){ if(ok) show(); else { ops = ""; try { localStorage.removeItem("teloson-ops"); } catch(e){} } }); }
  function show(){ $("gate").hidden = true; $("console").hidden = false; $("signout").hidden = false; }

  // ---- data ----
  function load(){
    return rpc("teloson_ops_read", { p_key: ops }).then(function(j){ if(!j || !j.ok) return false; data = j; render(); return true; }).catch(function(){ return false; });
  }
  function render(){
    $("stamp").textContent = "Updated " + new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    var open = data.requests.filter(function(r){ return r.status === "new"; }).length;
    $("n-requests").textContent = open ? open + " new" : data.requests.length; $("n-clients").textContent = data.clients.length; $("n-activity").textContent = data.activity.length;
    // requests
    var tb = $("t-requests").querySelector("tbody"); tb.innerHTML = data.requests.map(function(r){
      return "<tr><td><time>" + when(r.created_at) + "</time></td><td><b>" + esc(r.name) + "</b><br><a class='code' href='mailto:" + esc(r.email) + "'>" + esc(r.email) + "</a></td><td>" + esc(r.location || "") + "</td><td class='note'>" + esc(r.note || "") + "</td><td><span class='pill " + esc(r.status) + "'>" + esc(r.status) + "</span></td><td><span class='act'>" +
        (r.status !== "replied" ? "<button class='mini' data-req='" + r.id + "' data-status='replied'>Replied</button>" : "") +
        (r.status !== "archived" ? "<button class='mini' data-req='" + r.id + "' data-status='archived'>Archive</button>" : "<button class='mini' data-req='" + r.id + "' data-status='new'>Reopen</button>") +
        "<button class='mini' data-copyemail='" + esc(r.email) + "'>Copy email</button></span></td></tr>";
    }).join(""); $("e-requests").hidden = data.requests.length > 0;
    // clients
    tb = $("t-clients").querySelector("tbody"); tb.innerHTML = data.clients.map(function(c){
      return "<tr><td><b>" + esc(c.name) + "</b><br><span>" + esc(c.email) + "</span>" + (c.notes ? "<br><span style='color:var(--ink-3)'>" + esc(c.notes) + "</span>" : "") + "</td><td class='code'>" + esc(c.code) + "</td><td>" + esc(c.mandate) + "<br>" + mandateState(c) + "</td><td><span class='pill " + esc(c.status) + "'>" + esc(c.status) + "</span></td><td class='num'>" + c.installs + "</td><td><time>" + (c.last_seen ? when(c.last_seen) : "never") + "</time></td><td><span class='act'>" +
        "<button class='mini' data-welcome='" + c.id + "'>Welcome note</button>" +
        "<button class='mini' data-copy='" + esc(c.code) + "'>Copy code</button>" +
        "<button class='mini' data-attach='" + c.id + "'>" + (c.profile ? "Replace mandate" : "Attach mandate") + "</button>" +
        (undisclosed(c).length ? "<button class='mini' data-disclose='" + c.id + "'>Mark disclosed</button>" : "") +
        (c.status === "active" ? "<button class='mini' data-cid='" + c.id + "' data-cstatus='paused'>Pause</button>" : "<button class='mini' data-cid='" + c.id + "' data-cstatus='active'>Activate</button>") +
        (c.status !== "revoked" ? "<button class='mini danger' data-cid='" + c.id + "' data-cstatus='revoked'>Revoke</button>" : "") +
        "</span></td></tr>";
    }).join(""); $("e-clients").hidden = data.clients.length > 0;
    // activity
    tb = $("t-activity").querySelector("tbody"); tb.innerHTML = data.activity.map(function(a){
      var label = { lookup: "signed in", claim: "installer ran", download: "desk downloaded", lookup_failed: "sign-in failed", claim_failed: "installer refused", ops_failed: "bad operator key" }[a.event] || a.event;
      return "<tr><td><time>" + when(a.created_at) + "</time></td><td><span class='pill " + esc(a.event) + "'>" + esc(label) + "</span>" + (a.detail && a.detail.status ? " <span style='color:var(--ink-3)'>" + esc(a.detail.status) + "</span>" : "") + "</td><td>" + esc(a.client || "") + "</td><td class='code'>" + esc(a.code_tried || "") + "</td><td>" + esc(a.host || "") + "</td></tr>";
    }).join(""); $("e-activity").hidden = data.activity.length > 0;
    // config
    var cfg = data.config || {}; $("cfg").innerHTML = Object.keys(cfg).sort().map(function(k){ return "<div><dt>" + esc(k) + "</dt><dd>" + esc(cfg[k]) + "</dd></div>"; }).join("");
  }

  // ---- tabs ----
  document.querySelectorAll(".op-tab").forEach(function(t){ t.addEventListener("click", function(){
    document.querySelectorAll(".op-tab").forEach(function(x){ x.classList.toggle("on", x === t); });
    document.querySelectorAll(".op-panel").forEach(function(p){ p.classList.toggle("on", p.dataset.panel === t.dataset.tab); });
  }); });

  // ---- actions ----
  document.addEventListener("click", function(e){
    var b = e.target.closest("button.mini"); if(!b) return;
    if(b.dataset.req){ rpc("teloson_ops_request", { p_key: ops, p_id: b.dataset.req, p_status: b.dataset.status }).then(load); }
    else if(b.dataset.cid){ if(b.dataset.cstatus === "revoked" && !b.classList.contains("sure")){ b.textContent = "Really revoke"; b.classList.add("sure"); return; } rpc("teloson_ops_client", { p_key: ops, p_action: "status", p_client: { id: b.dataset.cid, status: b.dataset.cstatus } }).then(load); }
    else if(b.dataset.attach){ attachFor = b.dataset.attach; picker.click(); }
    else if(b.dataset.disclose){
      if(!b.classList.contains("sure")){ b.textContent = "Told them in writing?"; b.classList.add("sure"); return; }
      var dc = data.clients.filter(function(x){ return x.id === b.dataset.disclose; })[0]; if(!dc) return;
      var np = JSON.parse(JSON.stringify(dc.profile)); (np.unimplemented || []).forEach(function(u){ u.disclosed_to_client = true; });
      rpc("teloson_ops_client", { p_key: ops, p_action: "update", p_client: { id: dc.id, profile: np } }).then(function(){ toast("Marked disclosed"); load(); });
    }
    else if(b.dataset.copy){ copy(b.dataset.copy); }
    else if(b.dataset.copyemail){ copy(b.dataset.copyemail); }
    else if(b.dataset.welcome){
      var c = data.clients.filter(function(x){ return x.id === b.dataset.welcome; })[0]; if(!c) return;
      var first = c.name.split(" ")[0];
      copy("Hi " + first + ",\n\nYour desk is ready to install.\n\n1. Go to https://teloson.com/desk/ and sign in with this code and the email address this note was sent to:\n   " + c.code + "\n2. The page shows one line to paste into Terminal on the Mac the desk should live on. That is the whole install.\n\nIt starts on practice money with real prices. Real money is switched on separately, with us, after the practice period.\n\nReply to this email if anything stops you.\n\nJack");
    }
  });
  $("addform").addEventListener("submit", function(e){
    e.preventDefault(); var st = $("addstatus"); st.className = "status";
    var c = { name: $("c-name").value, email: $("c-email").value, mandate: $("c-mandate").value.trim().toLowerCase(), code: $("c-code").value, notes: $("c-notes").value };
    if(!c.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim()) || !c.mandate){ st.textContent = "Name, a real email and the mandate are needed."; st.className = "status err"; return; }
    $("addgo").disabled = true;
    var f = $("c-profile").files[0];
    (f ? readMandate(f, c.mandate) : Promise.resolve(null)).then(function(p){
      if(p) c.profile = p;
      c.identity = identityFor(c.mandate, c.name, c.email, $("c-mobile").value, $("c-tz").value);
      return rpc("teloson_ops_client", { p_key: ops, p_action: "add", p_client: c });
    }, function(msg){ return { ok: false, message: String(msg) }; }).then(function(j){
      $("addgo").disabled = false;
      if(!j || !j.ok){ st.textContent = "Could not add that client" + (j && j.message ? ": " + j.message : ".") ; st.className = "status err"; return; }
      st.textContent = "Added. Code " + j.code + " (copied)."; copy(j.code); $("addform").reset(); load();
    }).catch(function(err){ $("addgo").disabled = false; st.textContent = "Could not add that client. Is the code or email already used?"; st.className = "status err"; });
  });
  $("tokform").addEventListener("submit", function(e){
    e.preventDefault(); var v = $("tok").value.trim(), st = $("tokstatus"); if(!v) return;
    rpc("teloson_ops_config", { p_key: ops, p_name: "repo_token", p_value: v }).then(function(j){ st.textContent = j && j.ok ? "Saved. The installer can download the desk now." : "Not saved."; st.className = j && j.ok ? "status" : "status err"; $("tok").value = ""; load(); });
  });
  setInterval(function(){ if(ops && !document.hidden) load(); }, 60000);
})();
