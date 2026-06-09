(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function card(item) {
    var tags = [item.type, item.region].concat(item.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(item.url) + '">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="type-badge">' + escapeHtml(item.type) + '</span>',
      '<span class="play-mark">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
      '<p>' + escapeHtml(item.summary) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function matchItem(item, keyword, type, year) {
    var content = [item.title, item.region, item.type, item.year, item.genre, item.category, item.summary, (item.tags || []).join(' ')].join(' ').toLowerCase();

    if (keyword && content.indexOf(keyword) === -1) {
      return false;
    }

    if (type && item.type.indexOf(type) === -1) {
      return false;
    }

    if (year && item.year !== year) {
      return false;
    }

    return true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-type-select]');
    var yearSelect = document.querySelector('[data-year-select]');
    var output = document.querySelector('[data-search-results]');

    if (!form || !input || !output || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var result = window.MOVIE_INDEX.filter(function (item) {
        return matchItem(item, keyword, type, year);
      }).slice(0, 240);

      if (!result.length) {
        output.innerHTML = '<div class="empty-state">未找到匹配内容，请尝试更换关键词。</div>';
        return;
      }

      output.innerHTML = '<div class="movie-grid">' + result.map(card).join('') + '</div>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    input.addEventListener('input', render);

    if (typeSelect) {
      typeSelect.addEventListener('change', render);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', render);
    }

    render();
  });
})();
