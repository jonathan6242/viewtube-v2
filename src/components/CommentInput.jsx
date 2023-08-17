import { addDoc, arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";
import useAuthUser from "../hooks/useAuthUser";

function CommentInput({ reply, setReplyInputOpen, mobile, inputRefMobile, 
  text, setText, comment, replies, videoUID }) {
  const [active, setActive] = useState(false);
  const [focus, setFocus] = useState(false);
  const inputRef = useRef();
  const { user } = useAuthUser();
  const { id } = useParams();

  useEffect(() => {
    if(reply) {
      setActive(true)
      setFocus(true)
      inputRef?.current?.focus()
    }
  }, [])

  const onSubmitComment = async (e) => {
    e.preventDefault();
    if(!user) {
      toast.info('Sign in to comment.', { theme: 'colored' });
      return;
    }
    if(text.trim() === '') return 
    setText('');
    setActive(false);

    await updateDoc(doc(db, "users", videoUID), {
      notifications: arrayUnion({
        content: text,
        uid: user?.uid,
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        type: "comment",
        to: `/video/${id}`,
        dateCreated: Date.now()
      })
    })

    await addDoc(collection(db, "videos", id, "comments"), {
      likes: [],
      dislikes: [],
      dateCreated: Date.now(),
      comment: text,
      displayName: user?.displayName,
      photoURL: user?.photoURL,
      uid: user?.uid,
    })
  }

  const onSubmitReply = async (e) => {
    e.preventDefault();
    if(!user) {
      toast.info('Sign in to reply.', { theme: 'colored' });
      return;
    }
    if(text.trim() === '') return 
    let mentions;

    for(let reply of replies) {
      const name = reply?.displayName;
      if(text.indexOf(name) === 1 && 
      (text[name.length + 1] === ' ' || !text[name.length + 1])) {
        mentions = {
          uid: reply?.uid,
          displayName: name
        }
        break;
      }
    }
    
    setText('');
    setReplyInputOpen(false);

    // If reply does not mention anyone, notify everyone in the replies + the comment author
    if(!mentions) {
      let added = [];
      for(let reply of replies) {
        if(!added.includes(reply?.uid)) {
          added.push(reply?.uid)
          await updateDoc(doc(db, "users", reply?.uid), {
            notifications: arrayUnion({
              content: text,
              uid: user?.uid,
              displayName: user?.displayName,
              photoURL: user?.photoURL,
              type: "reply",
              to: `/video/${id}`,
              dateCreated: Date.now()
            })
          })
        }
      }
      if(!added.includes(comment?.uid)) {
        await updateDoc(doc(db, "users", comment?.uid), {
          notifications: arrayUnion({
            content: text,
            uid: user?.uid,
            displayName: user?.displayName,
            photoURL: user?.photoURL,
            type: "reply",
            to: `/video/${id}`,
            dateCreated: Date.now()
          })
        })
      }
    }

    // If reply mentions someone, notify them
    if(mentions) {
      await updateDoc(doc(db, "users", mentions.uid), {
        notifications: arrayUnion({
          content: text,
          uid: user?.uid,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
          type: "reply",
          to: `/video/${id}`,
          dateCreated: Date.now()
        })
      })
    }

    const replyObject = {
      likes: [],
      dislikes: [],
      dateCreated: Date.now(),
      comment: text,
      displayName: user.displayName,
      photoURL: user.photoURL,
      uid: user.uid
    }
    if(mentions) {
      replyObject.mentions = mentions;
    }

    await addDoc(
      collection(db, "videos", id, "comments", comment.id, "replies"),
      replyObject
    )


  }

  // Desktop
  if(!mobile) {
    return (
      <>
        {
          !reply ? (
            <div className="flex items-start mb-8 space-x-4">
              {
                user ? (
                  <div 
                    className="mt-1 w-10 h-10 rounded-full bg-cover bg-center bg-no-repeat flex-shrink-0 md:w-12 md:h-12 md:mt-0"
                    style={{
                      backgroundImage: `url(${user?.photoURL})`
                    }}
                  >
                  </div>
                ) : (
                  <div
                    className="mt-1 rounded-full material-symbols-outlined fill-1 text-[40px]
                    flex-shrink-0 md:mt-0 md:text-[48px] flex justify-center items-center"
                  >
                    account_circle
                  </div>
                )
              }

              <form
                className="flex-1 flex flex-col"
                onSubmit={onSubmitComment}
              >
                <div className="flex-1 flex relative justify-center">
                  <input 
                    type="text"
                    className={`flex-1 self-stretch bg-transparent text-base placeholder:text-secondary outline-none transition duration-200 pb-1 border-b`}
                    placeholder={`Add a comment...`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => {
                      setFocus(true)
                      setActive(true)
                    }}
                    onBlur={() => {
                      setFocus(false)
                    }}
                  />
                  <div className={`absolute 
                  ${focus ? 'h-[2px] -bottom-[1px]' : 'h-[1px] -bottom-0 bg-gray-500 dark:bg-gray-400'} 
                  ${active ? 'w-full' : 'w-0'} duration-200
                  bg-black dark:bg-white`}></div>
                </div>
                {
                  active && (
                    <div className="mt-2 self-end flex space-x-2 text-sm font-medium">
                      <button
                        type='button'
                        className="py-[10px] px-4 opacity-90 uppercase "
                        onClick={() => {
                          setActive(false)
                          setText('')
                        }}
                      >
                        Cancel
                      </button>
                      
                      <button
                        className={`py-[10px] px-5 rounded uppercase ${text.length ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-dark2 text-secondary'}`}
                      >
                        <span>{reply ? 'Reply' : 'Comment'}</span> 
                      </button>
                    </div>
                  )
                }
        
              </form>
            </div>
          ) : (
            <div className="flex items-start space-x-4 mt-1">
              {
                user ? (
                  <div 
                    className="w-8 h-8 rounded-full bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${user?.photoURL})`
                    }}
                  ></div>
                ) : (
                  <div
                    className="material-symbols-outlined fill-1 text-[32px] flex justify-center items-center"
                  >
                    account_circle
                  </div>
                )
              }


              <form 
                className="flex-1 flex flex-col justify-start"
                onSubmit={onSubmitReply}
              >
                <div className="flex-1 flex relative justify-center">
                  <input 
                    type="text"
                    className="flex-1 self-stretch bg-transparent text-base placeholder:text-secondary outline-none border-b pb-1 transition duration-200"
                    placeholder="Add a reply..."
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => {
                      setFocus(true)
                      setActive(true)
                    }}
                    onBlur={() => {
                      setFocus(false)
                    }}
                  />
                  <div className={`absolute 
                  ${focus ? 'h-[2px] -bottom-[1px]' : 'h-[1px] -bottom-0 bg-gray-500 dark:bg-gray-400'} 
                  ${active ? 'w-full' : 'w-0'} duration-200
                bg-black dark:bg-white`}></div>
                </div>
                <div className="mt-2 self-end flex space-x-2 text-sm font-medium">
                  <button
                    type='button'
                    className="py-[10px] px-4 opacity-90 uppercase "
                    onClick={() => {
                      setReplyInputOpen(false)
                      setText('');
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`py-[10px] px-5 rounded uppercase ${text.length ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-dark2 text-secondary'}`}
                  >
                    Reply
                  </button>
                </div>
              </form>
            </div>
          )
        }
      </>
    )
  }


  // Mobile
  return (
    <form onSubmit={reply ? onSubmitReply : onSubmitComment}>
      <div className="flex mb-0 space-x-2">
        {
          user ? (
            <div 
              className="w-10 h-10 rounded-full bg-cover bg-center bg-no-repeat flex-shrink-0
              md:w-12 md:h-12"
              style={{
                backgroundImage: `url(${user?.photoURL})`
              }}
            ></div>
          ) : (
            <div
              className="material-symbols-outlined fill-1 text-[40px] flex-shrink-0 md:text-[48px] flex justify-center items-center"
            >
              account_circle
            </div>
          )
        }
        <div className="flex-1">
          <input 
            type="text"
            className={`w-full placeholder:text-secondary outline-none transition duration-200 pl-2 py-2 pr-0 border border-transparent bg-gray-100 dark:bg-dark2 rounded`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Add a ${reply ? 'reply' : 'comment'}...`}
            ref={inputRefMobile}
          />
        </div>
      </div>
      <div className="mt-2 flex justify-end space-x-2 text-sm font-medium">
        <button
          className="py-[10px] px-5 rounded bg-gray-100 dark:bg-dark2 text-secondary uppercase space-x-2 flex items-center"
        >
          <span className="material-symbols-outlined fill-1 text-xl">
            send
          </span>
          <span>{reply ? 'Reply' : 'Comment'}</span> 
        </button>
      </div>
    </form>
  )
}
export default CommentInput