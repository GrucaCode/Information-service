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
  const view = params.get("view");

  const views = [
    loginSection,
    registerSection,
    userSection
  ]

  const displayView = (section) => {
    views.forEach(viewName => {
      if (viewName === section) {
        viewName.hidden = false;
      } else {
        viewName.hidden = true;
      }
    });
  }

  if (view === "login") {
    displayView(loginSection);
  } else if (view === "register") {
    displayView(registerSection);
  }

  if (toggleToLoginBtn) {
    toggleToLoginBtn.addEventListener("click", displayView(loginSection));
  }

  if (toggleToRegisterBtn) {
    toggleToRegisterBtn.addEventListener("click", displayView(registerSection));
  }

  // Sprawdzenie czy użytkownik jest zalogowny - wyświetlenie odpowiedniego widoku
  fetch('/api/me')
  .then(res => res.json())
  .then(data => {
    if (data.loggedIn) {
      displayView(userSection);
      userNameSpans.forEach(span => span.textContent = data.user.firstName);

      if (firstNameEl && lastNameEl && emailEl) {
        firstNameEl.textContent = data.user.firstName;
        lastNameEl.textContent = data.user.lastName;
        emailEl.textContent = data.user.email;
      }
    } else {
      if (view === "register") {
        displayView(registerSection);
      } else {
        displayView(loginSection);
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

  // Wylogowanie użytkownika
  const logoutBtn = document.getElementById("logout-btn");
  const logoutBtnProfile = document.querySelector(".data-logout-btn");

  function handleLogout() {
    fetch("/api/logout", { method: "POST" })
      .then(() => window.location.href = 'index.html');
  }

  logoutBtn?.addEventListener("click", handleLogout);
  logoutBtnProfile?.addEventListener("click", handleLogout);

  const register = async (e) => {
    e.preventDefault();
    try {
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

      if (!data.success) {
        registerMessage.textContent = data.message || "Błąd rejestracji";
        return;
      }

      const regSuccessMessage = document.querySelector(".data-reg-success-message");
      regSuccessMessage.hidden = false;
      regSuccessMessage.innerHTML = `<p class="success-message">Zarejestrowano pomyślnie!<p>`;
      displayView(loginSection);
      form.reset();

    } catch(err) {
      console.error("Failed to fetch register data", err);
      registerMessage.textContent = "Wystąpił błąd. Spróbuj ponownie później.";
    }
  }

  const registerMessage =  document.querySelector(".data-register-message");
  const registerForm = document.querySelector(".data-register-form");
  registerForm?.addEventListener("submit", register); 

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

  const validateLoginInputs = () => {
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

  const validateRegisterInputs = () => {
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