(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
          restart();
        });
      });

      showSlide(0);
      restart();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (panel) {
      var scope = panel.parentElement;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
      var search = panel.querySelector("[data-search-input]");
      var category = panel.querySelector("[data-category-filter]");
      var year = panel.querySelector("[data-year-filter]");
      var empty = panel.querySelector("[data-empty-state]");

      function valueOf(input) {
        return input ? input.value.trim().toLowerCase() : "";
      }

      function update() {
        var query = valueOf(search);
        var selectedCategory = valueOf(category);
        var selectedYear = valueOf(year);
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.category,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.region
          ].join(" ").toLowerCase();
          var cardCategory = (card.dataset.category || "").toLowerCase();
          var cardYear = (card.dataset.year || "").toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchCategory = !selectedCategory || cardCategory === selectedCategory;
          var matchYear = !selectedYear || cardYear === selectedYear;
          var shouldShow = matchQuery && matchCategory && matchYear;

          card.style.display = shouldShow ? "" : "none";

          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, category, year].forEach(function (input) {
        if (input) {
          input.addEventListener("input", update);
          input.addEventListener("change", update);
        }
      });
    });
  });
}());
