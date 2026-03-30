export const toPLDate = (date) => {
  if (!date) return "—";
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("pl-PL");
}

export const goToArticle = (article) => {
  if (!article?.id) return;
  window.location.href = `article.html?id=${encodeURIComponent(article.id)}`;
};