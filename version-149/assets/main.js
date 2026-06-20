(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function findBasePath() {
        var marker = document.documentElement.getAttribute('data-base') || './';
        return marker;
    }

    function goSearch(form) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var base = findBasePath();
        var target = base + 'search.html';
        if (value) {
            target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
    }

    function initHeader() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                var open = menu.classList.toggle('open');
                document.body.classList.toggle('menu-open', open);
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }
        document.querySelectorAll('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                goSearch(form);
            });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero-slider]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
                dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
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
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initImages() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
            }, { once: true });
        });
    }

    function initFilters() {
        var grid = document.querySelector('[data-filter-grid]');
        var panel = document.querySelector('[data-filter-panel]');
        if (!grid || !panel) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        var keyword = panel.querySelector('[data-filter-keyword]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var region = panel.querySelector('[data-filter-region]');
        function getValue(input) {
            return input ? input.value.trim().toLowerCase() : '';
        }
        function apply() {
            var q = getValue(keyword);
            var t = getValue(type);
            var y = getValue(year);
            var r = getValue(region);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (t && (card.getAttribute('data-type') || '').toLowerCase() !== t) {
                    ok = false;
                }
                if (y && (card.getAttribute('data-year') || '').toLowerCase() !== y) {
                    ok = false;
                }
                if (r && (card.getAttribute('data-region') || '').toLowerCase().indexOf(r) === -1) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            var empty = document.querySelector('[data-filter-empty]');
            if (empty) {
                empty.style.display = visible ? 'none' : '';
            }
        }
        [keyword, type, year, region].forEach(function (input) {
            if (input) {
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            }
        });
        apply();
    }

    function initPlayer() {
        var video = document.querySelector('[data-hls-video]');
        var button = document.querySelector('[data-play-video]');
        var cover = document.querySelector('[data-player-cover]');
        var status = document.querySelector('[data-player-status]');
        if (!video || !button) {
            return;
        }
        var source = video.getAttribute('data-video-src');
        var attached = false;
        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }
        function attachSource() {
            if (attached || !source) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('视频准备中');
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('视频已就绪');
                    video.play().catch(function () {
                        setStatus('点击播放');
                    });
                });
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setStatus('播放源暂时不可用');
                    }
                });
                window.__currentHls = hls;
                return;
            }
            video.src = source;
            setStatus('视频准备中');
        }
        button.addEventListener('click', function () {
            attachSource();
            if (cover) {
                cover.classList.add('hidden');
            }
            video.setAttribute('controls', 'controls');
            video.play().catch(function () {
                setStatus('点击播放');
            });
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('hidden');
            }
            setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
            setStatus('已暂停');
        });
    }

    function initSearchPage() {
        var form = document.querySelector('[data-search-page-form]');
        var input = document.querySelector('[data-search-page-input]');
        var results = document.querySelector('[data-search-results]');
        if (!form || !input || !results || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        function render() {
            var query = input.value.trim().toLowerCase();
            var source = window.MOVIE_SEARCH_INDEX;
            var matched = query ? source.filter(function (movie) {
                return movie.search.toLowerCase().indexOf(query) !== -1;
            }) : source.slice(0, 36);
            results.innerHTML = '';
            if (!matched.length) {
                var empty = document.createElement('div');
                empty.className = 'empty-state';
                empty.textContent = '没有找到相关影片';
                results.appendChild(empty);
                return;
            }
            matched.slice(0, 120).forEach(function (movie) {
                var link = document.createElement('a');
                link.className = 'search-result';
                link.href = 'detail/' + movie.file;
                link.innerHTML = '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '"><div><span class="badge">' + escapeHtml(movie.category) + '</span><h2 class="card-title">' + escapeHtml(movie.title) + '</h2><p class="card-desc">' + escapeHtml(movie.desc) + '</p></div>';
                results.appendChild(link);
            });
        }
        function escapeHtml(value) {
            return String(value).replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
            var url = new URL(window.location.href);
            if (input.value.trim()) {
                url.searchParams.set('q', input.value.trim());
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState(null, '', url.toString());
        });
        input.addEventListener('input', render);
        render();
    }

    ready(function () {
        initHeader();
        initHero();
        initImages();
        initFilters();
        initPlayer();
        initSearchPage();
    });
})();
