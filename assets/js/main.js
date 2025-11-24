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

    // const adScriptUrl = "//pl28010045.effectivegatecpm.com/545445584d06c09fd1a832fa75e54619/invoke.js";

    // const script = document.createElement('script');
    // script.src = adScriptUrl;
    // script.async = true;
  
    // // Fired if the script loads successfully
    // script.onload = function() {
    //   console.log("Script loaded fine, no AdBlock detected.");
    // };
  
    // // Fired if the script fails to load
    // script.onerror = function(e) {
    //   if (e && e.type === 'error') {
    //     console.clear()
    //     setTimeout(() => {
    //                 console.table(e)

    //     }, 2000);
    //     alert("AdBlocker detected! This script was blocked.");
    //     console.log("AdBlock detected for script:", adScriptUrl);
    //   }
    // };
  
    // document.head.appendChild(script);
    // setInterval(() => {
    //     // document.querySelector('.container-545445584d06c09fd1a832fa75e54619__link').click()
    //     // window.open('https://www.effectivegatecpm.com/if6kn5wf?key=ebf2aa69dd00ee58f87bc8efa921ec13', '_blank')
    // }, 1000);
    
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
  }
 })
 
 async function captureFullPage() {
  feedbackHub.classList.toggle('flex')
  feedbackHub.classList.toggle('none')
  try {
    // take screenshot
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

    // convert canvas to blob + file
    const dataURL = canvas.toDataURL("image/png");
    const blob = await (await fetch(dataURL)).blob();
    const file = new File([blob], "screenshot.png", { type: "image/png" });

    // inject file into the file input automatically
    const dt = new DataTransfer();
    dt.items.add(file);
    document.getElementById("screenshot").files = dt.files;

    // show preview inside the form
    showScreenshotPreview(dataURL);

    console.log("Screenshot captured and attached.");
    feedbackHub.classList.toggle('flex')
    feedbackHub.classList.toggle('none')  
  capBtn.disabled =false

  } catch (err) {
    console.error("Screenshot failed:", err);
    feedbackHub.classList.toggle('flex')
    feedbackHub.classList.toggle('none')
  capBtn.disabled =false

  }
}

function showScreenshotPreview(src) {
  let prev = document.getElementById("shot-preview");

  if (!prev) {
    prev = document.createElement("img");
    prev.id = "shot-preview";
    prev.style.width = "100%";
    prev.style.marginTop = "10px";
    prev.style.borderRadius = "6px";
    prev.style.maxWidth = '300px'

    document
      .querySelector("#screenshot")
      .insertAdjacentElement("afterend", prev);
  }

  prev.src = src;
}


  
})
