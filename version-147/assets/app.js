(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupNavigation() {
    var toggle = $('[data-nav-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        schedule();
      });
    });
    schedule();
  }

  function setupFilters() {
    $all('[data-filter-scope]').forEach(function (scope) {
      var input = $('[data-filter-keyword]', scope);
      var region = $('[data-filter-region]', scope);
      var type = $('[data-filter-type]', scope);
      var category = $('[data-filter-category]', scope);
      var sort = $('[data-sort-cards]', scope);
      var count = $('[data-filter-count]', scope);
      var list = $('[data-card-list]', scope);
      var cards = $all('.movie-card, .rank-card', scope);

      function getVisibleCards() {
        return cards.filter(function (card) {
          return card.style.display !== 'none';
        });
      }

      function applySort() {
        if (!sort || !list) {
          return;
        }
        var value = sort.value;
        var sorted = cards.slice().sort(function (a, b) {
          if (value === 'heat-desc') {
            return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
          }
          if (value === 'rating-desc') {
            return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
          }
          if (value === 'title-asc') {
            return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-CN');
          }
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
        sorted.forEach(function (card) {
          list.appendChild(card);
        });
      }

      function applyFilter() {
        var keyword = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var categoryValue = normalize(category && category.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.category,
            card.dataset.tags,
            card.dataset.year
          ].join(' '));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (regionValue && normalize(card.dataset.region) !== regionValue) {
            matched = false;
          }
          if (typeValue && normalize(card.dataset.type) !== typeValue) {
            matched = false;
          }
          if (categoryValue && normalize(card.dataset.category) !== categoryValue) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
        });
        if (count) {
          count.textContent = '匹配影片：' + getVisibleCards().length;
        }
      }

      [input, region, type, category].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
      if (sort) {
        sort.addEventListener('change', function () {
          applySort();
          applyFilter();
        });
      }
      applySort();
      applyFilter();
    });
  }

  function setupPlayer() {
    var video = $('[data-player]');
    var button = $('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var src = video.getAttribute('data-src');
    var attached = false;
    var instance = null;

    function attach() {
      if (attached || !src) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          maxBufferLength: 32,
          lowLatencyMode: true
        });
        instance.loadSource(src);
        instance.attachMedia(video);
        return;
      }
      video.src = src;
    }

    function start() {
      attach();
      button.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (instance) {
        instance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
