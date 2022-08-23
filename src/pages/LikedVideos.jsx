import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import Thumbnail from "../components/Thumbnail";
import ThumbnailSkeleton from "../components/ThumbnailSkeleton";
import { db } from "../firebase";
import useAuthUser from "../hooks/useAuthUser";
import { signin } from "../services";
import UndrawLiked from "../assets/undrawliked.svg"

function LikedVideos() {
  const { user, loading } = useAuthUser();
  const [videos, setVideos] = useState(null);

  useEffect(() => {
    if(!loading) {
      if(user) {
        return onSnapshot(
          query(
            collection(db, "videos"),
            where('likes', 'array-contains', user?.uid)
          ),
          (snapshot) => {
            setVideos(snapshot.docs
              .map(doc => ({...doc.data(), id: doc.id}))
              .sort((a, b) => b.dateCreated - a.dateCreated)
            );
          }
        )
      } else {
        setVideos([])
      }
    } else {
      setVideos(null)
    }
  }, [user, loading])

  return (
    <div className="flex-1 overflow-y-scroll py-6 sm:px-6 main-container">
      {
        user && !loading && (
          <>
            <div className="font-semibold text-lg mb-6 px-4 sm:px-0">
              Liked videos
            </div>
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
          </>
        )
      }
      {
        !user && !loading && (
          <div className="p-4 pb-6 flex flex-col items-center space-y-12">
            <img 
              className="w-48"
              src={UndrawLiked}
              alt=""
            />
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="font-semibold text-lg">Enjoy your favourite videos</div>
              <div className="text-gray-400 max-w-md">
                Sign in to access videos you've liked.
              </div>
              <button 
                className="flex items-center p-[6px] px-4 border bg-blue-400 border-blue-400 space-x-1 font-medium rounded text-white"
                onClick={signin}
              >
                <span className="material-symbols-outlined person">
                  person
                </span>
                <span className="uppercase">
                  Sign in
                </span>
              </button>
            </div>
          </div>
        )
      }
    </div>
  )
}
export default LikedVideos