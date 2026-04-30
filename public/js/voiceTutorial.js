const { driver } = window.driver.js;

const getPendingTutorial = () => {
  try {
    return localStorage.getItem('pendingTutorial');
  } catch(err) {
    return null;
    console.error('Failed to get item pendingTutorial', err);
  }
};

const startVoiceTutorial = () => {
  const micBtn = document.querySelector('.mic-btn');
  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('#searchQuery');
  const cleanInputBtn = document.querySelector('.data-clean-btn');
  const resultHeader = document.querySelector('.data-result-title');

  const steps = [
    {
      element: micBtn,
      popover: {
        title: 'Wyszukiwanie głosowe',
        description: 'Kliknij w mikrofon i powiedz, co chcesz wyszukać.',
        side: 'top',
      },
    },
    {
      element: searchInput,
      popover: {
        title: 'Pole wyszukiwania',
        description: 'To, co powiesz, pojawi się w tym miejscu.',
        side: 'top',
      },
    },
    {
      element: searchBtn,
      popover: {
        title: 'Przycisk wyszukiwania',
        description: 'Kliknij w lupę albo wciśnij Enter, aby wyszukać.',
        side: 'top',
      },
    },
    {
      element: cleanInputBtn,
      popover: {
        title: 'Czyszczenie pola',
        description: 'Tym przyciskiem wyczyścisz pole wyszukiwania.',
        side: 'top',
      },
    },
    {
      element: resultHeader,
      popover: {
        title: 'Wyniki wyszukiwania',
        description: 'Wyniki pojawią się tutaj.',
        align: 'center',
        side: 'top',
      },
    },
  ].filter(step => step.element);

  if (!steps.length) return;

  const voiceTutorial = driver({
    showProgress: true,
    allowClose: true,
    nextBtnText: 'Dalej',
    prevBtnText: 'Wstecz',
    doneBtnText: 'Zakończ',
    progressText: '{{current}} strona z {{total}}',
    steps,
  });

  voiceTutorial.drive();
};

document.addEventListener('DOMContentLoaded', () => {
  const pendingTutorial = getPendingTutorial();

  if (pendingTutorial !== 'voice') return;

  startVoiceTutorial();
});