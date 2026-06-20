(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (window.__hlsLoading) {
      return window.__hlsLoading;
    }
    window.__hlsLoading = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return window.__hlsLoading;
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initSearchJump() {
    document.querySelectorAll(".search-jump").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function initLocalFilter() {
    var grid = document.querySelector(".filterable-grid");
    if (!grid) {
      return;
    }
    var keyword = document.querySelector(".local-filter");
    var year = document.querySelector(".year-filter");
    var type = document.querySelector(".type-filter");
    var empty = document.querySelector(".empty-state");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      var t = type ? type.value : "";
      var shown = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var match = (!q || text.indexOf(q) !== -1) && (!y || card.getAttribute("data-year") === y) && (!t || card.getAttribute("data-type") === t);
        card.style.display = match ? "" : "none";
        if (match) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", shown === 0);
      }
    }
    [keyword, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
  }

  function movieCard(item) {
    var tags = (item.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"./" + escapeHtml(item.href) + "\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"poster-glow\"></span><span class=\"play-chip\">播放</span></a>" +
      "<div class=\"movie-card-body\"><div class=\"movie-card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
      "<h3><a href=\"./" + escapeHtml(item.href) + "\">" + escapeHtml(item.title) + "</a></h3><p>" + escapeHtml(item.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"}[char];
    });
  }

  function initSearchPage() {
    var results = document.querySelector(".search-results");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var form = document.querySelector(".search-page-form");
    var input = form ? form.querySelector("input[name='q']") : null;
    var title = document.querySelector(".search-title");
    var empty = document.querySelector(".search-empty");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }
    function render(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        return;
      }
      var matched = window.SEARCH_INDEX.filter(function (item) {
        return item.searchText.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(movieCard).join("");
      if (title) {
        title.textContent = "搜索结果";
      }
      if (empty) {
        empty.classList.toggle("show", matched.length === 0);
      }
    }
    if (initial) {
      render(initial);
    }
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : "";
        var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
        history.replaceState(null, "", url);
        render(value);
      });
    }
  }

  function initPlayers() {
    document.querySelectorAll(".video-player").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-overlay");
      var message = player.querySelector(".player-message");
      var src = player.getAttribute("data-src");
      var attached = false;
      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.classList.add("show");
        }
      }
      function attach() {
        if (attached || !video || !src) {
          return Promise.resolve();
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          return Promise.resolve();
        }
        return loadHls().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({enableWorker: true, lowLatencyMode: true});
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                showMessage("播放加载失败，请刷新后重试");
              }
            });
          } else {
            video.src = src;
          }
        }).catch(function () {
          video.src = src;
        });
      }
      function play() {
        attach().then(function () {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              showMessage("浏览器阻止自动播放，请再次点击播放按钮");
            });
          }
        });
      }
      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          player.classList.remove("is-playing");
        });
        video.addEventListener("error", function () {
          showMessage("当前播放源暂时无法加载");
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initSearchJump();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayers();
  });
})();
