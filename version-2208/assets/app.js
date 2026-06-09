(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-rail]')).forEach(function (railWrap) {
    var rail = railWrap.querySelector('.movie-rail');
    var left = railWrap.querySelector('[data-rail-left]');
    var right = railWrap.querySelector('[data-rail-right]');

    if (!rail) {
      return;
    }

    function move(direction) {
      rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.78, 260), behavior: 'smooth' });
    }

    if (left) {
      left.addEventListener('click', function () {
        move(-1);
      });
    }

    if (right) {
      right.addEventListener('click', function () {
        move(1);
      });
    }
  });

  function loadHlsLibrary(done) {
    if (window.Hls) {
      done();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');

    if (existing) {
      existing.addEventListener('load', done, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', done, { once: true });
    document.head.appendChild(script);
  }

  Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.video-overlay');
    var source = player.getAttribute('data-video-src');
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (video.dataset.ready === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.ready = 'true';
        return;
      }

      loadHlsLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          video.dataset.ready = 'true';
        } else {
          video.src = source;
          video.dataset.ready = 'true';
        }
      });
    }

    function requestPlay() {
      attachSource();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', requestPlay);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        requestPlay();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      player.classList.remove('is-playing');
    });

    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });

  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');

  if (searchInput && searchResults && window.MovieSearchIndex) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (match) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[match];
      });
    }

    function movieCard(item) {
      var tags = [item.genre].concat(item.tags || []).filter(Boolean).slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + escapeHtml(item.href) + '" aria-label="观看' + escapeHtml(item.title) + '">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />',
        '    <span class="play-badge">▶</span>',
        '    <span class="year-badge">' + escapeHtml(item.year) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <a class="movie-title" href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a>',
        '    <p>' + escapeHtml(item.summary) + '</p>',
        '    <div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function runSearch() {
      var query = searchInput.value.trim().toLowerCase();
      var items = window.MovieSearchIndex.filter(function (item) {
        if (!query) {
          return true;
        }

        var haystack = [
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          (item.tags || []).join(','),
          item.summary
        ].join(' ').toLowerCase();

        return haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      searchResults.innerHTML = items.map(movieCard).join('');
    }

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }
})();
