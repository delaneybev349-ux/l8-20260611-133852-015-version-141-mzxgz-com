(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-nav-toggle]');
        var mobilePanel = document.querySelector('[data-mobile-panel]');

        if (toggle && mobilePanel) {
            toggle.addEventListener('click', function () {
                mobilePanel.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
                image.setAttribute('aria-hidden', 'true');
            });
        });

        document.querySelectorAll('[data-global-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[type="search"]');
                var query = input ? input.value.trim() : '';
                var target = './search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });

        document.querySelectorAll('[data-local-filter]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('[data-movie-filter]');
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = './search.html?q=' + encodeURIComponent(query);
                }
            });
        });

        var filterInput = document.querySelector('[data-movie-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var emptyState = document.querySelector('[data-empty-state]');

        function applyFilter() {
            if (!filterInput || !cards.length) {
                return;
            }
            var query = filterInput.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-text') || card.textContent || '').toLowerCase();
                var matched = !query || text.indexOf(query) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        if (filterInput) {
            var params = new URLSearchParams(window.location.search);
            var keyword = params.get('q');
            if (keyword) {
                filterInput.value = keyword;
            }
            filterInput.addEventListener('input', applyFilter);
            applyFilter();
        }

        var slider = document.querySelector('[data-hero-slider]');
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
            var previous = slider.querySelector('[data-hero-prev]');
            var next = slider.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }

            function startTimer() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                    startTimer();
                });
            });

            if (previous) {
                previous.addEventListener('click', function () {
                    showSlide(current - 1);
                    startTimer();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    showSlide(current + 1);
                    startTimer();
                });
            }

            showSlide(0);
            startTimer();
        }

        var backTop = document.querySelector('[data-back-top]');
        if (backTop) {
            window.addEventListener('scroll', function () {
                backTop.classList.toggle('is-visible', window.scrollY > 680);
            }, { passive: true });
            backTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    });
}());
