document.addEventListener('DOMContentLoaded',()=>{
    const mode = localStorage.getItem('mode')
    if(mode == 'dark'){
        document.body.classList.add('dark')
    } else{
        document.body.classList.remove('dark')
    }

const modeBtn = document.querySelector('.modes')
if(modeBtn){
modeBtn.addEventListener('click', (e)=>{
    console.log(modeBtn.innerHTML)
    const moon = '<i class="fas fa-moon"></i>'
    const sun = '<i class="fas fa-sun"></i>'
    if(modeBtn.innerHTML.trim() == moon){
        modeBtn.innerHTML = sun
        localStorage.setItem('mode', 'dark')
        document.body.classList.add('dark')

    } else{
        modeBtn.innerHTML = moon
        localStorage.setItem('mode', 'light')
        document.body.classList.remove('dark')

    }
})
}



})
