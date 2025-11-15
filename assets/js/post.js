const editor = document.getElementById("editable");
        const imgBtn = document.querySelector(".addImageBtn");
        const prevBtn = document.querySelector(".previewBtn");
        const vidBtn = document.querySelector(".addVideoBtn");
        const saveBtn = document.querySelector(".draftBtn");
        
        editor.addEventListener("input", () => {
            localStorage.setItem('draft', editor.innerHTML);
        });
        
        editor.addEventListener("paste", function(e) {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          const saved = localStorage.setItem('draft', text)
          document.execCommand("insertText", false, text);
        });
        document.addEventListener('DOMContentLoaded', ()=>{
            const saved = localStorage.getItem('draft');
            if(saved) editor.innerHTML = saved;
            const fileInput = document.getElementById("image");

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
            if(form){
            form.addEventListener('submit', async (e)=>{
              e.preventDefault();

              const title = form.querySelector('#title');
              const categ = form.querySelector('#category');
              const sub = form.querySelector('#sub');
              const content = form.querySelector('#editable');
              const trending = document.querySelector('#trending').checked;

              const fileInput = document.getElementById("image");
              const file = fileInput.files[0];

              // lil validation vibes
              if(!file) return alert("Add a pic bro", 'error');
              if(!title.value.trim()) return alert("Title missing", 'error');
              if(!categ.value.trim()) return alert("Pick a category first ", 'error');
              if(!sub.value.trim()) return alert("Sub category empty fam", 'error');
              if(!content.innerText.trim()) return alert("Drop some content", 'error');

              const formData = new FormData();
              formData.append("image", file);
              formData.append("title", title.value);
              formData.append("categ", categ.value);
              formData.append("sub", sub.value);
              formData.append("trending", trending);
              formData.append("content", content.innerHTML);

              try {
                const res = await fetch(`${baseUrl}/new`, {
                  method: 'POST',
                  body: formData
                });

                const data = await res.json();
                if(data.error) return alert(data.error, 'error');

                alert("Post Added", 'success');
                localStorage.removeItem("draft");
                form.reset();

              } catch (err) {
                alert("Network error", 'error');
              }
            });
          }

        });
        
        let savedRange = null;
        editor.addEventListener("mouseup", saveCursorPosition);
        editor.addEventListener("keyup", saveCursorPosition);
        
        function saveCursorPosition() {
            const sel = window.getSelection();
            if(sel.rangeCount) savedRange = sel.getRangeAt(0);
        }
        
        const fileInput = document.getElementById("newImage");
        const addImageBtn = imgBtn;
        addImageBtn.addEventListener('click', ()=>{
          fileInput.click()
        });

        fileInput.onchange = () => {
            const file = fileInput.files[0];
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
            fileInput.value = "";
        };
        
        function setProgress(percent){
            const offset = 163 - (percent/100)*163;
            circleProgress.style.strokeDashoffset = offset;
        }
        

    
 

// Save cursor in editor, not toolbar
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
        editor.appendChild(node); // fallback
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

// Image insertion
function insertImageAtCursor(url){
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    insertAtCursor(img);
}
document.addEventListener('DOMContentLoaded', async ()=>{
 
  const res = await pingAccount()
  if(res== '✔'){
    alert('Logged in. You can now post', 'success')
  }
})
document.getElementById('category').addEventListener('change', function () {
    const subcategories = window.subcategories
const category = this.value;
const subSelect = document.getElementById('sub');

subSelect.innerHTML = `<option value="">Select sub category</option>`;
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