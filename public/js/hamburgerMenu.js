const menuBtn = document.querySelector('.topbar-control--menu');
const menu = document.getElementById('hamburgerMenu');
const closeBtn = document.querySelector('.hamburger-menu__close-btn');
const hamburgerTutBtn = document.querySelector('.data-hamburger-tut');
const dropdownButtons = document.querySelectorAll('.drop-up-btn');
const body = document.body;
const logoutItem = document.querySelector('.logout-item');
const authItems = document.querySelectorAll('.data-notlogged-item');

const openMenu = (e) => {
  e.preventDefault();
  menu.classList.add('active');
  body.classList.add('no-scroll');
}

const closeMenu = (e) => {
  e.preventDefault();
  menu.classList.remove('active');
  body.classList.remove('no-scroll');
}

const handleDropdowns = (dropdownBtn) => {
  const clickedDropdown = dropdownBtn.closest('.dropdown');
  const isAlreadyOpen = clickedDropdown.classList.contains('open');

  const openDropdowns = document.querySelectorAll('.dropdown.open');
  const openDropdownText = dropdownBtn.querySelector('.drop-up-btn__text');
  const openDropdownArrow = dropdownBtn.querySelector('.drop-up-btn__arrow');

  openDropdowns.forEach(dropdown => {
    dropdown.classList.remove('open');
    const text = dropdown.querySelector('.drop-up-btn__text');
    const icon = dropdown.querySelector('.drop-up-btn__arrow');
    if (text) text.textContent = 'rozwiń';
    if (icon) icon.textContent = 'arrow_drop_down';
  });

  if (!isAlreadyOpen) {
    clickedDropdown.classList.add('open');
    if (openDropdownText) openDropdownText.textContent = 'zwiń';
    if (openDropdownArrow) openDropdownArrow.textContent = 'arrow_drop_up';
  }
} 

const updateAuthMenu = async () => {
  try {
    const res = await fetch('/api/me');

    if (!res.ok) {
      throw new Error('Failed to fetch auth state');
    }

    const data = await res.json();

    if (!logoutItem && authItems.length === 0) return;

    if (data.loggedIn) {
      if (logoutItem) logoutItem.classList.add('visible');
      authItems.forEach(item => { item.classList.add('hidden'); });
    } else {
      if (!logoutItem) logoutItem.classList.remove('visible');
      authItems.forEach(item => { item.classList.remove('hidden'); });
    };
  } catch (err) {
    console.warn('updateAuthMenu failed:', err);
  }
}

updateAuthMenu();

const logout = async (e) => {
  const target = e.target.closest('#logout-btn');
  if (!target) return;
  e.preventDefault();

  try {
    const res = await fetch('/api/logout', { method: 'POST' });

    if(!res.ok) {
      throw new Error('Logout failed')
    }

    location.href = '/';
  } catch(err) {
    console.warn('Logout failed:', err);
  }
};

menuBtn?.addEventListener('click', openMenu);

[closeBtn, hamburgerTutBtn].forEach(btn => {
  btn?.addEventListener('click', closeMenu);
});

dropdownButtons.forEach((dropdownBtn) => {
  dropdownBtn.addEventListener('click', () => handleDropdowns(dropdownBtn));
});

document.addEventListener('click', logout);
