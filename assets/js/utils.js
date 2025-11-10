// const baseUrl = 'http://127.0.0.1:5000'
const baseUrl = 'https://jomc.pythonanywhere.com'


document.addEventListener('DOMContentLoaded',()=>{
    const mode = localStorage.getItem('mode')
    if(mode == 'dark'){
        document.body.classList.add('dark')
    } else{
        document.body.classList.remove('dark')
    }

const modeBtn = document.querySelector('.modes')
if(modeBtn){
modeBtn.addEventListener('click', (e)=>{
    console.log(modeBtn.innerHTML)
    const moon = '<i class="fas fa-moon"></i>'
    const sun = '<i class="fas fa-sun"></i>'
    if(modeBtn.innerHTML.trim() == moon){
        modeBtn.innerHTML = sun
        localStorage.setItem('mode', 'dark')
        document.body.classList.add('dark')

    } else{
        modeBtn.innerHTML = moon
        localStorage.setItem('mode', 'light')
        document.body.classList.remove('dark')

    }
})                              
}

})


function parseMarkdown(text) {
    if(text){
text = text.replace(/^# (.*)$/gm, "<h1>$1</h1>");
text = text.replace(/^## (.*)$/gm, "<h2 style='font-size:large; font-weight:600'>$1</h2>");
text = text.replace(/^### (.*)$/gm, "<h3>$1</h3>");
text = text.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
text = text.replace(/^---$/gm, "<hr>");
text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
text = text.replace(/(^|[^*])\*(?!\*)([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
// Lists
text = text.replace(/(^|\n)(\* .+(\n\* .+)*)/g, (match, p1, p2) => {
const items = p2.trim().split('\n').map(line => `<li>${line.replace(/^\* /, '')}</li>`)
.join(
  '\n');
return `${p1}<ul>${items}</ul>`;
});
// Links
text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
// Raw URLs
text = text.replace(/(^|[^"'>])((https?:\/\/)[^\s<]+)/g, (m, prefix, url) =>
`${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
return text;
} else{
return 'No Description Provided'
}
  }

  function safeText(html) {
    const temp = document.createElement('div');
    
    try {
        temp.innerHTML = html; // browser tries fixing broken tags
    } catch (e) {
        console.warn("HTML parse error:", e);
    }

    return temp.textContent || ""; 
}

window.parseMarkdown = parseMarkdown
window.baseUrl = baseUrl
window.safeText = safeText

document.addEventListener('DOMContentLoaded', ()=>{
    const searchDiv = document.querySelector('.searchDiv')
    const tr = document.querySelector('.search')

    if(searchDiv && tr)
    tr.addEventListener('click', ()=>{
        if(searchDiv){
            searchDiv.classList.toggle('seen')
            searchDiv.classList.toggle('none')
        }
    })
    if(searchDiv)

    searchDiv.querySelector('.closeSearch').addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
    
        searchDiv.classList.toggle('seen');
        searchDiv.classList.toggle('none');
    
        params.delete('action');
    
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    
        window.history.pushState({}, '', newUrl);
    });
    
    if(searchDiv){
    const q = searchDiv.querySelector('#query')
    if(q){
    const qbtn = searchDiv.querySelector('#searchBtn')
    q.addEventListener('keydown', (e)=>{
        if(e.key== 'Enter'){
            if(q.value && q.value != ''){

                window.location.href = `/search/?q=${q.value.trim()}`
            } else if(q.value.trim() == ''){
                alert('Empty Search Item', 'error')
            }
        }
    })
    qbtn.addEventListener('click',()=>{
        if(q.value && q.value != ''){

            window.location.href = `/search/?q=${q.value.trim()}`
        } else if(q.value.trim() == ''){
            alert('Empty Search Item', 'error')
        }
    })
}
    }
})
setInterval(() => {
const params = new URLSearchParams(window.location.search)
const search = params.get('action')
if(search){
    const sd = document.querySelector('.searchDiv')
    setTimeout(() => {
         sd.classList.remove('none')
    sd.classList.add('seen')   
    }, 1000);

}
}, 1000);


function alert(text, type = 'info') {
    const div = document.createElement('div');
    div.classList.add('toast', type, 'seen');
    let msg = String(text).toLowerCase();

    if (
      msg.includes('unexpected') || 
      msg.includes('syntax') || 
      msg.includes('traceback') ||
      msg.includes('internal')
    ) {
      text = 'Server not yet configured, please contact support';
    }

    
    div.textContent = text;
    
      div.textContent = text;
      
    document.body.appendChild(div);

    setTimeout(() => {
      div.classList.remove('seen');
      div.classList.add('removing');
      setTimeout(() => div.remove(), 500);
    }, 5000);
  }

  function formatTime(rtime){
    const time = new Date(rtime);
    const options = {
      weekday: 'long', 
      hour: '2-digit',
      day: 'numeric', 
      month:'short',
      minute:'2-digit'  
    };
    return  time.toLocaleString(undefined, options);
}
window.formatTime = formatTime

function formatTimehD(rtime){
    const time = new Date(rtime);
    const options = {
      hour: '2-digit',
      day: 'numeric',
      month:'short',
      minute:'2-digit' ,
      year:'numeric' 
    };
    return  time.toLocaleString(undefined, options);
}
window.formatTimehD = formatTimehD
  window.alert = alert


  document.addEventListener('DOMContentLoaded', ()=>{
    const ps = new URLSearchParams(window.location.search)
    const app = ps.get('app_mode')
    showLoader()
    if(app == 'True'){
      localStorage.setItem('app_mode', true)
      const hd = document.querySelector('.header')
      const sdd = hd.querySelector('.searchDiv')
       hd.append(sdd)
      const ft = document.querySelector('.footer')
      ft.style.display= 'none'
    } else{
        if(app == 'False'){
            localStorage.removeItem('app_mode')
        }
      const s_app = localStorage.getItem('app_mode')
      if(s_app){
        showLoader()
        const hd = document.querySelector('.header')
        const sdd = hd.querySelector('.searchDiv')
        hd.append(sdd)
        const ft = document.querySelector('.footer')
        ft.style.display= 'none'
        setTimeout(() => {
        const iframes = document.querySelectorAll('iframe')
        console.clear()
        console.table(iframes)
        iframes.forEach(i=>{
          i.setAttribute('style','display:none')
        })
      }, 0.0001);

      }
    }
    hideLoader()
  })