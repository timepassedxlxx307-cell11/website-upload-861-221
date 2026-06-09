
(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("hidden");
        var openIcon = menuButton.querySelector(".menu-open");
        var closeIcon = menuButton.querySelector(".menu-close");
        if (openIcon && closeIcon) {
          openIcon.classList.toggle("hidden");
          closeIcon.classList.toggle("hidden");
        }
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;
      function show(index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
          slide.classList.toggle("opacity-100", i === current);
          slide.classList.toggle("opacity-0", i !== current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }
      function start() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }
      function restart() {
        if (timer) window.clearInterval(timer);
        start();
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });
      show(0);
      start();
    }

    var filterBoxes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-box]"));
    filterBoxes.forEach(function (box) {
      var queryInput = box.querySelector("[data-filter-query]");
      var yearSelect = box.querySelector("[data-filter-year]");
      var genreSelect = box.querySelector("[data-filter-genre]");
      var empty = box.querySelector("[data-empty-result]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get("q") || "";
      if (queryInput && queryFromUrl) queryInput.value = queryFromUrl;
      function apply() {
        var q = queryInput ? queryInput.value.trim().toLowerCase() : "";
        var y = yearSelect ? yearSelect.value : "";
        var g = genreSelect ? genreSelect.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var year = card.getAttribute("data-year") || "";
          var genre = card.getAttribute("data-genre") || "";
          var ok = true;
          if (q && text.indexOf(q) === -1) ok = false;
          if (y && year !== y) ok = false;
          if (g && genre.indexOf(g) === -1) ok = false;
          card.classList.toggle("is-filtered", !ok);
          if (ok) visible += 1;
        });
        if (empty) empty.classList.toggle("hidden", visible !== 0);
      }
      if (queryInput) queryInput.addEventListener("input", apply);
      if (yearSelect) yearSelect.addEventListener("change", apply);
      if (genreSelect) genreSelect.addEventListener("change", apply);
      apply();
    });
  });
})();
