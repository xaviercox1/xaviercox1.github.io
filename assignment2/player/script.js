// We create an object array containing the videos
const videoList = [
    { name: "Zenscape", link: "zenscape.mp4" },
    { name: "Stardust", link: "stardust.mp4" },
  ];
  
  const playPauseButton = document.querySelector("#play-pause-btn");
  playPauseButton.addEventListener("click", togglePlay);
  const playPauseImg = document.querySelector("#play-pause-img");
  const myVideo = document.querySelector("#my-video");
  const videoName = document.querySelector("#video-name");
  const videoTime = document.querySelector("#video-time");
  const progressBar = document.querySelector("#progress-bar-fill");
  // myVideo.removeAttribute("controls");
  myVideo.addEventListener("timeupdate", updateProgressBar);
  myVideo.addEventListener("volumechange", updateVolume);
  const firstVideoButton = document.querySelector("#first-video-btn");
  firstVideoButton.addEventListener("click", function playIt() {
    myVideo.pause();
    playVideo(0);
  });
  
  function updateVolume() {
    const volume = myVideo.volume;
    console.log("Volume changed:", volume);
  }
  
  const secondVideoButton = document.querySelector("#second-video-btn");
  secondVideoButton.addEventListener("click", function playIt() {
    myVideo.pause();
    playVideo(1);
  });
  
  function togglePlay() {
    if (myVideo.paused || myVideo.ended) {
      myVideo.play();
      playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/pause--v1.png";
    } else {
      myVideo.pause();
      playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/play--v1.png";
    }
  }
  
  function playVideo(no) {
    myVideo.src = videoList[no].link;
    videoName.textContent = videoList[no].name;
    // myVideo.load();
    // myVideo.play();
  }
  
  function updateProgressBar() {
    videoTime.textContent = myVideo.currentTime.toFixed(2);
    const value = (myVideo.currentTime / myVideo.duration) * 100;
    progressBar.style.width = value + "%";
  }
  
  // Function to toggle fullscreen mode
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      // If no element is in fullscreen, request fullscreen on the video player
      myVideo.requestFullscreen();
    } else {
      // Otherwise, exit fullscreen
      document.exitFullscreen();
    }
  }
  
  // Event listener for double-click on the video to toggle fullscreen
  myVideo.addEventListener("dblclick", toggleFullscreen);
  
  // Event listener for fullscreen change event to update UI
  document.addEventListener("fullscreenchange", function () {
    if (document.fullscreenElement === myVideo) {
      console.log("Entered fullscreen");
    } else {
      console.log("Exited fullscreen");
    }
  });