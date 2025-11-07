document.addEventListener('DOMContentLoaded', ()=>{
    const lNews = document.querySelector('.newsDiv')
    const mRead = document.querySelector('.mostRead')
    const trending = document.querySelector('.trending')


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
                        div.innerHTML = `
                        <div class="image"><img src="/assets/images/2a4b65c860.jpg" alt="" srcset=""></div>
                        <div class="details">
                            <div class="title"><b>
                               ${n.title}
                            </b></div>
                            <div class="context">
                                ${parseMarkdown(n.content)}...
                            </div>
                        </div>`
                        const previewText = safeText(n.content).slice(0, 70) + "..."
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
                            <div class="image"><img src="/assets/images/2a4b65c860.jpg" alt="" srcset=""></div>
                            <div class="details">
                                <div class="title"><b>
                                   ${n.title}
                                </b></div>
                                <div class="context">
                                    ${parseMarkdown(n.content)}...
                                </div>
                            </div>`
                            const previewText = safeText(n.content).slice(0, 70) + "..."
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
                trending.innerHTML = ''

                if(news){
                    news.forEach(n => {
                        const div = document.createElement('div')
                        const a = document.createElement('a')     
                        a.setAttribute('href', `/open/?s=${n.slug}`)
                        a.classList.add('n-link')                   
                        div.classList.add('-news')
                        div.innerHTML = `
                        <div class="image"><img src="/assets/images/2a4b65c860.jpg" alt="" srcset=""></div>
                        <div class="details">
                            <div class="title"><b>
                               ${n.title}
                            </b></div>
                            <div class="context">
                                ${parseMarkdown(n.content)}...
                            </div>
                        </div>`
                        const previewText = safeText(n.content).slice(0, 70) + "..."
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