(function () {
  function findHeader() {
    return document.querySelector("header, .header, .app-header, .topbar, .navbar");
  }

  function hasOverflowBlocker(el) {
    var parent = el ? el.parentElement : null;
    while (parent && parent !== document.body) {
      var styles = window.getComputedStyle(parent);
      var overflowMix = (styles.overflow || "") + " " + (styles.overflowX || "") + " " + (styles.overflowY || "");
      if (/(auto|scroll|hidden)/i.test(overflowMix)) return true;
      parent = parent.parentElement;
    }
    return false;
  }

  function applyFallback(header) {
    var rect = header.getBoundingClientRect();
    var app = header.closest(".app");
    var page = app ? app.querySelector(".page") : null;
    var height = Math.ceil(rect.height || header.offsetHeight || 0);

    header.classList.add("is-fixed-header");
    header.style.width = rect.width + "px";
    header.style.left = rect.left + "px";
    header.style.right = "auto";

    if (page) {
      var current = parseFloat(window.getComputedStyle(page).paddingTop) || 0;
      if (!page.dataset.stickyOffsetApplied) {
        page.dataset.stickyOffsetApplied = "1";
        page.dataset.basePaddingTop = String(current);
      }
      var basePadding = parseFloat(page.dataset.basePaddingTop || "0") || 0;
      page.style.paddingTop = basePadding + height + "px";
    } else {
      var bodyCurrent = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
      if (!document.body.dataset.stickyOffsetApplied) {
        document.body.dataset.stickyOffsetApplied = "1";
        document.body.dataset.basePaddingTop = String(bodyCurrent);
      }
      var bodyBase = parseFloat(document.body.dataset.basePaddingTop || "0") || 0;
      document.body.style.paddingTop = bodyBase + height + "px";
    }

    return true;
  }

  function syncFixedHeader(header) {
    if (!header || !header.classList.contains("is-fixed-header")) return;
    var rect = header.getBoundingClientRect();
    var width = Math.ceil((header.parentElement && header.parentElement.clientWidth) || rect.width || header.offsetWidth || 0);
    var left = 0;
    if (header.parentElement) {
      left = Math.round(header.parentElement.getBoundingClientRect().left);
    } else {
      left = Math.round(rect.left || 0);
    }
    header.style.width = width + "px";
    header.style.left = left + "px";
  }

  function stabilizeHeader() {
    var header = findHeader();
    if (!header) return;
    if (hasOverflowBlocker(header)) {
      var applied = applyFallback(header);
      if (applied && !header.dataset.fixedSyncBound) {
        header.dataset.fixedSyncBound = "1";
        window.addEventListener("resize", function () {
          syncFixedHeader(header);
        });
      }
      syncFixedHeader(header);
    }
  }

  window.addEventListener("DOMContentLoaded", stabilizeHeader);
})();


