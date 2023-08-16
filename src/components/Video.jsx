import { useContext, useEffect, useRef, useState } from "react";
import VideoPageContext from "../context/VideoPageContext";

function Video({ src }) {
  const { videoRef: videoContainerRef } =
    useContext(VideoPageContext);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(2);
  const [volume, setVolume] = useState(1);
  const [progressPosition, setProgressPosition] = useState(0);
  const [previewPosition, setPreviewPosition] = useState(0);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoHeight, setVideoHeight] = useState(videoContainerRef?.current?.clientHeight);
  const [videoWidth, setVideoWidth] = useState(videoContainerRef?.current?.clientWidth);

  let scrubbing;
  let wasPaused;

  const videoRef = useRef();
  const mobileVideoRef = useRef();
  const volumeSliderRef = useRef();
  const speedBtnRef = useRef();
  const timelineContainerRef = useRef();

  // Handle all key inputs
  const handleKeyDown = (e) => {
    if (e.target.tagName.toLowerCase() === "input" && e.target.type === "text")
      return;
    const tagName = document.activeElement.tagName.toLowerCase();
    switch (e.key.toLowerCase()) {
      case " ":
        if (tagName === "button") return;
      case "k":
        togglePlay();
        break;
      case "f":
        toggleFullscreen();
        break;
      case "i":
        toggleMiniplayer();
        break;
      case "m":
        toggleMute();
        break;
      case "arrowleft":
      case "j":
        skip(-5);
        break;
      case "arrowright":
      case "l":
        skip(5);
        break;
    }
  };

  const togglePlay = (e) => {
    if (
      e &&
      (document
        .querySelector(".video-controls-container")
        .contains(e?.target) ||
        e?.target.classList.contains("video-controls-container"))
    )
      return;
    const paused = videoRef.current?.paused;
    paused ? videoRef.current?.play() : videoRef.current?.pause();
    paused ? setPlaying(true) : setPlaying(false);
  };

  const toggleFullscreen = () => {
    // if(document.fullscreenElement === null || window.innerWidth < 768) {
    //   videoContainerRef?.current?.requestFullscreen();
    //   setFullscreen(true);
    // } else {
    //   document.exitFullscreen();
    //   setFullscreen(false);
    // }
    const videoContainer = videoRef?.current;
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen =
      videoContainer.requestFullscreen ||
      videoContainer.mozRequestFullScreen ||
      videoContainer.webkitRequestFullScreen ||
      videoContainer.msRequestFullscreen;
    var cancelFullScreen =
      document.exitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen;

    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      requestFullScreen.call(videoContainer);
    } else {
      cancelFullScreen.call(document);
    }
  };

  const toggleMiniplayer = async () => {
    try {
      await document.exitPictureInPicture();
    } catch (error) {
      videoRef?.current?.requestPictureInPicture();
    }
  };

  const toggleMute = () => {
    const video = videoRef?.current;
    video.muted = !video.muted;
  };

  const changePlaybackRate = () => {
    const video = videoRef?.current;
    let newPlaybackRate = video.playbackRate + 0.25;
    if (newPlaybackRate > 2) {
      newPlaybackRate = 0.25;
    }
    video.playbackRate = newPlaybackRate;
    speedBtnRef.current.textContent = `${newPlaybackRate}x`;
  };

  const skip = (seconds) => {
    const video = videoRef?.current;
    video.currentTime += seconds;
  };

  const formatTime = (time) => {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    const secondsString = seconds.toString().padStart(2, "0");
    const minutesString = minutes.toString().padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${minutesString}:${secondsString}`;
    }
    return `${minutes}:${secondsString}`;
  };

  const handleTimelineUpdate = (e) => {
    let x;
    if (e.type === "touchstart" || e.type === "touchmove") {
      x = e.targetTouches[0]?.clientX;
    } else if (e.type === "touchend") {
      x = e.changedTouches[0]?.clientX;
    } else {
      x = e.x;
    }
    const rect = timelineContainerRef?.current?.getBoundingClientRect();
    const percent = Math.min(Math.max(0, x - rect.x), rect.width) / rect.width;
    setPreviewPosition(percent);

    if (scrubbing) {
      if (e?.cancellable) e.preventDefault();
      setProgressPosition(percent);
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const toggleScrubbing = (e) => {
    const touchEvents = ["touchstart", "touchend"];
    let x;
    if (e.type === "touchstart") {
      x = e.targetTouches[0]?.clientX;
    } else if (e.type === "touchend") {
      x = e.changedTouches[0]?.clientX;
    } else {
      x = e.x;
    }
    const video = videoRef?.current;
    const rect = timelineContainerRef?.current?.getBoundingClientRect();
    let percent = Math.min(Math.max(0, x - rect.x), rect.width) / rect.width;
    if (touchEvents.includes(e.type)) {
      scrubbing = e.touches.length > 0;
    } else {
      scrubbing = (e.buttons & 1) === 1;
    }

    if (scrubbing) {
      wasPaused = video.paused;
      video.pause();
      document.body.classList.add("scrubbing");
    } else {
      video.currentTime = percent * video.duration;
      if (!wasPaused) video.play();
      document.body.classList.remove("scrubbing");
    }

    handleTimelineUpdate(e);
  };

  window.mobileCheck = function () {
    let check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  };

  // Hide controls on blur (mobile)
  const hideControlsOnBlur = (e) => {
    if (!videoContainerRef?.current?.contains(e.target)) {
      setControlsOpen(false);
    }
  };

  const changeVideoSize = (e) => {
    setVideoHeight(videoContainerRef?.current?.clientHeight)
    setVideoWidth(videoContainerRef?.current?.clientWidth)
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchstart", hideControlsOnBlur);
    window.addEventListener("resize", changeVideoSize)

    // Toggle scrubbing
    timelineContainerRef?.current?.addEventListener(
      "mousedown",
      toggleScrubbing
    );
    timelineContainerRef?.current?.addEventListener(
      "touchstart",
      toggleScrubbing
    );

    // Handle timeline update
    timelineContainerRef?.current?.addEventListener(
      "mousemove",
      handleTimelineUpdate
    );
    timelineContainerRef?.current?.addEventListener(
      "touchmove",
      handleTimelineUpdate
    );

    // Toggle scrubbing if scrubbing
    const toggleScrubbingIfScrubbing = (e) => {
      if (scrubbing) toggleScrubbing(e);
    };
    document.addEventListener("mouseup", toggleScrubbingIfScrubbing);
    document.addEventListener("touchend", toggleScrubbingIfScrubbing);

    // Handle timeline update if scrubbing
    const handleTimelineUpdateIfScrubbing = (e) => {
      if (scrubbing) handleTimelineUpdate(e);
    };
    document.addEventListener("mousemove", handleTimelineUpdateIfScrubbing);
    document.addEventListener("touchmove", handleTimelineUpdateIfScrubbing);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", hideControlsOnBlur);

      timelineContainerRef?.current?.removeEventListener(
        "mousedown",
        toggleScrubbing
      );
      timelineContainerRef?.current?.removeEventListener(
        "touchstart",
        toggleScrubbing
      );

      timelineContainerRef?.current?.removeEventListener(
        "mousemove",
        handleTimelineUpdate
      );
      timelineContainerRef?.current?.removeEventListener(
        "touchmove",
        handleTimelineUpdate
      );

      document.removeEventListener("mouseup", toggleScrubbingIfScrubbing);
      document.removeEventListener("touchend", toggleScrubbingIfScrubbing);

      document.removeEventListener(
        "mousemove",
        handleTimelineUpdateIfScrubbing
      );
      document.removeEventListener(
        "touchmove",
        handleTimelineUpdateIfScrubbing
      );
      window.removeEventListener("resize", changeVideoSize)
    };
  }, []);

  if (window.mobileCheck()) {
    return (
      <div
        className={`relative pb-[56.25%] ${
          loading
            ? "animated-bg"
            : "video-container flex bg-cover bg-center bg-no-repeat bg-black group max-w-[100vw]"
        }`}
        style={{
          height: `${(9 / 16) * videoWidth}px`
        }}
        ref={videoContainerRef}
        draggable={false}
      >
        <video
          className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-full h-full max-w-[100vw]"
          src={src}
          controls
          style={{
            height: `${(9 / 16) * videoWidth}px`,
            width: `${videoWidth}px`
          }}
          preload="metadata"
          onLoadedMetadata={() => {
            setLoading(false);
          }}
          draggable={false}
        ></video>
      </div>
    );
  }

  return (
    <>
      <div
        className={`relative pb-[56.25%] ${
          loading
            ? "animated-bg"
            : "video-container flex bg-cover bg-center bg-no-repeat bg-black group "
        }`}
        ref={videoContainerRef}
        draggable={false}
        onClick={(e) => {
          if (window.innerWidth > 767) togglePlay(e);
          if (window.innerWidth < 768) setControlsOpen(!controlsOpen);
        }}
      >
        <div
          className={`absolute bottom-0 top-0 md:top-auto inset-x-0 md:aspect-[6/1] 
        bg-[#00000040] md:bg-transparent z-10
        md:bg-gradient-to-t md:from-[#000000f0] md:to-transparent
        ${controlsOpen ? "opacity-100" : "opacity-0 md:opacity-100"}
        ${playing ? "md:opacity-0" : "md:opacity-100"} pointer-events-none
        md:group-hover:opacity-100 md:group-focus-within:opacity-100 duration-300 ease
        ${loading ? "invisible" : "visible"}`}
          draggable={false}
        ></div>
        <div className="blur-container absolute inset-0 z-10 backdrop-blur-[2px]"></div>
        <button
          className={`z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          h-16 w-16 rounded-full bg-[#00000040] text-white flex justify-center items-center md:hidden
          ${controlsOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"}
          ${
            loading ? "invisible" : "visible"
          } duration-200 ease mobile-play-pause`}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay(e);
          }}
        >
          <span
            className={`material-symbols-outlined text-5xl
            ${playing ? "hidden" : "block"}`}
          >
            play_arrow
          </span>
          <span
            className={`material-symbols-outlined text-5xl
            ${playing ? "block" : "hidden"}`}
            id="mobile-pause"
          >
            pause
          </span>
        </button>
        <div
          className={`video-controls-container absolute inset-x-0 bottom-[-1px]
        md:mx-2 z-40 ${
          playing ? "opacity-0" : "md:opacity-100"
        } group-hover:opacity-100 group-focus-within:opacity-100
        flex flex-col-reverse md:flex-col
        ${loading ? "invisible" : "visible"}`}
          draggable={false}
        >
          {/* Timeline */}
          <div
            className="timeline-container h-2 flex items-center cursor-pointer
            touch-none"
            ref={timelineContainerRef}
          >
            <div className="timeline h-2 md:h-[6px] w-full relative bg-[rgba(238,238,238,0.25)]">
              <div
                className="absolute h-full left-0 bg-[rgba(238,238,238,0.5)]
                hidden timeline-preview"
                style={{
                  width: `${previewPosition * 100}%`,
                }}
              ></div>
              <div
                className="absolute h-full left-0 bg-red-500 timeline-progress"
                style={{
                  width: `${progressPosition * 100}%`,
                }}
              ></div>

              <div
                className={`absolute top-1/2 left-0 w-5 h-5 md:w-4 md:h-4 rounded-full bg-red-500 timeline-thumb -translate-x-1/2 -translate-y-1/2`}
                style={{
                  marginLeft: `${progressPosition * 100}%`,
                }}
              ></div>
            </div>
          </div>
          {/* Controls */}
          <div
            className={`controls flex items-center space-x-0 md:space-x-3 px-4 py-2 md:p-2
          ${
            controlsOpen ? "opacity-100" : "opacity-0 md:opacity-100"
          } transition-opacity duration-200 ease`}
            draggable={false}
          >
            {/* Play / pause */}
            <button
              className="hidden md:flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              draggable={false}
            >
              <span
                className={`material-symbols-outlined text-4xl
                ${playing ? "hidden" : "block"}`}
                draggable={false}
              >
                play_arrow
              </span>
              <span
                className={`material-symbols-outlined text-4xl
                ${playing ? "block" : "hidden"}`}
                id="pause"
                draggable={false}
              >
                pause
              </span>
            </button>
            {/* Volume */}
            <div
              className="volume-container hidden md:flex items-center space-x-3"
              draggable={false}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  videoRef.current.muted = !videoRef.current.muted;
                }}
                draggable={false}
              >
                <span
                  className="material-symbols-outlined text-3xl flex items-center"
                  draggable={false}
                >
                  volume_
                  {volumeLevel === 2
                    ? "up"
                    : volumeLevel === 1
                    ? "down"
                    : "off"}
                </span>
              </button>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="any"
                value={volume}
                onChange={(e) => {
                  setVolume(e.target.value);
                  if (videoRef.current) {
                    videoRef.current.volume = e.target.value;
                    videoRef.current.muted = e.target.value === 0;
                  }
                }}
                style={{
                  background: `linear-gradient(to right, #fff ${
                    volume * 100
                  }%, rgba(255, 255, 255, 0.5) ${volume * 100}%)`,
                }}
                ref={volumeSliderRef}
                draggable={false}
              />
            </div>
            {/* Duration */}
            <div
              className="duration-container flex flex-1 items-center space-x-1 text-white text-lg"
              draggable={false}
            >
              <span className="tracking-wide" draggable={false}>
                {!isNaN(videoRef?.current?.currentTime)
                  ? formatTime(videoRef?.current?.currentTime)
                  : "0:00"}
              </span>
              <span className="text-base" draggable={false}>
                /
              </span>
              <span className="tracking-wide" draggable={false}>
                {!isNaN(videoRef?.current?.duration)
                  ? formatTime(videoRef?.current?.duration)
                  : "0:00"}
              </span>
            </div>
            {/* Speed */}
            <button
              className="text-white text-lg text-center tracking-widest w-16
              hidden md:flex md:justify-center"
              onClick={(e) => {
                e.stopPropagation();
                changePlaybackRate(e);
              }}
              ref={speedBtnRef}
              draggable={false}
            >
              1x
            </button>
            {/* Miniplayer */}
            <button
              className="items-center hidden md:flex"
              onClick={(e) => {
                e.stopPropagation();
                toggleMiniplayer(e);
              }}
              draggable={false}
            >
              <span
                className="material-symbols-outlined text-4xl"
                id="miniplayer"
                draggable={false}
              >
                branding_watermark
              </span>
            </button>
            {/* Fullscreen (Desktop) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="hidden md:block"
              draggable={false}
            >
              <span
                className={`material-symbols-outlined text-4xl
                ${fullscreen ? "hidden" : "block"}`}
                draggable={false}
              >
                fullscreen
              </span>
              <span
                className={`material-symbols-outlined text-4xl
                ${fullscreen ? "block" : "hidden"}`}
                draggable={false}
              >
                fullscreen_exit
              </span>
            </button>
            {/* Fullscreen (Mobile) */}
            {/* <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="md:hidden"
            >
              <span 
                className={`material-symbols-outlined text-4xl
                ${fullscreen ? 'hidden' : 'block'}`}
                draggable={false}
              >
                fullscreen
              </span>
              <span 
                className={`material-symbols-outlined text-4xl
                ${fullscreen ? 'block' : 'hidden'}`}
                draggable={false}
              >
                fullscreen_exit
              </span>
            </button> */}
          </div>
        </div>
        <video
          className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2`}
          style={{
            height: `${videoHeight}px`,
            width: `${videoWidth}px`
          }}
          src={src}
          ref={videoRef}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onVolumeChange={() => {
            const video = videoRef?.current;
            setVolume(video.volume);
            let volumeLevel;
            if (video.muted || video.volume === 0) {
              volumeLevel = 0;
              setVolume(0);
            } else if (video.volume >= 0.5) {
              volumeLevel = 2;
            } else {
              volumeLevel = 1;
            }
            setVolumeLevel(volumeLevel);
          }}
          onTimeUpdate={() => {
            const video = videoRef?.current;
            setProgressPosition(video.currentTime / video.duration);
          }}
          preload="metadata"
          onLoadedMetadata={() => {
            setLoading(false);
          }}
          draggable={false}
        ></video>
      </div>
    </>
  );
}
export default Video;
