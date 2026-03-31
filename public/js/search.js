import { toPLDate } from "./utils.js";
import { goToArticle } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchQuery');
  const searchBtn = document.querySelector('.search-btn');
  const micBtn = document.querySelector('.mic-btn');
  const micIcon = document.getElementById('mic-icon');
  const clearBtn = document.querySelector('.clean-btn');
  const resultsWrap = document.querySelector('.results');

  const hideResults = () => {
    resultsWrap.innerHTML = '';
    resultsWrap.setAttribute('hidden', true);
  }

  const prepareToRender = () => {
    resultsWrap.innerHTML = '';
    resultsWrap.removeAttribute('hidden');
  }

  const clearResults = (e) => {
    e.preventDefault();
    searchInput.value = '';
    hideResults();
  }

  const renderEmptyResults = () => {
    resultsWrap.innerHTML = `
      <p>Nie znaleziono wyników dla podanego zapytania. Użyj innego słowa lub frazy</p>
      <img src="img/Empty_graphics.svg" alt="Grafika informująca o braku wyników">
    `;
  }

  const renderResultCard = (article) => {
      const date = toPLDate(article.publish_date);

      resultsWrap.insertAdjacentHTML('beforeend',`
        <article class="result-card">
          ${article.image ? `<img src="${article.image}" alt="${article.title}" class="result-card__img">`: ""}
          <div class="result-card__content">
            <h3 class="result-card__title">${article.title}</h3>
              <div class="result-card__actions">
                <button class="btn-read-more" data-article-id="${article.id}">
                  <div class="btn-read-more__frame">Czytaj</div>
                </button>
              </div>
            <img src="img/Menu line.svg" alt="linia dekoracyjna oddzielająca menu od tekstu" class="result-card__decor-line">
            <div class="result-card__info">
              <p class="result-card__label">Data:</p>
              <p class="result-card__date">${date}</p>
            </div>
          </div>
        </article>
      `);
  }

  const renderResults = (foundNews = []) => {
    prepareToRender();

    if(!foundNews.length) {
      renderEmptyResults();
      return;
    }

    foundNews.forEach((article) => {
      renderResultCard(article);
    });
  }

  const performSearch = async (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) {
      hideResults();
      return;
    }
    try {
      const r = await fetch(`/api/news/search?q=${encodeURIComponent(q)}`);
      const data = await r.json();

      if (!data.success) {
        renderResults([]);
        return;
      }

      renderResults(data.news || []);
    } catch (err) {
      console.error(err);
      renderResults([]);
    }
  }

  resultsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-read-more');
    if(!btn) return;

    const newsId = btn.getAttribute('data-article-id');
    goToArticle({id: newsId});
  });  

  searchBtn?.addEventListener('click', (e) => performSearch(e));

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch(e);
  });

  clearBtn?.addEventListener('click', (e) => clearResults(e));

  
  // Wyszukiwanie głosowe
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (micBtn && SpeechRecognition) {
    const recog = new SpeechRecognition();
    recog.lang = 'pl-PL';
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    let listening = false;

    micBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!listening) {
        try {
          recog.start();
          listening = true;
          micIcon.textContent = 'settings_voice';
        } catch (err) {
          console.error(err);
        }
      } else {
        recog.stop();
      }
    });

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      searchInput.value = transcript;
      micIcon.textContent = 'mic';
      listening = false;
      performSearch();
    };

    recog.onerror = () => {
      micIcon.textContent = 'mic';
      listening = false;
    };

    recog.onend = () => {
      micIcon.textContent = 'mic';
      listening = false;
    };

  } else if (micBtn) {
    micBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Wyszukiwanie głosowe nie jest wspierane w tej przeglądarce.');
    });
  }
});