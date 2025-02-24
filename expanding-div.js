const expandingDivs = document.querySelectorAll('.expanding-div');
const heroTexts = document.querySelectorAll('.hero-text');

console.log(expandingDivs.length);
console.log(heroTexts.length);

let animationsCompleted = 0;
function checkAnimation() {
    animationsCompleted++;
    if (animationsCompleted == 2) {
        for (let i = 0; i < heroTexts.length; i++) {
            heroTexts[i].classList.add("visible");
        }
    }
} 

expandingDivs[0].addEventListener("animationend", checkAnimation);
expandingDivs[1].addEventListener("animationend", checkAnimation);