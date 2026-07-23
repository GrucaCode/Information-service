const goUpBtn = document.querySelector('.js-btn-go-up');

const toggleGoUpBtn = () => {
    window.scrollY > 100 ? goUpBtn.classList.add('visible') : goUpBtn.classList.remove('visible');
}

window.addEventListener('scroll', toggleGoUpBtn);
