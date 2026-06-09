(() => {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        let index = 0;

        const showSlide = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                showSlide(Number(dot.dataset.heroDot || 0));
            });
        });

        if (slides.length > 1) {
            window.setInterval(() => {
                showSlide(index + 1);
            }, 6200);
        }
    }

    document.querySelectorAll('[data-rail]').forEach((rail) => {
        const wrap = rail.closest('.rail-wrap');
        const prev = wrap ? wrap.querySelector('[data-rail-prev]') : null;
        const next = wrap ? wrap.querySelector('[data-rail-next]') : null;

        if (prev) {
            prev.addEventListener('click', () => {
                rail.scrollBy({ left: -rail.clientWidth * 0.8, behavior: 'smooth' });
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                rail.scrollBy({ left: rail.clientWidth * 0.8, behavior: 'smooth' });
            });
        }
    });

    const searchInput = document.querySelector('[data-search-input]');
    const clearSearch = document.querySelector('[data-clear-search]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const resultCount = document.querySelector('[data-result-count]');
    const emptyState = document.querySelector('[data-empty-state]');
    const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
    let activeFilter = 'all';

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const matchesCard = (card, query, filter) => {
        const haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.year,
            card.dataset.category,
            card.textContent
        ].join(' '));
        const filterMatch = filter === 'all' || haystack.includes(normalize(filter));
        const queryMatch = !query || haystack.includes(normalize(query));
        return filterMatch && queryMatch;
    };

    const applyFilters = () => {
        if (!cards.length) {
            return;
        }

        const query = searchInput ? searchInput.value : '';
        let visible = 0;

        cards.forEach((card) => {
            const show = matchesCard(card, query, activeFilter);
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (resultCount) {
            resultCount.textContent = `当前显示 ${visible} 部影片`;
        }

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    };

    if (searchInput) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');

        if (initialQuery) {
            searchInput.value = initialQuery;
        }

        searchInput.addEventListener('input', applyFilters);
    }

    if (clearSearch && searchInput) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            applyFilters();
        });
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter || 'all';
            filterButtons.forEach((item) => item.classList.toggle('active', item === button));
            applyFilters();
        });
    });

    applyFilters();

    const backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', () => {
            backTop.classList.toggle('show', window.scrollY > 500);
        });

        backTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
