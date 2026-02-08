const slides = Array.from(document.querySelectorAll(".slide"))
const dotsWrap = document.getElementById("progressDots")

const bgm = document.getElementById("bgm")
const playBtn = document.getElementById("playBtn")
const tapMusicBtn = document.getElementById("tapMusicBtn")
const musicHint = document.getElementById("musicHint")

const gameArea = document.getElementById("gameArea")
const timerText = document.getElementById("timerText")
const caughtText = document.getElementById("caughtText")
const gameMsg = document.getElementById("gameMsg")

const gameOverlay = document.getElementById("gameOverlay")
const overlayTitle = document.getElementById("overlayTitle")
const overlayText = document.getElementById("overlayText")
const overlayBtn = document.getElementById("overlayBtn")

const requestMicBtn = document.getElementById("requestMicBtn")
const tapCakeBtn = document.getElementById("tapCakeBtn")
const nextAfterCakeBtn = document.getElementById("nextAfterCakeBtn")
const cakeImg = document.getElementById("cakeImg")
const micStatus = document.getElementById("micStatus")
const blowMeter = document.getElementById("blowMeter")
const blowBar = document.getElementById("blowBar")

const letterScroller = document.getElementById("letterScroller")
const replayLetterBtn = document.getElementById("replayLetterBtn")

const edgeDecor = document.getElementById("edgeDecor")

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

document.addEventListener("click", (e)=>{
  const active = slides[currentSlide]
  const card = active.querySelector(".card")
  if(!card) return
  if(card.dataset.tapNext !== "true") return
  if(e.target.closest("button")) return
  unlockTo(currentSlide + 1)
  setSlide(currentSlide + 1)
}, true)

function softMessage(el, text, tone){
  el.textContent = text
  el.style.color = tone === "bad" ? "var(--bad)" : tone === "good" ? "var(--good)" : "var(--muted)"
}

function nowMs(){
  return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()
}

let gameRunning = false
let gameCaught = 0
let gameDeadline = 0
let tickInt = null
let spawnInt = null
let loseTimeout = null

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
  const w = gameArea.clientWidth
  const h = gameArea.clientHeight
  if(w < 80 || h < 120) return

  const b = document.createElement("div")
  b.className = "butterfly"

  const x = rand(10, w-60)
  const y = rand(10, h-60)
  b.style.left = `${x}px`
  b.style.top = `${y}px`

  const vx = rand(-1.4, 1.4)
  const vy = rand(-1.1, 1.1)

  let px = x
  let py = y
  let alive = true

  const mover = setInterval(()=>{
    if(!alive || !gameRunning) return
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
  })

  gameArea.appendChild(b)

  setTimeout(()=>{
    if(alive){
      alive = false
      clearInterval(mover)
      b.remove()
    }
  }, 2400)
}

function safeStartGame(){
  const w = gameArea.clientWidth
  const h = gameArea.clientHeight
  if(w < 80 || h < 120){
    setTimeout(safeStartGame, 90)
    return
  }
  startGame()
}

function startGame(){
  clearGame()
  gameOverlay.hidden = true

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

function showStartOverlay(){
  gameOverlay.hidden = false
  overlayTitle.textContent = "Kita main game dulu ya, siap?"
  overlayText.textContent = "Tangkap 10 kupu-kupu dalam 30 detik ya 💗"
  overlayBtn.textContent = "Mulai"
  softMessage(gameMsg, "", "neutral")
  timerText.textContent = "30"
  caughtText.textContent = "0"
}

function showRetryOverlay(){
  gameOverlay.hidden = false
  overlayTitle.textContent = "Yah gagal…"
  overlayText.textContent = "Waktunya habis. Ulang lagi ya."
  overlayBtn.textContent = "Ulangi Game"
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
  showRetryOverlay()
}

overlayBtn.addEventListener("click", (e)=>{
  e.preventDefault()
  e.stopPropagation()
  requestAnimationFrame(()=> requestAnimationFrame(()=> safeStartGame()))
})

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
(tempel teks panjang kamu di sini)`

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

  if(i === 0){
    showStartOverlay()
  }

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

function buildEdgeDecor(){
  if(!edgeDecor) return
  edgeDecor.innerHTML = ""

  const emojis = ["💗","🎀","🫧","✨","🌸","🧸","🍓","🦋","💞","🩷","🌷","⭐️"]
  const w = window.innerWidth
  const h = window.innerHeight

  const gutter = Math.max(44, Math.min(68, Math.floor(w * 0.14)))
  const countPerSide = Math.max(10, Math.min(18, Math.floor(h / 70)))

  function place(side){
    for(let i=0;i<countPerSide;i++){
      const el = document.createElement("div")
      el.className = "decor-emoji"
      el.textContent = emojis[(Math.random()*emojis.length)|0]
      const y = Math.floor((i + Math.random()*0.6) * (h / countPerSide))
      const x = side === "left"
        ? Math.floor(8 + Math.random()*(gutter - 18))
        : Math.floor(w - gutter + Math.random()*(gutter - 18))
      const size = Math.floor(16 + Math.random()*10)
      el.style.left = x + "px"
      el.style.top = Math.max(6, Math.min(h-24, y)) + "px"
      el.style.fontSize = size + "px"
      el.style.transform = `rotate(${Math.floor(-18 + Math.random()*36)}deg)`
      edgeDecor.appendChild(el)
    }
  }

  place("left")
  place("right")
}

window.addEventListener("resize", ()=>{
  clearTimeout(window.__decorT)
  window.__decorT = setTimeout(buildEdgeDecor, 150)
})

unlockTo(0)
setSlide(0)
buildEdgeDecor()