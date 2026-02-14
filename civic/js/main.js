function increaseScore() {
  alert("Verification recorded. Citizen score increased!");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Swallow registration errors to avoid disrupting core flows.
    });
  });
}
