import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from "react"
import { toast } from "react-toastify";
import Thumbnail from "../components/Thumbnail"
import ThumbnailSkeleton from "../components/ThumbnailSkeleton";
import VideoContext from "../context/VideoContext"
import { auth, db } from "../firebase";
import useAuthUser from "../hooks/useAuthUser";

function Home({ popupOpen, setPopupOpen }) {
  const [videos, setVideos] = useState(null);
  const { user, loading } = useAuthUser();

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
  <div className="flex-1 overflow-y-scroll scrollbar-hide py-6 sm:px-6 main-container">
    {
      !user && !loading && popupOpen && (
        <div className="bg-blue-400 mb-6 p-6 font-semibold flex flex-col md:flex-row space-y-1 md:space-y-0 justify-center relative md:rounded-lg text-white">
          <i 
            className="absolute top-2 right-4 fa-solid fa-times text-xl cursor-pointer"
            onClick={() => setPopupOpen(false)}
          ></i>
          <span className="font-normal text-center">Welcome to ViewTube.&nbsp;</span>
          <span 
            className="font-semibold hover:underline underline-offset-2 decoration-2 text-center cursor-pointer"
            onClick={async () => {
              setPopupOpen(false)
              await signInWithEmailAndPassword(auth, "test@test.com", "demoaccount")
              toast.success('Successfully signed in.', {theme: 'colored'})
            }}
          >
            Click here to sign in with a test account.
          </span>
        </div>
      )
    }
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