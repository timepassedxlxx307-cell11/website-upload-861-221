import { H as Hls } from './hls-module.js';

export function setupVideoPlayer(options) {
    const video = document.getElementById(options.videoId);

    if (!video) {
        return;
    }

    const frame = video.closest('[data-player]');
    const overlay = frame ? frame.querySelector('[data-play-button]') : null;
    let prepared = false;

    const prepare = () => {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = options.source;
        } else if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(options.source);
            hls.attachMedia(video);
        } else {
            video.src = options.source;
        }
    };

    const start = () => {
        prepare();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        const playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(() => {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    };

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    video.addEventListener('play', () => {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('click', () => {
        if (!prepared) {
            start();
        }
    });
}
