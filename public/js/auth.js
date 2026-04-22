import { showLoader, hideLoader } from "./utils.js"; 

document.addEventListener("DOMContentLoaded", async () => {
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  const userSection = document.getElementById("user-section");

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

  const views = [loginSection, registerSection, userSection]

  showLoader()

  // Managing views 
  const displayView = (sectionToShow) => {
    if (views.length === 0 || !Array.isArray(views)) {
      console.error("Views array is empty or invalid");
      return;
    }

    views.forEach(view => {
      if (view === sectionToShow) {
        view.classList.remove("is-hidden");
      } else {
        view.classList.add("is-hidden");
      }
    });
  }

  const goToLoginView = () => {
    window.location.href = "/profile?view=login";
  }

  const goToRegisterView = () => {
    window.location.href = "/profile?view=register";
  }

  const renderUserView = (user) => {
    if (!user) {
      console.error("User object is missing");
      return;
    }

    if (!firstNameEl || !lastNameEl || !emailEl) {
      console.error("At least one element was not found: firstNameEl, lastNameEl or emailEl");
      return;
    }

    firstNameEl.textContent = user.firstName;
    lastNameEl.textContent = user.lastName;
    emailEl.textContent = user.email;
  }

  // Vaildate logic
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim())
  };

  const setSubmitBtn = (btn, frame, isValid) => {
    if (!btn || !frame) {
      console.error("Button or frame element is missing");
      return;
    }

    btn.classList.toggle("active", isValid);
    frame.classList.toggle("frame-active", isValid);
  }

  const validateLoginInputs = () => {
    if (!loginForm || !loginBtn || !loginFrame) {
      console.error("At least one element was not found or is undefined: loginForm, loginBtn or loginBtn");
      return;
    }

    const email = loginForm.elements.email.value;
    const pass = loginForm.elements.password.value;
    const isValid = 
        isValidEmail(email) && 
        pass.trim().length > 0;
        setSubmitBtn(loginBtn, loginFrame, isValid);
  }

  const validateRegisterInputs = () => {
    if (!registerForm || !registerBtn || !registerFrame) {
      console.error("At least one element was not found or is undefined: loginForm, registerBtn, registerFrame");
      return;
    }

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

  const handleSeePassToggle = (passInput, seePassText, visibilityIcon, e) => {
    e.preventDefault();

    if (!passInput || !seePassText || !visibilityIcon) {
      console.error("At least one element was not found: ", {
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

  // Login logic
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      const data = await res.json() 

      if (!data.success || !res.ok) {
        console.error("Failed to log out");
        alert("Nie udało się wylogować. Spróbuj ponownie.");
        return;
      }

      window.location.href = '/';
    } catch (err) {
      console.error("Logout request failed:", err);
      alert("Wystąpił problem podczas wylogowywania. Spróbuj ponownie później.");
    }
  };

  const login = async (e) => {
    e.preventDefault();

    try {
      const loginMessage = document.getElementById("login-message");
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

      if (res.status === 401) {
        if (loginMessage) loginMessage.textContent = data.message;
        return;
      }

      if (!res.ok) {
        if (loginMessage) loginMessage.textContent = data.message;
        console.error("Login request failed with status:", res.status);
        return;
      }

      if (!data.success) {
        if (loginMessage) loginMessage.textContent = "Nie udało się zalogować. Spróbuj ponownie"
        console.error("Login failed: success=false")
        return;
      }

      window.location.href = "/profile";
    } catch (err) {
      alert("Nie udało się zalogować. Spróbuj ponownie!");
    }
  }

  // register logic
  const regSuccessMessage = document.querySelector(".data-reg-success-message");
  const displayRegMessage = () => {
    const authMessage = sessionStorage.getItem("authMessage");
    if (authMessage && regSuccessMessage) {
      regSuccessMessage.hidden = false;
      regSuccessMessage.textContent = authMessage;
      sessionStorage.removeItem("authMessage");
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

      if (res.status === 400) {
        if (registerMessage) registerMessage.textContent = data.message;
        return
      }

      if (!res.ok) {
        console.error("Register request failed with status:", res.status);
        if (registerMessage) registerMessage.textContent = data.message || "Błąd serwera. Nie udało się zarejestrować. Spróbuj ponownie";
        return
      }

      if (!data.success) {
        console.error("Register failed: success=false")
        if (registerMessage) registerMessage.textContent = data.message || "Nie udało się zarejestrować. Spróbuj ponownie";
        return;
      }

      sessionStorage.setItem(
        "authMessage",
        "Zarejestrowano pomyślnie!"
      )

      form.reset();
      goToLoginView()

    } catch(err) {
      console.error("Failed to fetch register data", err);
      if (registerMessage) registerMessage.textContent = "Nie udało się zarejestrować. Spróbuj ponownie.";
    }
  }
  
  displayRegMessage();

  try {
    const res = await fetch("/api/me");
    const data = await res.json();

    if (!res.ok) {
      console.error("Fetching /api/me failed with status: ", res.status);
      displayView(view === "register" ? registerSection : loginSection);
      return;
    }

    if (!data.loggedIn) {
      displayView(view === "register" ? registerSection : loginSection);
    } else {
      renderUserView(data.user);
      displayView(userSection);
    }
  } catch (err) {
    console.error("Error view display:", err);
  } finally {
    hideLoader();
  }

  const registerForm = document.querySelector(".data-register-form");
  const registerMessage = document.querySelector(".data-register-message");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");
  const logoutBtnProfile = document.querySelector(".data-logout-btn");

  registerForm?.addEventListener("submit", register); 

  toggleToLoginBtn?.addEventListener("click", goToLoginView);
  toggleToRegisterBtn?.addEventListener("click", goToRegisterView);

  regSeePassBtn?.addEventListener("click", (e) => handleSeePassToggle(
    regPasswordInput, 
    regSeePassText, 
    regVisibilityIcon, 
    e
  ));

  loginSeePassBtn?.addEventListener("click", (e) => handleSeePassToggle(
    loginForm.elements.password, 
    loginSeePassText, 
    loginVisibilityIcon, 
    e
  ));

  loginForm?.addEventListener("submit", login);
  logoutBtn?.addEventListener("click", handleLogout);
  logoutBtnProfile?.addEventListener("click", handleLogout);

  loginInputs.forEach((input) => {
    input.addEventListener("input", validateLoginInputs)
  });

  registerInputs.forEach((input) => {
    input.addEventListener("input", validateRegisterInputs)
  });
});