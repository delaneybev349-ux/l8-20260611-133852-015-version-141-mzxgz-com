(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var toggle = player.querySelector('.player-toggle');
    var mute = player.querySelector('.player-mute');
    var progress = player.querySelector('.player-progress');
    var fullscreen = player.querySelector('.player-fullscreen');
    var hls = null;
    var loaded = false;

    if (!video) {
      return;
    }

    var loadStream = function () {
      var stream = video.getAttribute('data-stream');
      if (loaded || !stream) {
        return;
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    var playVideo = function () {
      loadStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };

    var pauseVideo = function () {
      video.pause();
    };

    var toggleVideo = function () {
      if (video.paused) {
        playVideo();
      } else {
        pauseVideo();
      }
    };

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (toggle) {
      toggle.addEventListener('click', toggleVideo);
    }

    video.addEventListener('click', toggleVideo);

    video.addEventListener('play', function () {
      if (toggle) {
        toggle.textContent = '暂停';
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (toggle) {
        toggle.textContent = '播放';
      }
    });

    video.addEventListener('timeupdate', function () {
      if (!progress || !video.duration) {
        return;
      }
      progress.style.width = Math.min(100, (video.currentTime / video.duration) * 100) + '%';
    });

    if (mute) {
      mute.addEventListener('click', function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullscreen) {
      fullscreen.addEventListener('click', function () {
        if (player.requestFullscreen) {
          player.requestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  });
})();
