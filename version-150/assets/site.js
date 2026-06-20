(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
        toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = all("[data-hero-slide]", hero);
      var dots = all("[data-hero-dot]", hero);
      var prev = document.querySelector("[data-hero-prev]");
      var next = document.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
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
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      show(0);
      restart();
    }

    var searchForms = all("[data-search-form]");
    searchForms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    var filterInput = document.querySelector("[data-card-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = all("[data-movie-card]");

    if (filterInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (initialQuery) {
        filterInput.value = initialQuery;
      }

      function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
      }

      function applyFilter() {
        var keyword = normalize(filterInput.value);
        var year = yearFilter ? yearFilter.value : "";
        cards.forEach(function (card) {
          var searchable = normalize(card.getAttribute("data-search"));
          var cardYear = card.getAttribute("data-year") || "";
          var matchedKeyword = !keyword || searchable.indexOf(keyword) !== -1;
          var matchedYear = !year || cardYear.indexOf(year) !== -1;
          card.hidden = !(matchedKeyword && matchedYear);
        });
      }

      filterInput.addEventListener("input", applyFilter);
      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilter);
      }
      applyFilter();
    }
  });
}());
