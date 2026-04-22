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