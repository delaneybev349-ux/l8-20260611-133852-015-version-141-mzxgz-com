(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setStatus(panel, message) {
        var status = panel.querySelector('[data-player-status]');
        if (status) {
            status.textContent = message;
        }
    }

    function playVideo(video, panel) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                setStatus(panel, '浏览器拦截了自动播放，请再次点击播放按钮。');
            });
        }
    }

    function initializePlayer(panel) {
        var video = panel.querySelector('video');
        var source = panel.getAttribute('data-src');
        var poster = panel.getAttribute('data-poster');

        if (!video || !source) {
            setStatus(panel, '当前影片播放源暂不可用。');
            return;
        }

        if (poster) {
            video.setAttribute('poster', poster);
        }

        panel.classList.add('is-playing');
        setStatus(panel, '正在连接播放源，请稍候。');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setStatus(panel, '播放源已连接。');
            }, { once: true });
            playVideo(video, panel);
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (panel._hlsInstance) {
                panel._hlsInstance.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            panel._hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setStatus(panel, '播放源已连接。');
                playVideo(video, panel);
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus(panel, '播放连接失败，请刷新页面后重试。');
                }
            });
            return;
        }

        video.src = source;
        setStatus(panel, '当前浏览器需要 HLS 支持，请更换浏览器或刷新后重试。');
    }

    ready(function () {
        document.querySelectorAll('[data-player]').forEach(function (panel) {
            var button = panel.querySelector('[data-play-button]');
            if (button) {
                button.addEventListener('click', function () {
                    initializePlayer(panel);
                });
            }
        });
    });
}());
