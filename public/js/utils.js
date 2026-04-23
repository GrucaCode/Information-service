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
  const loader = document.querySelector(".data-loader");
  if (!loader) return;
  loader.classList.remove("is-hidden");
}

export const hideLoader = () => {
  const loader = document.querySelector(".data-loader");
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