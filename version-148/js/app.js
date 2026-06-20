(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters(scope) {
        var input = scope.querySelector("[data-search-input]");
        var yearSelect = scope.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var empty = scope.querySelector("[data-empty-result]");
        var keyword = normalize(input ? input.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var shown = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var cardYear = card.getAttribute("data-year") || "";
            var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchYear = !year || cardYear === year;
            var visible = matchKeyword && matchYear;
            card.classList.toggle("is-hidden", !visible);
            if (visible) {
                shown += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", shown === 0);
        }
    }

    function bindFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        var globalInputs = Array.prototype.slice.call(document.querySelectorAll(".quick-search [data-search-input]"));

        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var yearSelect = scope.querySelector("[data-year-filter]");
            if (input) {
                input.addEventListener("input", function () {
                    applyFilters(scope);
                });
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", function () {
                    applyFilters(scope);
                });
            }
        });

        globalInputs.forEach(function (input) {
            input.addEventListener("input", function () {
                var keyword = normalize(input.value);
                document.querySelectorAll(".movie-card").forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
                });
            });
        });
    }

    function bindMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function bindHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    window.setupPlayer = function (videoId, sourceUrl) {
        var video = document.getElementById(videoId);
        var layer = document.querySelector('[data-player-layer="' + videoId + '"]');
        var hlsInstance = null;
        var started = false;

        if (!video || !sourceUrl) {
            return;
        }

        function play() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function start() {
            if (!started) {
                started = true;
                video.setAttribute("controls", "controls");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
            }
            if (layer) {
                layer.classList.add("is-hidden");
            }
            play();
        }

        if (layer) {
            layer.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    onReady(function () {
        bindMenu();
        bindHero();
        bindFilters();
    });
}());
