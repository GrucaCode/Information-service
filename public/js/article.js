import { 
  toPLDate, 
  showLoader, 
  hideLoader, 
  checkUserLogin, 
  handlePopUp,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const qs = new URLSearchParams(location.search);
  const newsId = qs.get("id"); 

  const titleEl = document.querySelector(".data-news-title");
  const imgEl = document.querySelector(".data-news-image");
  const textEl = document.querySelector(".data-news-text");
  const sumEl = document.querySelector(".data-news-sum");
  const authorEl = document.querySelector(".data-news-author");
  const dateEl = document.querySelector(".data-publish-date");
  const newsSourceBtn = document.querySelector(".data-source-btn");
  const saveBtn = document.querySelector(".data-save-btn");
  const articleContent = document.querySelector(".data-news-content");

  const splitIntoParagraphs = (text, maxSentencesPerPara = 4) => {
    if (!text) return [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    const paras = [];

    for (let i = 0; i < sentences.length; i += maxSentencesPerPara) {
      paras.push(sentences.slice(i, i + maxSentencesPerPara).join(" "));
    }

    return paras;
  };

  const articleDataToObject = (articleData) => {
    return {
      id: articleData.id || null,
      title: articleData.title || "",
      image: articleData.image || articleData.urlToImage || "",
      url: articleData.url || "#",
      summary: articleData.summary || "",
      text: articleData.text || "",
      publishedAt: articleData.publish_date || articleData.publishedAt || null,
      author: Array.isArray(articleData.authors)
        ? articleData.authors.join(", ")
        : (articleData.author || "")
    };
  };

  const getArticle = async (ids) => {
    const res = await fetch(`/api/news/retrieve?ids=${encodeURIComponent(ids)}`);
    const data = await res.json();

    if (!res.ok || !data.success || !data.news?.length) {
      throw new Error("Nie udało się pobrać artykułu z API");
    }

    return articleDataToObject(data.news[0]);
  }

  let article = null;

  const renderArticle = (article) => {
    const paras = splitIntoParagraphs(article.text, 5);

    if (titleEl) titleEl.textContent = article.title;
    if (imgEl) imgEl.setAttribute("src", `${article.image}`);
    if (authorEl) authorEl.textContent = article.author;
    if (dateEl) dateEl.textContent = toPLDate(article.publishedAt);
    if (sumEl) sumEl.textContent = article.summary;
    if (textEl) textEl.innerHTML = paras.map(p => `<p>${p}</p>`).join("");
    if (newsSourceBtn) newsSourceBtn.href = article.url || "#";
  }

  const renderEmptyArticle = () => {
    articleContent.innerHTML = `
      <main class="news">
        <div class="news__content">
          <p>Nie znaleziono artykułu</p>
          <p><a href="/">← Wróć na stronę główną</a></p>
        </div>
      </main>`;
  }

  const disableSaveBtn = () => {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.classList.add("deactivated");
    }
  }

  const activateSaveBtn = () => {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.classList.remove("deactivated");
    }
  }

  const checkIfSaved = async () => {
    try {    
      const res = await fetch(`/api/saved/check/${encodeURIComponent(newsId)}`);
      const data = await res.json();

      if (res.status === 401) {
        return false;
      }
      
      if (!res.ok || !data.success) {
        console.error("Failed to check saved status", res.status);
        return false;
      }

      return data.saved;
    } catch (err) {
      console.error("Error checking saved article:", err);
      return false;
    }
  }

  const saveArticle = async (article) => {
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ id: article.id })
      });

      if (res.status === 401) {
        await handlePopUp('loginToSave');

        location.href = "/profile?view=login";
        return;
      } else if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const data = await res.json();
      if (data.success) {
        disableSaveBtn();
        await handlePopUp('savingSuccess');
      } else {
        activateSaveBtn();
        await handlePopUp('savingFailure');
      }

    } catch (err) {
      console.error(err);
      await handlePopUp('savingError');
      saveBtn.disabled = false
    }
  }

  showLoader();

  try {  
    if (newsId) {
      article = await getArticle(newsId);
      const session = await checkUserLogin();
      if (session) {
          const isSaved = await checkIfSaved();
          if (isSaved) disableSaveBtn();
      }
      renderArticle(article);
    } else {
      throw new Error ("Failed to get any articles");
    }
  } catch (err) {
    renderEmptyArticle();
  } finally {
    hideLoader();
  }

  saveBtn?.addEventListener("click", () => saveArticle(article));
});