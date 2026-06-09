
(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-stream]");
      var overlay = player.querySelector("[data-play-overlay]");
      if (!video) return;
      var stream = video.getAttribute("data-stream");
      var attached = false;
      function attach() {
        if (attached || !stream) return;
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = stream;
        }
      }
      function play() {
        attach();
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }
      if (overlay) {
        overlay.addEventListener("click", function () {
          play();
        });
      }
      video.addEventListener("click", function () {
        attach();
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) overlay.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) overlay.classList.remove("is-hidden");
      });
      attach();
    });
  });
})();
