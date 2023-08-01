import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom"
import Thumbnail from "../components/Thumbnail";
import ThumbnailSkeleton from "../components/ThumbnailSkeleton";
import { db } from "../firebase";

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const term = searchParams.get("term");
  const [videos, setVideos] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("NEWEST");

  const dropdownRef = useRef();

  useEffect(
    () => {
      setVideos(null)
      return onSnapshot(
        collection(db, "videos"),
        (snapshot) => {
          setVideos(snapshot.docs
            .map(doc => ({...doc.data(), id: doc.id}))
            .sort((a, b) => b.dateCreated - a.dateCreated)
            .filter(video => video?.title?.toLowerCase().includes(term?.toLowerCase()))
          );
        }
      )
    }, [db, term]
  );

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

  return (
    <div className="flex-1 overflow-y-scroll scrollbar-hide main-container flex flex-col md:px-8">
        <div className="flex items-center justify-between pt-6 px-4 md:px-0 max-w-5xl mx-auto w-full">
          <div className="font-semibold text-lg">
            Results for "{term}"
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
      {/* Videos */}
      <div className="flex flex-col px-4 md:px-0 space-y-3 md:space-y-4 py-6 max-w-5xl mx-auto w-full">
        {
          videos ? videos
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
                search
              />
            ))

          : (
            new Array(10).fill(0).map((_, index) => (
              <ThumbnailSkeleton 
                key={index}
                noProfile
                search
              />
            ))
          )
        }
      </div>
      {/* Add space at bottom */}
      <div className="col-span-1 md:col-span-3 5md:col-span-4 lg:col-span-4 
      h-16 md:h-8"></div>
    </div>
  )
}
export default SearchPage