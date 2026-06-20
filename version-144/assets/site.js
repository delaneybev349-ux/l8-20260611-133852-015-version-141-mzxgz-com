(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function attachHls(video, src) {
        if (video.dataset.ready === "1") {
            return Promise.resolve();
        }
        video.dataset.ready = "1";
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hls = hls;
            return Promise.resolve();
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            return Promise.resolve();
        }
        video.src = src;
        return Promise.resolve();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            if (!video || !cover) {
                return;
            }
            var src = video.getAttribute("data-src");
            function start() {
                if (!src) {
                    return;
                }
                attachHls(video, src).then(function () {
                    cover.classList.add("is-hidden");
                    video.controls = true;
                    var attempt = video.play();
                    if (attempt && typeof attempt.catch === "function") {
                        attempt.catch(function () {
                            cover.classList.remove("is-hidden");
                        });
                    }
                });
            }
            cover.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initListingFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-listing-filter]"));
        forms.forEach(function (form) {
            var input = form.querySelector("[data-filter-keyword]");
            var year = form.querySelector("[data-filter-year]");
            var type = form.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type")
                    ].join(" "));
                    var yearOk = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    var typeOk = !selectedType || card.getAttribute("data-type").indexOf(selectedType) !== -1;
                    var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
                    card.style.display = yearOk && typeOk && keywordOk ? "block" : "none";
                });
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function initSearchPage() {
        var box = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        if (!box || !results || !window.movieSearchIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            box.value = initial;
        }

        function card(movie) {
            return [
                '<a class="movie-card" href="' + movie.url + '">',
                '<span class="poster-wrap">',
                '<img loading="lazy" src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, "&quot;") + '">',
                '<span class="poster-badge">' + movie.type + '</span>',
                '<span class="poster-year">' + movie.year + '</span>',
                '</span>',
                '<span class="movie-card-body">',
                '<strong class="movie-card-title">' + movie.title + '</strong>',
                '<span class="movie-card-meta">' + movie.region + ' · ' + movie.genre + '</span>',
                '<span class="movie-card-desc">' + movie.desc + '</span>',
                '</span>',
                '</a>'
            ].join("");
        }

        function render() {
            var q = normalize(box.value);
            if (!q) {
                results.innerHTML = '<div class="empty-state">输入影片名称、类型、地区或标签开始搜索。</div>';
                return;
            }
            var matches = window.movieSearchIndex.filter(function (movie) {
                return normalize(movie.title + " " + movie.region + " " + movie.genre + " " + movie.tags + " " + movie.type).indexOf(q) !== -1;
            }).slice(0, 120);
            if (!matches.length) {
                results.innerHTML = '<div class="empty-state">没有找到相关影片，换个关键词试试。</div>';
                return;
            }
            results.innerHTML = '<div class="movie-grid">' + matches.map(card).join("") + '</div>';
        }

        box.addEventListener("input", render);
        render();
    }

    ready(function () {
        initMenu();
        initHero();
        initPlayers();
        initListingFilters();
        initSearchPage();
    });
}());
