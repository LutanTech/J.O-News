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
    tr.addEventListener('click', ()=>{
        if(searchDiv){
            searchDiv.classList.toggle('seen')
            searchDiv.classList.toggle('none')
        }
    })
    searchDiv.querySelector('.closeSearch').addEventListener('click', ()=>{
        searchDiv.classList.toggle('seen')
        searchDiv.classList.toggle('none')
    })
    const q = searchDiv.querySelector('#query')
    const qbtn = searchDiv.querySelector('#searchBtn')
    qbtn.addEventListener('click',()=>{
        if(q.value && q.value != ''){
            window.location.href = `/search/?q=${q.value.trim()}`
        } else if(q.value.trim() == ''){
            alert('Empty Search Item')
        }
    })
})