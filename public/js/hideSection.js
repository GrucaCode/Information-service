const dataDropUpBtn = document.querySelector(".data-drop-up");
const dataSec = document.querySelector(".data-data-sec");
const dataText = document.querySelector(".data-drop-up-text");
const dataIcon = document.querySelector(".data-drop-up-icon");

const toggleSection = (e) => {
    dataSec.classList.toggle('hidden');
    if (dataSec.classList.contains('hidden')) {
        dataText.textContent = "rozwiń sekcję";
        dataIcon.textContent = "arrow_drop_down";
    } else {
        dataText.textContent = "zwiń sekcję";
        dataIcon.textContent = "arrow_drop_up";
    }
}

dataDropUpBtn.addEventListener('click', toggleSection);
