(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
      });
    }

    var topButton = document.querySelector('[data-back-top]');

    if (topButton) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 320) {
          topButton.classList.add('show');
        } else {
          topButton.classList.remove('show');
        }
      });

      topButton.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-slide-to]'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-to') || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var filterInput = document.querySelector('[data-card-filter]');

    if (filterInput) {
      filterInput.addEventListener('input', function () {
        var keyword = filterInput.value.trim().toLowerCase();
        var cards = document.querySelectorAll('[data-card]');

        cards.forEach(function (card) {
          var key = card.getAttribute('data-key') || '';
          card.style.display = key.indexOf(keyword) > -1 ? '' : 'none';
        });
      });
    }
  });
})();
