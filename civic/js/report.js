window.addEventListener("DOMContentLoaded", () => {
  const range = document.querySelector('input[type="range"]');
  if (!range) return;
  range.setAttribute("aria-label", "Urgency level");
});
