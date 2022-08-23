import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react"
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Thumbnail from "../components/Thumbnail";
import ThumbnailSkeleton from "../components/ThumbnailSkeleton";
import { db } from "../firebase";
import useAuthUser from "../hooks/useAuthUser";

function ChannelPage() {
  const [channel, setChannel] = useState(null);
  const [channelVideos, setChannelVideos] = useState(null);
  const [subscribers, setSubscribers] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("NEWEST");
  const [channelLoading, setChannelLoading] = useState(true);

  const { user } = useAuthUser();
  const { uid } = useParams();
  const dropdownRef = useRef();

  const subscribedByUser = subscribers?.includes(user?.uid)

  useEffect(() => {
    async function getChannel() {
      setChannelLoading(true);

      const docSnap = await getDoc(doc(db, "users", uid));
      const channel = {...docSnap.data(), id: docSnap.id}
      setChannel(channel);
      setSubscribers(channel?.subscribers)

      setChannelLoading(false);
    }
    async function getChannelVideos() {
      setChannelVideos(null);

      const docSnap = await getDocs(
        query(
          collection(db, "videos"),
          where("uid", "==", uid)
        )
      )
      setChannelVideos(
        docSnap.docs
          .map(doc => ({...doc.data(), id: doc.id}))
          .sort((a, b) => b?.dateCreated - a?.dateCreated)
      )
    }
    getChannel();
    getChannelVideos();
  }, [uid])

  useEffect(() => {
    const hideDropdown = (e) => {
      if(
        !e.target.classList.contains('dropdown')
        && !dropdownRef?.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', hideDropdown)
    return () => {
      document.removeEventListener('click', hideDropdown)
    }
  }, [])

  const toggleSubscribe = async () => {
    if(!subscribers?.includes(user?.uid)) {
      toast.success('Subscription added', {theme: 'colored'});

      setSubscribers([...subscribers, user?.uid])

      // Add user's UID to channel's subscribers
      await updateDoc(doc(db, "users", channel?.uid), {
        subscribers: arrayUnion(user?.uid)
      })

      // Add channel's UID to user's subscriptions
      await updateDoc(doc(db, "users", user?.uid), {
        subscriptions: arrayUnion(channel?.uid)
      })

      // Notify author of new subscriber
      await updateDoc(doc(db, "users", uid), {
        notifications: arrayUnion({
          content: '',
          uid: user?.uid,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
          type: "subscription",
          to: `/channel/${user?.uid}`,
          dateCreated: Date.now()
        })
      })
    } else {
      toast.success('Subscription removed', {theme: 'colored'});

      setSubscribers(subscribers.filter(uid => uid !== user?.uid));

      // Remove user's UID from channel's subscribers
      await updateDoc(doc(db, "users", channel?.uid), {
        subscribers: arrayRemove(user?.uid)
      })

      // Remove channel's UID from user's subscriptions
      await updateDoc(doc(db, "users", user?.uid), {
        subscriptions: arrayRemove(channel?.uid)
      })
    }
  }

  return (
    <div className="flex-1 overflow-y-scroll main-container flex flex-col">
      {/* Top Header */}
      <div className="px-4 md:px-8 py-6 border-b">   
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center max-w-7xl mx-auto">
          {
            !channelLoading ? (
              <>
                <div className="flex items-center space-x-3 md:space-x-6">
                  {/* Profile Picture */}
                  <div 
                    className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${channel?.photoURL})`
                    }}
                  ></div>
                  {/* Name & Subscribers */}
                  <div className="flex flex-col">
                    <div className="font-semibold text-lg md:text-2xl">
                      {channel?.displayName}
                    </div>
                    <div className="text-secondary text-sm md:text-base">
                      {subscribers?.length} subscribers
                    </div>
                  </div>
                </div>
                {/* Subscribe / Unsubscribe Button */}
                {
                  channel?.uid !== user?.uid && (
                  <button 
                    className={`py-2 px-4 uppercase font-medium rounded text-sm self-start ml-[60px] md:ml-0 md:text-base
                    ${!subscribedByUser ? 'bg-red-500 text-white' : 'bg-gray-300 dark:bg-dark2 opacity-70'}`}
                    onClick={toggleSubscribe}
                  >
                    {!subscribedByUser ? 'Subscribe' : 'Unsubscribe'}
                  </button>
                  )
                }
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 md:space-x-6">
                  {/* Profile Picture */}
                  <div 
                    className="w-12 h-12 md:w-20 md:h-20 rounded-full animated-bg"
                  ></div>
                  {/* Name & Subscribers */}
                  <div className="flex flex-col">
                    <div className="font-semibold md:text-lg mb-1 animated-bg w-48">
                      &nbsp;
                    </div>
                    <div className="text-secondary text-xs md:text-sm w-32 animated-bg">
                      &nbsp;
                    </div>
                  </div>
                </div>
              </>
            )
          }
          

        </div>
      </div>
      <div className="flex-1 md:px-8">
        {/* Title and Select Menu */}
        <div className="flex items-center justify-between pt-6 px-4 md:px-0 max-w-7xl mx-auto">
          <div className="font-semibold text-lg">
            Uploads 
          </div>
          {/* Dropdown Menu */}
          <div 
            className="dropdown relative flex items-center h-6 cursor-pointer select-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            ref={dropdownRef}
          >
            <span className="material-symbols-outlined md-28 mr-2 hidden md:block">
              sort
            </span>
            <span className="uppercase font-semibold">Sort by</span>
            {
              dropdownOpen && (
                <div className="absolute top-10 right-0 overflow-hidden text-sm border rounded bg-white
                dark:bg-black">
                  <div
                    className={`flex items-center px-4 h-12 w-56 duration-100
                    ${sortBy === 'POPULAR' ? 'bg-gray-100 dark:bg-dark2' 
                    : 'hover:bg-gray-50 dark:hover:bg-dark1'}`}
                    onClick={() => setSortBy('POPULAR')}
                  >
                    Most popular
                  </div>
                  <div
                    className={`flex items-center px-4 h-12 w-56 duration-100
                    ${sortBy === 'OLDEST' ? 'bg-gray-100 dark:bg-dark2' 
                    : 'hover:bg-gray-50 dark:hover:bg-dark1'}`}
                    onClick={() => setSortBy('OLDEST')}
                  >
                    Date added (oldest)
                  </div>
                  <div 
                    className={`flex items-center px-4 h-12 w-56 duration-100
                    ${sortBy === 'NEWEST' ? 'bg-gray-100 dark:bg-dark2' 
                    : 'hover:bg-gray-50 dark:hover:bg-dark1'}`}
                    onClick={() => setSortBy('NEWEST')}
                  >
                    Date added (newest)
                  </div>
                </div>
              )
            }
            <span className={`material-symbols-outlined md-28 ml-2 md:hidden
            ${dropdownOpen ? 'rotate-180' : 'rotate-0'} duration-300`}>
              expand_more
            </span>
          </div>
        </div>
        {/* Uploads - above 768px */}
        <div className="hidden md:grid md:grid-cols-3 5md:grid-cols-4 xl:grid-cols-5 gap-2 py-6 max-w-7xl mx-auto">
          {
            channelVideos ? channelVideos
              .sort((a, b) => {
                if(sortBy === 'NEWEST') return b?.dateCreated - a?.dateCreated
                if(sortBy === 'OLDEST') return a?.dateCreated - b?.dateCreated
                if(sortBy === 'POPULAR') return b?.views - a?.views
              })
              .map(video => (
                <Thumbnail
                  key={video.id}
                  video={video}
                  noProfile
                />
              ))

            : (
              new Array(10).fill(0).map((_, index) => (
                <ThumbnailSkeleton 
                  key={index}
                  noProfile
                />
              ))
            )
          }
        </div>
        {/* Uploads - below 768px */}
        <div className="grid grid-cols-1 md:hidden gap-4 py-6">
          {
            channelVideos ? channelVideos
              .sort((a, b) => {
                if(sortBy === 'NEWEST') return b?.dateCreated - a?.dateCreated
                if(sortBy === 'OLDEST') return a?.dateCreated - b?.dateCreated
                if(sortBy === 'POPULAR') return b?.views - a?.views
              })
              .map(video => (
                <Thumbnail
                  key={video.id}
                  video={video}
                />
              )) 
            : (
              new Array(5).fill(0).map((_, index) => (
                <ThumbnailSkeleton 
                  key={index}
                />
              ))
            )
          }
        </div>
        {/* Add space at bottom */}
        <div className="col-span-1 md:col-span-3 5md:col-span-4 lg:col-span-4 
        h-16 md:h-8"></div>
      </div>
    </div>
  )
}
export default ChannelPage