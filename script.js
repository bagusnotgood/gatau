/* ===== GAME CONFIG ===== */
const TARGET = 7;
const LIMIT = 30;

let taps = 0;
let time = LIMIT;
let timer;
let blown = false;

/* ELEMENTS */
const bird = document.getElementById('bird');
const counter = document.getElementById('counter');
const timerText = document.getElementById('timer');
const game = document.getElementById('game');
const slidesScreen = document.getElementById('slides');

/* MOVE BIRD */
function moveBird() {
  const size = 80;
  const x = Math.random() * (window.innerWidth - size);
  const y = Math.random() * (window.innerHeight - size);
  bird.style.left = `${x}px`;
  bird.style.top = `${y}px`;
}

/* RESET GAME */
function resetGame() {
  taps = 0;
  time = LIMIT;
  counter.textContent = `0 / ${TARGET}`;
  timerText.textContent = `⏱️ ${time}s`;
  moveBird();
}

/* TIMER */
function startTimer() {
  timer = setInterval(() => {
    time--;
    timerText.textContent = `⏱️ ${time}s`;

    if (time <= 0) {
      clearInterval(timer);
      alert("Waktunya habis 😭 coba lagi ya");
      resetGame();
      startTimer();
    }
  }, 1000);
}

/* START GAME */
resetGame();
startTimer();

bird.addEventListener('click', () => {
  taps++;
  counter.textContent = `${taps} / ${TARGET}`;
  moveBird();

  if (taps >= TARGET) {
    clearInterval(timer);
    game.classList.remove('active');
    slidesScreen.classList.add('active');
  }
});

/* SLIDES */
const slides = document.querySelectorAll('.slide');
let index = 0;

const candle = document.getElementById('candle');
candle?.addEventListener('click', () => {
  if (!blown) {
    candle.style.filter = "brightness(0.6)";
    blown = true;
    alert("Yay 🎉 lilinnya mati!");
  }
});

document.getElementById('next').onclick = () => {
  if (slides[index].classList.contains('candle-slide') && !blown) {
    alert("Tiup lilinnya dulu ya 🎂");
    return;
  }

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