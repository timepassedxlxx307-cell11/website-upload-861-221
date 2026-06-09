import { H as Hls } from './hls-vendor.js';

function setupPlayer() {
  var video = document.querySelector('.movie-player');
  var button = document.querySelector('[data-player-button]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-video-src');

  if (!source) {
    return;
  }

  function hideButton() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function attachSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          video.src = source;
        }
      });

      return;
    }

    video.src = source;
  }

  attachSource();

  if (button) {
    button.addEventListener('click', function () {
      hideButton();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    });
  }

  video.addEventListener('play', hideButton);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPlayer);
} else {
  setupPlayer();
}
