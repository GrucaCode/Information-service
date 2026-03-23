document.addEventListener("DOMContentLoaded", async () => {
  const qs = new URLSearchParams(location.search);
  const tmpId   = qs.get("id");    
  const savedId = qs.get("savedId");   

  const titleEl = document.querySelector(".data-news-title");
  const imgEl = document.querySelector(".data-news-image");
  const textEl = document.querySelector(".data-news-text");
  const sumEl = document.querySelector(".data-news-sum");
  const authorEl = document.querySelector(".data-news-author");
  const dateEl = document.querySelector(".data-publish-date");
  const newsSourceBtn = document.querySelector(".data-source-btn");
  const saveBtn = document.querySelector(".data-save-btn");

  const toPLDate = (date) => {
    if (!date) return "—";
    const dataObj = new Date(date);
    return dataObj.toLocaleDateString("pl-PL");
  }

  const splitIntoParagraphs = (text, maxSentencesPerPara = 4) => {
    if (!text) return [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    const paras = [];

    for (let i = 0; i < sentences.length; i += maxSentencesPerPara) {
      paras.push(sentences.slice(i, i + maxSentencesPerPara).join(" "));
    }

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

  let article = null;

  const renderArticle = (article) => {
    console.log(article);

    if (titleEl) titleEl.textContent = article.title;
    if (imgEl) imgEl.src = article.image;
    if (authorEl) authorEl.textContent = article.author;
    if (dateEl) dateEl.textContent = toPLDate(article.publishedAt);

    const lead = buildLead(article.summary);
    if (sumEl) sumEl.textContent = lead;

    const paras = splitIntoParagraphs(article.summary, 5);
    if (textEl) textEl.innerHTML = paras.map(p => `<p>${p}</p>`).join("");
  }

  const disableSaveBtn = () => {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.classList.add("deactivated");
    }
  }

  const setSourceLink = (article) => {
    if (newsSourceBtn) newsSourceBtn.href = article.url || "#";
  }

  const saveArticle = async (article) => {
    disableSaveBtn();
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(article)
      });

      if (res.status === 401) {
        alert("Zaloguj się, aby zapisać artykuł.");
        location.href = "profile.html?view=login";
        return;
      } else if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
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
      saveBtn.disabled = false 
    }
  }

  try {
    if (savedId) {
      article = await getSavedArticle();
      disableSaveBtn();
    } else if (tmpId) {
      article = getLocalArticle();
    } else {
      throw new Error ("Failed to get any articles");
    }

    renderArticle(article);
    setSourceLink(article);  
     
  } catch (err) {
    console.error(err);

    document.body.innerHTML = `
      <main class="news"><div class="news__content">
        <p>${err.message}</p>
        <p><a href="index.html">← Wróć na stronę główną</a></p>
      </div></main>`;
  }

  if (!savedId && saveBtn) {
    saveBtn.addEventListener("click", () => saveArticle(article));
  }
});