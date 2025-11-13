const mc = document.querySelector('.menu-icon')
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
        if(ls){

    const ls = document.querySelector('.links')
    if(window.innerWidth > 768){
        ls.classList.remove('large')
        ls.querySelector('.close-links').innerHTML = ''
    }
    if(window.innerWidth < 768){
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

})
