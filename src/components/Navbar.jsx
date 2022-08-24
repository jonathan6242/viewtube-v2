import { useContext, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import ModalContext from "../context/ModalContext"
import NavbarModal from "./NavbarModal"
import Notifications from "./Notifications"
import { signin } from "../services" 
import useAuthUser from "../hooks/useAuthUser"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../firebase"

function Navbar() {
  const { 
    navbarModalOpen, setNavbarModalOpen,
    sidebarOpen, setSidebarOpen,
    mobileSearchOpen, setMobileSearchOpen,
    notificationsOpen, setNotificationsOpen 
  } = useContext(ModalContext)
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);

  const mobileInputRef = useRef();
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if(user) {
      return onSnapshot(
        doc(db, "users", user?.uid),
        (snapshot) => {
          const firestoreUser = {...snapshot.data()}
          setNotifications(firestoreUser.notifications.sort((a, b) => b.dateCreated - a.dateCreated));
        }
      )
    } else {
      setNotifications([])
    }
  }, [user])

  useEffect(() => {
    if(mobileSearchOpen) {
      mobileInputRef.current.focus()
    }
  }, [mobileSearchOpen])

  const onSearch = (e) => {
    e.preventDefault();
    navigate({
      pathname: '/search',
      search: `?term=${searchTerm}`
    })
  }

  useEffect(() => {
    if(!location.pathname.includes('search')) {
      setSearchTerm('');
      setMobileSearchOpen(false)
    }
  }, [location.pathname])

  return (
    <div className="navbar px-3 md:px-6 flex justify-between items-center border-b md:space-x-12
    bg-white dark:bg-black">
      {
        mobileSearchOpen ? (
          <form 
            className="flex-1 flex items-center space-x-4"
            onSubmit={onSearch}
          >
            <span 
              className="material-symbols-outlined cursor-pointer opacity-75"
              onClick={() => setMobileSearchOpen(false)}
            >
              arrow_back
            </span>
            <input 
              type="text" 
              className="flex-1 py-1 outline-none dark:bg-black"
              placeholder="Search ViewTube"
              ref={mobileInputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        ) : (
          <>
            {/* Hamburger & Logo */}
            <div className="flex items-center md:space-x-4">
              <button
                className="hidden md:flex items-center justify-center"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="material-symbols-outlined md-28">
                  menu
                </span>
              </button>
              <Link to='/'>
                <div className="flex items-center space-x-1">
                  <i className="fa-brands fa-youtube text-red-400 text-xl md:text-2xl"></i>
                  <span className="md:text-lg font-semibold">ViewTube</span>
                </div>
              </Link>
            </div>
            {/* Searchbar */}
            <form 
              className="flex-1 hidden md:flex max-w-2xl border divide-x rounded"
              onSubmit={onSearch}
            >
              <input 
                type="text"
                placeholder="Search"
                className="p-2 px-3 outline-1 outline flex-1 rounded-l outline-transparent focus:outline-gray-400 dark:focus:outline-blue-500 z-10
                dark:bg-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="button"
                className="w-16 bg-gray-50 flex justify-center items-center rounded-r
                hover:bg-gray-100 duration-100 dark:bg-dark1 dark:hover:bg-dark1
                group relative"
              >
                <span className="material-symbols-outlined text-2xl">
                  search
                </span>
                <div className="hover-label">Search</div>
              </button>
            </form>
            {/* Buttons */}
            {
              !loading && (
                <div className={`flex items-center space-x-6 md:space-x-7 md:px-2
                ${!user ? 'md:space-x-3' : ''}`}>
                  {
                    !user && (
                      <>
                        <div className="relative">
                          <div className="group cursor-pointer hidden md:block">
                            <span 
                              className="material-symbols-outlined
                              navbar-modal-toggle w-8 flex justify-center md-28
                              select-none"
                              onClick={() => setNavbarModalOpen(!navbarModalOpen)}
                            >
                              more_vert
                            </span>
                            <div className="hover-label">
                              Settings
                            </div>
                          </div>
                          {/* Modal */}
                          <NavbarModal signedIn={false} />
                        </div>
                        <button 
                          className="hidden md:flex items-center p-[6px] px-4 border border-blue-400 text-blue-400 space-x-1 font-medium rounded
                          hover:bg-blue-400 hover:text-white duration-200"
                          onClick={signin}
                        >
                          <span className="material-symbols-outlined person">
                            person
                          </span>
                          <span className="uppercase">
                            Sign in
                          </span>
                        </button>
                        <div className="relative md:hidden">
                          <div className="group cursor-pointer flex items-center">
                            <span 
                              className="material-symbols-outlined notifications-toggle text-2xl"
                              onClick={() => setNotificationsOpen(!notificationsOpen)}
                            >
                              notifications
                            </span>
                            <div className="hover-label">
                              Notifications
                            </div>
                          </div>
                          {/* Modal */}
                          <Notifications 
                            notifications={notifications}
                            setNotifications={setNotifications}
                            signedIn={user}
                          />
                        </div>
                        <button 
                          className="group relative md:hidden flex items-center"
                          onClick={() => setMobileSearchOpen(true)}
                        >
                          <span className="material-symbols-outlined text-2xl">
                            search
                          </span>
                        </button>
                        <div 
                          className="relative md:hidden flex items-center"
                        >
                          <span 
                            className="material-symbols-outlined fill-1 navbar-modal-toggle cursor-pointer"
                            onClick={() => setNavbarModalOpen(!navbarModalOpen)}
                          >
                            account_circle
                          </span>
                        </div>
                      </>
                    )
                  }
                  {
                    user && (
                      <>
                        <Link
                          to='/createvideo'
                          className="group relative hidden md:flex items-center"
                        >
                          <span className="material-symbols-outlined">
                            video_call
                          </span>
                          <div className="hover-label">
                            Create
                          </div>
                        </Link>
                        <div className="relative">
                          <div className="group cursor-pointer flex items-center">
                            <div 
                              className="relative material-symbols-outlined notifications-toggle text-2xl
                              select-none"
                              onClick={() => setNotificationsOpen(!notificationsOpen)}
                            >
                              notifications
                              {
                                notifications?.length > 0 && (
                                  <div 
                                    className="absolute top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex justify-center items-center font-semibold"
                                  >
                                    {notifications?.length}
                                  </div>
                                )
                              }

                            </div>
                            <div className="hover-label">
                              Notifications
                            </div>
                          </div>
                          {/* Modal */}
                          <Notifications 
                            notifications={notifications}
                            setNotifications={setNotifications}
                            signedIn={user}
                          />
                        </div>
                        <button 
                          className="group relative md:hidden flex items-center"
                          onClick={() => setMobileSearchOpen(true)}
                        >
                          <span className="material-symbols-outlined text-2xl">
                            search
                          </span>
                        </button>
                        <div 
                          className="relative"
                        >
                          <div 
                            className="w-6 h-6 md:w-7 md:h-7 rounded-full cursor-pointer
                            bg-cover bg-center bg-no-repeat
                            navbar-modal-toggle"
                            style={{
                              backgroundImage: `url(${user?.photoURL})`
                            }}
                            onClick={() => setNavbarModalOpen(!navbarModalOpen)}
                          ></div>
                          {/* Modal */}
                          <NavbarModal />
                        </div>
                      </>
                    )
                  }
                </div>
              )
            }
            {/* Skeleton loading state */}
            {
              loading && (
                <div className="flex items-center space-x-2 w-[143px] px-2">
                  <div className="flex-1 md:w-24 h-6 animated-bg rounded"></div>
                  <div className="w-7 h-7 animated-bg rounded-full"></div>
                </div>
              )
            }
          </>
        )
      }

    </div>
  )
}
export default Navbar