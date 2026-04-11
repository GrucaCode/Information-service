// TO DO: check and correct error handling 

document.addEventListener("DOMContentLoaded", async () => {
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  const userSection = document.getElementById("user-section");
  const userNameSpans = document.querySelectorAll(".user-name");

  const toggleToLoginBtn = document.getElementById("show-login");
  const toggleToRegisterBtn = document.getElementById("show-register");

  const loginSeePassBtn = document.querySelector(".see-pass-btn");
  const loginVisibilityIcon = document.getElementById("eye-opened-icon");
  const loginSeePassText = document.querySelector(".data-see-pass-text");

  const regSeePassBtn = document.querySelector(".register-see-pass-btn");
  const regPasswordInput = document.querySelector("#register-form input[name='password']");
  const regVisibilityIcon = document.querySelector("#register-form .see-pass-btn__visibility");
  const regSeePassText = document.querySelector("#register-form .see-pass-text");

  const loginBtn = document.querySelector(".data-login-submit-btn");
  const loginFrame = document.querySelector(".data-submit-frame");
  const loginInputs = document.querySelectorAll("#login-form input");

  const registerBtn = document.querySelector(".data-register-submit-btn");
  const registerFrame = document.querySelector(".register-submit-btn__frame");
  const registerInputs = document.querySelectorAll("#register-form input");

  const firstNameEl = document.getElementById("user-firstName");
  const lastNameEl = document.getElementById("user-lastName");
  const emailEl = document.getElementById("user-email");

  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");

  const views = [
    loginSection,
    registerSection,
    userSection
  ]

  const displayView = (sectionToShow) => {
    views.forEach(view => {
      if (view === sectionToShow) {
        view.hidden = false;
      } else {
        view.hidden = true;
      }
    });
  }

  // Vaildate logic
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const setSubmitBtn = (btn, frame, isValid) => {
    btn.classList.toggle("active", isValid);
    frame.classList.toggle("frame-active", isValid);
  }

  const validateLoginInputs = () => {
    const email = loginForm.elements.email.value;
    const pass = loginForm.elements.password.value;
    const isValid = 
        isValidEmail(email) && 
        pass.trim().length > 0;

        setSubmitBtn(loginBtn, loginFrame, isValid);
  }

  const validateRegisterInputs = () => {
    const firstName = registerForm.elements.firstName.value;
    const lastName = registerForm.elements.lastName.value;
    const email = registerForm.elements.email.value;
    const pass = registerForm.elements.password.value;
    const isValid = 
        firstName.trim().length > 0 && 
        lastName.trim().length > 0 &&
        isValidEmail(email) &&
        pass.trim().length > 0;

    setSubmitBtn(registerBtn, registerFrame, isValid);
  } 

  const handlePassToggle = (passInput, seePassText, visibilityIcon, e) => {
    e.preventDefault();

    if (!passInput || !seePassText || !visibilityIcon) {
      console.error("Nie znaleziono co najmniej jednego elementu", {
        passInput,
        seePassText,
        visibilityIcon
      })
      return;
    } 

    const isPassVisible = passInput.type === "text";

    passInput.type = isPassVisible ? "password" : "text";
    visibilityIcon.textContent = isPassVisible ? "visibility" : "visibility_off";
    seePassText.textContent = isPassVisible ? "Zobacz hasło" : "Ukryj hasło";
  }

  //Login logic
  const handleLogout = () => {
    fetch("/api/logout", { method: "POST" })
      .then(() => window.location.href = 'index.html');
  }

  const login = async (e) => {
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
      window.location.href = "profile.html";
    } else {
      document.getElementById("login-message").textContent = data.message || "Błąd logowania. Spróbuj zalogować się jeszcze raz";
    }
  }

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
      // TO DO: display success message in login view 
      form.reset();
      window.location.href = "profile.html?view=login";

    } catch(err) {
      console.error("Failed to fetch register data", err);
      registerMessage.textContent = "Wystąpił błąd. Spróbuj ponownie później.";
    }
  }


  // TO DO: Loader
  const renderUserView = (user) => {
    userNameSpans.forEach(span => span.textContent = user.firstName);

    if (firstNameEl && lastNameEl && emailEl) {
      firstNameEl.textContent = user.firstName;
      lastNameEl.textContent = user.lastName;
      emailEl.textContent = user.email;
    }
  }  

  fetch('/api/me')
  .then(res => res.json())
  .then(data => {
    if (!data.loggedIn) {
      displayView(view === "register" ? registerSection : loginSection);
    }
    renderUserView(data.user);
    displayView(userSection);
  });

  const registerForm = document.querySelector(".data-register-form");
  const registerMessage =  document.querySelector(".data-register-message");
  registerForm?.addEventListener("submit", register); 

  toggleToLoginBtn?.addEventListener("click", () => 
    window.location.href = "profile.html?view=login");
  toggleToRegisterBtn?.addEventListener("click", () => 
    window.location.href = "profile.html?view=register");

  // TO DO: create goToLogin/Register functions to reduce redundancy 

  regSeePassBtn?.addEventListener("click", (e) => handlePassToggle(
    regPasswordInput, 
    regSeePassText, 
    regVisibilityIcon, 
    e
  ));

  const loginForm = document.getElementById("login-form");

  loginSeePassBtn?.addEventListener("click", (e) => handlePassToggle(
    loginForm.elements.password, 
    loginSeePassText, 
    loginVisibilityIcon, 
    e
  ));

  loginForm?.addEventListener("submit", login);

  const logoutBtn = document.getElementById("logout-btn");
  const logoutBtnProfile = document.querySelector(".data-logout-btn");

  logoutBtn?.addEventListener("click", handleLogout);
  logoutBtnProfile?.addEventListener("click", handleLogout);

  loginInputs.forEach((input) => {
    input.addEventListener("input", validateLoginInputs)
  });

  registerInputs.forEach((input) => {
    input.addEventListener("input", validateRegisterInputs)
  });
});