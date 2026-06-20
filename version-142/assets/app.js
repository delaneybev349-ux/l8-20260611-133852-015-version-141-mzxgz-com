(function () {
  function setupMobileNav() {
    var button = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('.hero-carousel');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-slide') || '0'));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        activate(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('.movie-filter'));
    forms.forEach(function (form) {
      var targetSelector = form.getAttribute('data-target');
      var target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }
      var controls = Array.prototype.slice.call(form.querySelectorAll('[data-filter]'));
      var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
      var counter = form.querySelector('.filter-count');

      function valueFor(name) {
        var control = form.querySelector('[data-filter="' + name + '"]');
        return control ? control.value.trim().toLowerCase() : '';
      }

      function apply() {
        var q = valueFor('q');
        var year = valueFor('year');
        var region = valueFor('region');
        var type = valueFor('type');
        var visible = 0;

        cards.forEach(function (card) {
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
          var cardType = (card.getAttribute('data-type') || '').toLowerCase();
          var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
          var genre = (card.getAttribute('data-genre') || '').toLowerCase();
          var tags = (card.getAttribute('data-tags') || '').toLowerCase();
          var haystack = [title, cardRegion, cardType, cardYear, genre, tags].join(' ');
          var matched = true;

          if (q && haystack.indexOf(q) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
        }
      }

      controls.forEach(function (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();
