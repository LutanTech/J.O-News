document.addEventListener('DOMContentLoaded', () => {
    const from = document.querySelector('#from');
    const to = document.querySelector('#to');
    const category = document.querySelector('#category');
    const applyBtn = document.querySelector('#applyFiltersBtn');
    window.id = localStorage.getItem('uid')
    window.token = localStorage.getItem('token')
   if(!window.id || !window.token){
    alert('Please Login again', 'info')
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000);
   }


  const baseUrl = window.baseUrl;

  const formatDate = (d) => d.toISOString().slice(0, 10);

  // today
  const today = new Date();
  today.setHours(0,0,0,0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // max range 3 months (90 days)
  const MAX_RANGE = 90;

  // default: last 7 days
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  from.value = formatDate(oneWeekAgo);
  to.value = formatDate(today);


  function validateFrom() {
    if (!from.value) return;

    let fDate = new Date(from.value);

    // from cannot be today or future
    if (fDate >= today) {
      from.value = formatDate(yesterday);
      fDate = yesterday;
    }

    // if to < from, fix it
    if (to.value) {
      let tDate = new Date(to.value);
      if (tDate < fDate) {
        to.value = formatDate(fDate);
      }
    }

    // enforce max 3 months
    if (to.value) {
      let tDate = new Date(to.value);
      let diffDays = (tDate - fDate) / (1000 * 60 * 60 * 24);

      if (diffDays > MAX_RANGE) {
        let newFrom = new Date(tDate);
        newFrom.setDate(newFrom.getDate() - MAX_RANGE);
        from.value = formatDate(newFrom);
      }
    }
  }


  function validateTo() {
    if (!to.value) return;

    let tDate = new Date(to.value);
    let now = new Date();

    // to cannot be future
    if (tDate > now) {
      to.value = formatDate(now);
      tDate = now;
    }

    // to cannot be earlier than from
    if (from.value) {
      let fDate = new Date(from.value);
      if (tDate < fDate) {
        to.value = from.value;
        tDate = fDate;
      }
    }

    // enforce max 3 months
    if (from.value) {
      let fDate = new Date(from.value);
      let diffDays = (tDate - fDate) / (1000 * 60 * 60 * 24);

      if (diffDays > MAX_RANGE) {
        let newTo = new Date(fDate);
        newTo.setDate(newTo.getDate() + MAX_RANGE);
        to.value = formatDate(newTo);
      }
    }
  }


  from.addEventListener('change', validateFrom);
  to.addEventListener('change', validateTo);


  function fetchArticles(page) {
    const f = from.value;
    const t = to.value;
    const c = category.value;

    console.log("Fetching articles:", f, t, c);

    fetch(`${baseUrl}/get_user_articles?id=${window.id}&token=${window.token}&from=${f}&to=${t}&category=${c}&page=${page || 1 }`)
      .then(res => res.json())
      .then(data => {
        dbtn(false)
        renderCategs(data.categories_summary)
        renderButtonState(data.has_prev, data.has_next)
        console.log(data.has_prev, data.has_next)
        const as = data.articles
        window.page = data.page > data.total_pages ? data.total_pages : data.page

        document.querySelector('.total').innerHTML = `<b>Total Articles:</b> ${data.count}`

        const ad = document.querySelector('.articles-div')
        ad.innerHTML = ''
        if(as.length < 1){
          ad.innerHTML = '<h4>No Posted articles in the selected parameters</h4>'
        }
        as.forEach(a => {
          const div = document.createElement('div')
          div.classList.add('user-article')
          const alink = document.createElement('a')
          alink.classList.add('art-link')
          alink.href = `${window.location.origin}/open/?s=${a.slug}`
          div.innerHTML = `
          <div class="contents">
          <div class="img">
            <img src="${a.image_url}" alt="">
          </div>
          <div class="innerContent">
          <div class="title">
            ${a.title.length > 50 ? a.title.slice(0, 50) + '...' : a.title}</div>
            <div class="text">
            </div>
            <div class="actions">
              <a href="#copyLink" id="copyLink" onclick="copy(${window.location.origin}/open/?s=${a.slug})">
                <div class="action" tooltip="Copy Link">
                  <i class="fas fa-link"></i>
                </div>
              </a>
        
              <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/open/?s=${a.slug}">
                <div class="action" tooltip="Share to Facebook">
                  <i class="fab fa-facebook"></i>
                </div>
              </a>
        
              <a target="_blank" href="https://twitter.com/intent/tweet?url=${window.location.origin}/open/?s=${a.slug}">
                <div class="action" tooltip="Share to X">
                  <i class="fab fa-x-twitter"></i>
                </div>
              </a>
        
              <a target="_blank" href="https://www.instagram.com/?url=${window.location.origin}/open/?s=${a.slug}">
                <div class="action" tooltip="Share to Instagram">
                  <i class="fab fa-instagram"></i>
                  </div>
                </a>
        
                <a target="_blank" 
                    href="https://wa.me/send/?text=Check Out this news article by ${a.user ? a.user : 'Unknown'}%0A ${a.title} %0A${window.location.origin}/open/?s=${a.slug}" 
                    tooltip="Share to WhatsApp">
                    <div class="action" id="wa">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                  </a>
            </div>
          </div>
          <span id="a-date" style="font-size:x-small"> ${formatTimehD(a.added)} </span>
          </div>
 
          `
          alink.append(div)
          ad.appendChild(alink)
          
        });
      })
      .catch(err=>{
        alert('Network error: '+ err.message, 'error')
        dbtn(false)
      })
  }
  function renderCategs(cs){
    const categs = document.querySelector('.user-categs')
    const categsSelect = document.querySelector('#category')


    categs.innerHTML = ''
         
    categsSelect.innerHTML = '<option value=""> All </option>'

    cs.forEach(c=>{
      const div = document.createElement('div')
      div.classList.add('categ')
      div.innerHTML = `
        <div class="text">${c.name}</div>
        <div class="count">${c.count}</div>`
      categs.appendChild(div)
      const op = document.createElement('option')
    op.value = c.name
    op.textContent = c.name
    categsSelect.appendChild(op)
    })
  }
// add these once
const pbtn = document.querySelector('.prev');
const nxbtn = document.querySelector('.next');

pbtn.addEventListener('click', () => {
  if (window.page > 1) {
    fetchArticles(parseInt(window.page) - 1);
  }
});

nxbtn.addEventListener('click', () => {
  if (window.page && window.hasNext) {
    fetchArticles(parseInt(window.page) + 1);
  }
});

function renderButtonState(hasPrev, hasNext) {
  pbtn.disabled = !hasPrev;
  nxbtn.disabled = !hasNext;

  window.hasNext = hasNext;
}


  // Apply filters button
  applyBtn.addEventListener('click', () => {
    if (!from.value || !to.value) {
      console.log("Select both dates please");
      return;
    }
    fetchArticles(parseInt(window.page));
    dbtn(true)
  });

  fetchArticles(1);
  dbtn(true)

});
function dbtn(loading) {
    const btn = document.getElementById('applyFiltersBtn');
  
    if (!btn) return;
  
    if (!btn.originalText) btn.originalText = btn.innerHTML; 
  
    if (loading) {
      btn.disabled = true;
      btn.innerHTML = `${btn.originalText} <i class="fas fa-spinner fa-spin"></i>`;
    } else {
      btn.disabled = false;
      btn.innerHTML = btn.originalText;
    }
  }
  