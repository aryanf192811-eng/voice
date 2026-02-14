(function () {
  function getEl(id) {
    return document.getElementById(id);
  }

  function handleAccident() {
    var api = window.CivicEmergency;
    if (!api || !api.openCamera) {
      console.warn("[Civic Accident] Emergency module not ready");
      return;
    }

    var coords = { lat: 28.6139, lng: 77.2090 };
    api.setStatus("Preparing accident report...", "state-loading");

    api.openCamera()
      .then(function () {
        var captureBtn = api.getCaptureButton();
        var videoEl = api.getVideo();
        if (!captureBtn || !videoEl) {
          throw new Error("Camera controls unavailable");
        }

        if (captureBtn.dataset.boundAccident) return;
        captureBtn.dataset.boundAccident = "1";
        captureBtn.addEventListener("click", function () {
          api.setStatus("Submitting accident report...", "state-loading");
          var payload = {
            type: "ACCIDENT",
            timestamp: new Date().toISOString(),
            coords: coords,
            media: api.captureFrame(videoEl)
          };
          api.emitPayload(payload);
          api.closeCamera();
          api.setStatus("Accident reported. Assistance is being dispatched to the location.", "state-success");
          if (api.showToast) {
            api.showToast("Accident reported. Assistance is being dispatched to the location.");
          }
        });
      })
      .catch(function () {
        api.setStatus("Unable to open camera for accident report.", "state-error");
        if (api.showToast) {
          api.showToast("Unable to open camera. Please retry.");
        }
      });
  }

  window.addEventListener("DOMContentLoaded", function () {
    var btn = getEl("accidentTrigger");
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = "true";
      btn.addEventListener("click", handleAccident);
    }
  });
})();
