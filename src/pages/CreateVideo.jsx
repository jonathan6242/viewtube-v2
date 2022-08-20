import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid'
import { db, storage } from "../firebase";
import useAuthUser from "../hooks/useAuthUser";

function CreateVideo() {
  const thumbnailRef = useRef();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [video, setVideo] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { user } = useAuthUser();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      async function storeFile(file) {
        return new Promise((resolve, reject) => {
          const fileName = `${user?.uid}-${uuidv4()}`
          const fileRef = ref(storage, `files/${fileName}`)

          try {
            uploadString(fileRef, file, "data_url")
              .then(() => {
                getDownloadURL(fileRef)
                  .then((downloadURL) => {
                    resolve(downloadURL)
                  })
              })
          } catch (error) {
            reject(error)
          }
        })
      }
      // Upload thumbnail to Storage
      setLoadingMessage('Uploading thumbnail');
      const thumbnailURL = await storeFile(thumbnail);
      // Upload video to Storage
      setLoadingMessage('Uploading video');
      const videoURL = await storeFile(video);
      // Add video to Firestore
      await addDoc(collection(db, "videos"), {
        dateCreated: Date.now(),
        views: 0,
        likes: [],
        dislikes: [],
        thumbnail: thumbnailURL,
        video: videoURL,
        title,
        description,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid
      })

      setLoadingMessage('');
      setLoading(false);
      navigate('/')
      toast.success('Successfully created video.', {theme: 'colored'})
    } catch (error) {
      toast.error('Could not create video.', {theme: 'colored'})
      setLoading(false);
    }
    
  }

  const addThumbnail = async (e) => {
    if(e.target.files[0]) {
      const thumbnail = await readFile(e.target.files[0])
      setThumbnail(thumbnail);
    } else {
      setThumbnail('');
    }
  }

  const addVideo = async (e) => {
    if(e.target.files[0]) {
      const video = await readFile(e.target.files[0])
      setVideo(video);
    } else {
      setVideo('');
    }
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (readerEvent) => {
        resolve(readerEvent.target.result);
      }
    })
  }

  return (
    <form
      className="p-3 py-5 md:p-12 md:py-8 pb-20 flex-1 flex flex-col
      overflow-y-scroll main-container"
      onSubmit={onSubmit}
    >
      <div className="text-2xl font-semibold mb-6">Create Video</div>
      <div className="text-lg font-semibold mb-2">Title</div>
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        rows={1}
        className="outline-none border max-w-md bg-transparent p-2 mb-6 min-h-[42px]
        focus:border-black dark:focus:border-white transition-colors duration-150 ease"
      ></textarea>
      <div className="text-lg font-semibold mb-2">Description</div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="outline-none border max-w-md bg-transparent p-2 mb-6 min-h-[90px]
        focus:border-black dark:focus:border-white transition-colors duration-150 ease"
      ></textarea>
      <div className="text-lg font-semibold mb-2">Thumbnail</div>
      <button
        type="button"
        className="text-sm self-start text-white bg-blue-500
        font-medium uppercase py-2 px-4 mb-6"
        onClick={() => thumbnailRef.current.click()}
      >
        Choose file
      </button>
      <input
        type="file"
        accept='image/*'
        className="hidden"
        ref={thumbnailRef}
        onChange={addThumbnail}
        required
      />
      {
        thumbnail && (
          <img 
            src={thumbnail}
            alt=""
            className={`max-w-md mb-6 aspect-[16/9]`}
          />
        )
      }

      <div className="text-lg font-semibold mb-2">Video</div>
      <div className="h-9">
        <input
          type="file"
          accept="video/*"
          className="file-input"
          onChange={addVideo}
          required
        />
      </div>
      {
        video && <video src={video} className="max-w-md mt-4" controls></video>
      }
      <button
        className={`text-white bg-blue-500 max-w-md font-semibold uppercase 
        py-2 px-4 mt-6 flex items-center justify-center
        ${loading ? 'bg-opacity-75 pointer-events-none' : 'bg-opacity-100 pointer-events-auto'}`}
      >
        {
          loading ? (
            <img
              className="w-6 h-6"
              src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif"
            ></img>
          ) 
          : <span>Create video</span>
        }
      </button>
      {/* Loading Message */}
      {
        loading && (
          <div className="max-w-md mt-2 text-sm flex justify-center items-center">
            <div className="loading inline-block relative">
              {loadingMessage}
            </div>
          </div>
        )
      }

    </form>
  )
}
export default CreateVideo