(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function setupCategoryFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-filter-grid]');

    if (!panel || !grid) {
      return;
    }

    var search = panel.querySelector('[data-filter-search]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var count = panel.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function applyFilters() {
      var keyword = valueOf(search);
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);
      var visible = 0;

      cards.forEach(function (card) {
        var content = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || content.indexOf(keyword) !== -1;
        var matchesRegion = !regionValue || (card.getAttribute('data-region') || '').toLowerCase() === regionValue;
        var matchesType = !typeValue || (card.getAttribute('data-type') || '').toLowerCase() === typeValue;
        var matchesYear = !yearValue || (card.getAttribute('data-year') || '').toLowerCase() === yearValue;
        var shouldShow = matchesKeyword && matchesRegion && matchesType && matchesYear;

        card.classList.toggle('is-hidden', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部';
      }
    }

    [search, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });
  }

  function setupImageFallback() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
        image.removeAttribute('srcset');
      }, { once: true });
    });
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="movie/' + encodeURIComponent(movie.id) + '.html" class="movie-card-link">',
      '    <div class="poster-wrap">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '      <span class="poster-play">▶</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p class="movie-card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
      '      <p class="movie-card-summary">' + escapeHtml(movie.one_line || movie.summary || '') + '</p>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('[data-search-page-input]');
    var status = document.querySelector('[data-search-status]');
    var results = document.querySelector('[data-search-results]');

    if (!form || !input || !status || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var movies = [];

    input.value = initialQuery;

    function render(query) {
      var keyword = query.trim().toLowerCase();

      if (!keyword) {
        status.textContent = '请输入关键词开始搜索。';
        results.innerHTML = '';
        return;
      }

      var matches = movies.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.one_line,
          movie.summary,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();

        return haystack.indexOf(keyword) !== -1;
      });

      status.textContent = '搜索“' + query + '”找到 ' + matches.length + ' 部影片。';
      results.innerHTML = matches.slice(0, 200).map(createCard).join('\n');
      setupImageFallback();
    }

    fetch('assets/data/movies.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        movies = data;
        render(initialQuery);
      })
      .catch(function () {
        status.textContent = '搜索数据加载失败，请检查 assets/data/movies.json 是否存在。';
      });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', nextUrl);
      render(query);
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCategoryFilters();
    setupImageFallback();
    setupSearchPage();
  });
})();
