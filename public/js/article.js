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

    return {
      title: dataItem.title || "",
      image: dataItem.image || "",
      text: dataItem.summary || "",
      publish_date: dataItem.publishedAt || null,
      author: dataItem.author || ""
    }
  } 

  const getLocalArticle = () => {
    const rawData = localStorage.getItem(`article-${tmpId}`);

    if (!rawData) {
      throw new Error('Failed to get local article data');
    }

    const article = JSON.parse(rawData);

    return {
      title: article.title || "",
      image: article.image || article.urlToImage || "",
      url: article.url || "#",
      text: article.text || article.content || article.description || "",
      publish_date: article.publish_date || article.publishedAt || null,
      author: article.author || ""
    }
  }

  // // Pobieranie danych z artykułu 
  // try {
  //   if (savedId) {
  //     const res = await fetch(`/api/saved/${encodeURIComponent(savedId)}`);
  //     if (res.status === 401) {
  //       location.href = "profile.html?view=login";
  //       return;
  //     }
  //     const data = await res.json();
  //     if (!data.success || !data.item) throw new Error("Invalid response data");

  //     console.log(data.item);

  //     const it = data.item;
  //     article = {
  //       title: it.title || "",
  //       image: it.image || "",
  //       url:   it.url   || "#",
  //       text:  it.summary || "",
  //       publish_date: it.publishedAt || null,
  //       author: it.author || ""
  //     };
  //   } else if (tmpId) {
  //     const raw = localStorage.getItem(`article-${tmpId}`);
  //     if (!raw) throw new Error("Artykuł wygasł lub nie istnieje.");
  //     article = JSON.parse(raw);
  //     article = {
  //       title: article.title || "",
  //       image: article.image || article.urlToImage || "",
  //       url:   article.url   || "#",
  //       text:  article.text  || article.content || article.description || "",
  //       publish_date: article.publish_date || article.publishedAt || null,
  //       author: article.author || ""
  //     };
  //   } else {
  //     throw new Error("Brak identyfikatora artykułu w URL.");
  //   }
  // } catch (err) {
  //   console.error(err);
  //   document.body.innerHTML = `
  //     <main class="news"><div class="news__content">
  //       <p>${err.message}</p>
  //       <p><a href="index.html">← Wróć na stronę główną</a></p>
  //     </div></main>`;
  //   return;
  // }

  const titleEl = document.querySelector(".data-news-title");
  const imgEl = document.querySelector(".data-news-image");
  const textEl = document.querySelector(".data-news-text");
  const sumEl = document.querySelector(".data-news-sum");
  const authorEl = document.querySelector(".data-news-author");
  const dateEl = document.querySelector(".data-publish-date");
  const newsSourceBtn = document.querySelector(".data-source-btn");
  const saveBtn = document.querySelector(".data-save-btn");

  // if (titleEl)  titleEl.textContent = article.title || "";
  // if (imgEl)   { imgEl.src = article.image || ""; imgEl.alt = article.title || ""; }
  // if (authorEl) authorEl.textContent = article.author || "—";
  // if (dateEl)   dateEl.textContent   = toPLDate(article.publish_date);

  // const lead = article.summary || buildLead(article.text);
  // if (sumEl) sumEl.textContent = lead;

  // // dzielenie tekstu na akapity
  // if (textEl) {
  //   const paras = splitIntoParagraphs(article.text, 5);
  //   textEl.innerHTML = paras.map(p => `<p>${p}</p>`).join("");
  // }

  const renderArticle = (article) => {
    titleEl.textContent = article.title;
    imgEl.src = article.image;
    authorEl.textContent = article.author || "—";
    dateEl.textContent = toPLDate(article.publish_date);

    const lead = buildLead(article.text);
    sumEl.textContent = lead;

    const paras = splitIntoParagraphs(article.text, 5);
    textEl.innerHTML = paras.map(p => `<p>${p}</p>`).join("");
  }

  const handleArticleBtns = (article) => {
    if (newsSourceBtn) newsSourceBtn.href = article.url || "#";
    if (savedId && saveBtn) {
      saveBtn.setAttribute("disabled", "true");
      // saveBtn.style.backgroundColor = " #616161";
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


  // Zapisywanie artykułu do profilu
  if (!savedId && saveBtn) {
    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      try {
        const payload = {
          title: article.title,
          url: article.url,
          image: article.image,
          summary: article.text || "",
          publishedAt: article.publish_date || null
        };
        const r = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify(payload)
        });
        if (r.status === 401) {
          alert("Zaloguj się, aby zapisać artykuł.");
          location.href = "profile.html?view=login";
          return;
        }
        const data = await r.json();
        alert(data.success ? (data.message || "Zapisano wiadomość w Twoim Profilu!") : (data.message || "Nie udało się zapisać wiadomości, spróbuj ponownie"));
      } catch (e) {
        console.error(e);
        alert("Błąd zapisu.");
      } finally {
        saveBtn.disabled = false;
      }
    });
  }
});