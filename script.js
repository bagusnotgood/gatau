let slide = 1;
const total = 7;
const bgm = document.getElementById('bgm');

function show(n){
  document.querySelectorAll('.slide').forEach(s=>s.classList.remove('active'));
  document.getElementById('s'+n).classList.add('active');
  slide = n;
}

function next(){
  if(slide < total) show(slide + 1);
}

/* BUTTERFLY */
setInterval(()=>{
  const b = document.createElement('img');
  b.src = "assets/butterfly.png";
  b.className = "butterfly";
  b.style.top = Math.random()*80 + "%";
  document.body.appendChild(b);
  setTimeout(()=>b.remove(),12000);
},3000);

/* GAME */
let time = 30;
const bird = document.getElementById('bird');

function moveBird(){
  bird.style.left = Math.random()*80 + "%";
  bird.style.top = Math.random()*80 + "%";
}
moveBird();

const timer = setInterval(()=>{
  time--;
  document.getElementById('timer').innerText = time;
  moveBird();
  if(time <= 0) location.reload();
},1000);

bird.onclick = ()=>{
  clearInterval(timer);
  bgm.play();
  show(2);
};

/* MIC & CAKE */
let cakeDone = false;
const cake = document.getElementById('cake');

cake.onclick = blow;

navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  const mic = ctx.createMediaStreamSource(stream);
  mic.connect(analyser);

  const data = new Uint8Array(analyser.frequencyBinCount);

  function detect(){
    analyser.getByteFrequencyData(data);
    let vol = data.reduce((a,b)=>a+b)/data.length;
    if(vol > 40 && slide === 3) blow();
    requestAnimationFrame(detect);
  }
  detect();
});

function blow(){
  if(cakeDone) return;
  cakeDone = true;
  cake.src = "assets/cake_on.gif";
  setTimeout(()=>show(4),2000);
}

/* FINAL TEXT */
const text = `Sei, di hari ulang tahunmu ini,
aku cuma ingin kamu tahu satu hal penting.
Kamu itu berharga, kamu itu berarti,
dan kehadiran kamu selalu membawa rasa hangat.

Semoga langkahmu selalu dipermudah,
hatimu selalu dikuatkan,
dan setiap lelahmu diganti
dengan kebahagiaan yang tulus. 💖`;

const box = document.getElementById('finalText');
text.split(" ").forEach((w,i)=>{
  const span = document.createElement('span');
  span.innerText = w + " ";
  span.className = "word";
  span.style.animationDelay = i*0.1 + "s";
  box.appendChild(span);
});
