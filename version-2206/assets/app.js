(function () {
    "use strict";

    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (slides.length < 2) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupSearch() {
        var input = document.querySelector(".js-search");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery) {
            input.value = initialQuery;
        }
        var activeCategory = "all";
        var filterGroup = document.querySelector("[data-filter-group]");

        function apply() {
            var query = normalize(input.value);
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta"));
                var category = card.getAttribute("data-category") || "";
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchCategory = activeCategory === "all" || category === activeCategory;
                card.classList.toggle("is-hidden", !(matchQuery && matchCategory));
            });
        }

        input.addEventListener("input", apply);
        var form = input.closest("form");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
        }
        if (filterGroup) {
            filterGroup.addEventListener("click", function (event) {
                var button = event.target.closest("button[data-filter-value]");
                if (!button) {
                    return;
                }
                activeCategory = button.getAttribute("data-filter-value") || "all";
                Array.prototype.slice.call(filterGroup.querySelectorAll("button")).forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        }
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var trigger = player.querySelector(".play-overlay");
            var streamUrl = player.getAttribute("data-stream");
            var hlsItem = null;
            if (!video || !trigger || !streamUrl) {
                return;
            }

            function attach() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }
                video.setAttribute("data-ready", "1");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsItem = new window.Hls({ enableWorker: true });
                    hlsItem.loadSource(streamUrl);
                    hlsItem.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function start() {
                attach();
                player.classList.add("is-playing");
                video.controls = true;
                var playCall = video.play();
                if (playCall && typeof playCall.catch === "function") {
                    playCall.catch(function () {});
                }
            }

            trigger.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });
            window.addEventListener("pagehide", function () {
                if (hlsItem) {
                    hlsItem.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });
})();
