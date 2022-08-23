import { useContext, useEffect, useRef, useState } from "react"
import VideoPageContext from "../context/VideoPageContext"

function Video({ src }) {
  const { videoRef: videoContainerRef, setVideoHeight } = useContext(VideoPageContext);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(2);
  const [volume, setVolume] = useState(1);
  const [progressPosition, setProgressPosition] = useState(0);
  const [previewPosition, setPreviewPosition] = useState(0);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  let scrubbing;
  let wasPaused;

  const videoRef = useRef()
  const volumeSliderRef = useRef();
  const speedBtnRef = useRef();
  const timelineContainerRef = useRef();

  // Handle all key inputs
  const handleKeyDown = (e) => {
    if(e.target.tagName.toLowerCase() === "input" && e.target.type === "text") return;
    const tagName = document.activeElement.tagName.toLowerCase();
    switch(e.key.toLowerCase()) {
      case ' ':
        if (tagName === "button") return
      case 'k':
        togglePlay();
        break;
      case 'f':
        toggleFullscreen();
        break;
      case 'i':
        toggleMiniplayer();
        break;
      case 'm':
        toggleMute();
        break;
      case "arrowleft":
        case "j":
          skip(-5)
          break;
      case "arrowright":
        case "l":
          skip(5)
          break;
          
    }
  }

  const togglePlay = (e) => {
    if(e && (document.querySelector('.video-controls-container').contains(e?.target)
    || e?.target.classList.contains('video-controls-container'))) return;
    const paused = videoRef.current?.paused
    paused ? videoRef.current?.play() : videoRef.current?.pause();
    paused ? setPlaying(true) : setPlaying(false);
  }

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
  }

  const toggleMiniplayer = async () => {
    try {
      await document.exitPictureInPicture();
    } catch (error) {
      videoRef?.current?.requestPictureInPicture();
    }
      
  }

  const toggleMute = () => {
    const video = videoRef?.current;
    video.muted = !video.muted;
  }

  const changePlaybackRate = () => {
    const video = videoRef?.current;
    let newPlaybackRate = video.playbackRate + 0.25;
    if(newPlaybackRate > 2) {
      newPlaybackRate = 0.25
    }
    video.playbackRate = newPlaybackRate;
    speedBtnRef.current.textContent = `${newPlaybackRate}x`
  }

  const skip = (seconds) => {
    const video = videoRef?.current;
    video.currentTime += seconds;
  }

  const formatTime = (time) => {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    const secondsString = seconds.toString().padStart(2, '0');
    const minutesString = minutes.toString().padStart(2, '0');

    if(hours > 0) {
      return `${hours}:${minutesString}:${secondsString}`
    }
    return `${minutes}:${secondsString}`
  }

  const handleTimelineUpdate = (e) => {
    let x;
    if(e.type === 'touchstart' || e.type === 'touchmove') {
      x = e.targetTouches[0]?.clientX;
    } else if(e.type === 'touchend') {
      x = e.changedTouches[0]?.clientX;
    } else {
      x = e.x;
    }
    const rect = timelineContainerRef?.current?.getBoundingClientRect();
    const percent = Math.min(Math.max(0, x - rect.x), rect.width) / rect.width;
    setPreviewPosition(percent)

    if(scrubbing) {
      if(e?.cancellable) e.preventDefault();
      setProgressPosition(percent)
      videoRef.current.currentTime = percent * videoRef.current.duration
    }
  }

  const toggleScrubbing = (e) => {
    const touchEvents = ['touchstart', 'touchend']
    let x;
    if(e.type === 'touchstart') {
      x = e.targetTouches[0]?.clientX;
    } else if(e.type === 'touchend') {
      x = e.changedTouches[0]?.clientX;
    } else {
      x = e.x;
    }
    const video = videoRef?.current;
    const rect = timelineContainerRef?.current?.getBoundingClientRect();
    let percent = Math.min(Math.max(0, x - rect.x), rect.width) / rect.width;
    if(touchEvents.includes(e.type)) {
      scrubbing = e.touches.length > 0
    } else {
      scrubbing = (e.buttons & 1) === 1;
    }

    if(scrubbing) {
      wasPaused = video.paused;
      video.pause();
      document.body.classList.add('scrubbing')
    } else {
      video.currentTime = percent * video.duration;
      if(!wasPaused) video.play();
      document.body.classList.remove('scrubbing')
    }
    
    handleTimelineUpdate(e);
  }

  // Hide controls on blur (mobile)
  const hideControlsOnBlur = (e) => {
    if(!videoContainerRef?.current?.contains(e.target)) {
      setControlsOpen(false);
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('touchstart', hideControlsOnBlur)

    // Toggle scrubbing
    timelineContainerRef?.current?.addEventListener('mousedown', toggleScrubbing)
    timelineContainerRef?.current?.addEventListener('touchstart', toggleScrubbing)

    // Handle timeline update
    timelineContainerRef?.current?.addEventListener("mousemove", handleTimelineUpdate)
    timelineContainerRef?.current?.addEventListener("touchmove", handleTimelineUpdate)

    // Toggle scrubbing if scrubbing
    const toggleScrubbingIfScrubbing = (e) => {
      if(scrubbing) toggleScrubbing(e)
    }
    document.addEventListener("mouseup", toggleScrubbingIfScrubbing)
    document.addEventListener("touchend", toggleScrubbingIfScrubbing)

    // Handle timeline update if scrubbing
    const handleTimelineUpdateIfScrubbing = (e) => {
      if(scrubbing) handleTimelineUpdate(e)
    }
    document.addEventListener("mousemove", handleTimelineUpdateIfScrubbing)
    document.addEventListener("touchmove", handleTimelineUpdateIfScrubbing)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('touchstart', hideControlsOnBlur)

      timelineContainerRef?.current?.removeEventListener('mousedown', toggleScrubbing)
      timelineContainerRef?.current?.removeEventListener('touchstart', toggleScrubbing)

      timelineContainerRef?.current?.removeEventListener("mousemove", handleTimelineUpdate)
      timelineContainerRef?.current?.removeEventListener("touchmove", handleTimelineUpdate)

      document.removeEventListener("mouseup", toggleScrubbingIfScrubbing)
      document.removeEventListener("touchend", toggleScrubbingIfScrubbing)

      document.removeEventListener("mousemove", handleTimelineUpdateIfScrubbing)
      document.removeEventListener("touchmove", handleTimelineUpdateIfScrubbing)
    }
  }, [])

  return (
    <>
      <div
        className={`relative aspect-[16/9] ${loading ? 'animated-bg' 
        : 'video-container flex bg-cover bg-center bg-no-repeat bg-black group '}`}
        ref={videoContainerRef}
        draggable={false}
        onClick={(e) => {
          if(window.innerWidth > 767) togglePlay(e)
          if(window.innerWidth < 768) setControlsOpen(!controlsOpen)
        }}
      >
        <div className={`absolute bottom-0 top-0 md:top-auto inset-x-0 md:aspect-[6/1] 
        bg-[#00000040] md:bg-transparent z-10
        md:bg-gradient-to-t md:from-[#000000f0] md:to-transparent
        ${controlsOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'}
        ${playing ? 'md:opacity-0' : 'md:opacity-100'} pointer-events-none
        md:group-hover:opacity-100 md:group-focus-within:opacity-100 duration-300 ease
        ${loading ? 'invisible' : 'visible'}`}
        draggable={false}></div>
        <div className="blur-container absolute inset-0 z-10 backdrop-blur-[2px]"></div>
        <button 
          className={`z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          h-16 w-16 rounded-full bg-[#00000040] text-white flex justify-center items-center md:hidden
          ${controlsOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
          ${loading ? 'invisible' : 'visible'} duration-200 ease mobile-play-pause`}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay(e);
          }}
        >
          <span 
            className={`material-symbols-outlined text-5xl
            ${playing ? 'hidden' : 'block'}`}
          >
            play_arrow
          </span>
          <span 
            className={`material-symbols-outlined text-5xl
            ${playing ? 'block' : 'hidden'}`}
            id="mobile-pause"
          >
            pause
          </span>
        </button>
        <div className={`video-controls-container absolute inset-x-0 bottom-0
        md:mx-2 z-40 ${playing ? 'opacity-0' : 'md:opacity-100'} group-hover:opacity-100 group-focus-within:opacity-100
        flex flex-col-reverse md:flex-col
        ${loading ? 'invisible' : 'visible'}`}
        draggable={false}>
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
                  width: `${previewPosition * 100}%`
                }}
              ></div>
              <div 
                className="absolute h-full left-0 bg-red-500 timeline-progress"
                style={{
                  width: `${progressPosition * 100}%`
                }}
              ></div>
    
              <div 
                className={`absolute top-1/2 left-0 w-5 h-5 md:w-4 md:h-4 rounded-full bg-red-500 timeline-thumb -translate-x-1/2 -translate-y-1/2`}
                style={{
                  marginLeft: `${progressPosition * 100}%`
                }}
              >
              </div>
            </div>
          </div>
          {/* Controls */}
          <div className={`controls flex items-center space-x-0 md:space-x-3 px-4 py-2 md:p-2
          ${controlsOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'} transition-opacity duration-200 ease`}
          draggable={false}>
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
                ${playing ? 'hidden' : 'block'}`}
                draggable={false}
              >
                play_arrow
              </span>
              <span 
                className={`material-symbols-outlined text-4xl
                ${playing ? 'block' : 'hidden'}`}
                id="pause"
                draggable={false}
              >
                pause
              </span>
            </button>
            {/* Volume */}
            <div className="volume-container hidden md:flex items-center space-x-3"
            draggable={false}>
              <button onClick={(e) => {
                e.stopPropagation();
                videoRef.current.muted = !videoRef.current.muted
              }}
              draggable={false}>
                <span className="material-symbols-outlined text-3xl flex items-center"
                draggable={false}>
                  volume_{volumeLevel === 2 ? 'up' : volumeLevel === 1 ? 'down' : 'off'}
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
                  setVolume(e.target.value)
                  if(videoRef.current) {
                    videoRef.current.volume = e.target.value;
                    videoRef.current.muted = e.target.value === 0;
                  }
                }}
                style={{
                  background: `linear-gradient(to right, #fff ${volume * 100}%, rgba(255, 255, 255, 0.5) ${volume * 100}%)`
                }}
                ref={volumeSliderRef}
                draggable={false}
              />
            </div>
            {/* Duration */}
            <div className="duration-container flex flex-1 items-center space-x-1 text-white text-lg" draggable={false}>
              <span className="tracking-wide" draggable={false}>
                {!isNaN(videoRef?.current?.currentTime) ? formatTime(videoRef?.current?.currentTime) : '0:00'}
              </span>  
              <span className="text-base" draggable={false}>/</span>  
              <span className="tracking-wide" draggable={false}>
                {!isNaN(videoRef?.current?.duration) ? formatTime(videoRef?.current?.duration) : '0:00'}
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
              <span className="material-symbols-outlined text-4xl" id="miniplayer" 
              draggable={false}>
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
            </button>
            {/* Fullscreen (Mobile) */}
            <button 
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
            </button>
          </div>
        </div>          
        <video
          className={
            `${videoRef?.current?.offsetWidth / videoRef?.current?.offsetHeight > 16/9 ? 'object-cover' 
            : 'object-contain'
            } mx-auto`
          }
          src={src}
          ref={videoRef}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onVolumeChange={() => {
            const video = videoRef?.current
            setVolume(video.volume)
            let volumeLevel;
            if (video.muted || video.volume === 0) {
              volumeLevel = 0;
              setVolume(0)
            } else if (video.volume >= 0.5) {
              volumeLevel = 2
            } else {
              volumeLevel = 1
            }
            setVolumeLevel(volumeLevel)
          }}
          onTimeUpdate={() => {
            const video = videoRef?.current
            setProgressPosition(video.currentTime / video.duration)
          }}
          onLoadedData={() => {
            const video = videoRef?.current
            setLoading(false);

          }}
          draggable={false}
        ></video>
      </div>
    </>
  )
}
export default Video