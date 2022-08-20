import { createContext, useRef, useState } from "react";

const VideoPageContext = createContext();

export const VideoPageProvider = ({ children }) => {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [videoHeight, setVideoHeight] = useState();
  // Keep track of the video height
  const videoRef = useRef();

  return <VideoPageContext.Provider value={{
    descriptionOpen, setDescriptionOpen,
    commentsOpen, setCommentsOpen,
    videoHeight, setVideoHeight,
    videoRef
  }}>
    { children }
  </VideoPageContext.Provider>
}

export default VideoPageContext