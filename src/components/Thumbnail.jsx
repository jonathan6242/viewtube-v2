import { formatDistanceToNowStrict } from "date-fns";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom"
import ModalContext from "../context/ModalContext";

function Thumbnail({ recommended, video, noProfile }) {
  const navigate = useNavigate();
  const { setSidebarOpen } = useContext(ModalContext)

  const navigateToVideo = (e) => {
    navigate(`/video/${video.id}`)
    setSidebarOpen(false)
  }

  const navigateToProfile = (e) => {
    e.stopPropagation();
    navigate(`/channel/${video?.uid}`)
    setSidebarOpen(false)
  }

  // Recommended video thumbnail
  if(recommended) {
    return (
      <div 
        className="flex flex-col md:flex-row md:space-x-2 cursor-pointer group"
        onClick={navigateToVideo}
      >
        <div 
          className="aspect-[16/9] bg-cover bg-center bg-no-repeat md:w-44 flex-shrink-0"
          style={{
            backgroundImage: `url(${video?.thumbnail})`
          }}
        ></div>
        {/* Details - above 768px */}
        <div className="hidden md:flex flex-col">
          {/* Title */}
          <div className="font-semibold line-clamp-2 mb-2 text-sm">
            {video?.title}
          </div>
          {/* Author */}
          <div className="text-xs text-secondary mb-[1px]">
            {video?.displayName}
          </div>
          <div className="text-xs text-secondary">
            {video?.views} views · {video?.dateCreated && formatDistanceToNowStrict(video?.dateCreated)} ago
          </div>
        </div>
        {/* Details - below 768px */}
        <div className="flex items-start space-x-3 p-3 pb-6 bg-white dark:bg-black
        xs:px-1 md:px-0 md:hidden">
          {/* Profile Picture */}
          <div 
            className="block w-10 h-10 md:w-9 md:h-9 rounded-full flex-shrink-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${video?.photoURL})`
            }}
            onClick={navigateToProfile}
          ></div>
          {/* Details */}
          <div className="flex flex-col">
            {/* Title */}
            <div className="font-semibold line-clamp-2 mb-1">
              {video?.title}
            </div>
            {/* Author */}
            <div 
              className="text-sm text-secondary"
            >
              {video?.displayName} · {video?.views} views
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="flex flex-col cursor-pointer group"
      onClick={navigateToVideo}
    >
       <div 
        className="aspect-[16/9] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${video?.thumbnail})`
        }}
       ></div>
       <div className="flex items-start space-x-3 p-3 pb-6 bg-white dark:bg-black
       xs:px-1 md:px-0">
          {/* Profile Picture */}
          {
            !noProfile && (
              <div 
                className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-center bg-cover bg-no-repeat flex-shrink-0"
                style={{
                  backgroundImage: `url(${video?.photoURL})`
                }}
                onClick={navigateToProfile}
              ></div>
            )
          }
          {/* Details */}
          <div className="flex flex-col">
            {/* Title */}
            <div className="font-semibold line-clamp-2 mb-1">
              {video?.title}
            </div>
            {/* Author */}
            <div 
              className="text-sm text-secondary"
              onClick={navigateToProfile}
            >
              {video?.displayName}
            </div>
            <div className="text-sm text-secondary">
              {video?.views} views · {video?.dateCreated && formatDistanceToNowStrict(video?.dateCreated)} ago
            </div>
          </div>
       </div>
    </div>
  )
}
export default Thumbnail