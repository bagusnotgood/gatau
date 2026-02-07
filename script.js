const BUILD_ID = "build-20260207-3"

const slides = Array.from(document.querySelectorAll(".slide"))
const dotsWrap = document.getElementById("progressDots")
document.getElementById("buildId").textContent = BUILD_ID

const bgm = document.getElementById("bgm")
const playBtn = document.getElementById("playBtn")
const tapMusicBtn = document.getElementById("tapMusicBtn")
const musicHint = document.getElementById("musicHint")

const gameArea = document.getElementById("gameArea")
const timerText = document.getElementById("timerText")
const caughtText = document.getElementById("caughtText")
const gameMsg = document.getElementById("gameMsg")

const requestMicBtn = document.getElementById("requestMicBtn")
const tapCakeBtn = document.getElementById("tapCakeBtn")
const nextAfterCakeBtn = document.getElementById("nextAfterCakeBtn")
const cakeImg = document.getElementById("cakeImg")
const micStatus = document.getElementById("micStatus")
const blowMeter = document.getElementById("blowMeter")
const blowBar = document.getElementById("blowBar")

const letterScroller = document.getElementById("letterScroller")
const replayLetterBtn = document.getElementById("replayLetterBtn")

const modal = document.getElementById("modal")
const modalTitle = document.getElementById("modalTitle")
const modalText = document.getElementById("modalText")
const modalBtn = document.getElementById("modalBtn")

let currentSlide = 0
let lockedUntil = 0

function clamp(n,a,b){ return Math.max(a, Math.min(b, n)) }

function buildDots(){
  dotsWrap.innerHTML = ""
  for(let i=0;i<slides.length;i++){
    const d = document.createElement("div")
    d.className = "dot" + (i===0 ? " active" : "")
    dotsWrap.appendChild(d)
  }
}
buildDots()

function unlockTo(i){ lockedUntil = Math.max(lockedUntil, i) }

function setSlide(i){
  i = clamp(i, 0, slides.length-1)
  if(i > lockedUntil) i = lockedUntil
  slides[currentSlide].classList.remove("active")
  currentSlide = i
  slides[currentSlide].classList.add("active")
  Array.from(dotsWrap.children).forEach((d, idx)=> d.classList.toggle("active", idx===currentSlide))
  onEnterSlide(currentSlide)
}

function softMessage(el, text, tone){
  el.textContent = text
  el.style.color = tone === "bad" ? "var(--bad)" : tone === "good" ? "var(--good)" : "var(--muted)"
}

function openModal(title, text, btnText){
  modalTitle.textContent = title
  modalText.textContent = text
  modalBtn.textContent = btnText || "OK"
  modal.hidden = false
}

function closeModal(){ modal.hidden = true }

modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal() })

modalBtn.addEventListener("click", (e)=>{
  e.preventDefault()
  e.stopPropagation()
  closeModal()
  setSlide(0)
  setTimeout(startGame, 120)
})

document.addEventListener("click", (e)=>{
  const active = slides[currentSlide]
  const card = active.querySelector(".card")
  if(!card) return
  if(card.dataset.tapNext !== "true") return
  if(modal.hidden === false) return
  if(e.target.closest("button")) return
  unlockTo(currentSlide + 1)
  setSlide(currentSlide + 1)
}, true)

function nowMs(){
  return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()
}

let gameRunning = false
let gameCaught = 0
let gameDeadline = 0
let tickInt = null
let spawnInt = null
let loseTimeout = null
let gameStarted = false

function clearGame(){
  if(tickInt) clearInterval(tickInt)
  tickInt = null
  if(spawnInt) clearInterval(spawnInt)
  spawnInt = null
  if(loseTimeout) clearTimeout(loseTimeout)
  loseTimeout = null
  gameArea.innerHTML = ""
  gameRunning = false
}

function rand(min, max){ return Math.random()*(max-min)+min }

function spawnButterfly(){
  const b = document.createElement("div")
  b.className = "butterfly"

  const w = gameArea.clientWidth
  const h = gameArea.clientHeight
  const x = rand(10, w-64)
  const y = rand(10, h-64)
  b.style.left = `${x}px`
  b.style.top = `${y}px`
  b.style.animationDuration = `${rand(1.0, 1.8)}s`

  const vx = rand(-1.4, 1.4)
  const vy = rand(-1.1, 1.1)

  let px = x
  let py = y
  let alive = true

  const mover = setInterval(()=>{
    if(!alive) return
    px += vx * 3.2
    py += vy * 3.0
    if(px < 0 || px > w-54) px = clamp(px, 0, w-54)
    if(py < 0 || py > h-54) py = clamp(py, 0, h-54)
    b.style.left = `${px}px`
    b.style.top = `${py}px`
  }, 40)

  b.addEventListener("click", ()=>{
    if(!gameRunning) return
    alive = false
    clearInterval(mover)
    b.remove()
    gameCaught++
    caughtText.textContent = `${gameCaught}`
    if(gameCaught >= 10) winGame()
  }, {passive:true})

  gameArea.appendChild(b)

  setTimeout(()=>{
    if(alive){
      alive = false
      clearInterval(mover)
      b.remove()
    }
  }, 2400)
}

function startGame(){
  closeModal()
  clearGame()

  gameRunning = true
  gameCaught = 0
  caughtText.textContent = "0"
  timerText.textContent = "30"
  softMessage(gameMsg, "Game mulai. Tangkap 10 kupu-kupu ya 💗", "neutral")

  const start = nowMs()
  gameDeadline = start + 30000

  loseTimeout = setTimeout(()=>{
    if(gameRunning) loseGame()
  }, 30000)

  tickInt = setInterval(()=>{
    if(!gameRunning) return
    const left = Math.max(0, gameDeadline - nowMs())
    const sec = Math.ceil(left / 1000)
    timerText.textContent = `${sec}`
  }, 120)

  spawnInt = setInterval(()=>{
    if(!gameRunning) return
    spawnButterfly()
    if(Math.random() < 0.25) spawnButterfly()
  }, 520)
}

function winGame(){
  if(!gameRunning) return
  clearGame()
  softMessage(gameMsg, "Berhasil! Lanjut 🎀", "good")
  unlockTo(1)
  setTimeout(()=> setSlide(1), 650)
}

function loseGame(){
  if(!gameRunning) return
  clearGame()
  softMessage(gameMsg, "Gagal.", "bad")
  openModal("Yah gagal…", "Waktunya habis. Ulang lagi ya.", "Ulangi Game")
}

playBtn.addEventListener("click", async ()=>{
  try{
    if(bgm.paused){
      await bgm.play()
      playBtn.textContent = "Pause"
    }else{
      bgm.pause()
      playBtn.textContent = "Play"
    }
  }catch{
    musicHint.textContent = "Audio diblokir. Tap Play lagi (browser sok ngatur)."
    musicHint.style.color = "var(--bad)"
  }
})

tapMusicBtn.addEventListener("click", ()=>{
  unlockTo(2)
  setSlide(2)
})

let micStream=null, audioCtx=null, analyser=null, micSource=null, rafId=null
let blown=false, blowStable=0

function stopMic(){
  if(rafId) cancelAnimationFrame(rafId)
  rafId=null
  if(micStream){ micStream.getTracks().forEach(t=>t.stop()); micStream=null }
  if(audioCtx){ audioCtx.close().catch(()=>{}); audioCtx=null }
  analyser=null; micSource=null
}

function extinguishCake(reason){
  if(blown) return
  blown = true
  cakeImg.src = "assets/cake_off.png"
  nextAfterCakeBtn.disabled = false
  micStatus.textContent = reason === "mic" ? "Yay! Lilinnya mati karena tiupan kamu 💨" : "Oke! Lilinnya mati karena tap 🎀"
  micStatus.style.color = "var(--good)"
  blowBar.style.width = "0%"
  stopMic()
}

async function requestMic(){
  if(blown) return
  micStatus.textContent = "Meminta izin microphone…"
  micStatus.style.color = "var(--muted)"

  try{
    micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation:true, noiseSuppression:true, autoGainControl:true } })
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    micSource = audioCtx.createMediaStreamSource(micStream)
    micSource.connect(analyser)

    blowMeter.hidden = false
    micStatus.textContent = "Mic aktif. Tiup ke arah mic (atau tap kuenya)."
    micStatus.style.color = "var(--muted)"

    const buf = new Uint8Array(analyser.fftSize)

    const tick = ()=>{
      if(!analyser || blown) return
      analyser.getByteTimeDomainData(buf)
      let sum=0
      for(let i=0;i<buf.length;i++){
        const v=(buf[i]-128)/128
        sum += v*v
      }
      const rms = Math.sqrt(sum/buf.length)
      const raw = clamp((rms-0.02)/0.12, 0, 1)
      blowBar.style.width = `${Math.round(raw*100)}%`
      if(raw>0.70) blowStable++
      else blowStable = Math.max(0, blowStable-1)
      if(blowStable>=10){ extinguishCake("mic"); return }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
  }catch{
    micStatus.textContent = "Izin mic ditolak / nggak tersedia. Tap kuenya aja ya."
    micStatus.style.color = "var(--bad)"
    blowMeter.hidden = true
    stopMic()
  }
}

requestMicBtn.addEventListener("click", requestMic)
tapCakeBtn.addEventListener("click", ()=> extinguishCake("tap"))
cakeImg.addEventListener("click", ()=> extinguishCake("tap"))

nextAfterCakeBtn.addEventListener("click", ()=>{
  unlockTo(3)
  setSlide(3)
})

const letterText = `Happy Birthday, Seiras Heartifilia aka Fadiaa..
di hari bertambahnya satu tahun usia kamu saat ini, aku harap kamu tau satu hal penting yang sering orang lain lupa bilang ke kamu secara utuh: kamu uda ngelakuin yang terbaik dengan semua keterbatasan, luka, dan beban yang kamu bawa. dan itu bukan hal yang kecil.

Semoga di umur kamu yang sekarang, kamu tumbuh menjadi pribadi yang lebii baik lagi ya, bukan versi “sempurna” menurut dunia, tapi versi kamu yang lebi jujur sama diri sendiri, lebii lembut ke hati sendiri, dan lebii berani ngebela kebahagiaan kamu sendiri. Semoga kamu semakin kuat, bukan karena hidup berhenti nyakitin kamu, tapi karena kamu belajar berdiri meskipun kaki kamu bergerter, belajar bernapas meskipun dada kamu sesak, dan belajar bertahan walau rasanya ingin nyerah gitu aja.

makasiii yaa buat sei, karena udaa bertahan sampe hari ini. ... (biarin teks panjang kamu tetap di sini)`

let letterInterval=null
function clearLetter(){
  if(letterInterval) clearInterval(letterInterval)
  letterInterval=null
  letterScroller.innerHTML=""
}
function animateLetter(){
  clearLetter()
  const tokens = letterText.split(/(\s+)/)
  tokens.forEach(t=>{
    if(t.trim()===""){ letterScroller.appendChild(document.createTextNode(t)); return }
    const s=document.createElement("span")
    s.className="word"
    s.textContent=t
    letterScroller.appendChild(s)
  })
  const words = Array.from(letterScroller.querySelectorAll(".word"))
  let idx=0
  letterScroller.scrollTop=0
  letterInterval=setInterval(()=>{
    if(idx>=words.length){ clearInterval(letterInterval); letterInterval=null; return }
    words[idx].classList.add("show")
    idx++
    const nearBottom = (letterScroller.scrollHeight - (letterScroller.scrollTop + letterScroller.clientHeight)) < 140
    if(nearBottom) letterScroller.scrollTop = letterScroller.scrollHeight
  }, 70)
}
replayLetterBtn.addEventListener("click", animateLetter)

function onEnterSlide(i){
  if(i !== 2) stopMic()
  if(i === 2){
    blown=false; blowStable=0
    cakeImg.src="assets/cake_on.gif"
    nextAfterCakeBtn.disabled=true
    micStatus.textContent="Menunggu izin microphone…"
    micStatus.style.color="var(--muted)"
    blowMeter.hidden=true
    blowBar.style.width="0%"
  }
  if(i === 7) animateLetter()
}

unlockTo(0)
setSlide(0)

window.addEventListener("load", ()=>{
  if(gameStarted) return
  gameStarted = true
  setTimeout(startGame, 300)
})