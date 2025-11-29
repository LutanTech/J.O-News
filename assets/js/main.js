const mc = document.querySelector('.menu-icon')
if(mc)
mc.addEventListener('click', ()=>{
    const ls = document.querySelector('.links')
    // if(window.innerWidth < 768){
        if(ls){
            if(ls.hasAttribute('style')){
                ls.removeAttribute('style')
            } else{
                 ls.setAttribute('style', 'display:flex !important')
                 ls.classList.add('large')
                 const closeLs = document.createElement('div')
                 closeLs.classList.add('close-links')
                 closeLs.innerHTML = '&times'
                 const exists = ls.querySelector('.close-links')
                 if(exists){
                    return
                 }
                 ls.appendChild(closeLs)
                 closeLs.addEventListener('click',()=>{
                    
                    mc.click()
                 })
        // }
    }
    }
})
document.addEventListener('DOMContentLoaded', ()=>{
    window.addEventListener('resize',()=>{
    const ls = document.querySelector('.links')

        if(ls){

    if(window.innerWidth > 768 && ls){
        ls.classList.remove('large')
        const cl = ls.querySelector('.close-links')
        cl ? cl.innerHTML = '' : ''
    }
    if(window.innerWidth < 768 && ls){
        ls.classList.add('large')
    }
}
    })

    
    const div = document.createElement('div');
    div.classList.add('login');
    div.tooltip = 'Login';
    div.addEventListener('click', () => {
        window.location.href = '/login';
    });
    div.innerHTML = `<i class="fas fa-plus"></i>`;
    
    const ics = document.querySelector('.icons');
    if (ics.firstChild) {
        ics.insertBefore(div, ics.firstChild); 
    } else {
        ics.appendChild(div); 
    }
    const up = document.querySelector('.uptop');

    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight - 300 && up) {
        up.classList.add('flex');
        up.classList.remove('none');
      } else if(up) {
        up.classList.add('none');
        up.classList.remove('flex');
      }
    });
    
    if (up) {
      up.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
    setTimeout(() => {
      // console.clear()
    }, 10000);
})
document.addEventListener('DOMContentLoaded', ()=>{
  const helpIcon = document.querySelector('.help')
 const feedbackHub = document.createElement('div')

feedbackHub.className = 'feedback-ov none'

 feedbackHub.innerHTML =  `

  <div class="feedback-inner">
    <button class="back-f-btn" type="button"><i class="fas fa-angles-left"></i> Back</button>
    <hr>
    <h2>Feedback</h2>
    <h3>Submit feedback, errors or general queries</h3>
    <div class="submission">
      <form action="" method="post" id="f-form">
        <legend>
        <label for="screenshot">Upload Screenshot</label>
        <input type="file" name="screenshot" accept="image/*" id="screenshot">
        <div id="preview" style="position:relative;"></div>
        Or
        <button type="button" id="screenshotCapture">Capture Screen </button>
      </legend>
      <legend>
        <label for="text"> Enter Description </label>
        <textarea name="description" placeholder="Describe the issue" id="description" cols="10" rows="10"></textarea>
      </legend>
      <legend>
        <button type="submit">Submit</button>
      </legend>
      </form>
    </div>
</div>

 `
 document.body.appendChild(feedbackHub)
 
 const backBtn = feedbackHub.querySelector('.back-f-btn')
 backBtn.addEventListener('click', ()=>{
  feedbackHub.classList.toggle('flex')
  feedbackHub.classList.toggle('none')
 })
 const capBtn = feedbackHub.querySelector('#screenshotCapture')
capBtn.addEventListener('click', ()=>{
  const init = capBtn.innerHTML
  capBtn.innerHTML =  '<i class="fas fa-spinner fa-spin">'
  capBtn.disabled = true
  captureFullPage()
  setTimeout(() => {
    capBtn.innerHTML = init
  }, 2000);
 }) 

 if(helpIcon){
  helpIcon.addEventListener('click', ()=>{
    feedbackHub.classList.toggle('flex')
    feedbackHub.classList.toggle('none')
  })
}
 const innerFdb = feedbackHub.querySelector('.feedback-inner')
 document.addEventListener('click', (e)=>{
  if(e.target == feedbackHub && !innerFdb.contains(e.target) && e.target !== innerFdb && feedbackHub.classList.contains('flex') ){
    feedbackHub.classList.remove('flex')
    feedbackHub.classList.add('none')
    c.classList.remove('flex')
    c.classList.add('none')
  }
 })
 const ss = document.querySelector('#screenshot')
 ss.addEventListener('input', (e)=>{
  const file = ss.files[0]
  if(file){
  const url = URL.createObjectURL(file)
   showScreenshotPreview(url)
  }
 })

 const c = document.createElement('div')
 c.className = 'capturing none'
 c.innerHTML = `
    <div class="line"></div>
 `
 document.body.appendChild(c)
 
 async function captureFullPage() {
  feedbackHub.classList.toggle('flex')
  feedbackHub.classList.toggle('none')
  c.classList.toggle('flex')
  c.classList.toggle('none')  
  try {
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
      removeContainer: true,
      scrollX: 0,
      scrollY: -window.scrollY,
      foreignObjectRendering: true
    });

    const dataURL = canvas.toDataURL("image/png");
    const blob = await (await fetch(dataURL)).blob();
    const file = new File([blob], "screenshot.png", { type: "image/png" });

    const dt = new DataTransfer();
    dt.items.add(file);
    document.getElementById("screenshot").files = dt.files;

    showScreenshotPreview(dataURL);

    console.log("Screenshot captured and attached.");
    feedbackHub.classList.toggle('flex')
    feedbackHub.classList.toggle('none') 
    c.classList.toggle('flex')
    c.classList.toggle('none')  
  capBtn.disabled =false

  } catch (err) {
    console.error("Screenshot failed:", err);
    feedbackHub.classList.toggle('flex')
    feedbackHub.classList.toggle('none')
    c.classList.toggle('flex')
    c.classList.toggle('none')  
  capBtn.disabled =false

  }
}

function showScreenshotPreview(src) {
  let prev = document.getElementById("shot-preview");
  const prevDiv = fForm.querySelector('#preview')

  if (!prev) {
    prevDiv.innerHTML = `<button id="previewImage" type="button" style="position: absolute;
    border: 0;
    outline: 0;
    background: #0000006e;
    color: #fff;
    backdrop-filter: blur(2px);
    border-radius: 50%;
    right: 0;"><i class="fas fa-eye"></i></button>`
    prev = document.createElement("img");
    prev.id = "shot-preview";
    prev.style.width = "100%";
    prev.style.marginTop = "10px";
    prev.style.borderRadius = "6px";
    prev.style.maxWidth = '300px'

    // document
    //   .querySelector("#screenshot")
    //   .insertAdjacentElement("afterend", prev);
      prevDiv.appendChild(prev)
  }


  prev.src = src;
  prevDiv.querySelector('#previewImage').addEventListener('click', (e)=>{
    let previewLarge = ''
    e.stopImmediatePropagation()
    console.log(e)
    const exists = document.querySelector('.previewLarge')

    if(exists){
     previewLarge = exists
    } else{
    previewLarge = document.createElement('div')

    document.body.appendChild(previewLarge)
    }
    previewLarge.classList.remove('none')
    previewLarge.classList.add('previewLarge')
    previewLarge.setAttribute('style', `color: aliceblue;
    position: fixed;
    z-index: 200000;
    top: 0;
    right: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 0;
    background: #000000bf;
    flex-direction: column;`)

    previewLarge.innerHTML = `
    <div>
    <h2>Preview</h2>
    <buttton type="button" style="    padding: 10px;
    position: absolute;
    font-size: 3em;
    font-family: math;
    color: red;
    right: 20px;
    top: 20px;
    user-select: none;
    cursor: pointer;
}" onclick="document.querySelector('.previewLarge').classList.add('none')">&times;</button>
    </div>
    <img id="img" style="width: 90%; margin: auto; border: 4px solid green; max-width: 500px; max-height:500px" src="${src}">
    `
  })
}


const fForm = document.getElementById("f-form");
const screenshotInput = document.getElementById("screenshot");

fForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const desc = document.getElementById("description").value.trim();
  const file = screenshotInput.files[0];

  if (!desc) {
    alert("Please describe the issue", 'error');
    document.getElementById("description").focus();
    return;
  }

  const submitBtn = fForm.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.innerText = "Submitting…";

  try {
    let base64Image = "";

    // convert file -> base64 if exists
    if (file) {
      base64Image = await convertToBase64(file);
    }

    const payload = {
      description: desc,
      image: base64Image
    };

    const res = await fetch(`${baseUrl}/help`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Server rejected feedback");

    alert("Feedback sent successfully. We will get back to you soon", 'success');

    fForm.reset();
    const prev = document.getElementById("shot-preview");
    if (prev) prev.remove();

  } catch (err) {
    console.error(err);
    alert("Network Error");
  }

  submitBtn.disabled = false;
  submitBtn.innerText = "Submit";
});


function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result); 
    reader.onerror = () => reject("Failed converting to base64");

    reader.readAsDataURL(file);
  });
}

  
})


// Custom Ads

document.addEventListener('DOMContentLoaded', async () => {

  const body = document.body
  const ad = document.createElement('div')
  ad.classList.add('ad-overlay', 'none')

  async function getAd() {
    try {
      const res = await fetch(`${baseUrl}/ads/latest`)
      const data = await res.json()

      let a = data.ads && data.ads.length > 0 ? data.ads[0] : null

      if (a) {
        ad.innerHTML = `
          ${a.url ? `<a href="${a.url}" target="_blank">` : ''}
          <div class="ad">
            <b id="identifier">Sponsored Ad</b>

            <div class="ad-title">${a.title || 'Lutan Tech'}</div>

            <div class="ad-w-cover">
              <div class="ad-wait">
                <div class="timeDiv">10</div>
                <div class="closeAd">&times;</div>
              </div>
            </div>

            <hr style="width: 100%;">

            <div class="pic">
              <img src="${a.image_url || 'https://lutan-tech.is-great.org/images/LUTAN_TECH_LOGO.png'}">
            </div>

            <div class="content">
              ${a.content || `Need a website like this? Contact <a href='https://lutan-tech.is-great.org'>Lutan Tech</a>.`}
            </div>
          </div>
          ${a.url ? '</a>' : ''}
        `
      } else {
        // fallback
        ad.innerHTML = fallbackHTML()
      }

    } catch (err) {
      console.error(err)
      ad.innerHTML = fallbackHTML()
    }

    body.appendChild(ad)
    setTimeout(() => startAd(), 1500)
  }


  function fallbackHTML() {
    return `
      <a href="https://lutan-tech.is-great.org" target="_blank">
        <div class="ad">
          <b id="identifier">Sponsored Ad</b>

          <div class="ad-title">Lutan Tech</div>

          <div class="ad-w-cover">
            <div class="ad-wait">
              <div class="timeDiv">10</div>
              <div class="closeAd">&times;</div>
            </div>
          </div>

          <hr>

          <div class="pic">
            <img src="https://lutan-tech.is-great.org/images/LUTAN_TECH_LOGO.png">
          </div>

          <div class="content">
            Need a website like this? Contact <a href='https://lutan-tech.is-great.org'>Lutan Tech</a>.
          </div>
        </div>
      </a>
    `
  }


  function startAd() {

    const overlay = document.querySelector('.ad-overlay')
    const parent = overlay.querySelector('.ad-wait')

    if (sessionStorage.getItem('sA1t')) {
      setTimeout(() => sessionStorage.removeItem('sA1t'), 120000)
      return
    }

    overlay.classList.add('flex')
    overlay.classList.remove('none')

    const timeDiv = parent.querySelector('.timeDiv')
    let time = 10

    const interval = setInterval(() => {
      time -= 1
      timeDiv.textContent = time

      if (time <= 0) {
        clearInterval(interval)
        parent.innerHTML = `<div class="closeAd" style="opacity: 1;">&times;</div>`
      }

    }, 1000)

    parent.addEventListener('click', e => {
      if (e.target.classList.contains('closeAd')) {
        overlay.classList.add('none')
        overlay.classList.remove('flex')
        sessionStorage.setItem('sA1t', true)
      }
    })
  }


  getAd()

})


