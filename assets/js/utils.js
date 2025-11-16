const baseUrl = "https://jomc.pythonanywhere.com";

function copy(e) {
  e && (navigator.clipboard.writeText(String(e)), alert("Copied", "success"))
}

function parseMarkdown(e) {
  return e ? e = (e = (e = (e = (e = (e = (e = (e = (e = (e = e.replace(/^# (.*)$/gm, "<h1>$1</h1>")).replace(/^## (.*)$/gm,
      "<h2 style='font-size:large; font-weight:600'>$1</h2>")).replace(/^### (.*)$/gm, "<h3>$1</h3>")).replace(/^#### (.*)$/gm, "<h4>$1</h4>"))
    .replace(/^---$/gm, "<hr>")).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")).replace(/(^|[^*])\*(?!\*)([^*]+)\*(?!\*)/g, "$1<em>$2</em>")).replace(
    /(^|\n)(\* .+(\n\* .+)*)/g, ((e, t, o) => `${t}<ul>${o.trim().split("\n").map((e=>`<li>${e.replace(/^\* /,"")}</li>`)).join("\n")}</ul>`))).replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')).replace(/(^|[^"'>])((https?:\/\/)[^\s<]+)/g, ((
    e, t, o) => `${t}<a href="${o}" target="_blank" rel="noopener noreferrer">${o}</a>`)) : "No Description Provided"
}

function safeText(e) {
  const t = document.createElement("div");
  try {
    t.innerHTML = e
  } catch (e) {
    console.warn("HTML parse error:", e)
  }
  return t.textContent || ""
}

function alert(e, t = "info") {
  let o = document.querySelector(".toast") || document.createElement("div");
  o.className = "", o.classList.add("toast", t, "seen");
  let n = String(e).toLowerCase();
  (n.includes("unexpected") || n.includes("syntax") || n.includes("traceback") || n.includes("internal")) && (e =
    "Server not yet configured, please contact support", o.classList.add("error")), n.includes("failed to fetch") && (e =
      "Failed to Communicate to server. Please make sure you have an active internet connection or contact support", o.classList.add("error")), o.textContent =
    e, document.body.appendChild(o), setTimeout((() => {
      o.classList.remove("seen"), o.classList.add("removing"), setTimeout((() => o.remove()), 500)
    }), 5e3)
}

function formatTime(e) {
  return new Date(e).toLocaleString(void 0, {
    weekday: "long",
    hour: "2-digit",
    day: "numeric",
    month: "short",
    minute: "2-digit"
  })
}

function formatTimehD(e) {
  return new Date(e).toLocaleString(void 0, {
    hour: "2-digit",
    day: "numeric",
    month: "short",
    minute: "2-digit",
    year: "numeric"
  })
}
async function checkBlock(e) {
  const t = e + "?check=" + Date.now(),
    o = await new Promise((e => {
      const o = document.createElement("script");
      o.src = t, o.onload = () => e(!1), o.onerror = () => e(!0), document.head.appendChild(o), setTimeout((() => e(!0)), 2e3)
    }));
  let n = !0;
  try {
    await fetch(e.replace("/invoke.js", "/favicon.ico"), {
      mode: "no-cors"
    })
  } catch {
    n = !1
  }
  let r = "unknown";
  return o && n && (r = "extension"), o && !n && (r = "network"), o || (r = "none"), {
    blocked: o,
    reason: r
  }
}
async function pingAccount() {
  if (!window.id || !window.token) return console.warn("not logged"), "❌";
  try {
    const e = await fetch(`${baseUrl}/ping/account?id=${window.id}&token=${window.token}`),
      t = await e.json();
    if (t.error) return alert(t.error || "An error occured", "error"), localStorage.clear(), "❌";
    const o = t.user;
    return localStorage.setItem("user", JSON.stringify(o)), localStorage.setItem("uid", o.id), localStorage.setItem("usn", o.username), localStorage.setItem(
      "token", t.token || window.token), localStorage.setItem("lastPing", (new Date).toISOString()), "✔"
  } catch (e) {
    return alert(e.message, "error"), "❌"
  }
}
document.addEventListener("DOMContentLoaded", (() => {
  "dark" == localStorage.getItem("mode") ? document.body.classList.add("dark") : document.body.classList.remove("dark");
  const e = document.querySelector(".modes");
  e && e.addEventListener("click", (t => {
    console.log(e.innerHTML);
    const o = '<i class="fas fa-moon"></i>';
    e.innerHTML.trim() == o ? (e.innerHTML = '<i class="fas fa-sun"></i>', localStorage.setItem("mode", "dark"), document.body.classList.add(
      "dark")) : (e.innerHTML = o, localStorage.setItem("mode", "light"), document.body.classList.remove("dark"))
  }))
})), window.copy = copy, window.parseMarkdown = parseMarkdown, window.baseUrl = baseUrl, window.safeText = safeText, document.addEventListener(
  "DOMContentLoaded", (() => {
    const e = document.querySelector(".searchDiv"),
      t = document.querySelector(".search");
    if (e && t && t.addEventListener("click", (() => {
        e && (e.classList.toggle("seen"), e.classList.toggle("none"))
      })), e && e.querySelector(".closeSearch").addEventListener("click", (() => {
        const t = new URLSearchParams(window.location.search);
        e.classList.toggle("seen"), e.classList.toggle("none"), t.delete("action");
        const o = window.location.pathname + (t.toString() ? "?" + t.toString() : "");
        window.history.pushState({}, "", o)
      })), e) {
      const t = e.querySelector("#query");
      if (t) {
        const o = e.querySelector("#searchBtn");
        t.addEventListener("keydown", (e => {
          "Enter" == e.key && (t.value && "" != t.value ? window.location.href = `/search/?q=${t.value.trim()}` : "" == t.value.trim() && alert(
            "Empty Search Item", "error"))
        })), o.addEventListener("click", (() => {
          t.value && "" != t.value ? window.location.href = `/search/?q=${t.value.trim()}` : "" == t.value.trim() && alert("Empty Search Item",
            "error")
        }))
      }
    }
  })), setInterval((() => {
  if (new URLSearchParams(window.location.search).get("action")) {
    const e = document.querySelector(".searchDiv");
    e.classList.remove("none"), e.classList.add("seen")
  }
}), 1e3), window.formatTime = formatTime, window.formatTimehD = formatTimehD, window.alert = alert, document.addEventListener("DOMContentLoaded", (() => {
  const e = new URLSearchParams(window.location.search).get("app_mode");
  if ("True" == e) {
    localStorage.setItem("app_mode", !0);
    const e = document.querySelector(".header"),
      t = e.querySelector(".searchDiv");
    e.innerHTML = "", e.append(t);
    document.querySelector(".footer").style.display = "none"
  } else {
    "False" == e && localStorage.removeItem("app_mode");
    if (localStorage.getItem("app_mode")) {
      const e = document.querySelector(".header"),
        t = e.querySelector(".searchDiv");
      e.innerHTML = "", e.append(t);
      document.querySelector(".footer").style.display = "none", setTimeout((() => {
        const e = document.querySelectorAll("iframe");
        console.clear(), e.forEach((e => {
          e.setAttribute("style", "display:none")
        }))
      }), 1e-4)
    }
  }
  hideLoader()
})), document.addEventListener("DOMContentLoaded", (() => {
  setTimeout((() => {
    checkBlock("https://pl28010045.effectivegatecpm.com/545445584d06c09fd1a832fa75e54619/invoke.js").then(console.log)
  }), 5e3), window.uid = localStorage.getItem("uid")
})), window.id = localStorage.getItem("uid"), window.token = localStorage.getItem("token"), window.pingAccount = pingAccount;