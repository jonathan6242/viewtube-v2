import { formatDistanceToNowStrict } from "date-fns";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../firebase";
import useAuthUser from "../hooks/useAuthUser";
import CommentInput from "./CommentInput";

function Reply({ mobile, inputRefMobile, reply, commentID, replies, setText }) {
  const [replyInputOpen, setReplyInputOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [likes, setLikes] = useState(reply?.likes);
  const [dislikes, setDislikes] = useState(reply?.dislikes);
  const { user } = useAuthUser();
  const { id } = useParams();

  const likedByUser = likes?.includes(user?.uid)
  const dislikedByUser = dislikes?.includes(user?.uid)

  const likeReply = async () => {
    let disliked;
    // Remove dislike if reply is disliked by user
    if(dislikes?.includes(user?.uid)) {
      // Update dislikes in state
      setDislikes(dislikes.filter(uid => uid !== user?.uid));
      disliked = true;
    }

    if(!likes?.includes(user?.uid)) {
      // Update likes in state
      setLikes([...likes, user?.uid])

      // Update likes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", commentID, "replies", reply?.id), {
        likes: arrayUnion(user?.uid)
      })
    } else {
      // Update likes in state
      setLikes(likes.filter(uid => uid !== user?.uid));

      // Update likes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", commentID, "replies", reply?.id), {
        likes: arrayRemove(user?.uid)
      })
    }

    if(disliked) {
      // Update dislikes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", commentID, "replies", reply?.id), {
        dislikes: arrayRemove(user?.uid)
      })
    }
  }

  const dislikeReply = async () => {
    let liked;
    // Remove like if reply is liked by user
    if(likes?.includes(user?.uid)) {
      // Update likes in state
      setLikes(likes.filter(uid => uid !== user?.uid));
      liked = true;
    }

    if(!dislikes?.includes(user?.uid)) {
      // Update dislikes in state
      setDislikes([...dislikes, user?.uid])

      // Update dislikes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", commentID, "replies", reply?.id), {
        dislikes: arrayUnion(user?.uid)
      })
    } else {
      // Update dislikes in state
      setDislikes(dislikes.filter(uid => uid !== user?.uid));

      // Update dislikes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", commentID, "replies", reply?.id), {
        dislikes: arrayRemove(user?.uid)
      })
    }

    if(liked) {
      // Update likes in Firestore
      await updateDoc(doc(db, "videos", id, "comments", commentID, "replies", reply?.id), {
        likes: arrayRemove(user?.uid)
      })
    }
  }

  if(!mobile) {
    return (
      <div className="flex items-start space-x-4 mb-6">
        <Link
          to={`/channel/${reply?.uid}`}
          className="w-8 h-8 rounded-full bg-cover bg-center bg-no-repeat flex-shrink-0"
          style={{
            backgroundImage: `url(${reply?.photoURL})`
          }}
        ></Link>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center space-x-3">
            <Link
              to={`/channel/${reply?.uid}`}
              className="block font-semibold"
            >
              {reply?.displayName}
            </Link>
            <div className="text-sm text-secondary">
              {reply?.dateCreated && formatDistanceToNowStrict(reply?.dateCreated)} ago
            </div>
          </div>
          <div className="mt-1">
            {
              reply?.mentions ? (
                <>
                  <Link 
                    to={`/channel/${reply?.mentions?.uid}`}
                    className="text-blue-400"
                  >
                    @{reply?.mentions?.displayName}
                  </Link>
                  &nbsp;{reply?.comment.slice(reply?.mentions?.displayName?.length + 2)}
                </>
              ) : (
                reply?.comment
              )
            }
          </div>
          <div className="flex text-sm mt-2">
            <div className="flex items-center space-x-2">
              <span 
                className={`material-symbols-outlined cursor-pointer select-none text-xl
                ${likedByUser ? 'fill-1' : 'fill-0'}`}
                onClick={likeReply}
              >
                thumb_up
              </span>
              <span>{likes?.length}</span>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <span 
                className={`material-symbols-outlined cursor-pointer select-none text-xl
                ${dislikedByUser ? 'fill-1' : 'fill-0'}`}
                onClick={dislikeReply}
              >
                thumb_down
              </span>
            </div>
            <button 
              className="font-medium py-2 px-4 uppercase text-secondary ml-2"
              onClick={() => {
                setReplyInputOpen(true)
                setReplyText(`@${reply?.displayName}`)
              }}
            >
              Reply
            </button>
          </div>
          {
            replyInputOpen && (
              <CommentInput 
                reply
                setReplyInputOpen={setReplyInputOpen}
                replyInputOpen={replyInputOpen}
                text={replyText}
                setText={setReplyText}
                commentID={commentID}
                replies={replies}
              />
            )
          }
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start space-x-4 mb-6">
      <Link
        to={`/channel/${reply?.uid}`}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cover bg-center bg-no-repeat flex-shrink-0"
        style={{
          backgroundImage: `url(${reply?.photoURL})`
        }}
      ></Link>
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-y-[2px]">
          <Link
            to={`/channel/${reply?.uid}`}
            className="block font-semibold mr-3"
          >
            {reply?.displayName}
          </Link>
          <div className="text-sm text-secondary">
            {reply?.dateCreated && formatDistanceToNowStrict(reply?.dateCreated)} ago
          </div>
        </div>
        <div className="mt-1 leading-relaxed">
          {
            reply?.mentions ? (
              <>
                <Link 
                  to={`/channel/${reply?.mentions?.uid}`}
                  className="text-blue-400"
                >
                  @{reply?.mentions?.displayName}
                </Link>
                &nbsp;{reply?.comment.slice(reply?.mentions?.displayName?.length + 2)}
              </>
            ) : (
              reply?.comment
            )
          }
        </div>
        <div className="flex items-center text-sm mt-2">
          <div className="flex items-center space-x-2">
            <span 
              className={`material-symbols-outlined cursor-pointer select-none text-xl
              ${likedByUser ? 'fill-1' : 'fill-0'}`}
              onClick={likeReply}
            >
              thumb_up
            </span>
            <span>{likes?.length}</span>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span 
              className={`material-symbols-outlined cursor-pointer select-none text-xl
              ${dislikedByUser ? 'fill-1' : 'fill-0'}`}
              onClick={dislikeReply}
            >
              thumb_down
            </span>
          </div>
          <span 
            className="material-symbols-outlined ml-8 cursor-pointer text-xl"
            onClick={() => {
              inputRefMobile.current.focus()
              setText(`@${reply?.displayName}`)
            }}
          >
            mode_comment
          </span>
        </div>
      </div>
    </div>
  )

}
export default Reply