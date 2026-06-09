(function () {
  function initMoviePlayer(source) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    var status = document.getElementById("playerStatus");
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function showStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showStatus("视频暂时无法播放，请稍后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        showStatus("视频暂时无法播放，请稍后重试");
      }
    }

    function playVideo() {
      loadSource();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    loadSource();

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
