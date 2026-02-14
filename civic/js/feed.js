function setupFeedReveal() {
  const cards = document.querySelectorAll(".feed-card");
  if (!cards.length) return;

  if (!("IntersectionObserver" in window)) {
    cards.forEach((card) => card.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach((card) => observer.observe(card));
}

window.addEventListener("DOMContentLoaded", setupFeedReveal);
