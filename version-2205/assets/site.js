(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupNavigation() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll("[data-search-form]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = "./search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        var input = document.getElementById("movieSearch");
        var genre = document.getElementById("genreFilter");
        var year = document.getElementById("yearFilter");
        var region = document.getElementById("regionFilter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".js-card"));
        var empty = document.querySelector("[data-empty-state]");
        if (!cards.length || (!input && !genre && !year && !region)) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery && input) {
            input.value = initialQuery;
        }
        function apply() {
            var query = normalize(input && input.value);
            var genreValue = normalize(genre && genre.value);
            var yearValue = normalize(year && year.value);
            var regionValue = normalize(region && region.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.year,
                    card.dataset.type
                ].join(" "));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchGenre = !genreValue || normalize(card.dataset.genre).indexOf(genreValue) !== -1;
                var matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
                var matchRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
                var show = matchQuery && matchGenre && matchYear && matchRegion;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        [input, genre, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById("movieVideo");
        var cover = document.querySelector("[data-player-cover]");
        var button = document.querySelector("[data-player-button]");
        var message = document.querySelector("[data-player-message]");
        if (!video || !source) {
            return;
        }
        var hlsInstance = null;
        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.classList.add("is-visible");
            }
        }
        function attach() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        showMessage("播放暂时不可用，请稍后再试");
                    }
                });
            } else {
                showMessage("播放暂时不可用，请稍后再试");
            }
        }
        function start() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }
        attach();
        if (cover) {
            cover.addEventListener("click", start);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupSearchForms();
        setupHero();
        setupFilters();
    });
})();
