(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector("[data-search-input]");
  var typeFilter = document.querySelector("[data-filter-type]");
  var categoryFilter = document.querySelector("[data-filter-category]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var emptyState = document.querySelector("[data-empty-state]");

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var type = typeFilter ? typeFilter.value : "";
    var category = categoryFilter ? categoryFilter.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre")
      ].join(" ").toLowerCase();
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchType = !type || (card.getAttribute("data-type") || "").indexOf(type) !== -1;
      var matchCategory = !category || card.getAttribute("data-category") === category;
      var show = matchQuery && matchType && matchCategory;

      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (searchInput) {
    var initialQuery = getQueryParam("q");
    if (initialQuery) {
      searchInput.value = initialQuery;
    }

    searchInput.addEventListener("input", applyFilters);
  }

  if (typeFilter) {
    typeFilter.addEventListener("change", applyFilters);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters);
  }

  if (searchInput || typeFilter || categoryFilter) {
    applyFilters();
  }
})();
