/* GAME */
const bird = document.getElementById('bird');
const counter = document.getElementById('counter');
const game = document.getElementById('game');
const slidesScreen = document.getElementById('slides');

let taps = 0;

function moveBird() {
  const x = Math.random() * (window.innerWidth - 80);
  const y = Math.random() * (window.innerHeight - 200);
  bird.style.left = `${x}px`;
  bird.style.top = `${y}px`;
}

moveBird();

bird.addEventListener('click', () => {
  taps++;
  counter.textContent = `${taps} / 5`;
  moveBird();

  if (taps >= 5) {
    game.classList.remove('active');
    slidesScreen.classList.add('active');
  }
});

/* SLIDES */
const slides = document.querySelectorAll('.slide');
let index = 0;

document.getElementById('next').onclick = () => {
  if (index < slides.length - 1) {
    slides[index].classList.remove('active');
    index++;
    slides[index].classList.add('active');
  }
};

document.getElementById('prev').onclick = () => {
  if (index > 0) {
    slides[index].classList.remove('active');
    index--;
    slides[index].classList.add('active');
  }
};