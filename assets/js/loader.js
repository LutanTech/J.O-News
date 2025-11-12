    function hideLoader(){
    const ov = document.querySelector('.overlay')

        ov.classList.remove('visible')
    }
    function showLoader(text, type, clear){
       
    const ov = document.querySelector('.overlay')

        ov.classList.add('visible')
         if(text){
            const textDiv = document.createElement('div')
            textDiv.classList.add('loader-text')
            const exists = ov.querySelector('.loader-text')
            if(exists && exists.textContent.trim() == text){
                return;
            } else{
                if(text == 'Fetch error: TypeError: Failed to fetch'){
                    text = 'Network Error'                }
            textDiv.innerHTML = text
            textDiv.classList.add(type)
            if(clear){
                ov.innerHTML = ''
                ov.append(textDiv)
            } else{
            ov.appendChild(textDiv)
            }
            }
        }
    }
    window.showLoader = showLoader
    window.hideLoader = hideLoader