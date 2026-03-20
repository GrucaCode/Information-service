document.addEventListener("DOMContentLoaded", async () => {
  const qs = new URLSearchParams(location.search);
  const tmpId   = qs.get("id");    
  const savedId = qs.get("savedId");   

  const toPLDate = (date) => {
    if (!date) return "—";
    const dataObj = new Date(date);
    return dataObj.toLocaleDateString("pl-PL");
  }

  const splitIntoParagraphs = (text, maxSentencesPerPara = 4) => {
    if (!text) return [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    const paras = [];
    while (sentences.length) paras.push(sentences.splice(0, maxSentencesPerPara).join(" "));
    return paras;
  };

  const buildLead = (text) => {
    if (!text) return "";
    const firstTwoSentences = text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
    return firstTwoSentences;
  };

  const articleDataToObject = (articleData) => {
    return {
      title: articleData.title || "",
      image: articleData.image || articleData.urlToImage || "",
      url: articleData.url || "#",
      summary: articleData.text || articleData.summary || "",
      publishedAt: articleData.publish_date || articleData.publishedAt || null,
      author: articleData.author || ""
    }
  }

  const getSavedArticle = async () => {
    const res = await fetch(`/api/saved/${encodeURIComponent(savedId)}`);

    if (res.status === 401) {
      location.href = "profile.html?view=login";
      throw new Error("Unauthorised access");
    }

    const data = await res.json();
    if (!data.success || !data.item) {
      throw new Error("Invalid response data");
    }

    const dataItem = data.item;

    return articleDataToObject(dataItem)
  } 

  const getLocalArticle = () => {
    const rawData = localStorage.getItem(`article-${tmpId}`);

    if (!rawData) {
      throw new Error('Failed to get local article data');
    }

    const article = JSON.parse(rawData);

    return articleDataToObject(article)
  }

  const titleEl = document.querySelector(".data-news-title");
  const imgEl = document.querySelector(".data-news-image");
  const textEl = document.querySelector(".data-news-text");
  const sumEl = document.querySelector(".data-news-sum");
  const authorEl = document.querySelector(".data-news-author");
  const dateEl = document.querySelector(".data-publish-date");
  const newsSourceBtn = document.querySelector(".data-source-btn");
  const saveBtn = document.querySelector(".data-save-btn");

  const renderArticle = (article) => {
    titleEl.textContent = article.title;
    imgEl.src = article.image;
    authorEl.textContent = article.author;
    dateEl.textContent = toPLDate(article.publishedAt);

    const lead = buildLead(article.summary);
    sumEl.textContent = lead;

    const paras = splitIntoParagraphs(article.summary, 5);
    textEl.innerHTML = paras.map(p => `<p>${p}</p>`).join("");
  }

  const handleArticleBtns = (article) => {
    if (newsSourceBtn) newsSourceBtn.href = article.url || "#";
    if (savedId && saveBtn) {
      saveBtn.setAttribute("disabled", "true");
      saveBtn.classList.add("deactivated");
    }
  }

  let article = null;

  try {

    if (savedId) {
      article = await getSavedArticle();
    } else if (tmpId) {
      article = getLocalArticle();
    } else {
      throw new Error ("Failed to get any articles");
    }

    renderArticle(article);
    handleArticleBtns(article);   

  } catch (err) {
    console.error(err);

    document.body.innerHTML = `
      <main class="news"><div class="news__content">
        <p>${err.message}</p>
        <p><a href="index.html">← Wróć na stronę główną</a></p>
      </div></main>`;
  }


  const saveArticle = async (article) => {
    saveBtn.disabled = true;
    try {
      const payload = articleDataToObject(article);

      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        alert("Zaloguj się, aby zapisać artykuł.");
        location.href = "profile.html?view=login";
        return;
      }

      const data = await res.json();
      if (data.success) {
        alert("Zapisano wiadomość w Twoim Profilu!");
      } else {
        alert("Nie udało się zapisać wiadomości, spróbuj ponownie");
      }

    } catch (err) {
      console.error(err);
      alert("Błąd zapisu.");
        
    } finally {
      saveBtn.disabled = false;
    }
  }

  if (!savedId && saveBtn) {
    saveBtn.addEventListener("click", () => saveArticle(article));
  }
});