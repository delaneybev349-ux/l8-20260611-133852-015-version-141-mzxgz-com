(function () {
  function attach(video, url) {
    if (!video || !url) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = url;
      }
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video.__hlsInstance) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video.__hlsInstance = hls;
      }
      return;
    }
    if (!video.src) {
      video.src = url;
    }
  }

  function start(frame) {
    var video = frame.querySelector("video");
    var overlay = frame.querySelector("[data-play-button]");
    var url = frame.getAttribute("data-video");
    attach(video, url);
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video) {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var frames = Array.prototype.slice.call(document.querySelectorAll(".player-frame"));
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var overlay = frame.querySelector("[data-play-button]");
      var url = frame.getAttribute("data-video");
      attach(video, url);
      if (video && url) {
        video.addEventListener("play", function () {
          attach(video, url);
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
      }
      if (overlay) {
        overlay.addEventListener("click", function () {
          start(frame);
        });
      }
      frame.addEventListener("click", function (event) {
        if (event.target === frame) {
          start(frame);
        }
      });
    });
  });
})();
