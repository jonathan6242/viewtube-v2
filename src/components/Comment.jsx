import { formatDistanceToNowStrict } from "date-fns";
import { arrayRemove, arrayUnion, collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import VideoPageContext from "../context/VideoPageContext";
import { db } from "../firebase";
import useAuthUser from "../hooks/useAuthUser";
import CommentInput from "./CommentInput"
import Reply from "./Reply";

function Comment({ mobile, comment }) {
  const [replyInputOpen, setReplyInputOpen] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [likes, setLikes] = useState(comment?.likes);
  const [dislikes, setDislikes] = useState(comment?.dislikes);
  const [replies, setReplies] = useState();
  const { setCommentsOpen } = useContext(VideoPageContext)
  const { user } = useAuthUser();
  const inputRefMobile = useRef();
  const scrollRef = useRef();
  const { id } = useParams();

  const likedByUser = likes?.includes(user?.uid)
  const dislikedByUser = dislikes?.includes(user?.uid)

  // Get replies
  useEffect(
    () => {
      if(comment?.id) {
        return onSnapshot(
          collection(db, "videos", id, "comments", comment?.id, "replies"),
          (snapshot) => {
            setReplies(snapshot?.docs
              .map(doc => ({...doc.data(), id: doc.id}))
              .sort((a, b) => a.dateCreated - b.dateCreated)
            );
          }
        )
      }
    }, [comment?.id]
  );

  useEffect(() => {
    if(repliesOpen && mobile) {
      scrollRef.current.scrollTop = 0
    }
  }, [repliesOpen])

  const likeComment = async () => {
    if(!user) {
      toast.info('Sign in to like comments.', { theme: 'colored' });
      return;
    }
    let disliked;
    // Remove dislike if comment is disliked by user
    if(dislikes?.includes(user?.uid)) {
      // Update dislikes in state
      setDislikes(dislikes.filter(uid => uid !== user?.uid));
      disliked = true;
    }

    if(!likes?.includes(user?.uid)) {
      // Update likes in state
      setLikes([...likes, user?.uid])

      // Update likes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", comment?.id), {
        likes: arrayUnion(user?.uid)
      })
    } else {
      // Update likes in state
      setLikes(likes.filter(uid => uid !== user?.uid));

      // Update likes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", comment?.id), {
        likes: arrayRemove(user?.uid)
      })
    }

    if(disliked) {
      // Update dislikes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", comment?.id), {
        dislikes: arrayRemove(user?.uid)
      })
    }
  }

  const dislikeComment = async () => {
    if(!user) {
      toast.info('Sign in to dislike comments.', { theme: 'colored' });
      return;
    }
    let liked;
    // Remove like if comment is liked by user
    if(likes?.includes(user?.uid)) {
      // Update likes in state
      setLikes(likes.filter(uid => uid !== user?.uid));
      liked = true;
    }

    if(!dislikes?.includes(user?.uid)) {
      // Update dislikes in state
      setDislikes([...dislikes, user?.uid])

      // Update dislikes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", comment?.id), {
        dislikes: arrayUnion(user?.uid)
      })
    } else {
      // Update dislikes in state
      setDislikes(dislikes.filter(uid => uid !== user?.uid));

      // Update dislikes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", comment?.id), {
        dislikes: arrayRemove(user?.uid)
      })
    }

    if(liked) {
      // Update likes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", comment?.id), {
        likes: arrayRemove(user?.uid)
      })
    }
  }

  return (
    <div className="flex items-start space-x-4 mb-6">
      {/* Profile Picture */}
      <Link
        to={`/channel/${comment?.uid}`}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${comment?.photoURL})`
        }}
      ></Link>
      <div className="flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-y-[2px]">
          <Link
            to={`/channel/${comment?.uid}`}
            className="block font-semibold mr-3"
          >
            {comment?.displayName}
          </Link>
          <div className="text-sm text-secondary">
            {comment?.dateCreated && formatDistanceToNowStrict(comment?.dateCreated)} ago
          </div>
        </div>
        <div className="mt-1 leading-relaxed break-word">
          {comment?.comment}
        </div>
        {/* Likes and dislikes */}
        <div className="flex items-center text-sm mt-2">
          <div className="flex items-center space-x-2">
            <span 
              className={`material-symbols-outlined cursor-pointer select-none text-xl
              ${likedByUser ? 'fill-1' : 'fill-0'}`}
              onClick={likeComment}
            >
              thumb_up
            </span>
            <span>{likes?.length}</span>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span 
              className={`material-symbols-outlined cursor-pointer select-none text-xl
              ${dislikedByUser ? 'fill-1' : 'fill-0'}`}
              onClick={dislikeComment}
            >
              thumb_down
            </span>
          </div>
          {
            mobile ?
              <span 
                className="material-symbols-outlined ml-8 cursor-pointer text-xl"
                onClick={() => {
                  setRepliesOpen(true)
                  inputRefMobile.current.focus()
                }}
              >
                mode_comment
              </span>
            : (
              <button 
                className="font-medium py-2 px-4 uppercase text-secondary ml-2"
                onClick={() => setReplyInputOpen(true)}
              >
                Reply
              </button>
            )
          }

        </div>
        {
          replyInputOpen && (
            <CommentInput 
              reply
              setReplyInputOpen={setReplyInputOpen}
              text={replyText}
              setText={setReplyText}
              id={id}
              comment={comment}
              replies={replies}
            />
          )
        }
        {
          !mobile ? (
            <>
              {/* Replies - above 768px */}
              <button 
                className="my-2 text-blue-400 self-start flex items-start space-x-2 font-semibold"
                onClick={() => setRepliesOpen(!repliesOpen)}
              >
                {
                  replies?.length > 0 && (
                    <>
                      {
                        !repliesOpen ? (
                          <>
                            <span className="material-symbols-outlined md-32 -translate-y-[5px]
                            -mr-1 -ml-2">
                              arrow_drop_down
                            </span>
                            <span>View {replies?.length} replies</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined md-32 -translate-y-1
                            -mr-1 -ml-2">
                              arrow_drop_up
                            </span>
                            <span>Hide {replies?.length} replies</span>
                          </>
                        )   
                      }
                    </>
                  )
                }
              </button>
              {
                repliesOpen && (
                  replies?.map((reply, index) => (
                    <Reply
                      reply={reply}
                      comment={comment}
                      key={index}
                      replies={replies}
                    />
                  ))
                )
              }           
            </>
          ) : (
            <>
              {/* Replies - below 768px */}
              {
                replies?.length > 0 && (
                  <button 
                    className="self-start my-4 py-2 text-blue-400 font-semibold 
                    uppercase tracking-wide"
                    onClick={() => setRepliesOpen(true)}
                  >
                    {replies?.length} replies
                  </button>
                )
              }

              {/* Reply modal (mobile) */}
              <div 
                className={`fixed inset-0 bg-white dark:bg-black z-30
                ${repliesOpen ? 'translate-x-0' : 'translate-x-full'} duration-200
                flex flex-col md:hidden`}
              >
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center font-semibold space-x-4">
                    <span 
                      className="material-symbols-outlined md-28 cursor-pointer"
                      onClick={() => {
                        setRepliesOpen(false)
                        setReplyText('');
                      }}
                    >
                      arrow_back_ios_new
                    </span>
                    <span className="text-xl">Replies</span> 
                  </div>
                  <span 
                    className="material-symbols-outlined md-32 cursor-pointer"
                    onClick={() => {
                      setRepliesOpen(false)
                      setCommentsOpen(false)
                    }}
                  >
                    close
                  </span>
                </div>
                <div 
                  className="flex-1 p-3 overflow-y-scroll scrollbar-hide flex flex-col overflow-x-hidden"
                  ref={scrollRef}
                >
                  <div className="pb-3 border-b">
                    <div className="flex items-start space-x-4">
                      <Link
                        to={`/channel/${comment?.uid}`}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cover bg-center bg-no-repeat flex-shrink-0"
                        style={{
                          backgroundImage: `url(${comment?.photoURL})`
                        }}
                      ></Link>
                      <div className="flex-1 flex flex-col">
                        <div className="flex flex-wrap items-center gap-y-[2px]">
                          <Link
                            to={`/channel/${comment?.uid}`}
                            className="block font-semibold mr-3"
                          >
                            {comment?.displayName}
                          </Link>
                          <div className="text-sm text-secondary">
                            {comment?.dateCreated && formatDistanceToNowStrict(comment?.dateCreated)} ago
                          </div>
                        </div>
                        <div className="mt-1 leading-relaxed break-word">
                          {comment?.comment}
                        </div>
                        <div className="flex items-center text-sm mt-2">
                          <div className="flex items-center space-x-2">
                            <span 
                              className={`material-symbols-outlined cursor-pointer select-none text-xl
                              ${likedByUser ? 'fill-1' : 'fill-0'}`}
                              onClick={likeComment}
                            >
                              thumb_up
                            </span>
                            <span>{likes?.length}</span>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span 
                              className={`material-symbols-outlined cursor-pointer select-none text-xl
                              ${dislikedByUser ? 'fill-1' : 'fill-0'}`}
                              onClick={dislikeComment}
                            >
                              thumb_down
                            </span>
                          </div>
                          <span 
                            className="material-symbols-outlined ml-8 cursor-pointer text-xl"
                            onClick={() => inputRefMobile.current.focus()}
                          >
                            mode_comment
                          </span>
                        </div>
                        <div className="mt-3">
                          <CommentInput 
                            mobile
                            reply
                            setReplyInputOpen={setReplyInputOpen}
                            text={replyText}
                            setText={setReplyText}
                            id={id}
                            comment={comment}
                            replies={replies}
                            inputRefMobile={inputRefMobile}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-14 py-3">
                    {
                      replies?.map((reply, index) => (
                        <Reply
                          reply={reply}
                          comment={comment}
                          key={index}
                          replies={replies}
                          mobile
                          inputRefMobile={inputRefMobile}
                          setText={setReplyText}
                        />
                      ))
                    }
                  </div>
        
                </div>
              </div>
            </>
          )
        }
      </div>
    </div>
  )
}
export default Comment