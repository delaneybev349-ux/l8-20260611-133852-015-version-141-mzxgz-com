function initMoviePlayer(options) {
  var video = options.video;
  var trigger = options.trigger;
  var source = options.source;
  var hls = null;
  var ready = false;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (ready) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function playMovie() {
    attachSource();
    if (trigger) {
      trigger.hidden = true;
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (trigger) {
          trigger.hidden = false;
        }
      });
    }
  }

  if (trigger) {
    trigger.addEventListener('click', playMovie);
  }

  video.addEventListener('click', function () {
    if (!ready) {
      playMovie();
    }
  });

  video.addEventListener('play', function () {
    if (trigger) {
      trigger.hidden = true;
    }
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 && trigger) {
      trigger.hidden = false;
    }
  });

  video.addEventListener('ended', function () {
    if (trigger) {
      trigger.hidden = false;
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
