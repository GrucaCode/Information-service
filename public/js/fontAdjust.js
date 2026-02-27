const fontToggles = document.querySelectorAll('.data-aaa');
const aIcons = document.querySelectorAll('.data-icon-a-plus');
const root = document.documentElement;

let currentSize = 1;
const fontSizes = [1, 1.5, 2];

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

