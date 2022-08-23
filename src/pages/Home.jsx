import { collection, onSnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from "react"
import Thumbnail from "../components/Thumbnail"
import ThumbnailSkeleton from "../components/ThumbnailSkeleton";
import VideoContext from "../context/VideoContext"
import { db } from "../firebase";

function Home() {
  const [videos, setVideos] = useState(null);

  useEffect(
    () =>
      onSnapshot(
        collection(db, "videos"),
        (snapshot) => {
          setVideos(snapshot.docs
            .map(doc => ({...doc.data(), id: doc.id}))
            .sort((a, b) => b.dateCreated - a.dateCreated)
          );
        }
      ),
    [db]
  );

  return (
  <div className="flex-1 overflow-y-scroll py-6 sm:px-6 main-container">
    <div className="font-semibold text-lg mb-6 px-4 sm:px-0">Home</div>
    <div className="grid grid-cols-1 xs:grid-cols-2 3md:grid-cols-3 lg:grid-cols-4 gap-4 
    bg-white dark:bg-black">
      {
        videos ? videos.map(video => (
          <Thumbnail 
            key={video.id}
            video={video}
          />
        )) : (
          new Array(12).fill(0).map((_, index) => <ThumbnailSkeleton key={index} />)
        )
      }
      {/* Add space at bottom */}
      <div className="col-span-1 xs:col-span-2 3md:col-span-3 lg:col-span-4 
      h-16 md:h-8"></div>
    </div>
    
  </div>
  )
}
export default Home