const registerForm = document.getElementById("register-form");
const cleanBtn = document.querySelector(".clean-btn");
const registerMessage = document.getElementById("register-message")
const registerBtn = registerForm?.querySelector(".js-register-submit-btn");
const registerFrame = registerForm?.querySelector(".js-submit-frame");

const updateSubmitState = () => {
  if (!registerForm || !registerBtn || !registerFrame) return;
  const { firstName, lastName, email, password } = registerForm;
  const isFormFilled = [firstName, lastName, email, password].every(i => i.value.trim());

  registerBtn.disabled = !isFormFilled;
  registerBtn.classList.toggle("active", isFormFilled);
  registerFrame.classList.toggle("frame-active", isFormFilled);
}

const cleanRegisterForm = (e) => {
  e.preventDefault();
  registerForm.reset();
  registerMessage.textContent = "";
  updateSubmitState();
}

if (cleanBtn && registerForm) {
  cleanBtn.addEventListener("click", cleanRegisterForm)
}

["input", "change"].forEach(evt =>
  registerForm?.addEventListener(evt, updateSubmitState)
);

updateSubmitState();