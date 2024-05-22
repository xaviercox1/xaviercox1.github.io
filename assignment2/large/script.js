document.addEventListener("DOMContentLoaded", function() {
    const video = document.querySelector("#custom-video-player");
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

    const elements = [
        { name: 'video', element: video },
        { name: 'playPauseBtn', element: playPauseBtn },
        { name: 'playPauseImg', element: playPauseImg },
        { name: 'progressBar', element: progressBar },
        { name: 'volumeLowBtn', element: volumeLowBtn },
        { name: 'volumeHighBtn', element: volumeHighBtn },
        { name: 'volumeBarFill', element: volumeBarFill },
        { name: 'replayBtn', element: replayBtn },
        { name: 'repeatBtn', element: repeatBtn },
        { name: 'skipStartBtn', element: skipStartBtn },
        { name: 'rewindBtn', element: rewindBtn },
        { name: 'fastForwardBtn', element: fastForwardBtn },
        { name: 'fullscreenBtn', element: fullscreenBtn }
    ];

    const missingElements = elements.filter(e => !e.element);

    if (missingElements.length > 0) {
        console.error("Missing elements from the DOM:", missingElements.map(e => e.name));
        return;
    }

    video.removeAttribute("controls");

    // Set initial volume to max
    video.volume = 1;
    volumeBarFill.style.width = '100%';

    // Play/Pause Button
    playPauseBtn.addEventListener("click", function() {
        if (video.paused || video.ended) {
            video.play();
            playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/pause--v1.png";
        } else {
            video.pause();
            playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/play--v1.png";
        }
    });

    // Update Progress Bar
    video.addEventListener("timeupdate", function() {
        const value = (video.currentTime / video.duration) * 100;
        progressBar.style.width = value + "%";
    });

    // Volume Low Button
    volumeLowBtn.addEventListener("click", function() {
        video.volume = Math.max(0, video.volume - 0.1);
        updateVolumeBar();
    });

    // Volume High Button
    volumeHighBtn.addEventListener("click", function() {
        video.volume = Math.min(1, video.volume + 0.1);
        updateVolumeBar();
    });

    // Update Volume Bar
    function updateVolumeBar() {
        const value = video.volume * 100;
        volumeBarFill.style.width = value + "%";
    }

    // Replay Button
    replayBtn.addEventListener("click", function() {
        video.currentTime = 0;
        video.play();
    });

    // Repeat Button
    repeatBtn.addEventListener("click", function() {
        video.loop = !video.loop;
        repeatBtn.style.backgroundColor = video.loop ? "gray" : "";
    });

    // Skip to Start Button
    skipStartBtn.addEventListener("click", function() {
        video.currentTime = 0;
    });

    // Rewind Button
    rewindBtn.addEventListener("click", function() {
        video.currentTime = Math.max(0, video.currentTime - 10);
    });

    // Fast Forward Button
    fastForwardBtn.addEventListener("click", function() {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
    });

    // Fullscreen Button
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
    });
});
