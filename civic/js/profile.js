function animateCount(el) {
  const text = el.textContent.trim();
  const hasPercent = text.includes("%");
  const target = Number(text.replace("%", ""));
  if (!Number.isFinite(target)) return;

  const start = performance.now();
  const duration = 650;

  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const value = Math.round(target * eased);
    el.textContent = hasPercent ? value + "%" : String(value);
    if (p < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".small-stat strong, .big-score").forEach(animateCount);
});
