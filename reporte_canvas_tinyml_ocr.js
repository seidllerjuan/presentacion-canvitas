document.addEventListener("DOMContentLoaded", () => {
  const progressItems = document.querySelectorAll(".progress-item");

  progressItems.forEach((item) => {
    const target = item.getAttribute("data-progress") || "0";
    const bar = item.querySelector(".progress span");
    if (bar) {
      requestAnimationFrame(() => {
        bar.style.width = `${target}%`;
      });
    }
  });
});
