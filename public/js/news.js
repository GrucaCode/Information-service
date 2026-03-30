import { goToArticle } from "./utils.js";

const slidesContainer = document.querySelector('.slider__slides');
const dotsContainer = document.querySelector('.slider__dots');
const nextArrow = document.querySelector('.slider-nav__arrow--next');
const prevArrow = document.querySelector('.slider-nav__arrow--prev');

const createDot = (index) => {
  const dot = document.createElement('i');
  dot.className = 'material-icons-outlined slider__dot';
  dot.textContent = index === 0 ? 'radio_button_checked' : 'brightness_1';
  dot.dataset.index = index;
  return dot;
};

const createSlide = (article, index) => {
  const slide = document.createElement('div');      
  slide.classList.add('article');

  const isActive = index === 0;

  if (isActive) {
    slide.classList.add('active');
  } else {
    slide.classList.remove('active');
  }

  slide.innerHTML = `
    <div class="article__image-container">
      <img src="${article.image}" alt="${article.title}" class="article__image">
    </div>
    <div class="article__content">
        <div class="article__text">
          <h3 class="article__title">${article.title}</h3>
          <p class="article__sum">${article.summary || ''}</p>
        </div>
        <button class="btn-read-more">
            <div class="btn-read-more__frame">Czytaj dalej</div>
        </button>
        <img src="img/Menu line.svg" alt="linie" class="article__line">
        <div class="date">
          <p class="date__label">Data:</p>
          <p class="date__text">${new Date(article.publish_date).toLocaleDateString('pl-PL')}</p>
        </div>
    </div>
    `;

  return slide;
}

document.addEventListener("DOMContentLoaded", () => {
  fetch('/api/news')
    .then(res => res.json())
    .then(data => {
      const articles = data.news;
      const articlesLen = data.number;
      
      if (!articles || !articlesLen) return;

      articles.forEach((article, index) => {
        const slide = createSlide(article, index);

        slidesContainer.appendChild(slide);

        const readMoreBtn = slide.querySelector('.btn-read-more');

        readMoreBtn.addEventListener('click', () => goToArticle(article));
        
        dotsContainer.appendChild(createDot(index));
      });

      const slides = document.querySelectorAll('.article');
      const dots = document.querySelectorAll('.slider__dot');

      let currentIndex = 0;

      // Display slide and navigation dot based on the index change
      const displaySlide = (index) => {
        slides.forEach((slide, i) => {
          const isActive = i === index;
          if (isActive) {
            slide.classList.add('active');
            dots[i].textContent = 'radio_button_checked';
          } else {
            slide.classList.remove('active');
            dots[i].textContent = 'brightness_1';
          }
        });
        currentIndex = index;
      }

      nextArrow.addEventListener('click', () => {
        const next = (currentIndex + 1) % articlesLen;
        displaySlide(next);
      });

      prevArrow.addEventListener('click', () => {
        const prev = (currentIndex - 1 + articlesLen) % articlesLen;
        displaySlide(prev);
      });

      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          const index = parseInt(dot.dataset.index);
          displaySlide(index);
        });
      });
    });
});