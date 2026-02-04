const slides = Array.from(document.querySelectorAll(".slide"))
const deck = document.getElementById("deck")
const dots = document.getElementById("dots")
const prevBtn = document.getElementById("prev")
const nextBtn = document.getElementById("next")

let idx = 0

const toast = (() => {
  const el = document.getElementById("toast")
  const t = document.getElementById("tTitle")
  const m = document.getElementById("tMsg")
  const e = document.getElementById("tEmoji")
  const c = document.getElementById("tClose")
  let timer = null

  const hide = () => {
    el.classList.remove("show")
    if (timer) clearTimeout(timer)
    timer = null
  }

  c.addEventListener("click", hide)

  return (msg, opt = {}) => {
    t.textContent = opt.title || "Hey"
    m.textContent = msg
    e.textContent = opt.emoji || "🫶"
    el.classList.add("show")
    if (timer) clearTimeout(timer)
    timer = setTimeout(hide, opt.ms || 2200)
  }
})()

const makeDots = () => {
  dots.innerHTML = ""
  slides.forEach((_, i) => {
    const d = document.createElement("div")
    d.className = "d" + (i === idx ? " on" : "")
    d.addEventListener("click", () => go(i))
    dots.appendChild(d)
  })
}

const decorSets = {
  butterfly: ["🦋","✨","🎀","💗","🌸","⭐"],
  hello: ["💞","🫧","🌷","✨","🫶","🍬"],
  cake: ["🎂","🕯️","✨","🍓","🎀","🫧"],
  memories: ["📸","🌙","✨","🫶","🌸","⭐"],
  wish: ["✨","🫶","🎀","🌷","🫧","💗"],
  final: ["🎀","💗","✨","🌸","🫶","⭐"]
}

const rand = (a, b) => a + Math.random() * (b - a)

const clearDecor = slide => {
  const old = slide.querySelector(".decor")
  if (old) old.remove()
}

const renderDecor = slide => {
  clearDecor(slide)
  const type = slide.dataset.decor || "final"
  const set = decorSets[type] || decorSets.final
  const layer = document.createElement("div")
  layer.className = "decor"
  const n = 16
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div")
    el.className = "de"
    el.textContent = set[Math.floor(Math.random() * set.length)]
    el.style.left = rand(-5, 95) + "vw"
    el.style.top = rand(0, 100) + "vh"
    el.style.setProperty("--s", rand(18, 30).toFixed(0) + "px")
    el.style.setProperty("--o", rand(0.45, 0.9).toFixed(2))
    el.style.setProperty("--b", (Math.random() < 0.15 ? rand(0.2, 0.9) : 0).toFixed(1) + "px")
    el.style.setProperty("--t", rand(7, 15).toFixed(1) + "s")
    layer.appendChild(el)
  }
  slide.appendChild(layer)
}

const go = i => {
  idx = Math.max(0, Math.min(slides.length - 1, i))
  slides.forEach((s, k) => s.classList.toggle("on", k === idx))
  makeDots()
  renderDecor(slides[idx])
}

prevBtn.addEventListener("click", () => go(idx - 1))
nextBtn.addEventListener("click", () => go(idx + 1))

document.addEventListener("click", e => {
  const btn = e.target.closest("[data-next],[data-prev]")
  if (!btn) return
  if (btn.hasAttribute("data-next")) go(idx + 1)
  if (btn.hasAttribute("data-prev")) go(idx - 1)
})

let startX = null
deck.addEventListener("touchstart", e => {
  startX = e.touches?.[0]?.clientX ?? null
}, { passive: true })

deck.addEventListener("touchend", e => {
  const endX = e.changedTouches?.[0]?.clientX ?? null
  if (startX == null || endX == null) return
  const dx = endX - startX
  if (Math.abs(dx) < 45) return
  if (dx < 0) go(idx + 1)
  else go(idx - 1)
  startX = null
}, { passive: true })

const audio = new Audio("assets/bgm.mp3")
audio.preload = "metadata"
audio.loop = true

const playBtn = document.getElementById("playBtn")
const muteBtn = document.getElementById("muteBtn")
const seek = document.getElementById("seek")
const cur = document.getElementById("cur")
const dur = document.getElementById("dur")
const cover = document.getElementById("cover")

const fmt = s => {
  s = Math.max(0, Math.floor(s || 0))
  const m = Math.floor(s / 60)
  const r = String(s % 60).padStart(2, "0")
  return `${m}:${r}`
}

audio.addEventListener("loadedmetadata", () => {
  dur.textContent = fmt(audio.duration)
})

audio.addEventListener("timeupdate", () => {
  cur.textContent = fmt(audio.currentTime)
  if (!seek.dragging && audio.duration) {
    seek.value = String((audio.currentTime / audio.duration) * 100)
  }
})

playBtn.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play()
      playBtn.textContent = "⏸"
      cover.textContent = "♪"
      toast("musik nyala, jangan baper ya", { emoji:"🎀", title:"Play" })
    } catch {
      toast("browser lu nolak autoplay, pencet lagi pelan-pelan", { emoji:"🥲", title:"Gagal" })
      playBtn.textContent = "▶"
    }
  } else {
    audio.pause()
    playBtn.textContent = "▶"
    toast("musik dipause", { emoji:"🫧", title:"Pause" })
  }
})

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted
  muteBtn.textContent = audio.muted ? "🔇" : "🔊"
})

seek.addEventListener("pointerdown", () => (seek.dragging = true))
seek.addEventListener("pointerup", () => (seek.dragging = false))
seek.addEventListener("input", () => {
  if (!audio.duration) return
  audio.currentTime = (Number(seek.value) / 100) * audio.duration
})

let bfTaps = 0
const bf = document.getElementById("bf")
const bfFill = document.getElementById("bfFill")
const bfCount = document.getElementById("bfCount")

const setBf = v => {
  const p = Math.max(0, Math.min(12, v))
  bfFill.style.width = (p / 12) * 100 + "%"
  bfCount.textContent = String(p)
}

bf.addEventListener("click", () => {
  bfTaps++
  if (bfTaps > 12) bfTaps = 12
  setBf(bfTaps)
  if (bfTaps === 12) toast("haiii 👋", { emoji:"🦋", title:"dia nyapa" })
})

const cakeBtn = document.getElementById("cakeBtn")
const cakeImg = document.getElementById("cakeImg")
const cakeHint = document.getElementById("cakeHint")
const micBtn = document.getElementById("micBtn")
const micStat = document.getElementById("micStat")

let blown = false
const blowCandle = () => {
  if (blown) return
  blown = true
  cakeImg.src = "assets/cake_blown.gif"
  cakeHint.textContent = "yay"
  toast("lilinnya mati. manis.", { emoji:"🎂", title:"wish" })
}

cakeBtn.addEventListener("click", blowCandle)

let micStream = null
let micCtx = null
let micAnalyser = null
let micData = null
let micOn = false
let blowFrames = 0

const stopMic = () => {
  micOn = false
  micStat.textContent = "off"
  if (micStream) micStream.getTracks().forEach(t => t.stop())
  micStream = null
  if (micCtx) micCtx.close().catch(() => {})
  micCtx = null
  micAnalyser = null
  micData = null
}

const startMic = async () => {
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  micCtx = new (window.AudioContext || window.webkitAudioContext)()
  const src = micCtx.createMediaStreamSource(micStream)
  micAnalyser = micCtx.createAnalyser()
  micAnalyser.fftSize = 1024
  micData = new Uint8Array(micAnalyser.fftSize)
  src.connect(micAnalyser)
  micOn = true
  micStat.textContent = "listening"
  loopMic()
}

const loopMic = () => {
  if (!micOn || blown || !micAnalyser) return
  micAnalyser.getByteTimeDomainData(micData)
  let sum = 0
  for (let i = 0; i < micData.length; i++) {
    const v = (micData[i] - 128) / 128
    sum += v * v
  }
  const rms = Math.sqrt(sum / micData.length)
  if (rms > 0.14) blowFrames++
  else blowFrames = Math.max(0, blowFrames - 1)
  if (blowFrames > 6) {
    blowCandle()
    stopMic()
    return
  }
  requestAnimationFrame(loopMic)
}

micBtn.addEventListener("click", async () => {
  if (micOn) {
    stopMic()
    return
  }
  try {
    await startMic()
    toast("tiup pelan ke mic HP", { emoji:"🕯️", title:"Mic" })
  } catch {
    toast("izin mic ditolak. tap kue aja ya", { emoji:"🥲", title:"Mic" })
    stopMic()
  }
})

const photos = ["assets/p1.jpg","assets/p2.jpg","assets/p3.jpg","assets/p4.jpg"]
let gI = 0
const gImg = document.getElementById("gImg")
const gCap = document.getElementById("gCap")
const gPrev = document.getElementById("gPrev")
const gNext = document.getElementById("gNext")

const syncGallery = () => {
  gImg.src = photos[gI]
  gCap.textContent = `${gI + 1} / ${photos.length}`
}

gPrev.addEventListener("click", () => {
  gI = (gI - 1 + photos.length) % photos.length
  syncGallery()
})
gNext.addEventListener("click", () => {
  gI = (gI + 1) % photos.length
  syncGallery()
})

const wish = document.getElementById("wish")
const saveWish = document.getElementById("saveWish")
const wishOut = document.getElementById("wishOut")
const restart = document.getElementById("restart")

saveWish.addEventListener("click", () => {
  const v = (wish.value || "").trim()
  if (!v) return toast("isi dulu, jangan kosong", { emoji:"🫧", title:"Wish" })
  localStorage.setItem("wish", v)
  toast("kesimpen ✅", { emoji:"✨", title:"Wish" })
  renderWish()
})

const renderWish = () => {
  const v = localStorage.getItem("wish")
  wishOut.textContent = v ? `wish kamu: “${v}”` : ""
}

restart.addEventListener("click", () => go(0))

renderWish()
syncGallery()
makeDots()
go(0)