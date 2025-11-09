document.addEventListener('DOMContentLoaded', () => {


    // -------------------- Utility Functions --------------------
    function timeAgo(date){
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = [
            { label: 'yr', secs: 31536000 },
            { label: 'mon', secs: 2592000 },
            { label: 'wk', secs: 604800 },
            { label: 'd', secs: 86400 },
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

    function appendMostV(a, type){
        if(!a) return;
        const parent = document.querySelector('.featured');
        if(!parent) return;
        const div = document.createElement('div');
        div.classList.add('featured-news');
        div.addEventListener('click', ()=>{ window.location.href=`/open/?s=${a.slug}` })
        div.innerHTML = `
            <div class="ft-imgDiv">
                <div class="type">${type.replace('_',' ')}</div>
                <img id="ft-img" src="${a.image_url || '/assets/images/logo.jpg'}" alt="">
            </div>
            <div class="article-data">
                <div class="article-title">
                 <span>   ${a.title.length > 100 ? a.title.slice(0,100)+'...' : a.title} </span>
                 <marquee> ${a.content.slice(0, 100) + '...'}</marquee>
                </div>
            </div>
        `;
        parent.appendChild(div);
    }

    function ensureAd(container, adKey){
        if(!container || !adKey) return;

        const existingScript = container.querySelector(`script[data-ad-key="${adKey}"]`);
        if(existingScript){
            console.log(`Ad script ${adKey} already exists in ${container.id || container.className}`);
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

        script.onload = () => console.log(`Ad script ${adKey} loaded successfully in ${container.id || container.className}`);
        script.onerror = () => console.error(`Ad script ${adKey} failed to load in ${container.id || container.className}`);

        container.appendChild(script);
        console.log(`Ad script ${adKey} appended to ${container.id || container.className}`);
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
                        <div class="category" tooltip="Category"><i class="fas fa-tags"></i> <span>${n.categ || 'Unknown'}</span></div>
                        <div class="time"><i class="fas fa-clock"></i> <span>${timeAgo(n.added)}</span></div>

                        <div class="user" tooltip="Publisher"><i class="fas fa-user" style="color:blue;"></i> By Lutan </div>
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
    }

    // -------------------- Fetching Sections --------------------
    const sections = [
        { url: `${baseUrl}/get_news`, container: document.querySelector('.newsWrapper'), key: '1904', type: 'Latest News' },
        { url: `${baseUrl}/most_read`, container: document.querySelector('.mr'), key: 'ec8a', type: 'Most_Read' },
        { url: `${baseUrl}/trending`, container: document.querySelector('.trending'), key: 'a677', type: 'Trending' }
    ];

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
            .catch(err => console.error('Fetch error:', err));
    });

});
