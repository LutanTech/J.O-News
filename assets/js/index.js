document.addEventListener('DOMContentLoaded', () => {


    // -------------------- Utility Functions --------------------


    fetch(`${baseUrl}/get_featured_ads`)
    .then(res=>res.json())
    .then(data=>{
        if(data.error){
            console.warn('error getting featured ads')
        } else{
            if(data.ad || data.ads)
            featured_ad = data.ad || data.ads[Math.floor(Math.random() * data.ads.length)]
            appendMostV(featured_ad, 'Ad')

        }
    })

    function appendMostV(a, type){
        console.log(a)

        if(!a) return;
        const parent = document.querySelector('.featured-divs');
        if(!parent) return;
        const div = document.createElement('div');
        if(parent.querySelectorAll('.featured').length > 1){
            checkDivs()
        }
        div.classList.add('featured-news');
        div.classList.add('featured');
        const t = type.toLowerCase().replaceAll('_', '').replaceAll(' ', '').replace('news', '')
        div.classList.add('featured-'+ t )
        if(t == 'ad' ){
            div.classList.add('active')
        }
        div.addEventListener('click', ()=>{
            if(type == 'Ad' && a.url){
                fetch(`${baseUrl}/v/${a.id}`)
                window.open(a.url, '_blank')
            } else{
             window.location.href=`/open/?s=${a.url}`
            }
             })
        div.innerHTML = `
            <div class="ft-imgDiv">
                <div class="type">${type.replace('_',' ')}</div>
                <img id="ft-img" src="${a.image_url || '/assets/images/logo.jpg'}" alt="">
            </div>
            <div class="article-data">
                <div class="article-title">
                 <span class="art-data-t">   ${a.title.length > 100 ? a.title.slice(0,100)+'...' : a.title} </span> 
                 ${type == 'Ad' ? `<a style="color:aqua" href="${a.url ? a.url : '#'}">View</a>` : `<a  style="color:aqua" href="/open/?s=${a.url ? a.url : '#'}"> Read More</a>`}
                </div>
            </div>
        `;
        parent.appendChild(div);
    }

      
    function checkDivs() {
        if (window.innerWidth < 768) { 
            const divs = document.querySelectorAll('.featured');
            let index = 0;
    
            setInterval(() => {
    
                divs.forEach(d => d.classList.remove('active'));
                divs.forEach(d => d.classList.remove('go-right'));

    
                divs[index].classList.add('active');
    
                setTimeout(() => {
                    divs[index].classList.add('go-right');
                }, 6500);
    
    
                index++;
    
                if (index === 3 ) {
                    index = 0;
                }
    
            }, 7000);
    
        }
    }
    


    function ensureAd(container, adKey){
        if(!container || !adKey) return;

        const existingScript = container.querySelector(`script[data-ad-key="${adKey}"]`);
        if(existingScript){
            return;
        }

        const adConfig = {
            '1904': { key: '1904c59afdf44e6abad72dd3e6995806', width: 320, height: 50 },
            'ec8a': { key: 'ec8ad3d9df982516c830881e448efb48', width: 320, height: 50 }
        };
        if(!adConfig[adKey]) return;

        window.atOptions = {
            key: adConfig[adKey].key,
            format: 'iframe',
            height: adConfig[adKey].height,
            width: adConfig[adKey].width,
            params: {}
        };

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `//www.highperformanceformat.com/${adConfig[adKey].key}/invoke.js`;
        script.dataset.adKey = adKey;

        script.onerror = () => console.error(`Ad script ${adKey} failed to load in ${container.id || container.className}`);

        container.appendChild(script);
    }

     const ad = document.createElement('div')
      ad.innerHTML = `
<div id="container-545445584d06c09fd1a832fa75e54619"></div>
     `


    function renderNews(container, news, adKey, type){
        if(!news || news.length === 0) return;

        appendMostV(news[0], type);
        container.innerHTML = ``;

        // random index for ad placement (never first or last)
        const adIndex = news.length > 2 ? Math.floor(Math.random() * (news.length - 2)) + 1 : 0;

        news.forEach((n, index) => {
            const div = document.createElement('div');
            const a = document.createElement('a');
            a.href = `/open/?s=${n.slug}`;
            a.classList.add('n-link');
            div.classList.add('-news');

            div.innerHTML = `
                <div class="image"><img src="${n.image_url || '/assets/images/logo.jpg'}" alt="${n.title} Image"></div>
                <div class="details">
                    <div class="title"><b>${n.title.length > 50 ? n.title.slice(0,50)+'...' : n.title}</b></div>
                    <div class="context">${parseMarkdown(n.content)}</div>
                    <div class="dets">
                        <div class="category" tooltip="Category"><i class="fas fa-tags"></i> <span>${n.categ || 'Unknown'}</span></div> |
                        <div class="time"><i class="fas fa-clock" style="font-size:xx-small;"></i> <span>${timeAgo(n.added)}</span></div> |
                        ${n.user ? `
                        <div class="user" tooltip="Publisher"><i class="fas fa-user-circle" ></i> By ${n.user.length > 6? n.user.slice(0, 5) + '...' : n.user} </div>` : ''}
                    </div>
                </div>
            `;

            div.querySelector('.context').textContent = safeText(n.content).slice(0,60)+'...';
            a.appendChild(div);
            container.appendChild(a);

            // insert ad div at random index
            if(index === adIndex){
                const adDiv = document.createElement('div');
                adDiv.id = "container-83706ba541e98f9c09f46db018571cf6";
                container.appendChild(adDiv);
                document.querySelector('.trending').appendChild(ad);
                ensureAd(adDiv, adKey);
            }
        });
        hideLoader()
    }

    // -------------------- Fetching Sections --------------------
    const sections = [
        { url: `${baseUrl}/get_news?limit=20`, container: document.querySelector('.newsWrapper'), key: '1904', type: 'Latest News' },
        { url: `${baseUrl}/most_read?limit=20`, container: document.querySelector('.mr'), key: 'ec8a', type: 'Most_Read' },
        { url: `${baseUrl}/trending?limit=20`, container: document.querySelector('.tr'), key: 'a677', type: 'Trending' }
    ];
   initNews()
   async function  initNews(){
    sections.forEach(s => {
        if(!s.container) return;
        fetch(s.url)
            .then(res => res.json())
            .then(data => {
                if(data.error){
                    console.error(data.error);
                } else {
                    renderNews(s.container, data.news, s.key, s.type);
                }
            })
            .catch(err => showLoader(`<div style="display:flex; flex-direction:column; gap:10px; justify-content:center; align-items:center">Failed to get news.<p> Make sure you have an active internet connection or contact <a style="color:blue" href="/support"> support</a> if issue persists <p></p><b title="Retry"><i  class="fas fa-refresh" onclick="window.location.reload()" style="color:black; margin:auto; font-size:2em; cursor:pointer"></i></b></div>`, 'error', 'clear'));
    });
}
    window.renderNews = renderNews
    window.timeAgo = timeAgo
});
