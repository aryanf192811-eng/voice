window.addEventListener("DOMContentLoaded", () => {
  const confidenceBar = document.querySelector(".confidence .bar div");
  if (!confidenceBar) return;
  confidenceBar.style.transition = "width 220ms ease";
});
