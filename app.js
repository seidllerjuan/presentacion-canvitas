const slides = Array.from(document.querySelectorAll(".slide"));
const dotsNav = document.getElementById("dotsNav");
const progressFill = document.getElementById("progressFill");
const slideNow = document.getElementById("slideNow");
const slideTotal = document.getElementById("slideTotal");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const clockChip = document.getElementById("clockChip");

let index = 0;
let playing = true;
let resumeAfterBlur = false;
let timer = null;
let digitBuffer = "";
let digitTimer = null;

const AUTO_MS = 10000;
const durations = slides.map((slide) => Number(slide.dataset.duration || 0));
const totalSeconds = durations.reduce((sum, value) => sum + value, 0);

slideTotal.textContent = String(slides.length).padStart(2, "0");

function formatClock(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function elapsedUntil(currentIndex) {
  return durations.slice(0, currentIndex + 1).reduce((sum, value) => sum + value, 0);
}

function updateClock() {
  clockChip.textContent = `${formatClock(elapsedUntil(index))} / ${formatClock(totalSeconds)}`;
}

function buildDots() {
  dotsNav.innerHTML = slides
    .map(
      (slide, currentIndex) => `
        <button class="dot${currentIndex === 0 ? " active" : ""}" type="button" data-index="${currentIndex}" aria-label="Ir a ${slide.dataset.title}">
          <span class="dot-index">${String(currentIndex + 1).padStart(2, "0")}</span>
          <span>${slide.dataset.title}</span>
        </button>`
    )
    .join("");

  dotsNav.querySelectorAll(".dot").forEach((dot) => {
    dot.addEventListener("click", () => goTo(Number(dot.dataset.index)));
  });
}

function animateCounters(activeSlide) {
  activeSlide.querySelectorAll("[data-count]").forEach((element) => {
    const target = Number(element.dataset.count);
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  });
}

function revealSlide(activeSlide) {
  activeSlide.classList.remove("reveal");
  void activeSlide.offsetWidth;
  activeSlide.classList.add("reveal");
  animateCounters(activeSlide);
}

function updateDeck() {
  slides.forEach((slide, currentIndex) => {
    slide.classList.toggle("active", currentIndex === index);
  });

  dotsNav.querySelectorAll(".dot").forEach((dot, currentIndex) => {
    dot.classList.toggle("active", currentIndex === index);
  });

  slideNow.textContent = String(index + 1).padStart(2, "0");
  progressFill.style.width = `${((index + 1) / slides.length) * 100}%`;
  updateClock();
  revealSlide(slides[index]);
}

function goTo(newIndex) {
  index = (newIndex + slides.length) % slides.length;
  updateDeck();
  restartTimer();
}

function next() {
  goTo(index + 1);
}

function prev() {
  goTo(index - 1);
}

function setPlaying(value) {
  playing = value;
  playIcon.textContent = playing ? "||" : ">";
  if (playing) {
    restartTimer();
  } else {
    clearInterval(timer);
    timer = null;
  }
}

function restartTimer() {
  clearInterval(timer);
  if (!playing) {
    return;
  }
  timer = setInterval(next, AUTO_MS);
}

function queueDigitJump(digit) {
  digitBuffer += digit;
  clearTimeout(digitTimer);
  digitTimer = setTimeout(() => {
    const requestedSlide = Number(digitBuffer);
    digitBuffer = "";
    if (requestedSlide >= 1 && requestedSlide <= slides.length) {
      goTo(requestedSlide - 1);
    }
  }, 550);
}

buildDots();
updateDeck();
restartTimer();

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
playBtn.addEventListener("click", () => setPlaying(!playing));

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "PageDown") {
    next();
    return;
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    prev();
    return;
  }

  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    setPlaying(!playing);
    return;
  }

  if (event.key === "Home") {
    goTo(0);
    return;
  }

  if (event.key === "End") {
    goTo(slides.length - 1);
    return;
  }

  if (/^\d$/.test(event.key)) {
    queueDigitJump(event.key);
  }
});

window.addEventListener("blur", () => {
  resumeAfterBlur = playing;
  if (playing) {
    setPlaying(false);
  }
});

window.addEventListener("focus", () => {
  if (resumeAfterBlur) {
    resumeAfterBlur = false;
    setPlaying(true);
  }
});
