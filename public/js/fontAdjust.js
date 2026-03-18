const fontToggles = document.querySelectorAll('.data-aaa');
const aIcons = document.querySelectorAll('.data-icon-a-plus');
const root = document.documentElement;
let currentSize = 1;
const fontSizes = [1, 1.5, 2];

const bottomBar = document.querySelector('.bottom-nav-bar');
const topBar = document.querySelector('.top-bar');
const space = document.querySelector('.space');
const hero = document.querySelector('.hero');
const aPlusIcon = document.querySelector('.data-first-aaa');

const updateHeightSpace = () => {
  if (bottomBar && space) {
    const height = bottomBar.offsetHeight;
    space.style.height = height + 'px';
  }
}

const updateHeroMarginTop = () => {    
  if (topBar && hero) {
    const height = topBar.offsetHeight;
    hero.style.marginTop = height + 'px';
  }
}

const updateLayout = () => {
  updateHeightSpace();
  updateHeroMarginTop();
}

const fontAdjust = (e) => {
    e.preventDefault();

    if (currentSize === fontSizes[0]) {
      currentSize = fontSizes[1];
    } else if (currentSize === fontSizes[1]) {
      currentSize = fontSizes[2];
    } else {
      currentSize = fontSizes[0];
    }

    root.style.fontSize = currentSize + 'rem';
    
    const iconText = currentSize === fontSizes[2] ? 'text_decrease' : 'text_increase';
    aIcons.forEach(aIcon => {
      aIcon.textContent = iconText;
    });
}

fontToggles.forEach((fontToggle) => {
  fontToggle.addEventListener('click', fontAdjust);
});

aPlusIcon?.addEventListener('click', () => {
  setTimeout(updateLayout, 100);
});

