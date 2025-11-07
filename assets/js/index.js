document.addEventListener('DOMContentLoaded', ()=>{
    const lNews = document.querySelector('.newsDiv')
    const mRead = document.querySelector('.mostRead')
    const trending = document.querySelector('.trending')

    function timeAgo(date){
        const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    
        const intervals = [
            { label: 'yr', secs: 31536000 },
            { label: 'mon', secs: 2592000 },
            { label: 'wk', secs: 604800 },
            { label: 'd', secs: 86400 },
            { label: 'hr', secs: 3600 },
            { label: 'min', secs: 60 },
            { label: 'sec', secs: 1 }
        ]
    
        for (const i of intervals){
            const count = Math.floor(seconds / i.secs)
            if (count > 0){
                return `${count} ${i.label}${count > 1 ? 's' : ''} ago`
            }
        }
        return 'just now'
    }

    
    function fetchLatestNews(){
        // showLoader()
        fetch(`${baseUrl}/get_news`)
        .then(res=>res.json())
        .then(data=>{
            if(data.error){
                showMessage(data.error, 'error')
            } else{
                const news = data.news
                lNews.innerHTML = '<h2>Latest News</h2> <hr>'

                if(news){
                    news.forEach(n => {
                        const div = document.createElement('div')
                        const a = document.createElement('a')     
                        a.setAttribute('href', `/open/?s=${n.slug}`)
                        a.classList.add('n-link')                   
                        div.classList.add('-news')
                        const ft = timeAgo(n.added)
                        div.innerHTML = `
                        <div class="image"><img src="${n.image_url ? n.image_url : '/assets/images/logo.jpg'}" alt="${n.title} Image" srcset=""></div>
                        <div class="details">
                            <div class="title"><b>
                               ${n.title.length > 50 ? n.title.slice(0, 100) + "..." : n.title}
                            </b></div>
                            <div class="context">
                                ${parseMarkdown(n.content)}
                            </div>
                            <div class="dets">
                            <div class="time">
                             <i class="fas fa-clock"></i>
                             <span> ${ft} </span> 
                             </div>
                            <div class="category" tooltip="Category">
                              <i class="fas fa-tags"></i>
                              <span> ${n.categ ? n.categ : 'Unknown'}</span>
                            </div>
                            <div class="verified" tooltip="Verified">
                              <i class="fas fa-check-circle" style="color:blue;"></i>
                            </div>
                            
                            </div>

                        </div>`
                        const previewText = safeText(n.content).slice(0,60) + "..."
                         div.querySelector('.context').textContent = previewText

                        a.append(div)
                        lNews.appendChild(a)
                    });
                 hideLoader()
                }
            }
        })
    }
    function appendMostV(a, type){
        if(a){
            const parent = document.querySelector('.featured')
            const div = document.createElement('div')
            div.classList.add('featured-news')
            div.innerHTML = `
            <div class="ft-imgDiv">
            <div class="type">${type.replace('_',' ')}</div>
                <img id="ft-img" src="${a.image_url ? a.image_url  : '/assets/images/logo.jpg'} "  alt="">
            </div>
            <div class="article-data">
            <div class="article-title">
                ${a.title.length > 100 ? a.title.slice(0, 100) + '...' : a.title}
            </div>
            </div>
            `
            parent.appendChild(div)
        }
    }
    function fetchMostRead(){
        // showLoader()
        fetch(`${baseUrl}/most_read`)
        .then(res=>res.json())
        .then(data=>{
            if(data.error){
                showMessage(data.error, 'error')
            } else{
                const news = data.news
                const p1 = data.news[0]
                appendMostV(p1, 'Most_Read')
                if(news){
                        mRead.innerHTML = '<h2>Most Read</h2>  <hr>'
                        news.forEach(n => {
                            const div = document.createElement('div')
                            const a = document.createElement('a')     
                            a.setAttribute('href', `/open/?s=${n.slug}`)
                            a.classList.add('n-link')                   
                            div.classList.add('-news')
                            div.innerHTML = `
                           <div class="image"><img src="${n.image_url ? n.image_url : '/assets/images/logo.jpg'}" alt="${n.title} Image" srcset=""></div>
                            <div class="details">
                                <div class="title"><b>
                                ${n.title.length > 50 ? n.title.slice(0, 50) + "..." : n.title}                                </b></div>
                                <div class="context">
                                    ${parseMarkdown(n.content)}...
                                </div>
                             <div class="dets">
                            <div class="time"> 
                            <i class="fas fa-clock"></i>
                            <span> ${timeAgo(n.added)}</span>
                            </div>
                            <div class="category" tooltip="Category">
                              <i class="fas fa-tags"></i>
                              <span> ${n.categ ? n.categ : 'Unknown'}</span>
                            </div>
                            <div class="verified" tooltip="Verified">
                              <i class="fas fa-check-circle" style="color:blue;"></i>
                            </div>
                            
                            </div>
                            </div>`
                            const previewText = safeText(n.content).slice(0, 60) + "..."
                             div.querySelector('.context').textContent = previewText
    
                            a.append(div)
                            mRead.appendChild(a)
                        });
                        hideLoader()
                }
            }
        })
    }
    function fetchTrending(){
        // showLoader()
        fetch(`${baseUrl}/trending`)
        .then(res=>res.json())
        .then(data=>{
            if(data.error){
                showMessage(data.error, 'error')
            } else{
                const news = data.news
                const t1 = data.news[0]
                appendMostV(t1, 'Trending')
                trending.innerHTML = `
               <h2>Trending</h2>  <hr>
                `

                if(news){
                    news.forEach(n => {
                        const div = document.createElement('div')
                        const a = document.createElement('a')     
                        a.setAttribute('href', `/open/?s=${n.slug}`)
                        a.classList.add('n-link')                   
                        div.classList.add('-news')

                        div.innerHTML = `
                        <div class="image"><img src="${n.image_url ? n.image_url : '/assets/images/logo.jpg'}" alt="${n.title} Image" srcset=""></div>
                        <div class="details">
                          <div class="title"><b>
                              ${n.title.length > 50 ? n.title.slice(0, 70) + "..." : n.title}
                            </b></div>
                          <div class="context">
                            ${parseMarkdown(n.content)}...
                          </div>
                          <div class="dets">
                            <div class="time"> <i class="fas fa-clock"></i> ${timeAgo(n.added)}</div>
                            <div class="category" tooltip="Category">
                              <i class="fas fa-tags"></i>
                              <span> ${n.categ ? n.categ : 'Unknown'}</span>
                            </div>
                            <div class="verified" tooltip="Verified">
                              <i class="fas fa-check-circle" style="color:blue;"></i>
                            </div>
                          </div>
                        </div>
                        `
                        const previewText = safeText(n.content).slice(0, 60) + "..."
                         div.querySelector('.context').textContent = previewText

                        a.append(div)
                        trending.appendChild(a)
                    });
                    hideLoader()
                }
            }
        })
    }
    fetchLatestNews()
    fetchMostRead()
    fetchTrending()
})