import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid'
import { db, storage } from "../firebase";
import useAuthUser from "../hooks/useAuthUser";
import useFirestoreUser from "../hooks/useFirestoreUser";

function EditVideo() {
  const thumbnailRef = useRef();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [oldThumbnail, setOldThumbnail] = useState('');
  const [video, setVideo] = useState('');
  const [oldVideo, setOldVideo] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    async function getVideo() {
      setLoading(true);
      const docSnap = await getDoc(doc(db, "videos", id));
      const video = {...docSnap.data(), id: docSnap.id}

      setTitle(video?.title);
      setDescription(video?.description);

      setThumbnail(video?.thumbnail);
      setOldThumbnail(video?.thumbnail)

      setVideo(video?.video)
      setOldVideo(video?.video)

      setLoading(false);
    }
    getVideo();
  }, [])

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

      let thumbnailURL;
      if(thumbnail === oldThumbnail) {
        thumbnailURL = thumbnail;
      } else {
        // Upload thumbnail to Storage
        setLoadingMessage('Uploading thumbnail');
        thumbnailURL = await storeFile(thumbnail);
        console.log('New thumbnail')
      }

      let videoURL
      if(video === oldVideo) {
        videoURL = video;
      } else {
        // Upload video to Storage
        setLoadingMessage('Uploading video');
        videoURL = await storeFile(video);
        console.log('New video')
      }

      // Update video in Firestore
      await updateDoc(doc(db, "videos", id), {
        thumbnail: thumbnailURL,
        video: videoURL,
        title,
        description
      })

      setLoadingMessage('');
      setLoading(false);
      navigate(`/video/${id}`)
      toast.success('Changes saved.', {theme: 'colored'})
    } catch (error) {
      toast.error('Could not save changes.', {theme: 'colored'})
      console.log(error)
      setLoading(false);
    }
    
  }

  const deleteVideo = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "videos", id))
      toast.success('Successfully deleted video.', {theme: 'colored'})
      setLoading(false);
      navigate('/')
    } catch (error) {
      toast.error('Could not delete video.', {theme: 'colored'})
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
      <div className="text-2xl font-semibold mb-6">Edit Video</div>
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
          : <span>Edit video</span>
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
      <button
        type="button"
        className={`text-white bg-red-500 max-w-md font-semibold uppercase 
        py-2 px-4 mt-6 flex items-center justify-center
        ${loading ? 'bg-opacity-75 pointer-events-none' : 'bg-opacity-100 pointer-events-auto'}`}
        onClick={deleteVideo}
      >
        {
          loading ? (
            <img
              className="w-6 h-6"
              src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif"
            ></img>
          ) 
          : <span>Delete video</span>
        }
      </button>
    </form>
  )
}
export default EditVideo