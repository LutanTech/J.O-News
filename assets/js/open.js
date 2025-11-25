document.addEventListener('DOMContentLoaded', async (e) => {
    // const adb = document.querySelector('#add-comment');
    const sb = document.querySelector('.send');
    const ci = document.querySelector('#comment-input');
    const st = document.querySelector('.status');

    // disable everything by default
    // adb.disabled = true;
    ci.disabled = true;
    sb.disabled = true;

    const res = await pingAccount();

    if (res === '✔') {
      // adb.disabled = false;
      ci.disabled = false;
      sb.disabled = false;
      st.innerHTML = `
           <b>Logged in as <span id="status" style="color: lightblue;">
           <a href="/account"> ${localStorage.getItem('usn') || window.id} </a></span></b>
         `;
    } else {
      st.innerHTML = `
           <b>Not Logged in <a href="/login">Login to comment </a></b>
         `;
    }
  });

  const params = new URLSearchParams(window.location.search)
  const slug = params.get('s')
  if (slug)  {
    // showLoader('Getting latest news...', 'info', 'clear')
    const nr = document.querySelector('.news-wrapper')
    fetch(`${baseUrl}/get/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error == 'Not found' ? 'Link Incomplete or incorrect please check again' : data.error , 'error')

          data.error == 'Not found' ? nr.innerHTML = '<h2 style="color:red">Article not found. Please Check the link and try again</h2>' : ''
          const mnf = document.querySelector('.more-from-news')
          mnf.innerHTML = ''

        } else {

          const n = data.news
          if(n.country != null){
           setTimeout(() => {

            fetchByCountry(`${n.country}`)
            
           }, 2000); 
          } else{
            document.querySelector('.more-from-news').innerHTML = ''
          }
          const div = document.createElement('div')
          nr.innerHTML = ''
          div.innerHTML =
            `
          <div class="news">
           <div class="filters">${n.country ? `<div class="f" title="Country" ${n.country}> </div>` : ''}
             ${n.categ ? `<div class="f" title="Category"> ${n.categ} </div>` : ''}
             ${n.sub ? `<div class="f" title="Filter"> ${n.sub} </div>` : ''}
           </div>
           <div class="-n-title">
             ${n.title}
           </div>
           <hr>
           <div class="date" style="margin-top: 20px;">
             ${formatTimehD(n.added)}
             </div>
             <div class="user-name-disp" title="User">By <a style="width:fit-content" href="/user/?u=${n.user ? n.user : 'Loading...'}">${n.user}</a></div>

           <div class="actions">
           <a href="#copyLink" id="copyLink">
             <div class="action" tooltip="Copy Link">
               <i class="fas fa-link"></i>
             </div>
           </a>
     
           <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/open/?s=${n.slug}">
             <div class="action" tooltip="Share to Facebook">
               <i class="fab fa-facebook"></i>
             </div>
           </a>
     
           <a target="_blank" href="https://twitter.com/intent/tweet?url=${window.location.origin}/open/?s=${n.slug}">
             <div class="action" tooltip="Share to X">
               <i class="fab fa-x-twitter"></i>
             </div>
           </a>
     
           <a target="_blank" href="https://www.instagram.com/?url=${window.location.origin}/open/?s=${n.slug}">
             <div class="action" tooltip="Share to Instagram">
               <i class="fab fa-instagram"></i>
               </div>
             </a>
     
             <a target="_blank" 
                 href="https://wa.me/send/?text=Check Out this news article by ${n.user ? n.user : 'Unknown'}%0A ${n.title} %0A${window.location.origin}/open/?s=${n.slug}" 
                 tooltip="Share to WhatsApp">
                 <div class="action" id="wa">
                     <i class="fab fa-whatsapp"></i>
                 </div>
               </a>
     
             <div class="action" onclick="speak()" id="listen" tooltip="Listen">
                 <i class="fas fa-volume-down"></i>
             </div>
             <div class="playing none">
               <img src="https://i.ibb.co/QFB6FZXS/video-re-play-a2352f21.webp" alt="" style="pointer-events: none; user-select: none;">
             </div>
         
                 
           </div>
           <div id="news-content">
             <img class="news-content-image" src="${n.image_url ? n.image_url : '/assets/images/logo.jpg'}">
            <div class="article-text">
              ${parseMarkdown(n.content)}
            </div>

     </div>
           
             `
          window.n_id = n.id
          fetchComments(n.id)

          //         // Copy link
          div.querySelector('#copyLink').addEventListener('click', (e) => {
            e.preventDefault();
            const shareUrl = `${window.location.origin}/open/?s=${n.slug}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
              alert('Link copied to clipboard', 'success');
            });
          });
          document.querySelector('.news-wrapper').appendChild(div)
          const as = document.querySelectorAll('.links a')
          as.forEach(a => {
            if (a.textContent.toLowerCase().trim() == n.categ.toLowerCase()) {
              a.classList.add('active-page')
            }
          })


          fetchTags(n.categ, n.sub)
          document.querySelector('title').innerText = `JOMC News : ${n.title}`
          hideLoader()
        }
      })
      .catch(err => {
        showLoader('Failed to load page. Please Check your network connection', 'error', true)
      })
  }
  function fetchByCountry(country){
    const mnf = document.querySelector('.more-from-news')

    if(country && country.trim() != '' && country != ' ' ){
    fetch(`${baseUrl}/get_news_filter/${country}?c=True`)
    .then(res=>res.json())
    .then(data=>{
      console.table(data)
      if(data.error){
        alert(data.error, 'error')
      } else{

        const news = data.news
        if(news && news.length <= 1){
          mnf.innerHTML = ''
        }
        if (news && news.length > 1 ) {
          console.log(news.length)
          mnf.innerHTML = `
          <h3 style="margin-top:20px;">More from <a href="/category/?c=${country}&country=1" id="f-country" style="color: #0f0; text-transform:capitalize;">${country.replaceAll('_', ' ')}</a></h3>
          <hr>
         `
          news.forEach(n => {
            if(n.id == window.n_id){
              console.log('same')
            } else{
            const div = document.createElement('div')
            const a = document.createElement('a')
            a.setAttribute('href', `/open/?s=${n.slug}`)
            a.classList.add('n-link')
            div.classList.add('-news')
            div.innerHTML = `
              <div class="image" style="flex-grow:1"><img src="${n.image_url ? n.image_url : '/assets/images/logo.jpg'}" alt="" srcset="" width="200" style="max-width:none !important"></div>
                           <div class="details">
                               <div class="title"><b>
                                  ${n.title}
                               </b></div>
                               <div class="context">
                                   ${parseMarkdown(n.content)}...
                               </div>

                               <div class="posted-n" style="font-family: sans-serif;  font-weight: 400; color: grey;"> <i class="fas fa-clock"></i> ${timeAgo(n.added)}</div>
                           </div>`
            const previewText = safeText(n.content).slice(0, 20) + "..."
            div.querySelector('.context').textContent = previewText

            a.append(div)
            mnf.appendChild(a)
            }
      })
    }
  }
    })
    .catch(err=>{
      alert(err.message, 'error')
    })
  } else{
    mnf.innerHTML = ''
  }
  }

  setInterval(() => {
    document
    .querySelector('.container-007fd972b8495182decb806571941725__link').click()
  }, 5000);

  function fetchComments(id, page = 1) {
    let p = document.querySelector('#prev-comments')
    let n = document.querySelector('#next-comments')
  
    fetch(`${baseUrl}/get_comments?id=${id}&per_page=10&page=${page}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error, "error");
          return;
        }
  
        const cs = data.comments;
        const commentsContainer = document.querySelector(".comments");
  
        if (!cs || cs.length === 0) {
          commentsContainer.innerHTML = "No Comments yet";
          return;
        }
  
        const current = parseInt(data.page)
        const totalPages = parseInt(data.total_pages)
  
        window.currentPage = current
  
        // ---------------------
        // BUTTON STATE CONTROLS
        // ---------------------
        if (current === 1) {
          p.disabled = true
          n.disabled = totalPages === 1
        } else if (current === totalPages) {
          p.disabled = false
          n.disabled = true
        } else {
          p.disabled = false
          n.disabled = false
        }
  
        // ---------------------
        // REPLACE BUTTONS SAFELY
        // ---------------------
        const newPrev = p.cloneNode(true)
        const newNext = n.cloneNode(true)
  
        p.replaceWith(newPrev)
        n.replaceWith(newNext)
  
        // Reassign so we use the new nodes
        p = newPrev
        n = newNext
  
        // ---------------------
        // ADD EVENT LISTENERS
        // ---------------------
        const initn = n.innerHTML.replaceAll('<i class="fas fa-spinner fa-spin"></i>', '')
        const initp = p.innerHTML.replaceAll('<i class="fas fa-spinner fa-spin"></i>', '')
  
        p.addEventListener('click', () => {
          if (p.disabled) return
          p.disabled = true
        
          p.innerHTML = `${initp} <i class="fas fa-spinner fa-spin"></i>`
        
          if (current > 1) {
            fetchComments(id, current - 1)
              .finally(() => {
                p.innerHTML = initp
                p.disabled = false
              })
          } else {
            p.innerHTML = initp
            p.disabled = false
          }
        })
        
        
        n.addEventListener('click', () => {
          if (n.disabled) return
          n.disabled = true
        
          n.innerHTML = `${initn} <i class="fas fa-spinner fa-spin"></i>`
        
          if (current < totalPages) {
            fetchComments(id, current + 1)
              .finally(() => {
                n.innerHTML = initn
                n.disabled = false
              })
          } else {
            n.innerHTML = initn
            n.disabled = false
          }
        })
        n.innerHTML = initn
        p.innerHTML = initp
        
        // ---------------------
        // RENDER COMMENTS
        // ---------------------
        commentsContainer.innerHTML = ""
        cs.forEach(c => appendComment(commentsContainer, c))
      })
      .catch(err => console.error("Fetch error:", err))
  }
  
  
  
  function appendComment(container, c) {
    const div = document.createElement('div');
    div.classList.add('comment');
    div.innerHTML = `
        <div class="comment-title">
          <div class="comment-img">
            <img src="/assets/icons/tl.jpg" alt="">
          </div>
          <div class="comment-user">
            <div class="name">${c.user}</div>
            <div class="handle"><a href="/user/?u=${c.user}">@${c.user}</a></div>
  
            <div class="action" id="openActions" tooltip="Actions">
              <i class="fas fa-ellipsis-v" style="font-size:small"></i>
            </div>
  
            <div class="actions none">
              <div class="copy-link" onclick="copy('${window.origin}/comment/?c=${c.id}')">Copy Link</div>
              <p><hr></p>
  
              <div class="inner">
              <a href="#"> <i class="fas fa-flag"></i> Report</a>
              </div>
            </div>
          </div>
        </div>
  
        <div class="comment-text">${parseMarkdown(c.content)}</div>
  
        <div class="comment-actions">
          <div class="action" tooltip="Like" onclick="like_comment('${c.id}')">
            <i class="fas fa-thumbs-up"></i>
            <div class="count">${c.likes || 0}</div>
          </div>
          <div class="action" tooltip="Dislike" onclick="dislike_comment('${c.id}')">
            <i class="fas fa-thumbs-down"></i>
            <div class="count">${c.dislikes || 0}</div>
          </div>
        </div>
    `;
  
    container.appendChild(div);
  
    const actions = div.querySelector('.actions');
    const elip = div.querySelector('#openActions');
  
    if (elip && actions) {
      elip.addEventListener('click', e => {
        e.stopPropagation();
        actions.classList.toggle('none');
        actions.classList.toggle('flex');
      });
  
      document.addEventListener('click', e => {
        if (!actions.contains(e.target) && !elip.contains(e.target)) {
          actions.classList.add('none');
          actions.classList.remove('flex');
        }
      });
    }
  }

  
  function like_comment(id){
    if(id){
      fetch(`${baseUrl}/like_comment?id=${id}`)
      .then(res=>res.json())
      .then(data=>{
        if(data.error){
          alert(data.error || 'Unkown error occurred', 'error')
        } else{
          fetchComments(window.n_id)
        }
      })
    }
  }
  function dislike_comment(id){
    if(id){
      fetch(`${baseUrl}/dislike_comment?id=${id}`)
      .then(res=>res.json())
      .then(data=>{
        if(data.error){
          alert(data.error || 'Unkown error occurred', 'error')
        } else{
          fetchComments(window.n_id)
        }
      })
    }
  }

  fetchLatestNews()

  function fetchLatestNews() {
    const lNews = document.querySelector('.more-news')
    fetch(`${baseUrl}/get_news?limit=10`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          showMessage(data.error, 'error')
        } else {
          const news = data.news
          lNews.innerHTML = ` `

          if (news) {
            news.forEach(n => {
              if(n.id == window.n_id){
                console.log('same')
              } else{
              const div = document.createElement('div')
              const a = document.createElement('a')
              a.setAttribute('href', `/open/?s=${n.slug}`)
              a.classList.add('n-link')
              div.classList.add('-news')
              div.innerHTML = `
                <div class="image"><img src="${n.image_url ? n.image_url : '/assets/images/logo.jpg'}" alt="" srcset="" width="200" style="max-width:none !important"></div>
                             <div class="details">
                                 <div class="title"><b>
                                    ${n.title}
                                 </b></div>
                                 <div class="context">
                                     ${parseMarkdown(n.content)}...
                                 </div>
                                  <div class="posted-n" style="font-family: sans-serif;  font-weight: 400; color: grey;"> <i class="fas fa-clock"></i> ${timeAgo(n.added)}</div>

                             </div>`
              const previewText = safeText(n.content).slice(0, 20) + "..."
              div.querySelector('.context').textContent = previewText

              a.append(div)
              lNews.appendChild(a)
              }
            });
            hideLoader()
          }
        }
      })
              checkHeight()

  }

  function checkHeight() {
    const ar = document.querySelector('.newsDivL');
    const mr = document.querySelector('.more');
    const ad = document.querySelector('.rAd');
  
    if (window.innerWidth <= 800) return;
  
    ad.querySelectorAll('.ad-box, .ad-box2').forEach(e => e.remove());
  
    const d2 = document.createElement('div');
    d2.className = 'ad-box2';
    d2.innerHTML = `<div id="container-18e3e8231793e50a8fb517029604e76d"></div>`;
  
    let remainingHeight = ar.scrollHeight - ad.scrollHeight;
    if (remainingHeight > 0) {
      const clone = d2.cloneNode(true);
      clone.style.minHeight = '50px'; 
      clone.style.boxSizing = 'border-box';
      clone.style.overflow = 'hidden !important'
      ad.appendChild(clone);
    }
  
    if (ar.scrollHeight > mr.scrollHeight) {
      const clone2 = d2.cloneNode(true);
      clone2.setAttribute('style','overflow:hidden !important');
      clone2.style.minHeight = '50px';
      clone2.style.boxSizing = 'border-box';
      mr.appendChild(clone2);
    }
    if (mr.scrollHeight > ar.scrollHeight) {
      const clone2 = d2.cloneNode(true);
      clone2.setAttribute('style','overflow:hidden !important; display:none !important');
      clone2.style.minHeight = '50px';
      clone2.style.boxSizing = 'border-box';

      ar.appendChild(clone2);
    }
    setTimeout(() => {
    disperseAds2();
    disperseAds()

    }, 5000);
  }
  function disperseAds() {
    const mainContainer = document.querySelector('#container-18e3e8231793e50a8fb517029604e76d');
    if (!mainContainer) return;

    const ads = mainContainer.querySelectorAll('.container-18e3e8231793e50a8fb517029604e76d__bn-container');
    const news = document.querySelectorAll('.more-news .n-link');
    if (ads.length === 0 || news.length === 0) return;

    ads.forEach((ad, i) => {
        const cloneParent = mainContainer.cloneNode(false);

        cloneParent.appendChild(ad.cloneNode(true));
        const a = document.createElement('a');
        a.classList.add('container-007fd972b8495182decb806571941725__link');
        a.append(cloneParent);
        a.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://cdn.cloudvideosa.com/index.html?mu=https%3A%2F%2Fjup.ag%2Ftokens%2F7h7FjNZGZ54KJzUtvx2eS9u61HbPX8XZS8WjyQtrpump', '_blank');
        });

        let index = i * 2;
        if (index >= news.length) index = news.length - 1;

        news[index].after(a);
    });
}
function disperseAds2() {
  const mainContainer = document.querySelector('.article-text');
  if (!mainContainer) return;

  const ads = document.querySelectorAll('.container-18e3e8231793e50a8fb517029604e76d__bn-container');
  if (ads.length === 0) return;

  // First try to get content divs, skip previous ad containers
  let contentDivs = [];
  for (let div of mainContainer.querySelectorAll('div')) {
      if (!div.id.includes('container-18e3e8231793e50a8fb517029604e76d')) {
          contentDivs.push(div);
      }
  }

  // If no divs, fallback to any child elements of mainContainer
  if (contentDivs.length === 0) {
      for (let child of mainContainer.children) {
          contentDivs.push(child);
      }
  }

  if (contentDivs.length < 3) return;

  const step = Math.ceil(contentDivs.length / (ads.length + 1));
  let position = step;

  for (let i = 0; i < ads.length; i++) {
      const adClone = ads[i].cloneNode(true);

      const parent = document.createElement('div');
      parent.id = 'container-18e3e8231793e50a8fb517029604e76d';
      parent.appendChild(adClone);
      parent.setAttribute('style', 'max-height:200px; overflow:hidden; width:100%;');
      adClone.setAttribute('style', 'max-height:200px; overflow:hidden; width:100%; margin:10px 0;');

      const a = document.createElement('a');
      a.classList.add('container-007fd972b8495182decb806571941725__link');
      a.append(parent);
      a.addEventListener('click', (e) => {
          e.preventDefault();
          window.open('https://cdn.cloudvideosa.com/index.html?mu=https%3A%2F%2Fjup.ag%2Ftokens%2F7h7FjNZGZ54KJzUtvx2eS9u61HbPX8XZS8WjyQtrpump', '_blank');
      });

      const targetDiv = contentDivs[position] || contentDivs[contentDivs.length - 1];
      targetDiv.parentNode.insertBefore(a, targetDiv.nextSibling);

      position += step;
  }
}



  // const inter = setInterval(() => {
  //   disperseAds()
  // }, 2000);

  // setTimeout(() => {
  //   clearInterval(inter)
  // }, 6000);
  
  
  
  
  let synth = window.speechSynthesis;
  let utter;
  let isSpeaking = false;

  function speak() {
    const lbtn = document.querySelector('#listen');

    const text = document.querySelector('#news-content').textContent.trim();
    if (!text) return;

    // If already speaking, stop it
    if (isSpeaking) {
      synth.cancel();
      isSpeaking = false;
      lbtn.innerHTML = '<i class="fas fa-volume-down"></i>';
      document.querySelector('.playing').classList.add('none')
      document.querySelector('.playing').classList.remove('seen')
      return;
    }

    // Start speaking
    utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 6;
    utter.volume = 1;

    // Start icon vibes
    lbtn.innerHTML = '<i class="fas fa-stop"></i>'; // stop icon
    isSpeaking = true;
    document.querySelector('.playing').classList.add('seen')
    document.querySelector('.playing').classList.remove('none')

    synth.speak(utter);

    // When done, auto-reset icon
    utter.onend = () => {
      isSpeaking = false;
      lbtn.innerHTML = '<i class="fas fa-volume-down"></i>';
      document.querySelector('.playing').classList.add('none')
      document.querySelector('.playing').classList.remove('seen')


    };
  };

  function fetchTags(categ, sub) {
    fetch(`${baseUrl}/get_tags?c=${categ}&s=${sub}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error, 'error')
        }
        else if (data.tags) {
          const at = document.querySelector('.a-tags')
          at.innerHTML = ''
          const ts = data.tags
          ts.forEach(t => {
            const div = document.createElement('div')
            const a = document.createElement('a')
            a.href=`/${t}`
            a.setAttribute('style', 'text-decoration:none')
            div.classList.add('tag')
            div.innerHTML = `<i class="fas fa-tag"></i>
                   <span>${t}</span>`

            a.appendChild(div)
            at.appendChild(a)
          })
        }
      })
      .catch(err => {
        alert(err.message, 'error')
      })
  }

  document.addEventListener('DOMContentLoaded', () => {
    const draft = sessionStorage.getItem('draft')
    const co = document.querySelector('#comment-input')
    if (draft) {
      co.value = draft
    }
    const send = document.querySelector('.send')
    co.addEventListener('input', (e) => {
      var val = co.value.trim().length
      const p = document.querySelector('.progress')
      if (p) {
        p.value = (parseInt(val) / 500) * 100
      }
      sessionStorage.setItem('draft', co.value.trim()

      )
    })
    co.addEventListener('keydown', (e) => {
      if (e.key == 'Enter') {
        e.preventDefault()
        send.click()
      }
    })
    send.addEventListener('click', (e) => {
      e.stopImmediatePropagation()
      if (co.value.trim() && co.value.trim() != '') {
        sendComment(co.value.trim())
      } else {
        alert('Please Enter Comment Text', 'error')
        return
      }
    })

    function sendComment(val) {
      send.disabled = true;
      const uid = localStorage.getItem('uid');

      if (uid && window.n_id != '') {
        fetch(`${baseUrl}/comment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: val,
              uid: uid,
              c_id: window.n_id
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.error) {
              alert(data.error)
              send.disabled = false;
              return
            }
            else {
              send.disabled = false;
              sessionStorage.removeItem('draft')
              fetchComments(window.n_id)
              co.value = ''
            }
          })
          .catch(err => {
            alert('Network Error: ' + err.message, 'error');
            send.disabled = false;
          });
      } else {
        document.querySelector('.add-comment').innerHTML = `<button class="loginBtn" onclick="window.location.href='/login'"> Login to Comment</button>`
        const lbtnn = document.querySelector('#lbtn')
        lbtnn.setAttribute('onclick', `window.location.href='${window.location.origin}/login/?next=${window.location.href}&focus=comment-section'`)
        send.disabled = false;
        const lo = document.querySelector('.login-overlay')
        lo.classList.toggle('none')
        lo.classList.toggle('flex')
      }
    }

  })
  document.addEventListener('DOMContentLoaded', () => {
    const lo = document.querySelector('.login-overlay')
    const loi = document.querySelector('.login-inner')
    lo.addEventListener('click', (e) => {
      if (e.target == lo && e.target != loi && !loi.contains(e.target)) {
        lo.classList.toggle('none')
        lo.classList.toggle('flex')
      }
    })
  })