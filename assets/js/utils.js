const baseUrl = "https://jomc.pythonanywhere.com";
// const baseUrl = "http://127.0.0.1:5000";

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

function timeAgo(date){
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
      { label: 'yr', secs: 31536000 },
      { label: 'mon', secs: 2592000 },
      { label: 'wk', secs: 604800 },
      { label: 'dy', secs: 86400 },
      { label: 'hr', secs: 3600 },
      { label: 'min', secs: 60 },
      { label: 'sec', secs: 1 }
  ];
  for (const i of intervals){
      const count = Math.floor(seconds / i.secs);
      if(count > 0) return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

window.timeAgo = timeAgo

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
      "Failed to Communicate to server. Please make sure you have an active internet connection or contact support", o.classList.add("error")), o.innerHTML = ` <svg width="30px" height="30px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-2.4" y="-2.4" width="28.80" height="28.80" rx="14.4" fill="#ffffff" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5 0.999992C10.9477 0.999992 10.5 1.44771 10.5 1.99999V2.99999H9.99998C7.23864 2.99999 4.99998 5.23824 4.99998 7.99975V11C4.99998 11.7377 4.76718 12.5722 4.39739 13.4148C4.03164 14.2482 3.55875 15.0294 3.14142 15.6439C2.38188 16.7624 2.85215 18.5301 4.40564 18.8103C5.42144 18.9935 6.85701 19.2115 8.54656 19.3527C8.54454 19.4015 8.54352 19.4506 8.54352 19.5C8.54352 21.433 10.1105 23 12.0435 23C13.9765 23 15.5435 21.433 15.5435 19.5C15.5435 19.4482 15.5424 19.3966 15.5402 19.3453C17.1921 19.204 18.596 18.9903 19.5943 18.8103C21.1478 18.5301 21.6181 16.7624 20.8586 15.6439C20.4412 15.0294 19.9683 14.2482 19.6026 13.4148C19.2328 12.5722 19 11.7377 19 11V7.99975C19 5.23824 16.7613 2.99999 14 2.99999H13.5V1.99999C13.5 1.44771 13.0523 0.999992 12.5 0.999992H11.5ZM12 19.5C12.5113 19.5 13.0122 19.4898 13.4997 19.4715C13.5076 20.2758 12.8541 20.9565 12.0435 20.9565C11.2347 20.9565 10.5803 20.2778 10.5872 19.4746C11.0473 19.491 11.5191 19.5 12 19.5ZM9.99998 4.99999C8.34305 4.99999 6.99998 6.34297 6.99998 7.99975V11C6.99998 12.1234 6.65547 13.2463 6.22878 14.2186C5.79804 15.2 5.25528 16.0911 4.79599 16.7675C4.78578 16.7825 4.78102 16.7969 4.77941 16.8113C4.77797 16.8242 4.77919 16.8362 4.78167 16.8458C6.3644 17.1303 9.00044 17.5 12 17.5C14.9995 17.5 17.6356 17.1303 19.2183 16.8458C19.2208 16.8362 19.222 16.8242 19.2206 16.8113C19.2189 16.7969 19.2142 16.7825 19.204 16.7675C18.7447 16.0911 18.2019 15.2 17.7712 14.2186C17.3445 13.2463 17 12.1234 17 11V7.99975C17 6.34297 15.6569 4.99999 14 4.99999H9.99998Z" fill="#0F0F0F"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.0299 0.757457C16.1622 0.228068 16.7146 -0.102469 17.2437 0.0301341C17.3131 0.0476089 17.3789 0.0669732 17.4916 0.104886C17.6295 0.151258 17.8183 0.221479 18.0424 0.322098C18.4894 0.522794 19.0851 0.848127 19.6982 1.35306C20.9431 2.37831 22.2161 4.1113 22.495 6.9005C22.55 7.45005 22.149 7.94009 21.5995 7.99504C21.05 8.05 20.5599 7.64905 20.505 7.09951C20.2839 4.88869 19.3068 3.62168 18.4268 2.89692C17.9774 2.52686 17.5418 2.28969 17.2232 2.14664C17.0645 2.07538 16.9369 2.02841 16.8541 2.00057C16.8201 1.98913 16.7859 1.97833 16.7513 1.96858C16.2192 1.83203 15.8964 1.2912 16.0299 0.757457Z" fill="#0F0F0F"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M7.97014 0.757457C7.83619 0.221662 7.29326 -0.104099 6.75746 0.0298498C6.68765 0.0473468 6.62176 0.066766 6.5084 0.104885C6.37051 0.151257 6.1817 0.221478 5.9576 0.322097C5.51059 0.522793 4.91493 0.848125 4.30179 1.35306C3.05685 2.37831 1.78388 4.1113 1.50496 6.90049C1.45001 7.45003 1.85095 7.94008 2.40049 7.99503C2.95004 8.04998 3.44008 7.64904 3.49504 7.0995C3.71612 4.88869 4.69315 3.62168 5.57321 2.89692C6.02257 2.52686 6.45815 2.28969 6.77678 2.14664C6.93548 2.07538 7.06308 2.02841 7.14589 2.00057C7.17991 1.98913 7.21413 1.97833 7.24867 1.96858C7.78081 1.83203 8.10358 1.2912 7.97014 0.757457Z" fill="#0F0F0F"></path> </g></svg>${e}`, document.body.appendChild(o), setTimeout((() => {
      o.classList.remove("seen"), o.classList.add("removing"), setTimeout((() => o.remove()), 500)
    }),60000000)
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


document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.querySelector('.sub-form')

  form.addEventListener('submit', (e)=>{
    e.preventDefault()
    const email = form.querySelector('input').value.trim()
    const button = form.querySelector('button')
    button.disabled = true
    button.textContent = 'Subscribin'
    fetch(`${baseUrl}/subscribe`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },body:JSON.stringify({'email':email})
    })
    .then(res=>res.json())
    .then(data=>{
      button.disabled = false
    button.textContent = 'Subscribe'
      if(data.error || !data.msg){
        alert(data.error || 'An error occured on our end', 'error')
      } else{
      alert(data.msg, 'success')
      }
    })
    .catch(err=>{
      alert(err.messge || 'An error occurred', 'error')
      button.disabled = false
    button.textContent = 'Subscribe'
    })
  })
  
})