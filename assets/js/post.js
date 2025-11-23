        
        document.addEventListener('DOMContentLoaded',async (e)=>{
        const editor = document.getElementById("editable");
        const imgBtn = document.querySelector(".addImageBtn");
        const prevBtn = document.querySelector(".previewBtn");
        const vidBtn = document.querySelector(".addVideoBtn");
        const saveBtn = document.querySelector(".draftBtn");
        
        
        editor.addEventListener("paste", function(e) {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          const saved = localStorage.setItem('draft', text)
          document.execCommand("insertText", false, text);
        });

        const saved = JSON.parse(localStorage.getItem('draft'));

        if (saved) {

          Object.entries(saved).forEach(([key, value]) => {
            if (key === "category") {
              return
          }
          if (key === "sub") {
            return
        }
            const elem = document.querySelector(`#${key}`);
            if (elem) {
              if (elem.type === "checkbox") {
                elem.checked = !!value;
              } else {
                elem.value = value;
              }
            }
        
            if (key === "editable") {
              const editor = document.querySelector('#editable');
              if (editor) editor.innerHTML = value;
            }

          });
        }
        
            var fileInput = document.getElementById("image");

        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (!file) return; // no file selected

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file); 
            img.style.maxWidth = "200px"; 
            img.style.maxHeight = "200px";

            const previewDiv = document.querySelector('.previewImageDiv');

            previewDiv.parentElement.classList.remove('none')
            previewDiv.parentElement.classList.add('seen')

            setTimeout(() => {
              previewDiv.innerHTML = '';
              previewDiv.appendChild(img);    
            }, 100);

            
        });

        const form = document.querySelector('.form');
        const all = ['title', 'category', 'country', 'sub', 'editable', 'trending']
        all.forEach(item=>{
          const i = form.querySelector(`#${item}`)
          i.addEventListener('input', ()=>{
            saveData()
          })
        })
        all.forEach(item=>{
          const i = form.querySelector(`#${item}`)
          i.addEventListener('change', ()=>{
            saveData()
          })
        })


          const b2e = document.querySelector('.b2edit')
          const pb = document.querySelector('.pub')
          const mp = document.querySelector('#mini')
          const fp = document.querySelector('#full')
          const eye = document.querySelector('.previewBtn')
          const save = document.querySelector('.draftBtn')
          const overlayc = document.querySelector('.previewModal')
          const pa = document.querySelector('.previewActions')
    
          function toggleOc(){
            overlayc.classList.toggle('flex')
            overlayc.classList.toggle('none')
          }
    
          overlayc.addEventListener('click', (e)=>{
            if(e.target != overlayc.querySelector('.innerPreview') && e.target == overlayc && !overlayc.querySelector('.innerPreview').contains(e.target)){
              overlayc.classList.remove('flex')
              overlayc.classList.add('none')
            }
          })
    
          eye.addEventListener('click', ()=>{
            saveData()
            pa.classList.toggle('none')
            pa.classList.toggle('flex')
          })
          save.addEventListener('click', ()=>{
            saveData()
          })
          document.addEventListener('click', (e) => {
            if(pa.contains(e.target) || e.target == pa || e.target == eye || eye.contains(e.target) || e.target.classList.contains('fa-eye') || e.target.classList.contains('fa-spin')){
              return
            } else{
              pa.classList.remove('flex')
              pa.classList.add('none')
            }
          });
          
          
          function saveData() {
        var form = document.querySelector('.form')
            const paInit = pa.innerHTML
            disableForSave()
            disableSave()
            pa.classList.add('disabled')
            setTimeout(() => {
              pa.classList.remove('disabled')
            }, 1500);
            const title = form.querySelector('#title').value.trim();
            const categ = form.querySelector('#category').value.trim();
            const country = form.querySelector('#country').value.trim();
            const id = localStorage.getItem('uid');
            const sub = form.querySelector('#sub').value.trim();
            const content = form.querySelector('#editable').innerHTML; 
            const trending = document.querySelector('#trending').checked;
          
            let draft = JSON.parse(localStorage.getItem('draft')) || {};
          
            draft = {
              ...draft,
              title:title,
              category: categ,
              country:country,
              uid: id,
              sub:sub,
              editable:content,
              trending:trending
            };
          
            localStorage.setItem('draft', JSON.stringify(draft));
          }
          
          function disableForSave(){
            eye.classList.add('disabled')
            const init = '<i class="fas fa-eye"></i>'
            eye.innerHTML = '<i class="fas fa-spinner fa-spin">'
            eye.setAttribute('tooltip','Saving...')
            setTimeout(() => {
            eye.innerHTML = '<i class="fas fa-check"></i>'

              setTimeout(() => {
              eye.innerHTML = init
              },2000);
            eye.classList.remove('disabled')
            eye.setAttribute('tooltip','Preview')
            }, 2000);
          }
          function disableSave(){
            save.classList.add('disabled')
            const init = '<i class="fas fa-bookmark"></i>'
            save.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
            save.setAttribute('tooltip','Saving...')
            setTimeout(() => {
            save.innerHTML = '<i class="fas fa-check"></i>'
            save.classList.remove('disabled')
            save.setAttribute('tooltip','Save')
            setTimeout(() => {
            save.innerHTML = init
            }, 2000);
            }, 3000);
          }
          
          mp.addEventListener('click', ()=>{
            toggleOc()
            const data = localStorage.getItem('draft')
            previewMini()
          })
    
          
          fp.addEventListener('click', ()=>{
            toggleOc()
            previewFull()

          })
          if(b2e){
          b2e.addEventListener('click', ()=>{
            toggleOc()
    
          })
        }


          function previewMini(){
          const inner = overlayc.querySelector('.innerPreview')
          const file = fileInput.files[0]
          const data = JSON.parse(localStorage.getItem('draft'))
          let src = ''
          if(file){
             src = URL.createObjectURL(file); 
          } else{
             src = '/assets/images/logo.jpg'
          }
          if(data)
            inner.innerHTML = `
                  <h1>Mini Preview</h1>
      <hr>
                      <a class="prev-link" href="#preview">
                      <div class="news">
                        <div class="image"><img src="${src}" alt=""></div>
                        <div class="news-content">
                          <div class="title">${data.title}</div>
                          <div class="text">
                            ${data.editable.slice(0, 100) + '...'}
                          </div>
                        
                        <div class="dets">
                          <div class="categ"><i class="fas fa-tags"></i> ${data.category ? data.category : '❗ Empty'}</div>
                          <div class="posted"><i class="fas fa-clock"></i> Just Now</div>
                          <div class="by"><i class="fas fa-user"></i> By ${localStorage.getItem('usn') ? localStorage.getItem('usn') : 'Unknown' }</div>
                        </div>
                      </div>
                    </div>
                      </a>
                              <div class="actions-c">
        <button class="bg-b b2edit" onclick="document.querySelector('.previewModal').click()">Back to Edit</button>
        <button class="bg-g pub">Publish</button>
      </div>
                      
            `
            document.querySelector('.pub').addEventListener('click', ()=>{
            preparePublish()
          })
          function preparePublish(){
            toggleOc()
            setTimeout(() => {
              document.querySelector('#pubBtn').click()
            }, 2000);
          }
          }
          



          function previewFull(){
            const file = fileInput.files[0]
            let src = ''
            if(file){
               src = URL.createObjectURL(file); 
            } else{
               src = '/assets/images/logo.jpg'
            }

          const inner = overlayc.querySelector('.innerPreview')
          const data = JSON.parse(localStorage.getItem('draft'))
          if(data)
            inner.innerHTML = `
                  <h1>Full Preview</h1>
      <hr>
                <div class="main-prev">
        <div class="news-article">
          <div class="categs">
            <div class="country" style="text-transform:capitalize">${data.country ? data.country : '❗ Empty' }</div>
            <div class="m-categ">${data.category ? data.category : '❗ Empty'}</div>
            <div class="sub-categ">${data.sub ? data.sub : '❗ Empty'}</div>
          </div>
          <div class="c-title">
            ${data.title ? data.title : '❗ Empty'}
          </div>
          <hr>
          <div class="date" style="color: grey; margin:10px 0">${formatTime(new Date())}</div>
          <div class="social-icons">
            
            <div class="s-icon">
            <i class="fas fa-link"></i>
            </div>
            
            <div class="s-icon">
            <i class="fab fa-facebook"></i>
            </div>
            
            <div class="s-icon">
            <i class="fab fa-x-twitter"></i>
            </div>  
            
            <div class="s-icon">
            <i class="fab fa-instagram"></i>
            </div>

            <div class="s-icon">
              <i class="fab fa-whatsapp"></i>
              </div>
              <div class="s-icon">
                <i class="fas fa-volume-down"></i>
                </div>

          </div>
          <div class="text-content">
            <div class="image-img">
              <img style="max-height:300px" src="${src}" alt="">
            </div>
            ${data.editable ? data.editable : '❗ Empty'}
          </div>
        </div>
        <div class="actions-c">
        <button class="bg-b b2edit" onclick="document.querySelector('.previewModal').click()">Back to Edit</button>
        <button class="bg-g pub">Publish</button>
      </div>
      <hr>
      </div>
            `
            document.querySelector('.pub').addEventListener('click', ()=>{
              preparePublish()
            })
            function preparePublish(){
              toggleOc()
              setTimeout(() => {
                document.querySelector('#pubBtn').click()
              }, 2000);
            }
          }
    

            if(form){
              
            form.addEventListener('submit', async (e)=>{
              e.preventDefault();

              const title = form.querySelector('#title');
              const categ = form.querySelector('#category');
              const country = form.querySelector('#country');
              const id = localStorage.getItem('uid');
              const sub = form.querySelector('#sub');
              const content = form.querySelector('#editable');
              const trending = document.querySelector('#trending').checked;

              const file = fileInput.files[0];

              if (!file) {
                alert("Image Missing", 'error');
                fileInput?.focus();
                show(fileInput);
                return;
              }

              if (!title.value.trim()) {
                alert("Title missing", 'error');
                title.focus();
                show(title)
                return;
              }

              if (!categ.value.trim()) {
                alert("Pick a category first", 'error');
                categ.focus();
                show(categ)
                return;
              }

              if (!country.value.trim()) {
                alert("Please choose country", 'error');
                country.focus();
                show(country)
                return;
              }

              if (!sub.value.trim()) {
                alert("Please Enter sub category", 'error');
                sub.focus();
                show(sub)
                return;
              }

              if (!content.innerText.trim()) {
                alert("Content can not be empty", 'error');
                content.scrollIntoView() 
                show(content)
                return;
              }
              function show(el){
                el.classList.add('onerror')
                el.scrollIntoView()
                setTimeout(() => {
                  el.classList.remove('onerror')
                }, 3000);
              }


              const formData = new FormData();
              formData.append("image", file);
              formData.append("title", title.value);
              formData.append("categ", categ.value);
              formData.append("country", country.value);
              formData.append("sub", sub.value);
              formData.append("id", id);
              formData.append("trending", trending);
              formData.append("content", content.innerHTML);
              const pbtn = form.querySelector('#pubBtn')
              pbtn.disabled = true
              var init = pbtn.innerHTML
              pbtn.innerHTML = 'Publishing...<i class="fas fa-spinner fa-spin"></i>'

              try {
                const res = await fetch(`${baseUrl}/new`, {
                  method: 'POST',
                  body: formData
                });

                const data = await res.json();
                if(data.error) return alert(data.error, 'error');

                alert("Posted successfully", 'success');
                localStorage.removeItem("draft");
                form.reset();
              pbtn.disabled = false
              pbtn.innerHTML = init
              
              } catch (err) {
                alert("Network error", 'error');
                pbtn.disabled = false
                pbtn.innerHTML = init

              }
              
            });
          }



        var res = await pingAccount()
        if(res == '❌'){
          alert('Please Login to continue. Redirecting... ', 'info')
          setTimeout(() => {
            window.location.href = `/login?next=${window.location.href}`
          }, 2000);
        }

        function pingImgUpload(){
          fetch('https://vidupload.onrender.com')
          .then(res=>res.json())
          .then(data=>{
            console.log(data)
            if(!data.pinged){
              alert('Our Upload Images endpoint might be experiencing some issues. We are about to resolve it. Just a moment')
              pingImgUpload()
            }
          })
        }
        pingImgUpload()



        
        let savedRange = null;
        editor.addEventListener("mouseup", saveCursorPosition);
        editor.addEventListener("keyup", saveCursorPosition);
        
        function saveCursorPosition() {
            const sel = window.getSelection();
            if(sel.rangeCount) savedRange = sel.getRangeAt(0);
        }
        
        let newfileInput = document.getElementById("newImage");
        const addImageBtn = imgBtn;
        addImageBtn.addEventListener('click', ()=>{
          newfileInput.click()
        });

        newfileInput.onchange = () => {
            const file = newfileInput.files[0];
            if(!file) return;
            const formData = new FormData();
            formData.append("image", file);
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `https://vidupload.onrender.com/upload-image`);
            uploadCircle.classList.remove("hidden");
            setProgress(0);
        
            xhr.upload.onprogress = e => {
                if(e.lengthComputable) setProgress((e.loaded/e.total)*100);
            };
        
            xhr.onload = () => {
                uploadCircle.classList.add("hidden");
                setProgress(0);
                const data = JSON.parse(xhr.responseText);
                if(!data.url) return alert("Server returned an error", 'error');
                insertImageAtCursor(data.url);
            };
        
            xhr.onerror = () => {
                uploadCircle.classList.add("hidden");
                alert("Failed to send Image for Upload : Network", 'error');
            };
        
            xhr.send(formData);
            newfileInput.value = "";
        };
        
        function setProgress(percent){
            const offset = 163 - (percent/100)*163;
            circleProgress.style.strokeDashoffset = offset;
        }
        

    
 

editor.addEventListener("mouseup", saveCursorPosition);
editor.addEventListener("keyup", saveCursorPosition);

function saveCursorPosition() {
    const sel = window.getSelection();
    if(sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if(editor.contains(range.commonAncestorContainer)) {
            savedRange = range.cloneRange();
        }
    }
}

function insertAtCursor(node){
    if(!savedRange) {
        editor.appendChild(node); 
        return;
    }
    const sel = window.getSelection();
    const range = savedRange.cloneRange();
    range.deleteContents();
    range.insertNode(node);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

function insertImageAtCursor(url){
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    insertAtCursor(img);
}


  var res = await pingAccount()
  if(res== '✔'){
    alert('Logged in. You can now post', 'success');
    const las = document.querySelector('.logged-in-as')
    las.style.background = 'rgb(0, 255, 89)'
    las.style.color = 'black'
    las.innerHTML = `Logged in as ${localStorage.getItem('usn')}`
  }
})
document.getElementById('category').addEventListener('change', function () {
    const subcategories = window.subcategories
const category = this.value;
const subSelect = document.getElementById('sub');

subSelect.innerHTML = `<option value="">Select sub categoryyy</option>`;
subSelect.disabled = true;

if (subcategories[category]) {
subcategories[category].forEach(sub => {
const opt = document.createElement('option');
opt.value = sub.toLowerCase().replace(/\s+/g, '_');
opt.textContent = sub;
subSelect.appendChild(opt);
});

subSelect.disabled = false;
}
});

document.addEventListener('DOMContentLoaded', ()=>{
  const cs = document.querySelector('#country')
  const countries = window.countries
  countries.forEach(c => {
    const op = document.createElement('option')
    op.value = String(c.name).replaceAll(' ', '_').toLowerCase()
    op.innerHTML = c.name
    if(c.name.includes('Kenya')){
        op.setAttribute('selected', '')
    }
    cs.appendChild(op)
    
  });
  cs.removeAttribute('disabled')

})