import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useContext, useEffect, useRef } from "react";
import ThemeContext from "./context/ThemeContext";
import ModalContext from "./context/ModalContext";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import VideoPage from "./pages/VideoPage";
import { VideoPageProvider } from "./context/VideoPageContext";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import VideoContext from "./context/VideoContext";
import CreateVideo from "./pages/CreateVideo";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChannelPage from "./pages/ChannelPage";
import Subscriptions from "./pages/Subscriptions";
import LikedVideos from "./pages/LikedVideos";
import SearchPage from "./pages/SearchPage";
import EditVideo from "./pages/EditVideo";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const { setTheme } = useContext(ThemeContext)
  const { 
    navbarModalOpen, setNavbarModalOpen, 
    notificationsOpen, setNotificationsOpen 
  } = useContext(ModalContext)

  useEffect(() => {
    if(localStorage.getItem("theme")) {
      if(localStorage.getItem("theme") === 'dark') {
        document.documentElement.classList.add('dark')
        setTheme("dark")
      } else {
        document.documentElement.classList.remove('dark')
        setTheme("light")
      }
    } else {
      if(document.documentElement.classList.contains('dark')) {
        localStorage.setItem("theme", "dark")
        setTheme("dark")
      } else {
        localStorage.setItem("theme", "light")
        setTheme("light")
      }
    }
    window.addEventListener('keydown', function(e) {
      if(e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
      }
    });
  }, [])

  // Close navbar modal when user clicks outside
  const closeNavbarModal = (e) => {
    if(window.innerWidth < 769) {
      return;
    }
    let targetInModals = false;
    const modals = document.querySelectorAll('.navbar-modal')
    modals.forEach((modal) => {
      if(modal?.contains(e.target)) {
        targetInModals = true;
      }
    })
    if(!e.target.classList?.contains('navbar-modal')
    && !e.target.classList?.contains('navbar-modal-toggle')
    && !targetInModals) {
      setNavbarModalOpen(false)
    }
  }

  // Close notifications modal when user clicks outside
  const closeNotifications = (e) => {
    if(window.innerWidth < 769) {
      return;
    }
    if(!e.target.classList?.contains('notifications')
    && !e.target.classList?.contains('notifications-toggle')
    && !document.querySelector('.notifications')?.contains(e.target)) {
      setNotificationsOpen(false)
    }
  }

  // General function to close modals when user clicks outside them
  const closeModals = (e) => {
    if(navbarModalOpen) {
      closeNavbarModal(e);
    }
    if(notificationsOpen) {
      closeNotifications(e);
    }
  }

  return (
    <Router>
      <div 
        className="relative flex flex-col min-h-screen text-black dark:text-white
        bg-white dark:bg-black overflow-x-hidden"
        onClick={closeModals}
      >
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/subscriptions' element={<Subscriptions />} />
            <Route path='/likedvideos' element={<LikedVideos />} />
            <Route path='/video/:id' element={
              <VideoPageProvider>
                <VideoPage />
              </VideoPageProvider>
            } />
            <Route path='/createvideo' element={<PrivateRoute />}>
              <Route path='/createvideo' element={<CreateVideo />} />
            </Route>
            <Route path='/channel/:uid' element={<ChannelPage />} />
            <Route path='/search' element={<SearchPage />} />
            <Route path='/editvideo/:id' element={<PrivateRoute />}>
              <Route path='/editvideo/:id' element={<EditVideo />} />
            </Route>
          </Routes>
        </div>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
