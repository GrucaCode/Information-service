document.addEventListener("DOMContentLoaded", async () => {
  const qs = new URLSearchParams(location.search);
  const newsId = qs.get("id");    
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
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("pl-PL");
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

  const getArticle = async () => {
    const res = await fetch(`/api/news/retrieve?ids=${encodeURIComponent(newsId)}`);
    const data = await res.json();

    if (!res.ok || !data.success || !data.news?.length) {
      throw new Error("Nie udało się pobrać artykułu z API");
    }

    return articleDataToObject(data.news[0]);
  }

  let article = null;

  const renderArticle = (article) => {
    if (titleEl) titleEl.textContent = article.title;
    if (imgEl) imgEl.setAttribute("src", `${article.image}`);
    if (authorEl) authorEl.textContent = article.author;
    if (dateEl) dateEl.textContent = toPLDate(article.publishedAt);
    if (sumEl) sumEl.textContent = article.summary;

    const paras = splitIntoParagraphs(article.text, 5);
    if (textEl) textEl.innerHTML = paras.map(p => `<p>${p}</p>`).join("");

    if (newsSourceBtn) newsSourceBtn.href = article.url || "#";
  }

  const disableSaveBtn = () => {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.classList.add("deactivated");
    }
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
    } else if (newsId) {
      article = await getArticle();
    } else {
      throw new Error ("Failed to get any articles");
    }

    renderArticle(article);
     
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