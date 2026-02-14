function animateCount(el) {
  const target = Number(el.getAttribute("data-count"));
  if (!Number.isFinite(target)) return;
  const hasPercent = el.textContent.trim().includes("%");
  const duration = 700;
  const start = performance.now();

  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const value = Math.round(target * eased);
    el.textContent = hasPercent ? value + "%" : String(value);
    if (p < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function setupDashboardCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCount);
    return;
  }

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach((el) => obs.observe(el));
}

function setupWeeklyChart() {
  const chart = document.querySelector(".mini-chart");
  if (!chart) return;
  const points = [40, 58, 66, 48, 78, 52, 44];
  const bars = chart.querySelectorAll("div");
  bars.forEach((bar, i) => {
    bar.style.height = points[i] + "%";
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupWeeklyChart();
  setupDashboardCounters();
});
