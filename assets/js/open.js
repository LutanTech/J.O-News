document.addEventListener('DOMContentLoaded', async () => {
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
  if (slug) {
    // showLoader('Getting latest news...', 'info', 'clear')
    fetch(`${baseUrl}/get/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error, 'error')
        } else {

          const n = data.news
          const div = document.createElement('div')
          document.querySelector('.news-wrapper').innerHTML = ''
          div.innerHTML =
            `
               <div class="news">
           <div class="filters">
             <div class="f">${n.categ}</div>
             <div class="f">${n.sub}</div>
           </div>
           <div class="-n-title">
             ${n.title}
           </div>
           <hr>
           <div class="date" style="margin-top: 20px;">
             ${formatTimehD(n.added)}
             </div>
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

  function fetchComments(id) {
    fetch(`${baseUrl}/get_comments?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error, "error");
          return;
        }
  
        const cs = data.comments;
        const commentsContainer = document.querySelector(".comments");
        const restContainer = document.querySelector(".rest-comments");
  
        // If no comments
        if (!cs || cs.length < 1) {
          commentsContainer.innerHTML = "No Comments yet";
          restContainer.innerHTML = "";
          return;
        }
  
        // Clear both
        commentsContainer.innerHTML = "";
        restContainer.innerHTML = "";
  
        // Split comments
        const firstTen = cs.slice(0, 10);
        const theRest = cs.slice(10);
  
        // Add first 10
        firstTen.forEach(c => appendComment(commentsContainer, c));
  
        // Add the rest if any
        if (theRest.length > 0) {
          theRest.forEach(c => appendComment(restContainer, c));
        }
      })
      .catch(err => console.error("Fetch error:", err));
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
                <a href="https://wa.me/send/?text=${window.location.origin}/comment/?c=${c.id}" target="_blank">
                  <div class="share-action"><i class="fab fa-whatsapp"></i></div>
                </a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/comment/?c=${c.id}" target="_blank">
                  <div class="share-action"><i class="fab fa-facebook"></i></div>
                </a>
                <a href="https://twitter.com/intent/tweet?url=${window.location.origin}/comment/?c=${c.id}" target="_blank">
                  <div class="share-action"><i class="fab fa-x-twitter"></i></div>
                </a>
                <a href="https://www.instagram.com/?url=${window.location.origin}/comment/?c=${c.id}" target="_blank">
                  <div class="share-action"><i class="fab fa-instagram"></i></div>
                </a>
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
    const lNews = document.querySelector('.more')
    showLoader('Updating page..', 'info', 'clear')
    fetch(`${baseUrl}/get_news?limit=16`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          showMessage(data.error, 'error')
        } else {
          const news = data.news

          lNews.innerHTML = '<h3 style="margin-left:20px;">More News</h3> <hr>'

          if (news) {
            news.forEach(n => {
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
            div.classList.add('tag')
            div.innerHTML = `<i class="fas fa-tag"></i>
                   <span>${t}</span>`

            at.appendChild(div)
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