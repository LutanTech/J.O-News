document.addEventListener('DOMContentLoaded', ()=>{
    const lNews = document.querySelector('.newsDiv')
    const mRead = document.querySelector('.mostRead')
    const trending = document.querySelector('.trending')

    function timeAgo(date){
        const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    
        const intervals = [
            { label: 'year', secs: 31536000 },
            { label: 'month', secs: 2592000 },
            { label: 'week', secs: 604800 },
            { label: 'day', secs: 86400 },
            { label: 'hour', secs: 3600 },
            { label: 'minute', secs: 60 },
            { label: 'second', secs: 1 }
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
        showLoader()
        fetch(`${baseUrl}/get_news`)
        .then(res=>res.json())
        .then(data=>{
            if(data.error){
                showMessage(data.error, 'error')
            } else{
                const news = data.news
                lNews.innerHTML = ''

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
                               ${n.title.length > 50 ? n.title.slice(0, 50) + "..." : n.title}
                            </b></div>
                            <div class="context">
                                ${parseMarkdown(n.content)}...
                            </div>
                            <div class="dets">
                            <div class="time"> <i class="fas fa-clock"></i> ${ft}</div>
                            
                            </div>
                        </div>`
                        const previewText = safeText(n.content).slice(0, 20) + "..."
                         div.querySelector('.context').textContent = previewText

                        a.append(div)
                        lNews.appendChild(a)
                    });
                 hideLoader()
                }
            }
        })
    }
    function fetchMostRead(){
        showLoader()
        fetch(`${baseUrl}/most_read`)
        .then(res=>res.json())
        .then(data=>{
            if(data.error){
                showMessage(data.error, 'error')
            } else{
                const news = data.news
                if(news){
                        mRead.innerHTML = ''
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
                            <div class="time"> <i class="fas fa-clock"></i> ${timeAgo(n.added)}</div>
                            
                            </div>
                            </div>`
                            const previewText = safeText(n.content).slice(0, 20) + "..."
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
        showLoader()
        fetch(`${baseUrl}/trending`)
        .then(res=>res.json())
        .then(data=>{
            if(data.error){
                showMessage(data.error, 'error')
            } else{
                const news = data.news
                trending.innerHTML = `
               
                
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
                            ${n.title.length > 50 ? n.title.slice(0, 50) + "..." : n.title}
                            </b></div>
                            <div class="context">
                                ${parseMarkdown(n.content)}...
                            </div>
                            <div class="dets">
                            <div class="time"> <i class="fas fa-clock"></i> ${timeAgo(n.added)}</div>
                            
                            </div>
                        </div>`
                        const previewText = safeText(n.content).slice(0, 20) + "..."
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