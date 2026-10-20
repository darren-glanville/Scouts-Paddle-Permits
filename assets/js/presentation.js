(function () {
  "use strict";

  const DEFAULTS = {
    SLIDE_INTERVAL_MS: 10000,
    QR_URL:
      "https://www.scouts.org.uk/volunteers/running-your-section/programme-guidance/information-for-volunteers/general-activity-guidance-a-z/paddlesports/kayaking/",
    QR_MODAL_TITLE: "Scan for more information",
    QR_SLIDE_CAPTION: "Scan for Scouts paddlesport and traditional rafting guidance.",
  };

  /** @type {typeof DEFAULTS} */
  const CONFIG = Object.assign(
    {},
    DEFAULTS,
    typeof window.PRESENTATION_CONFIG === "object" && window.PRESENTATION_CONFIG
      ? window.PRESENTATION_CONFIG
      : {}
  );

  function applyConfigPatch(patch) {
    if (!patch || typeof patch !== "object") return;
    Object.keys(DEFAULTS).forEach(function (key) {
      if (patch[key] !== undefined && patch[key] !== null && patch[key] !== "") {
        CONFIG[key] = patch[key];
      }
    });
  }

  function loadRuntimeConfig() {
    return fetch("assets/config.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (data) {
        applyConfigPatch(data);
      })
      .catch(function () {});
  }

  const MODAL_TRANSITION_MS = 500;

  const presentationEl = document.querySelector(".presentation");
  const btnFullscreen = document.getElementById("btn-fullscreen");
  const fullscreenIcon = document.getElementById("fullscreen-icon");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dotsContainer = document.getElementById("progress-dots");
  const modal = document.getElementById("qr-modal");
  const modalClose = document.getElementById("modal-close");
  const qrUrlDisplay = document.getElementById("qr-url-display");
  const qrModalUrl = document.getElementById("qr-modal-url");
  const slideTimerEl = document.getElementById("slide-timer");
  const qrModalTitle = document.getElementById("qr-modal-title");
  const qrSlideCaption = document.getElementById("qr-slide-caption");
  const slideDeckTitle = document.getElementById("slide-deck-title");

  let currentIndex = 0;
  let timerId = null;
  let modalOpen = false;
  let modalClosing = false;
  let pseudoFullscreen = false;

  function renderProgressDots() {
    slides.forEach(function (_, i) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Slide " + (i + 1));
      dot.addEventListener("click", function () {
        goToSlide(i);
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots(index) {
    const dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  }

  function updateSlideDeckTitle(index) {
    if (!slideDeckTitle) return;
    const onContentSlide = index > 0;
    slideDeckTitle.hidden = !onContentSlide;
    slideDeckTitle.classList.toggle("is-visible", onContentSlide);
  }

  function resetAnimations(slide) {
    slide.querySelectorAll(".animate-in").forEach(function (el) {
      el.style.animation = "none";
      void el.offsetHeight;
      el.style.animation = "";
    });
  }

  function goToSlide(nextIndex) {
    if (nextIndex === currentIndex || slides.length === 0) return;
    if (nextIndex < 0 || nextIndex >= slides.length) return;

    const prev = slides[currentIndex];
    const next = slides[nextIndex];

    prev.classList.remove("active", "leaving");
    next.classList.remove("leaving");
    resetAnimations(prev);

    prev.classList.add("leaving");
    prev.classList.remove("active");

    next.classList.add("active");
    resetAnimations(next);

    window.setTimeout(function () {
      prev.classList.remove("leaving");
    }, 750);

    currentIndex = nextIndex;
    updateDots(currentIndex);
    updateSlideDeckTitle(currentIndex);
  }

  function advanceSlide() {
    goToSlide((currentIndex + 1) % slides.length);
    resetTimer(false);
  }

  function retreatSlide() {
    goToSlide((currentIndex - 1 + slides.length) % slides.length);
    resetTimer(false);
  }

  function goNextManual() {
    if (modalOpen) return;
    goToSlide((currentIndex + 1) % slides.length);
    resetTimer();
  }

  function goPrevManual() {
    if (modalOpen) return;
    goToSlide((currentIndex - 1 + slides.length) % slides.length);
    resetTimer();
  }

  function clearTimer() {
    if (timerId !== null) {
      window.clearTimeout(timerId);
      timerId = null;
    }
  }

  function restartSpinner() {
    slideTimerEl.classList.remove("running");
    slideTimerEl.style.setProperty("--timer-duration", CONFIG.SLIDE_INTERVAL_MS + "ms");
    void slideTimerEl.offsetWidth;
    if (!modalOpen) {
      slideTimerEl.classList.add("running");
    }
  }

  function startTimer() {
    clearTimer();
    restartSpinner();
    if (modalOpen) return;
    timerId = window.setTimeout(advanceSlide, CONFIG.SLIDE_INTERVAL_MS);
  }

  /** @param {boolean} [restartAdvance=true] */
  function resetTimer(restartAdvance) {
    if (restartAdvance !== false) {
      startTimer();
    } else {
      clearTimer();
      restartSpinner();
      if (!modalOpen) {
        timerId = window.setTimeout(advanceSlide, CONFIG.SLIDE_INTERVAL_MS);
      }
    }
  }

  function renderQrCode(container, size) {
    container.innerHTML = "";
    /* global QRCode */
    new QRCode(container, {
      text: CONFIG.QR_URL,
      width: size,
      height: size,
      colorDark: "#7413dc",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
  }

  function setUrlLabels() {
    const label = CONFIG.QR_URL.replace(/^https?:\/\//, "");
    qrUrlDisplay.textContent = label;
    qrModalUrl.textContent = label;
    qrModalTitle.textContent = CONFIG.QR_MODAL_TITLE;
    qrSlideCaption.textContent = CONFIG.QR_SLIDE_CAPTION;
  }

  function openModal() {
    if (modalOpen || modalClosing) return;
    modalOpen = true;
    clearTimer();
    slideTimerEl.classList.remove("running");
    modal.hidden = false;
    modal.classList.remove("is-open");
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        modal.classList.add("is-open");
        modalClose.focus();
      });
    });
  }

  function closeModal() {
    if (!modalOpen || modalClosing) return;
    modalClosing = true;
    modal.classList.remove("is-open");

    window.setTimeout(function () {
      modal.hidden = true;
      modalClosing = false;
      modalOpen = false;
      startTimer();
    }, MODAL_TRANSITION_MS);
  }

  function isTypingContext() {
    const tag = document.activeElement && document.activeElement.tagName;
    return tag === "INPUT" || tag === "TEXTAREA";
  }

  function getNativeFullscreenElement() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      null
    );
  }

  function isFullscreenActive() {
    return Boolean(getNativeFullscreenElement()) || pseudoFullscreen;
  }

  function enterPseudoFullscreen() {
    if (!presentationEl) return;
    pseudoFullscreen = true;
    presentationEl.classList.add("is-pseudo-fullscreen");
    document.body.classList.add("presentation-fullscreen-active");
    updateFullscreenUi();
  }

  function exitPseudoFullscreen() {
    pseudoFullscreen = false;
    if (presentationEl) {
      presentationEl.classList.remove("is-pseudo-fullscreen");
    }
    document.body.classList.remove("presentation-fullscreen-active");
    updateFullscreenUi();
  }

  function exitNativeFullscreen() {
    const exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen;
    if (!exit) {
      return Promise.resolve();
    }
    try {
      const result = exit.call(document);
      return result && typeof result.then === "function" ? result : Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  function tryNativeFullscreen(el) {
    const request =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;
    if (!request) {
      return Promise.reject(new Error("Fullscreen API unavailable"));
    }
    try {
      const result = request.call(el);
      if (result && typeof result.then === "function") {
        return result;
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  function updateFullscreenUi() {
    if (!btnFullscreen || !fullscreenIcon) return;
    const active = isFullscreenActive();
    btnFullscreen.setAttribute("aria-label", active ? "Exit full screen" : "Enter full screen");
    btnFullscreen.setAttribute("aria-pressed", active ? "true" : "false");
    fullscreenIcon.className = "fa-solid " + (active ? "fa-compress" : "fa-expand");
    fullscreenIcon.setAttribute("aria-hidden", "true");
  }

  function exitAllFullscreen() {
    exitPseudoFullscreen();
    exitNativeFullscreen().catch(function () {});
  }

  function toggleFullscreen() {
    if (isFullscreenActive()) {
      exitAllFullscreen();
      return;
    }

    const targets = [presentationEl, document.documentElement, document.body].filter(Boolean);
    let chain = Promise.reject(new Error("start"));
    targets.forEach(function (el) {
      chain = chain.catch(function () {
        return tryNativeFullscreen(el);
      });
    });

    chain
      .then(function () {
        window.setTimeout(function () {
          if (getNativeFullscreenElement()) {
            exitPseudoFullscreen();
            updateFullscreenUi();
          } else {
            enterPseudoFullscreen();
          }
        }, 50);
      })
      .catch(function () {
        enterPseudoFullscreen();
      });
  }

  function initPresentation() {
    renderProgressDots();
    setUrlLabels();
    renderQrCode(document.getElementById("qr-slide"), 220);
    renderQrCode(document.getElementById("qr-modal-code"), 280);

    slides[0].classList.add("active");
    updateSlideDeckTitle(0);
    startTimer();

    document.addEventListener("keydown", function (e) {
      if (isTypingContext()) return;

      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        if (modalOpen) {
          closeModal();
        } else {
          openModal();
        }
        return;
      }

      if (e.code === "Escape") {
        if (modalOpen) {
          e.preventDefault();
          closeModal();
          return;
        }
        if (isFullscreenActive()) {
          e.preventDefault();
          exitAllFullscreen();
          return;
        }
      }

      if (modalOpen) return;

      if (e.code === "ArrowRight" || e.code === "PageDown") {
        e.preventDefault();
        goNextManual();
        return;
      }

      if (e.code === "ArrowLeft" || e.code === "PageUp") {
        e.preventDefault();
        goPrevManual();
      }
    });

    document.getElementById("btn-prev").addEventListener("click", goPrevManual);
    document.getElementById("btn-next").addEventListener("click", goNextManual);

    if (btnFullscreen) {
      btnFullscreen.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFullscreen();
      });
    }

    function onNativeFullscreenChange() {
      if (getNativeFullscreenElement()) {
        pseudoFullscreen = false;
        if (presentationEl) {
          presentationEl.classList.remove("is-pseudo-fullscreen");
        }
        document.body.classList.remove("presentation-fullscreen-active");
      }
      updateFullscreenUi();
    }

    document.addEventListener("fullscreenchange", onNativeFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onNativeFullscreenChange);
    updateFullscreenUi();

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  function init() {
    loadRuntimeConfig().then(initPresentation);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
