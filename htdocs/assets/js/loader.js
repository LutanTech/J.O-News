    function hideLoader(){
    const ov = document.querySelector('.overlay')

        ov.classList.remove('visible')
    }
    function showLoader(){
    const ov = document.querySelector('.overlay')

        ov.classList.add('visible')
    }
    window.showLoader = showLoader
    window.hideLoader = hideLoader