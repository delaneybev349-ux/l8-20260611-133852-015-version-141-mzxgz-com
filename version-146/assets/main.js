(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var searchForms = document.querySelectorAll("[data-site-search]");
    searchForms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    var filterInput = document.querySelector("[data-filter]");
    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (query && filterInput.hasAttribute("data-query-fill")) {
        filterInput.value = query;
      }
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));
      var applyFilter = function () {
        var value = filterInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.hidden = Boolean(value && text.indexOf(value) === -1);
        });
      };
      filterInput.addEventListener("input", applyFilter);
      applyFilter();
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      };
      var next = function () {
        show(current + 1);
      };
      var previous = function () {
        show(current - 1);
      };
      var nextButton = hero.querySelector("[data-hero-next]");
      var prevButton = hero.querySelector("[data-hero-prev]");
      if (nextButton) {
        nextButton.addEventListener("click", next);
      }
      if (prevButton) {
        prevButton.addEventListener("click", previous);
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });
      window.setInterval(next, 5200);
      show(0);
    }
  });
})();
