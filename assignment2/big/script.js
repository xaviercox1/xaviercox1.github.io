document.addEventListener("DOMContentLoaded", function() {
    const video = document.querySelector("#custom-video-player");
    const videoSource = document.querySelector("#video-source");
    const playPauseBtn = document.querySelector("#play-pause-btn");
    const playPauseImg = document.querySelector("#play-pause-img");
    const progressBar = document.querySelector("#progress-bar-fill");
    const volumeLowBtn = document.querySelector("#volume-low-btn");
    const volumeHighBtn = document.querySelector("#volume-high-btn");
    const volumeBarFill = document.querySelector(".volume-bar-fill");
    const replayBtn = document.querySelector("#replay-btn");
    const repeatBtn = document.querySelector("#repeat-btn");
    const skipStartBtn = document.querySelector("#skip-start-btn");
    const rewindBtn = document.querySelector("#rewind-btn");
    const fastForwardBtn = document.querySelector("#fast-forward-btn");
    const fullscreenBtn = document.querySelector("#fullscreen-btn");
    const downloadBtn = document.querySelector("#download-btn");
    const popSound = document.querySelector("#pop-sound");
    const youtubeUrlInput = document.querySelector("#youtube-url");
    const loadVideoBtn = document.querySelector("#load-video-btn");

    function playPopSound() {
        popSound.currentTime = 0;
        popSound.play();
    }

    function updateVolumeBar() {
        const value = video.volume * 100;
        volumeBarFill.style.width = value + "%";
    }

    playPauseBtn.addEventListener("click", function() {
        if (video.paused || video.ended) {
            video.play();
            playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/pause--v1.png";
        } else {
            video.pause();
            playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/play--v1.png";
        }
        playPopSound();
    });

    video.addEventListener("timeupdate", function() {
        const value = (video.currentTime / video.duration) * 100;
        progressBar.style.width = value + "%";
    });

    document.querySelector(".progress-bar").addEventListener("click", function(e) {
        const rect = this.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = offsetX / rect.width;
        video.currentTime = percentage * video.duration;
        progressBar.style.width = percentage * 100 + "%";
    });

    volumeLowBtn.addEventListener("click", function() {
        video.volume = Math.max(0, video.volume - 0.1);
        updateVolumeBar();
        playPopSound();
    });

    volumeHighBtn.addEventListener("click", function() {
        video.volume = Math.min(1, video.volume + 0.1);
        updateVolumeBar();
        playPopSound();
    });

    replayBtn.addEventListener("click", function() {
        video.currentTime = 0;
        video.play();
        playPopSound();
    });

    repeatBtn.addEventListener("click", function() {
        video.loop = !video.loop;
        repeatBtn.style.backgroundColor = video.loop ? "gray" : "";
        playPopSound();
    });

    skipStartBtn.addEventListener("click", function() {
        video.currentTime = 0;
        playPopSound();
    });

    rewindBtn.addEventListener("click", function() {
        video.currentTime = Math.max(0, video.currentTime - 10);
        playPopSound();
    });

    fastForwardBtn.addEventListener("click", function() {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        playPopSound();
    });

    fullscreenBtn.addEventListener("click", function() {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.mozRequestFullScreen) { // Firefox
            video.mozRequestFullScreen();
        } else if (video.webkitRequestFullscreen) { // Chrome, Safari and Opera
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) { // IE/Edge
            video.msRequestFullscreen();
        }
        playPopSound();
    });

    downloadBtn.addEventListener("click", function() {
        const link = document.createElement("a");
        link.href = video.currentSrc;
        link.download = "video.mp4";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    loadVideoBtn.addEventListener("click", function() {
        const youtubeUrl = youtubeUrlInput.value.trim();
        if (youtubeUrl) {
            const videoId = youtubeUrl.split("v=")[1].split("&")[0];
            const apiUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    video.src = embedUrl;
                    videoSource.src = embedUrl;
                    video.load();
                    video.play();
                })
                .catch(error => {
                    console.error("Error loading YouTube video:", error);
                });
        }
    });

    video.removeAttribute("controls");
    video.volume = 1;
    updateVolumeBar();
});
