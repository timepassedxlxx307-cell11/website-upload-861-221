
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMobileNav() {
        var button = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().replace(/\s+/g, '');
    }

    function initSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
        if (!inputs.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        inputs.forEach(function (input) {
            input.value = initialQuery;
        });
        var items = Array.prototype.slice.call(document.querySelectorAll('.searchable-list .movie-card, .searchable-list .rank-row'));
        function applySearch(query) {
            var q = normalize(query);
            items.forEach(function (item) {
                var text = normalize(item.textContent);
                item.classList.toggle('search-hidden', Boolean(q) && text.indexOf(q) === -1);
            });
        }
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                applySearch(input.value);
            });
        });
        applySearch(initialQuery);
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
        players.forEach(function (video) {
            var url = video.getAttribute('data-hls');
            var box = video.closest('.player-box');
            var overlay = box ? box.querySelector('.play-overlay') : null;
            var loaded = false;
            var hlsInstance = null;

            function attach() {
                if (loaded || !url) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
            }

            function play() {
                attach();
                video.controls = true;
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove('is-hidden');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        initMobileNav();
        initHero();
        initSearch();
        initPlayers();
    });
}());
