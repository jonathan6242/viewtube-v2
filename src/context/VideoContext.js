import { createContext, useState } from "react";

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);

  return <VideoContext.Provider value={{
  }}>
    { children }
  </VideoContext.Provider>
}

export default VideoContext