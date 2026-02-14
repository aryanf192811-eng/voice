(function () {
  function getEl() {
    for (var i = 0; i < arguments.length; i++) {
      var el = document.getElementById(arguments[i]);
      if (el) return el;
    }
    return null;
  }

  function setStatus(message, stateClass) {
    var status = getEl("emergencyStatus");
    if (!status) return;
    status.className = "emergency-status" + (stateClass ? " " + stateClass : "");
    status.textContent = message || "";
  }

  function showToast(message) {
    var toast = getEl("emergencyToast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(function () {
      toast.classList.add("hidden");
    }, 3200);
  }

  function stopStream(stream) {
    if (!stream) return;
    stream.getTracks().forEach(function (track) {
      track.stop();
    });
  }

  function emitEmergencyPayload(payload) {
    // Safe integration point for any existing pipeline listener.
    window.dispatchEvent(new CustomEvent("civic:emergency-report", { detail: payload }));
    if (typeof window.submitReport === "function") {
      window.submitReport(payload);
      return;
    }
    if (typeof window.pushReport === "function") {
      window.pushReport(payload);
      return;
    }
    console.log("[Civic Emergency]", payload);
  }

  function captureFrame(video) {
    if (!video || !video.videoWidth || !video.videoHeight) return null;
    var canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.86);
  }

  function createSharedEmergencyApi() {
    if (window.CivicEmergency && window.CivicEmergency.openCamera) {
      return window.CivicEmergency;
    }

    var cameraModal = getEl("emergencyCameraModal", "cameraModal");
    var cameraStreamEl = getEl("emergencyCameraStream", "cameraStream");
    var closeBtn = getEl("emergencyClose", "closeCamera");
    var captureBtn = getEl("emergencyCapture", "captureMedia");
    var activeStream = null;

    function closeCamera() {
      stopStream(activeStream);
      activeStream = null;
      if (cameraStreamEl) {
        cameraStreamEl.srcObject = null;
      }
      if (cameraModal) {
        cameraModal.classList.add("hidden");
      }
      setStatus("");
    }

    function openCamera() {
      if (!cameraModal || !cameraStreamEl) {
        return Promise.reject(new Error("Camera UI unavailable"));
      }
      cameraModal.classList.remove("hidden");
      setStatus("Opening camera...", "state-loading");
      return navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(function (stream) {
          activeStream = stream;
          cameraStreamEl.srcObject = stream;
          setStatus("Camera active. Capture evidence to send.", "");
          return stream;
        })
        .catch(function (error) {
          setStatus("Camera permission denied or unavailable.", "state-error");
          throw error;
        });
    }

    if (closeBtn && !closeBtn.dataset.boundEmergency) {
      closeBtn.dataset.boundEmergency = "1";
      closeBtn.addEventListener("click", closeCamera);
    }

    if (cameraModal && !cameraModal.dataset.boundEmergency) {
      cameraModal.dataset.boundEmergency = "1";
      cameraModal.addEventListener("click", function (e) {
        if (e.target === cameraModal) closeCamera();
      });
    }

    var api = {
      openCamera: openCamera,
      closeCamera: closeCamera,
      getStream: function () {
        return activeStream;
      },
      getCaptureButton: function () {
        return captureBtn;
      },
      getVideo: function () {
        return cameraStreamEl;
      },
      setStatus: setStatus,
      showToast: showToast,
      captureFrame: captureFrame,
      emitPayload: emitEmergencyPayload
    };

    window.CivicEmergency = api;
    return api;
  }

  function handleSOS() {
    var api = createSharedEmergencyApi();
    api.setStatus("Fetching live location...", "state-loading");

    var geoPromise = new Promise(function (resolve, reject) {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation unavailable"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        reject,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    });

    geoPromise
      .then(function (coords) {
        var payload = {
          type: "SOS",
          timestamp: new Date().toISOString(),
          coords: coords,
          media: null,
          userId: window.currentUser && window.currentUser.id ? window.currentUser.id : "anonymous"
        };
        api.emitPayload(payload);
        api.setStatus("Location sent to authority. Help is on the way.", "state-success");
        api.showToast("Location sent to authority. Help is on the way.");
      })
      .catch(function () {
        api.setStatus("Unable to fetch location. Please allow location access.", "state-error");
        api.showToast("Unable to send SOS location. Please retry.");
      });
  }

  window.addEventListener("DOMContentLoaded", function () {
    var btn = getEl("sosTrigger");
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = "true";
      btn.addEventListener("click", handleSOS);
    }
    createSharedEmergencyApi();
  });
})();
