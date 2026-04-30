document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('tutorial-modal');
  const dialog = document.querySelector('.data-tut-dialog');
  const background = document.querySelector('body');
  const openTutBtns = document.querySelectorAll('.data-open-tut-modal');
  const closeTutBtns = modal.querySelectorAll('.data-close-pop-up-btn');
  const startTutorialBtn = modal.querySelector('.data-tut-btn');
  let lastFocused = null;

  const openModal = (e) => {
    e.preventDefault();
    lastFocused = document.activeElement;
    modal.ariaHidden = 'false';
    background.classList.add('no-scroll');
    dialog.focus();
  }

  const closeModal = () => {
    modal.ariaHidden = 'true';
    background.classList.remove('no-scroll');
    lastFocused?.focus();
  }

  const startTutorial = () => {
    try { 
      localStorage.setItem('pendingTutorial', 'voice'); 
    } catch(err) {
      console.error("Failed to set pendingTutorial to voice");
    }
    window.location.href = '/search';
  }

  openTutBtns.forEach(btn =>
    btn.addEventListener('click', openModal)
  );

  closeTutBtns.forEach(btn => 
    btn.addEventListener('click', closeModal)
  );

  document.addEventListener('keydown', e => {
    const isModalHidden = modal.getAttribute('aria-hidden');
    if (isModalHidden === 'false' && e.key === 'Escape') {
      closeModal();
    } 
  });

  startTutorialBtn?.addEventListener('click', startTutorial);
});
