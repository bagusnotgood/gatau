const deck = document.getElementById("deck")
const slides = Array.from(document.querySelectorAll(".slide"))
const dots = document.getElementById("dots")

let idx = 0

const makeDots = () => {
  dots.innerHTML = ""
  slides.forEach((_, i) => {
    const d = document.createElement("div")
    d.className = "dot" + (i === idx ? " on" : "")
    d.addEventListener("click", () => go(i))
    dots.appendChild(d)
  })
}

const toast = (() => {
  const el = document.getElementById("toast")
  const msg = document.getElementById("toastMsg")
  const title = document.getElementById("toastTitle")
  const emoji = document.getElementById("toastEmoji")
  const close = document.getElementById("toastClose")
  let t = null

  const hide = () => {
    el.classList.remove("show")
    if (t) clearTimeout(t)
    t = null
  }

  close.addEventListener("click", hide)

  return (text, opt = {}) => {
    title.textContent = opt.title || "Yay!"
    emoji.textContent = opt.emoji || "🎉"
    msg.textContent = text
    el.classList.add("show")
    if (t) clearTimeout(t)
    t = setTimeout(hide, opt.ms || 2200)
  }
})()

const decorSets = {
  "hello-dolls": ["👋", "🧸", "✨", "💬", "🌈", "🫶"],
  balloons: ["🎈", "🎉", "🎀", "✨", "🫧", "🍬"],
  confetti: ["🎊", "✨", "⭐", "💥", "🟡", "🟣"],
  stars: ["⭐", "🌙", "✨", "💫", "🪐", "☁️"],
  hearts: ["💗", "💞", "💓", "🫶", "✨", "🌸"]
}

const clearDecor = slide => {
  const old = slide.querySelector(".decor")
  if (old) old.remove()
}

const rand = (a, b) => a + Math.random() * (b - a)

const renderDecor = slide => {
  clearDecor(slide)
  const type = slide.dataset.decor || "stars"
  const set = decorSets[type] || decorSets.stars
  const layer = document.createElement("div")
  layer.className = "decor"

  const n = 18
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div")
    el.className = "de" + (Math.random() < 0.45 ? " drift" : "")
    el.textContent = set[Math.floor(Math.random() * set.length)]
    el.style.left = rand(-5, 95) + "vw"
    el.style.top = rand(0, 100) + "vh"
    el.style.setProperty("--s", rand(18, 34).toFixed(0) + "px")
    el.style.setProperty("--o", rand(0.45, 0.95).toFixed(2))
    el.style.setProperty("--b", (Math.random() < 0.18 ? rand(0.2, 0.9) : 0).toFixed(1) + "px")
    el.style.setProperty("--t", rand(7, 16).toFixed(1) + "s")
    layer.appendChild(el)
  }

  slide.appendChild(layer)
}

const go = i => {
  idx = Math.max(0, Math.min(slides.length - 1, i))
  slides.forEach((s, k) => s.classList.toggle("on", k === idx))
  makeDots()
  renderDecor(slides[idx])
  syncAudioBySlide()
}

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

const wish = document.getElementById("wish")
const saveWish = document.getElementById("saveWish")
const finalText = document.getElementById("finalText")

saveWish.addEventListener("click", () => {
  const v = (wish.value || "").trim()
  if (!v) return toast("Tulis dulu dong, jangan kosong.", { emoji: "🫠", title: "Eits" })
  localStorage.setItem("wish", v)
  toast("Saved ✅", { emoji: "💾", title: "Mantap" })
})

const loadWish = () => {
  const v = localStorage.getItem("wish")
  if (v && finalText) finalText.textContent = `Wish kamu: “${v}”`
}

document.getElementById("restart").addEventListener("click", () => go(0))

let taps = 0
const toy = document.getElementById("toy")
const meterFill = document.getElementById("meterFill")
const tapCount = document.getElementById("tapCount")

const setMeter = v => {
  const p = Math.max(0, Math.min(10, v))
  meterFill.style.width = (p * 10) + "%"
  tapCount.textContent = String(p)
}

toy.addEventListener("click", () => {
  taps++
  if (taps > 10) taps = 10
  setMeter(taps)
  if (taps === 10) {
    toast("Say hello 👋", { emoji: "🧸", title: "Bonekanya" })
    toy.querySelector(".toy-text").textContent = "hello!"
  }
})

const audio = new Audio("assets/bgm.mp3")
audio.preload = "metadata"
audio.loop = true

const playBtn = document.getElementById("playBtn")
const muteBtn = document.getElementById("muteBtn")
const seek = document.getElementById("seek")
const cur = document.getElementById("cur")
const dur = document.getElementById("dur")
const cover = document.getElementById("cover")
const muteGlobal = document.getElementById("muteGlobal")

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
    } catch {
      toast("Browser lu nolak play. Coba pencet lagi.", { emoji: "🤏", title: "Woi" })
      playBtn.textContent = "▶"
    }
  } else {
    audio.pause()
    playBtn.textContent = "▶"
  }
})

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted
  muteBtn.textContent = audio.muted ? "🔇" : "🔊"
  muteGlobal.textContent = audio.muted ? "🔇" : "🔊"
})

muteGlobal.addEventListener("click", () => {
  audio.muted = !audio.muted
  muteBtn.textContent = audio.muted ? "🔇" : "🔊"
  muteGlobal.textContent = audio.muted ? "🔇" : "🔊"
})

seek.addEventListener("pointerdown", () => (seek.dragging = true))
seek.addEventListener("pointerup", () => (seek.dragging = false))
seek.addEventListener("input", () => {
  if (!audio.duration) return
  audio.currentTime = (Number(seek.value) / 100) * audio.duration
})

const syncAudioBySlide = () => {
  const onMusicSlide = slides[idx].querySelector("#playBtn")
  if (!onMusicSlide && !audio.paused) {
    audio.pause()
    playBtn.textContent = "▶"
  }
}

loadWish()
makeDots()
go(0)