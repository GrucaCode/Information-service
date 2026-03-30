import { toPLDate } from "./utils.js";
import { goToArticle } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  const userSection = document.getElementById("user-section");
  const userNameSpans = document.querySelectorAll(".user-name");

  const toggleToLoginBtn = document.getElementById("show-login");
  const toggleToRegisterBtn = document.getElementById("show-register");

  const seePassBtn = document.querySelector(".see-pass-btn");
  const passwordInput = document.getElementById("login-password");
  const visibilityIcon = document.getElementById("eye-opened-icon");
  const seePassText = document.querySelector(".data-see-pass-text");

  const regSeePassBtn = document.querySelector(".register-see-pass-btn");
  const regPasswordInput = document.querySelector("#register-form input[name='password']");
  const regVisibilityIcon = document.querySelector("#register-form .see-pass-btn__visibility");
  const regSeePassText = document.querySelector("#register-form .see-pass-text");

  const loginEmail = document.querySelector("#login-form input[name='email']");
  const loginPassword = document.querySelector("#login-form input[name='password']");
  const loginBtn = document.querySelector(".data-login-submit-btn");
  const loginFrame = document.querySelector(".data-submit-frame");

  const firstNameEl = document.getElementById("user-firstName");
  const lastNameEl = document.getElementById("user-lastName");
  const emailEl = document.getElementById("user-email");

  const registerFirstName = document.querySelector("#register-form input[name='firstName']");
  const registerLastName = document.querySelector("#register-form input[name='lastName']");
  const registerEmail = document.querySelector("#register-form input[name='email']");
  const registerPassword = document.querySelector("#register-form input[name='password']");
  const registerBtn = document.querySelector(".data-register-submit-btn");
  const registerFrame = document.querySelector(".register-submit-btn__frame");

  const params = new URLSearchParams(window.location.search);
  const view = params.get("view")

  const savedList = document.getElementById("saved-list");
  const sortSelect = document.getElementById("sort");

  if (view === "login") {
    loginSection.style.display = "block";
    registerSection.style.display = "none";
  }   else if (view === "register") {
    loginSection.style.display = "none";
    registerSection.style.display = "block";
  }
  else {
    userSection.style.display = "none";
    if (view === "register") {
      loginSection.style.display = "none";
      registerSection.style.display = "block";
    } else {
      loginSection.style.display = "block";
      registerSection.style.display = "none";
    }
  }
  
  // Przełączanie widoku logowania i rejestracji
  if (toggleToLoginBtn) {
    toggleToLoginBtn.addEventListener("click", () => {
      registerSection.style.display = "none";
      loginSection.style.display = "block";
    });
  }

  if (toggleToRegisterBtn) {
    toggleToRegisterBtn.addEventListener("click", () => {
      loginSection.style.display = "none";
      registerSection.style.display = "block";
    });
  }

  // Sprawdzenie czy użytkownik jest zalogowny - wyświetlenie odpowiedniego widoku
  fetch('/api/me')
  .then(res => res.json())
  .then(data => {
    if (data.loggedIn) {
      loginSection.style.display = "none";
      registerSection.style.display = "none";
      userSection.style.display = "block";
      userNameSpans.forEach(span => span.textContent = data.user.firstName);

      if (firstNameEl && lastNameEl && emailEl) {
        firstNameEl.textContent = data.user.firstName;
        lastNameEl.textContent = data.user.lastName;
        emailEl.textContent = data.user.email;
      }
    } else {
      if (view === "register") {
        loginSection.style.display = "none";
        registerSection.style.display = "block";
        userSection.style.display = "none";
      } else {
        loginSection.style.display = "block";
        registerSection.style.display = "none";
        userSection.style.display = "none";
      }
    }
  });

  // Logowanie
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email.value,
        password: form.password.value
      })
    });

    const data = await res.json();
    if (data.success) {
      window.location.reload();
    } else {
      document.getElementById("login-message").textContent = data.message || "Błąd logowania. Spróbuj zalogować się jeszcze raz";
    }
  });

  async function getSavedArticlesIds(sort = 'newest') {
    try {
      const r = await fetch(`/api/saved?sort=${encodeURIComponent(sort)}`);
      if (r.status === 401) {
        return [];
      }
      const data = await r.json();
      const ids = data.ids.map(item => item.newsId) || [];
     
      return ids;

    } catch(err) {
      console.error(err);
      return [];
    }
  }

  const retriveArticlesfromIds = async (ids) => {
    if (!Array.isArray(ids) || !ids.length) {
      return [];
    }

    const idsParam = ids.join(",");
    const res = await fetch(`/api/news/retrieve?ids=${encodeURIComponent(idsParam)}`);
    const data = await res.json();

    if (!res.ok || !data.success || !data.news?.length) {
      throw new Error("Nie udało się pobrać artykułu z API");
    }

    return data.news;
  }

  const renderEmptyState = () => {
    if (savedList) {
      savedList.innerHTML = `
        <div class="no-saved">
          <p class="no-saved__text">Brak zapisanych wiadomości, aby zapisać wiadomość przejdź do strony artykułu i kliknij w przycisk Zapisz w profilu</p>
          <img src="img/Empty_graphics.svg" alt="Grafika informująca o braku zapisanych wiadomości" class="no-saved__img">
        </div>`;
    }
  }

  const renderSavedArticles = (news) => {
    if (!news.length) {
      renderEmptyState();
      return;
    }

    if (savedList) {
      savedList.innerHTML = news.map(item => {
      const date = toPLDate(item.publish_date);

      return `
        <div class="saved-sec__wrapper saved" data-id="${item.id}">
          <div class="saved__img-container">
            ${item.image ? `<img src="${item.image}" alt="" class="saved-sec__img">` : ""}
          </div>
          <div class="saved__content">
            <h3 class="saved__title">${item.title}</h3>
            <button class="btn-read-more saved__read-btn" data-url="${item.url}">
              <div class="saved__btn-frame">Czytaj</div>
            </button>
            <img src="img/Menu line.svg" alt="" class="saved__decor-line">
            <div class="saved__info">
              <p class="saved__date-label">Data:</p>
              <p class="saved__date">${date}</p>
            </div>
          </div>
          <button class="delete-btn" data-id="${item.id}">
            <div class="delete-btn__frame">
              <i class="material-icons-outlined delete-btn__icon">delete</i>
              <p class="delete-btn__text">Usuń</p>
            </div>
          </button>
        </div>
      `;
      }).join("");
    }

  }

  const loadSavedArticles = async (sort = "newest") => {
    const ids = await getSavedArticlesIds(sort);
    const savedArticles = await retriveArticlesfromIds(ids);
    renderSavedArticles(savedArticles);
  }  

  const deleteSavedArticle = async (newsId, card) => {
    try {
      const response = await fetch(`/api/saved/${newsId}`, { method: 'DELETE' });
      const data = await response.json();

      if (!data.success) {
        alert("Nie udało się usunąć wiadomości.");
        return;
      }

      card?.remove();

      if (savedList && !savedList.children.length) {
        renderEmptyState();
      }

    } catch(err) {
      console.error(err);
      alert('Nie udało się usunąć wiadomości. Błąd jest po stronie aplikacji, zgłoś do nas ten incydent, a my postaramy się jak najszybciej go rozwiązać');
    }
  }

  sortSelect?.addEventListener('change', () => {
    loadSavedArticles(sortSelect.value);
  });

  savedList?.addEventListener("click", async (e) => {
    const readButton = e.target.closest(".saved__read-btn");
    const deleteBtn = e.target.closest(".delete-btn");
    const card = e.target.closest(".saved");

    if (!card) return;
    const articleId = card.dataset.id;

    if (readButton) {
      goToArticle({id: articleId})
    }

    if (deleteBtn) {
      await deleteSavedArticle(articleId, card)
    }
  });


  try {
    const meRes = await fetch("/api/me");
    const meData = await meRes.json();

    if (meData.loggedIn) {
      await loadSavedArticles("newest");
    }
  } catch (err) {
    console.error("Failed to check if user is logged in", err);
  }



  // Wylogowanie użytkownika
  const logoutBtn = document.getElementById("logout-btn");
  const logoutBtnProfile = document.querySelector(".data-logout-btn");

  function handleLogout() {
    fetch("/api/logout", { method: "POST" })
      .then(() => location.reload());
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
  if (logoutBtnProfile) {
    logoutBtnProfile.addEventListener("click", handleLogout);
  }

  // Rejestracja
  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        password: form.password.value
      })
    });

    const data = await res.json();

    if (data.success) {
      document.getElementById("register-message").textContent = "Zarejestrowano pomyślnie!";
      form.reset();
      window.location.reload();
    } else {
      document.getElementById("register-message").textContent = data.message || "Błąd rejestracji";
    }
  });

  // Ukrywanie i pokazywanie hasła
  if (seePassBtn && passwordInput && visibilityIcon) {
    seePassBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const isVisible = passwordInput.type === "text";
      passwordInput.type = isVisible ? "password" : "text";
      visibilityIcon.textContent = isVisible ? "visibility" : "visibility_off";
      seePassText.textContent = isVisible ? "Zobacz hasło" : "Ukryj hasło";
    });
  }

  if (regSeePassBtn && regPasswordInput && regVisibilityIcon) {
    regSeePassBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isVisible = regPasswordInput.type === "text";
      regPasswordInput.type = isVisible ? "password" : "text";
      regVisibilityIcon.textContent = isVisible ? "visibility" : "visibility_off";
      regSeePassText.textContent = isVisible ? "Zobacz hasło" : "Ukryj hasło";
  });
}
  function validateLoginInputs() {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.value.trim());
    const passwordValid = loginPassword.value.trim().length > 0;

    if (emailValid && passwordValid) {
      loginBtn.classList.add("active");
      loginFrame.classList.add("frame-active");
    } else {
      loginBtn.classList.remove("active");
      loginFrame.classList.remove("frame-active");
    }
  }
  function validateRegisterInputs() {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail.value.trim());
    const passwordValid = registerPassword.value.trim().length > 0;
    const firstNameValid = registerFirstName.value.trim().length > 0;
    const lastNameValid = registerLastName.value.trim().length > 0;

    if (emailValid && passwordValid && firstNameValid && lastNameValid) {
      registerBtn.classList.add("active");
      registerFrame.classList.add("frame-active");
    } else {
      registerBtn.classList.remove("active");
      registerFrame.classList.remove("frame-active");
    }
  } 

  loginEmail.addEventListener("input", validateLoginInputs);
  loginPassword.addEventListener("input", validateLoginInputs);

  registerFirstName.addEventListener("input", validateRegisterInputs);
  registerLastName.addEventListener("input", validateRegisterInputs);
  registerEmail.addEventListener("input", validateRegisterInputs);
  registerPassword.addEventListener("input", validateRegisterInputs);
});

