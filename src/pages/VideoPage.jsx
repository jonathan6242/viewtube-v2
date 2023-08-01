import { useContext, useEffect, useRef, useState } from "react";
import Comment from "../components/Comment"
import CommentInput from "../components/CommentInput"
import MobileScrollContainer from "../components/MobileScrollContainer";
import Thumbnail from "../components/Thumbnail"
import VideoPageContext from "../context/VideoPageContext";
import Video from "../components/Video";
import { Link, useLocation, useParams } from "react-router-dom";
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, limit, onSnapshot, query, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getUserByUID } from "../services";
import useAuthUser from "../hooks/useAuthUser"
import ThumbnailSkeleton from "../components/ThumbnailSkeleton";
import { toast } from "react-toastify";

function VideoPage() {
  const {
    descriptionOpen, setDescriptionOpen,
    commentsOpen, setCommentsOpen,
    videoHeight, setVideoHeight,
    videoRef
  } = useContext(VideoPageContext)
  const [video, setVideo] = useState(null);
  const [videos, setVideos] = useState(null);
  const [author, setAuthor] = useState(null);
  const [views, setViews] = useState();
  const [likes, setLikes] = useState();
  const [dislikes, setDislikes] = useState();
  const [subscribers, setSubscribers] = useState();
  const [comments, setComments] = useState(null);
  const [commentText, setCommentText] = useState('');

  const [infoLoading, setInfoLoading] = useState(true);

  const { id } = useParams();
  const { user } = useAuthUser();
  const location = useLocation();
  const likedByUser = likes?.includes(user?.uid)
  const dislikedByUser = dislikes?.includes(user?.uid)
  const subscribedByUser = subscribers?.includes(user?.uid)

  useEffect(() => {
    async function getVideos() {
      console.log('Get recommended')
      const docSnap = await getDocs(
        query(
          collection(db, "videos"),
          limit(10)
        )
      )
      setVideos(
        docSnap.docs
          .map(doc => ({...doc.data(), id: doc.id}))
          .sort((a, b) => b?.dateCreated - a?.dateCreated)
      )
    }
    getVideos();
  }, [])

  useEffect(() => {
    async function getVideo() {
      setInfoLoading(true);
      const docSnap = await getDoc(doc(db, "videos", id));
      const video = {...docSnap.data(), id: docSnap.id}
      setVideo(video)

      // Store views in state
      setViews(video?.views + 1)
      // Update views in Firestore
      await updateDoc(doc(db, "videos", id), ({
        views: video?.views + 1
      }))

      // Store likes in state
      setLikes(video?.likes);
      // Store dislikes in state
      setDislikes(video?.dislikes);

      const author = await getUserByUID(video?.uid);
      setAuthor(author);
      setSubscribers(author?.subscribers)
      setInfoLoading(false);
    }
    setComments(null);
    setVideo(null);
    getVideo();
    return onSnapshot(
      collection(db, "videos", id, "comments"),
      (snapshot) => {
        setComments(snapshot.docs
          .map(doc => ({...doc.data(), id: doc.id}))
          .sort((a, b) => b?.dateCreated - a?.dateCreated)
        );
      }
    )
  }, [id])

  useEffect(() => {
    setVideoHeight(videoRef.current?.clientHeight)
  })
  
  const updateHeight = () => {
    setVideoHeight(videoRef.current?.clientHeight)
  }

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight)
  }, [])

  const formatDate = (milliseconds) => {
    return new Date(milliseconds).toDateString().slice(4)
  }

  const likeVideo = async () => {
    if(!user) {
      toast.info('Sign in to like videos.', { theme: 'colored'});
      return;
    }
    let disliked;
    // Remove dislike if video is disliked by user
    if(dislikes?.includes(user?.uid)) {
      // Update dislikes in state
      setDislikes(dislikes.filter(uid => uid !== user?.uid));
      disliked = true;
    }

    if(!likes?.includes(user?.uid)) {
      // Update likes in state
      setLikes([...likes, user?.uid])

      // Update likes in Firestore
      await updateDoc(doc(db, "videos", id), {
        likes: arrayUnion(user?.uid)
      })
    } else {
      // Update likes in state
      setLikes(likes.filter(uid => uid !== user?.uid));

      // Update likes in Firestore
      await updateDoc(doc(db, "videos", id), {
        likes: arrayRemove(user?.uid)
      })
    }

    if(disliked) {
      // Update dislikes in Firestore
      await updateDoc(doc(db, "videos", id), {
        dislikes: arrayRemove(user?.uid)
      })
    }
  }

  const dislikeVideo = async () => {
    if(!user) {
      toast.info('Sign in to dislike videos.', { theme: 'colored'});
      return;
    }
    let liked;
    // Remove like if video is liked by user
    if(likes?.includes(user?.uid)) {
      // Update likes in state
      setLikes(likes.filter(uid => uid !== user?.uid));
      liked = true;
    }

    if(!dislikes?.includes(user?.uid)) {
      // Update dislikes in state
      setDislikes([...dislikes, user?.uid])

      // Update dislikes in Firestore
      await updateDoc(doc(db, "videos", id), {
        dislikes: arrayUnion(user?.uid)
      })
    } else {
      // Update dislikes in state
      setDislikes(dislikes.filter(uid => uid !== user?.uid));

      // Update dislikes in Firestore
      await updateDoc(doc(db, "videos", id), {
        dislikes: arrayRemove(user?.uid)
      })
    }

    if(liked) {
      // Update likes in Firestore
      await updateDoc(doc(db, "videos", id), {
        likes: arrayRemove(user?.uid)
      })
    }
  }

  const toggleSubscribe = async () => {
    if(!user) {
      toast.info('Sign in to subscribe.', { theme: 'colored'});
      return;
    }
    if(!subscribers?.includes(user?.uid)) {
      toast.success('Subscription added', {theme: 'colored'});

      setSubscribers([...subscribers, user?.uid])

      // Add user's UID to author's subscribers
      await updateDoc(doc(db, "users", video?.uid), {
        subscribers: arrayUnion(user?.uid)
      })

      // Add author's UID to user's subscriptions
      await updateDoc(doc(db, "users", user?.uid), {
        subscriptions: arrayUnion(video?.uid)
      })

      // Notify author of new subscriber
      await updateDoc(doc(db, "users", video?.uid), {
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

      // Remove user's UID from author's subscribers
      await updateDoc(doc(db, "users", video?.uid), {
        subscribers: arrayRemove(user?.uid)
      })

      // Remove author's UID from user's subscriptions
      await updateDoc(doc(db, "users", user?.uid), {
        subscriptions: arrayRemove(video?.uid)
      })
    }
  }

  const likeToDislikeRatio = (likes, dislikes) => {
    if(likes?.length === 0 && dislikes?.length === 0) {
      return 50;
    }
    if(dislikes?.length === 0) {
      return 100;
    }
    return (likes?.length / (likes?.length + dislikes?.length)) * 100
  }

  return (
    <div className={`flex-1 main-container overflow-hidden md:overflow-y-auto`}
    >
      <div className="flex w-full max-w-screen-3xl mx-auto md:p-6 space-x-6">
        {/* Video, description & comments */}
        <div className="flex-1 flex flex-col">
          {/* Custom video player */}
          {
            video?.video ? (
              <Video src={video?.video} />
            ) : (
              <div className="relative aspect-[16/9] animated-bg"></div>
            )
          }
          
          <MobileScrollContainer videoHeight={videoHeight}>
            {
              !infoLoading ? (
                <>
                  {/* Video details */}
                  <div className="p-3 pb-0 md:px-0 md:py-5 border-b">
                    <div
                      className="cursor-pointer md:cursor-default"
                      onClick={() => {
                        if(window.innerWidth < 768) setDescriptionOpen(true)
                      }}
                    >
                      {/* Video title */}
                      <div className="flex">
                        <div className="flex-1 text-xl font-semibold line-clamp-2 mb-1 md:mb-2">
                          {video?.title}
                        </div>
                        <span className="material-symbols-outlined md-32 md:hidden">
                          expand_more
                        </span>
                      
                      </div>
                      {/* Video views & upload date + like/dislike buttons */}
                      <div className="flex justify-between items-start max-w-3xl">
                        <div className="text-sm md:text-base text-secondary">
                          {views} views · {formatDate(video?.dateCreated)}
                        </div>
                        {/* Like/dislike buttons - above 768px */}
                        <div className="relative hidden md:flex justify-between w-32 px-2">
                          <div className="flex items-center space-x-2">
                            <span 
                              className={`material-symbols-outlined cursor-pointer select-none
                              ${likedByUser ? 'fill-1' : 'fill-0'}`}
                              onClick={likeVideo}
                            >
                              thumb_up
                            </span>
                            <span>{likes?.length}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span 
                              className={`material-symbols-outlined cursor-pointer
                              ${dislikedByUser ? 'fill-1' : 'fill-0'}`}
                              onClick={dislikeVideo}
                            >
                              thumb_down
                            </span>
                            <span>
                              {dislikes?.length}
                            </span>
                          </div>
                          <div 
                            className="absolute -bottom-5 left-0 h-[2px] 
                            bg-black dark:bg-white duration-100 ease"
                            style={{
                              width: `${likeToDislikeRatio(likes, dislikes)}%`
                            }}
                          >
                          </div>
                          <div className="absolute -bottom-5 left-0 w-full h-[2px] 
                          bg-black/30 dark:bg-white/40">
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Like/dislike buttons - below 768px */}
                    <div className="relative flex md:hidden text-center">
                      <div className="flex flex-col justify-center w-16 py-3 space-y-1">
                        <span 
                          className={`material-symbols-outlined cursor-pointer
                          ${likedByUser ? 'fill-1' : 'fill-0'}`}
                          onClick={likeVideo}
                        >
                          thumb_up
                        </span>
                        <span className="text-sm">
                          {likes?.length}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center w-16 py-3 space-y-1">
                        <span 
                          className={`material-symbols-outlined cursor-pointer select-none
                          ${dislikedByUser ? 'fill-1' : 'fill-0'}`}
                          onClick={dislikeVideo}
                        >
                          thumb_down
                        </span>
                        <span className="text-sm">
                          {dislikes?.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Video description */}
                  <div className="py-4 px-3 md:px-0 space-y-3 border-b">
                    {/* Author & subscribe button */}
                    <div className="flex justify-between items-start md:items-center 
                    space-x-3 md:space-x-4">
                      <div className="flex items-start space-x-3 md:space-x-4">
                        <Link
                          to={`/channel/${video?.uid}`}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cover bg-center bg-no-repeat flex-shrink-0"
                          style={{
                            backgroundImage: `url(${author?.photoURL})`
                          }}
                        ></Link>
                        <div>
                          <Link
                            to={`/channel/${video?.uid}`}
                            className="block font-semibold text-base line-clamp-2"
                          >
                            {author?.displayName}
                          </Link>
                          <div className="text-secondary text-sm md:text-base leading-relaxed">
                            {subscribers?.length} subscribers
                          </div>
                        </div>
                      </div>
                      {
                        video?.uid !== user?.uid && !infoLoading ? (
                          <button 
                            className={`py-2 px-4 uppercase font-medium rounded text-sm md:text-base
                            ${!subscribedByUser ? 'bg-red-500 text-white' : 'bg-gray-300 dark:bg-dark2 opacity-70'}`}
                            onClick={toggleSubscribe}
                          >
                            { !subscribedByUser ? 'Subscribe' : 'Unsubscribe'}
                          </button>
                        ) : !infoLoading ? (
                          <Link
                            to={`/editvideo/${video?.id}`}
                            className="py-2 px-4 uppercase font-medium rounded text-sm md:text-base bg-blue-400 text-white"
                          >
                            Edit video
                          </Link>
                        ) : (<></>)
                      }

                    </div>
                    {/* Description - above 768px */}
                    <div className="ml-16 max-w-lg hidden md:block">
                      {video?.description}
                    </div>
                  </div>        
                </>
              ) : (
                <>
                  {/* Video details */}
                  <div className="p-3 pb-0 md:px-0 md:py-5 border-b">
                    <div>
                      {/* Video title */}
                      <div className="flex">
                        <div className="w-60 text-xl font-semibold line-clamp-2 mb-1 md:mb-2 animated-bg">
                          &nbsp;
                        </div>
                      </div>
                      {/* Video views & upload date + like/dislike buttons */}
                      <div className="flex justify-between items-start max-w-3xl">
                        <div className="h-5 md:text-base text-secondary w-48 animated-bg">
                          &nbsp;  
                        </div>
                        {/* Like/dislike buttons - above 768px */}
                        <div className="relative hidden md:flex justify-between w-32 px-2">
                          <div className="w-8 h-8 rounded-full animated-bg"></div>
                          <div className="w-8 h-8 rounded-full animated-bg"></div>
                        </div>
                      </div>
                    </div>
                    {/* Like/dislike buttons - below 768px */}
                    <div className="relative flex md:hidden text-center">
                      <div className="flex flex-col justify-center items-center w-16 py-3">
                        <div className="w-8 h-8 animated-bg rounded-full"></div>
                      </div>
                      <div className="flex flex-col justify-center items-center w-16 py-3">
                        <div className="w-8 h-8 animated-bg rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  {/* Video description */}
                  <div className="py-4 px-3 md:px-0 space-y-3 border-b">
                    {/* Author & subscribe button */}
                    <div className="flex justify-between items-start md:items-center 
                    space-x-3 md:space-x-4">
                      <div className="flex items-start space-x-3 md:space-x-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 animated-bg rounded-full">
                        </div>
                        <div>
                          <div className="font-semibold text-sm mb-2 line-clamp-2 w-24 animated-bg">
                            &nbsp;
                          </div>
                          <div className="text-secondary text-[10px] leading-relaxed animated-bg w-32">
                            &nbsp;
                          </div>
                        </div>
                      </div>
                      {
                        video?.uid !== user?.uid && !infoLoading ? (
                          <button 
                          className={`py-2 px-4 uppercase font-medium rounded text-sm md:text-base
                          ${!subscribedByUser ? 'bg-red-500 text-white' : 'bg-gray-300 dark:bg-dark2 opacity-70'}`}
                          onClick={toggleSubscribe}
                        >
                          { !subscribedByUser ? 'Subscribe' : 'Unsubscribe'}
                        </button>
                        ) : !infoLoading ? (
                          <Link
                            to={`/editvideo/${video?.id}`}
                            className="py-2 px-4 uppercase font-medium rounded text-sm md:text-base bg-blue-400 text-white"
                          >
                            Edit video
                          </Link>
                        ) : (<></>)
                      }

                    </div>
                    {/* Description - above 768px */}
                    <div className="ml-16 max-w-lg hidden md:flex flex-col space-y-2">
                      <div className="text-[10px] animated-bg">&nbsp;</div>
                      <div className="text-[10px] animated-bg">&nbsp;</div>
                    </div>
                  </div>        
                </>             
              ) 
            }

            {/* Comments button - below 768px */}
            <div 
              className="py-4 px-3 flex justify-between items-center border-b cursor-pointer
              md:hidden"
              onClick={() => setCommentsOpen(true)}
            >
              {
                comments ? (
                  <>
                    <div className="space-x-2">
                      <span>Comments</span>
                      <span>•</span>
                      <span className="text-secondary">{comments?.length}</span> 
                    </div>
                    <div className="flex flex-col items-center text-xs leading-none">
                      <span className="material-symbols-outlined">
                        unfold_more
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="animated-bg w-40">
                    &nbsp;
                  </div>
                )
              }

            
            </div>
            {/* Recommended videos - below 1100px */}
            <div className="py-4 pb-20 md:pb-4 space-y-2 5md:hidden">
              {
                videos && !infoLoading ? (
                  videos
                  ?.filter(video => video?.id !== id)
                  .map(video => (
                    <Thumbnail 
                      recommended
                      video={video}
                      key={video?.id}
                    />
                  ))
                ) : (
                  new Array(6).fill(0).map((_, index) => (
                    <ThumbnailSkeleton 
                      recommended
                      key={index}
                    />
                  ))
                )
              }
            </div>
            {/* Comments - above 768px */}
            {
              comments ? (
                <div className="hidden md:flex flex-col pt-6">
                  <div className="mb-6">{comments?.length} comments</div>
                    <CommentInput
                      text={commentText}
                      setText={setCommentText}
                      id={id}
                      videoUID={video?.uid}
                    />
                    {
                      comments?.map(comment => (
                        <Comment 
                          comment={comment}
                          key={comment.id}
                        />
                      ))
                    }
                </div>
              ) : (
                <div className="flex items-center justify-center pt-10">
                  <img
                    className="w-10 h-10"
                    src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif"
                  ></img>
                </div>

              )
            }

          </MobileScrollContainer>
        </div>
        {/* Recommended videos - above 1100px */}
        <div className="flex-1 max-w-sm space-y-2 hidden 5md:block">
          {
            videos && !infoLoading ? 
              videos
                .filter(video => video?.id !== id)
                .map(video => (
                  <Thumbnail 
                    recommended
                    video={video}
                    key={video?.id}
                  />
                )) 
            : new Array(6).fill(0).map((_, index) => (
              <ThumbnailSkeleton 
                recommended
                key={index}
              />
            ))
          }
        </div>
      </div>
      {/* Description modal (mobile) */}
      <div 
        className={`fixed inset-x-0 bottom-0 bg-white dark:bg-black z-10
        ${descriptionOpen ? 'translate-y-0' : 'translate-y-full'} duration-200
        flex flex-col md:hidden`}
        style={{
          top: `${48 + videoHeight}px`
        }}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <div className="text-xl font-semibold">
            Description
          </div>
          <span 
            className="material-symbols-outlined md-32 cursor-pointer"
            onClick={() => setDescriptionOpen(false)}
          >
            close
          </span>
        </div>
        <div className="flex-1 p-3 overflow-y-scroll scrollbar-hide">
          <div className="text-xl font-semibold">{video?.title}</div>
          <div className="py-2 pb-3 flex border-b">
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xl font-semibold">{likes?.length}</div>
              <div className="text-sm text-secondary">Likes</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xl font-semibold">{views}</div>
              <div className="text-sm text-secondary">Views</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xl font-semibold">
                {new Date(video?.dateCreated)?.toDateString()?.slice(4, 10)}
              </div>
              <div className="text-sm text-secondary">
                {new Date(video?.dateCreated)?.toDateString()?.slice(11)}
              </div>
            </div>
          </div>
          <div className="py-3 text-sm">
            {video?.description}
          </div>
        </div>
      </div>
      {/* Comments modal (mobile) */}
      <div 
        className={`fixed inset-x-0 bottom-0 bg-white dark:bg-black z-20
        ${commentsOpen ? 'translate-y-0' : 'translate-y-full'} duration-200
        flex flex-col md:hidden`}
        style={{
          top: `${48 + videoHeight}px`
        }}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <div className="text-xl font-semibold">
            Comments
          </div>
          <span 
            className="material-symbols-outlined md-32 cursor-pointer"
            onClick={() => setCommentsOpen(false)}
          >
            close
          </span>
        </div>
        <div className="flex-1 p-3 overflow-y-scroll scrollbar-hide">
          <div className="pb-3 border-b">
            <CommentInput 
              mobile
              text={commentText}
              setText={setCommentText}
              videoUID={video?.uid}
            />
          </div>
          <div className="py-3">
            {
              comments?.map(comment => (
                <Comment 
                  comment={comment}
                  key={comment.id}
                  mobile
                />
              ))
            }
          </div>

        </div>
      </div>
    </div>
  )
}
export default VideoPage