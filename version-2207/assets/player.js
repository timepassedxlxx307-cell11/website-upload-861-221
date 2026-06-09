(function () {
  var hlsPromise = null;
  var playerScriptUrl = document.currentScript ? document.currentScript.src : new URL('assets/player.js', document.baseURI).href;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function getHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = import(new URL('hls-vendor.js', playerScriptUrl).href)
        .then(function (mod) {
          return mod.H;
        })
        .catch(function () {
          return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js').then(function () {
            return window.Hls;
          });
        });
    }

    return hlsPromise;
  }

  function beginPlayback(stage) {
    var video = stage.querySelector('video');
    var message = stage.querySelector('.player-message');
    var source = stage.getAttribute('data-play');

    if (!video || !source) {
      return;
    }

    if (stage.getAttribute('data-ready') === '1') {
      video.play().catch(function () {});
      return;
    }

    stage.setAttribute('data-ready', '1');
    stage.classList.add('is-playing');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {
        if (message) {
          message.textContent = '播放暂时不可用，请稍后重试';
        }
      });
      return;
    }

    getHls()
      .then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      })
      .catch(function () {
        stage.removeAttribute('data-ready');
        stage.classList.remove('is-playing');

        if (message) {
          message.textContent = '播放暂时不可用，请稍后重试';
        }
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-play]').forEach(function (stage) {
      var button = stage.querySelector('.play-button-layer');
      var video = stage.querySelector('video');

      if (button) {
        button.addEventListener('click', function () {
          beginPlayback(stage);
        });
      }

      if (video) {
        video.addEventListener('click', function () {
          if (stage.getAttribute('data-ready') !== '1') {
            beginPlayback(stage);
          }
        });
      }
    });
  });
})();
