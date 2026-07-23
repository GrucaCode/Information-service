export const toPLDate = (date) => {
  if (!date) return "—";
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("pl-PL");
}

export const goToArticle = (article) => {
  if (!article?.id) return;
  window.location.href = `/article?id=${encodeURIComponent(article.id)}`;
};

let loaderShownAt = 0;
let loaderTimeout = null;

export const showLoader = () => {
  const loader = document.querySelector(".js-loader");
  if (!loader) return;
  loader.classList.remove("is-hidden");
}

export const hideLoader = () => {
  const loader = document.querySelector(".js-loader");
  if (!loader) return;
  loader.classList.add("is-hidden");
}

export const checkUserLogin = async () => {
  try {
    const res = await fetch("/api/me");
    const data = await res.json();

    if (!res.ok) {
      console.error("Fetching /api/me failed with status: ", res.status);
      return { loggedIn: false, user: null };
    }

    return {
      loggedIn: !!data.loggedIn,
      user: data.user
    };
  } catch (err) {
    console.error("Failed to check user session:", err);
    return { loggedIn: false, user: null };
  }
};

const popUpMessages = {
    loginToSave: {
        title: 'Konieczność logowania',
        message: 'Zaloguj się, aby zapisać artykuł.',
    },
    savingSuccess: {
        title: 'Wiadomość zapisana',
        message: 'Zapisano wiadomość w Twoim Profilu'
    },
    savingFailure: {
        title: 'Wiadomość nie zostałą zapisana',
        message: 'Nie udało się zapisać wiadomości, spróbuj ponownie'
    },
    savingError: {
        title: 'Błąd zapisu',
        message: 'Pojawił się błąd podczas zapisywania wiadomości, spróbuj ponownie'
    },
    logoutFailure: {
        title: 'Wylogowywanie nie udane',
        message: 'Nie udało się wylogować. Spróbuj ponownie'
    },
    logoutError: {
        title: 'Błąd wylogowywania',
        message: 'Wystąpił problem podczas wylogowywania. Spróbuj ponownie później.'
    },
    loginError: {
        title: 'Błąd logowania',
        message: 'Nie udało się zalogować. Spróbuj ponownie'
    },
    removingFailure: {
        title: 'Atrykuł nie został usunięty',
        message: 'Nie udało się usunąć wiadomości.',
    },
    removingError: {
        title: 'Błąd usuwania artykułu',
        message: 'Nie udało się usunąć wiadomości. Błąd jest po stronie aplikacji, zgłoś do nas ten incydent, a my postaramy się jak najszybciej go rozwiązać'
    },
    noVoiceSearch: {
        title: 'Wyszukiwanie głosowe niedostępne',
        message: 'Wyszukiwanie głosowe nie jest wspierane w tej przeglądarce.'
    }
};  

let lastFocused = null;

export const handlePopUp = (key) => {
  return new Promise((resolve) => {
    const popUp = document.querySelector('.js-pop-up');
    const dialog = document.querySelector('.js-pop-up-dialog');
    const closeBtns = document.querySelectorAll('.js-close-pop-up-btn');
    const okBtn = document.querySelector('.js-ok-btn');
    const popUpTitle = document.querySelector('.js-pop-up-title');
    const popUpText = document.querySelector('.js-pop-up-desc');
    const popUpIcon = document.querySelector('.js-pop-up-icon');
    const background = document.querySelector('body');
    
    const config = popUpMessages[key];

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    const close = () => {
      const activeElement = document.activeElement;

      if (activeElement instanceof HTMLElement && popUp.contains(activeElement)) {
        activeElement.blur();
      }

      if (
        lastFocused instanceof HTMLElement &&
        document.contains(lastFocused) &&
        !popUp.contains(lastFocused)
      ) {
        lastFocused.focus({preventScroll: true});
      } else {
        document.activeElement?.blur();
      }

      background.classList.remove('no-scroll');
      popUp.ariaHidden = 'true';

      closeBtns.forEach(btn => {
        btn.removeEventListener('click', close);
      });

      okBtn.removeEventListener('click', close);
      document.removeEventListener('keydown', handleEscape);

      resolve();
    }

    popUpTitle.textContent = config.title;
    popUpText.textContent = config.message;

    const fittedIcon = (key === 'savingSuccess') ? 'check_circle' : 'warning';
    popUpIcon.textContent = fittedIcon;

    lastFocused = document.activeElement;

    popUp.ariaHidden = 'false';
    background.classList.add('no-scroll');
    dialog.focus();

    closeBtns.forEach(btn => {
      btn.addEventListener('click', close);
    });

    okBtn.addEventListener('click', close); 
    document.addEventListener('keydown', handleEscape);
  });
}