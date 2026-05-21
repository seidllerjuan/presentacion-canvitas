document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card, .comparison-strip__item, .callout");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, { threshold: 0.12 });

  cards.forEach((card) => observer.observe(card));
});
