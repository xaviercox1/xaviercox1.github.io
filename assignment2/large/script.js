document.addEventListener("DOMContentLoaded", function() {
    // Grab all the elements we need for control
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
    const popSound = document.querySelector("#pop-sound");

    // Ensure all elements are available in the DOM
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

    // Check for missing elements
    const missingElements = elements.filter(e => !e.element);
    if (missingElements.length > 0) {
        console.error("Missing elements from the DOM:", missingElements.map(e => e.name));
        return;
    }

    // Remove default video controls for a custom look
    video.removeAttribute("controls");

    // Initialize volume to max and update the volume bar
    video.volume = 1;
    volumeBarFill.style.width = '100%';

    // Function to play pop sound on button click
    function playPopSound() {
        popSound.currentTime = 0;
        popSound.play();
    }

    // Play/Pause functionality with a pop sound effect for feedback
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

    // Update progress bar as video plays
    video.addEventListener("timeupdate", function() {
        const value = (video.currentTime / video.duration) * 100;
        progressBar.style.width = value + "%";
    });

    // Volume down functionality with visual feedback and pop sound
    volumeLowBtn.addEventListener("click", function() {
        video.volume = Math.max(0, video.volume - 0.1);
        updateVolumeBar();
        playPopSound();
    });

    // Volume up functionality with visual feedback and pop sound
    volumeHighBtn.addEventListener("click", function() {
        video.volume = Math.min(1, video.volume + 0.1);
        updateVolumeBar();
        playPopSound();
    });

    // Update the volume bar based on current volume
    function updateVolumeBar() {
        const value = video.volume * 100;
        volumeBarFill.style.width = value + "%";
    }

    // Replay button functionality to restart video from the beginning
    replayBtn.addEventListener("click", function() {
        video.currentTime = 0;
        video.play();
        playPopSound();
    });

    // Toggle repeat functionality with visual feedback
    repeatBtn.addEventListener("click", function() {
        video.loop = !video.loop;
        repeatBtn.style.backgroundColor = video.loop ? "gray" : "";
        playPopSound();
    });

    // Skip to start functionality to quickly jump to the beginning
    skipStartBtn.addEventListener("click", function() {
        video.currentTime = 0;
        playPopSound();
    });

    // Rewind functionality to go back 10 seconds
    rewindBtn.addEventListener("click", function() {
        video.currentTime = Math.max(0, video.currentTime - 10);
        playPopSound();
    });

    // Fast forward functionality to skip ahead 10 seconds
    fastForwardBtn.addEventListener("click", function() {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        playPopSound();
    });

    // Fullscreen toggle functionality for immersive viewing
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
});
