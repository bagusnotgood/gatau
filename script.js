
/* SLIDE */
let slide = 1;
const total = 7;
function show(n){
  document.querySelectorAll('.slide').forEach(s=>s.classList.remove('active'));
  document.getElementById('s'+n).classList.add('active');
  slide = n;
}
function next(){ if(slide < total) show(slide+1); }

/* MUSIC */
const bgm = document.getElementById('bgm');
const playBtn = document.getElementById('playBtn');
let playing = false;

playBtn.onclick = ()=>{
  if(!playing){
    bgm.play();
    playBtn.innerText = "⏸ Pause Music";
  }else{
    bgm.pause();
    playBtn.innerText = "▶️ Play Music";
  }
  playing = !playing;
};

/* EMOJI DECOR */
const emojis = ["🎈","🎉","💖","✨","🌸"];
setInterval(()=>{
  const e = document.createElement("div");
  e.className = "emoji";
  e.innerText = emojis[Math.floor(Math.random()*emojis.length)];
  e.style.left = Math.random()*100+"vw";
  document.body.appendChild(e);
  setTimeout(()=>e.remove(),6000);
},800);

/* GAME LOGIC */
let time = 30;
let score = 0;
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const gameArea = document.getElementById("gameArea");

function spawnButterfly(){
  const b = document.createElement("img");
  b.src = "assets/butterfly.png";
  b.className = "butterfly";
  b.style.left = Math.random()*85+"%";
  b.style.top = Math.random()*85+"%";
  gameArea.appendChild(b);

  b.onclick = ()=>{
    b.remove();
    score++;
    scoreEl.innerText = score;
    if(score >= 10){
      clearInterval(gameTimer);
      show(2);
    }
  };

  setTimeout(()=>b.remove(),2000);
}

const gameTimer = setInterval(()=>{
  time--;
  timerEl.innerText = time;
  spawnButterfly();

  if(time <= 0 && score < 10){
    location.reload(); // ulang game
  }
},1000);

/* CAKE */
const cake = document.getElementById("cake");
let done = false;
cake.onclick = ()=>{
  if(done) return;
  done = true;
  cake.src = "assets/cake_on.gif";
  setTimeout(()=>show(4),2000);
};

/* FINAL TEXT */
const text = `Sei, semoga di usia baru ini,
kamu selalu dikelilingi hal-hal baik,
orang-orang tulus,
dan mimpi-mimpi yang perlahan jadi nyata.

Tetap jadi kamu yang hangat,
yang lembut,
dan yang selalu pantas
mendapatkan bahagia. 💖`;

const box = document.getElementById("finalText");
text.split(" ").forEach((w,i)=>{
  const span = document.createElement("span");
  span.innerText = w + " ";
  span.style.opacity = 0;
  span.style.animation = `show .3s forwards`;
  span.style.animationDelay = i*0.1+"s";
  box.appendChild(span);
});
