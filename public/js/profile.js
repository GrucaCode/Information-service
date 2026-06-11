import { toPLDate, goToArticle, handlePopUp } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const savedList = document.getElementById("saved-list");
  const sortSelect = document.getElementById("sort");

  const getSavedArticlesIds = async (sort = 'newest') => {
    try {
      const r = await fetch(`/api/saved?sort=${encodeURIComponent(sort)}`);
      if (r.status === 401) {
        return [];
      }
      const data = await r.json();
      const ids = data.ids.map(item => item.newsId) || [];
     
      return ids;

    } catch(err) {
      console.error(err);
      return [];
    }
  }

  const retriveArticlesfromIds = async (ids) => {
    if (!Array.isArray(ids) || !ids.length) {
      return [];
    }

    const idsParam = ids.join(",");
    const res = await fetch(`/api/news/retrieve?ids=${encodeURIComponent(idsParam)}`);
    const data = await res.json();

    if (!res.ok || !data.success || !data.news?.length) {
      throw new Error("Nie udało się pobrać artykułu z API");
    }

    return data.news;
  }

  const renderEmptyState = () => {
    if (savedList) {
      savedList.innerHTML = `
        <div class="no-saved">
          <p class="no-saved__text">Brak zapisanych wiadomości, aby zapisać wiadomość przejdź do strony artykułu i kliknij w przycisk Zapisz w profilu</p>
          <img src="img/Empty_graphics.svg" alt="Grafika informująca o braku zapisanych wiadomości" class="no-saved__img">
        </div>`;
    }
  }

  const renderSavedArticles = (news) => {
    if (!news.length) {
      renderEmptyState();
      return;
    }

    if (savedList) {
      savedList.innerHTML = news.map(item => {
      const date = toPLDate(item.publish_date);

      return `
        <div class="saved-sec__wrapper saved" data-id="${item.id}">
          <div class="saved__img-container">
            ${item.image ? `<img src="${item.image}" alt="${item.title}" class="saved-sec__img">` : ""}
          </div>
          <div class="saved__content">
            <h3 class="saved__title">${item.title}</h3>
            <button class="btn-read-more saved__read-btn" data-url="${item.url}">
              <div class="saved__btn-frame">Czytaj</div>
            </button>
            <img src="img/Menu line.svg" alt="" class="saved__decor-line">
            <div class="saved__info">
              <p class="saved__date-label">Data:</p>
              <p class="saved__date">${date}</p>
            </div>
          </div>
          <button class="delete-btn" data-id="${item.id}">
            <div class="delete-btn__frame">
              <i class="material-icons-outlined delete-btn__icon">delete</i>
              <p class="delete-btn__text">Usuń</p>
            </div>
          </button>
        </div>
      `;
      }).join("");
    }

  }

  const loadSavedArticles = async (sort = "newest") => {
    const ids = await getSavedArticlesIds(sort);
    const savedArticles = await retriveArticlesfromIds(ids);
    renderSavedArticles(savedArticles);
  }  

  const deleteSavedArticle = async (newsId, card) => {
    try {
      const response = await fetch(`/api/saved/${newsId}`, { method: 'DELETE' });
      const data = await response.json();

      if (!data.success) {
        await handlePopUp('removingFailure');
        return;
      }

      card?.remove();

      if (savedList && !savedList.children.length) {
        renderEmptyState();
      }

    } catch(err) {
      console.error(err);
      await handlePopUp('removingError');
    }
  }

  sortSelect?.addEventListener('change', () => {
    loadSavedArticles(sortSelect.value);
  });

  savedList?.addEventListener("click", async (e) => {
    const readButton = e.target.closest(".saved__read-btn");
    const deleteBtn = e.target.closest(".delete-btn");
    const card = e.target.closest(".saved");

    if (!card) return;
    const articleId = card.dataset.id;

    if (readButton) {
      goToArticle({id: articleId})
    }

    if (deleteBtn) {
      await deleteSavedArticle(articleId, card)
    }
  });


  try {
    const meRes = await fetch("/api/me");
    const meData = await meRes.json();

    if (meData.loggedIn) {
      await loadSavedArticles("newest");
    }
  } catch (err) {
    console.error("Failed to check if user is logged in", err);
  }
});

