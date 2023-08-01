import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import Thumbnail from "../components/Thumbnail";
import ThumbnailSkeleton from "../components/ThumbnailSkeleton";
import { db } from "../firebase";
import useAuthUser from "../hooks/useAuthUser";
import useFirestoreUser from "../hooks/useFirestoreUser"
import { signin } from "../services";
import UndrawSubscriptions from "../assets/undrawsubscriptions.svg"

function Subscriptions() {
  const { firestoreUser, loading: firestoreLoading } = useFirestoreUser();
  const { user, loading: authLoading } = useAuthUser();
  const [videos, setVideos] = useState(null);
  const loading = firestoreLoading || authLoading;

  useEffect(() => {
    if(!loading) {
      if(firestoreUser) {
        if(firestoreUser?.subscriptions?.length > 0) {
          return onSnapshot(
            query(
              collection(db, "videos"),
              where('uid', 'in', firestoreUser?.subscriptions)
            ),
            (snapshot) => {
              setVideos(snapshot.docs
                .map(doc => ({...doc.data(), id: doc.id}))
                .sort((a, b) => b.dateCreated - a.dateCreated)
              );
              console.log(snapshot.docs
                .map(doc => ({...doc.data(), id: doc.id}))
                .sort((a, b) => b.dateCreated - a.dateCreated))
            }
          )
        } else {
          setVideos([]);
        }
      } else {
        setVideos([]);
      }
    } else {
      setVideos(null);
    }
  }, [loading, firestoreUser])

  return (
    <div className="flex-1 overflow-y-scroll scrollbar-hide py-6 sm:px-6 main-container">
      {
        user && !loading && (
          <>
            <div className="font-semibold text-lg mb-6 px-4 sm:px-0">Subscriptions</div>
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
              src={UndrawSubscriptions}
              alt=""
            />
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="font-semibold text-lg">Don't miss new videos</div>
              <div className="text-gray-400 max-w-md">
                Sign in to see updates from your favourite ViewTube channels.
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
export default Subscriptions