(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var setSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
      thumbs.forEach(function (thumb, idx) {
        thumb.classList.toggle('is-active', idx === current);
      });
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        setSlide(Number(thumb.getAttribute('data-hero-thumb') || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var localSearch = document.querySelector('[data-local-search]');
  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get('q') || '';

  if (searchInput) {
    searchInput.value = queryValue;
  }

  if (localSearch) {
    localSearch.value = queryValue;
  }

  var grid = document.querySelector('[data-card-grid]');
  var emptyState = document.querySelector('[data-empty-state]');
  var sortSelect = document.querySelector('[data-sort-select]');

  var normalize = function (value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  };

  var filterCards = function () {
    if (!grid) {
      return;
    }
    var activeInput = localSearch || searchInput;
    var query = normalize(activeInput ? activeInput.value : '');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  };

  var sortCards = function () {
    if (!grid || !sortSelect) {
      return;
    }
    var mode = sortSelect.value;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var collator = new Intl.Collator('zh-Hans-CN');

    cards.sort(function (a, b) {
      if (mode === 'hot-desc') {
        return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
      }
      if (mode === 'title-asc') {
        return collator.compare(a.getAttribute('data-title') || '', b.getAttribute('data-title') || '');
      }
      return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
    });

    cards.forEach(function (card) {
      grid.appendChild(card);
    });
    filterCards();
  };

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (localSearch) {
    localSearch.addEventListener('input', filterCards);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', sortCards);
    sortCards();
  } else {
    filterCards();
  }

  var favoriteButton = document.querySelector('[data-favorite]');

  if (favoriteButton) {
    var favoriteKey = 'movie-favorite-' + favoriteButton.getAttribute('data-favorite');
    var setFavorite = function () {
      var active = window.localStorage.getItem(favoriteKey) === '1';
      favoriteButton.classList.toggle('is-active', active);
      favoriteButton.textContent = active ? '已收藏' : '收藏';
    };

    favoriteButton.addEventListener('click', function () {
      var active = window.localStorage.getItem(favoriteKey) === '1';
      window.localStorage.setItem(favoriteKey, active ? '0' : '1');
      setFavorite();
    });

    setFavorite();
  }

  var shareButton = document.querySelector('[data-share]');

  if (shareButton) {
    shareButton.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).then(function () {
          shareButton.textContent = '已复制';
          window.setTimeout(function () {
            shareButton.textContent = '分享';
          }, 1600);
        });
      }
    });
  }
})();
