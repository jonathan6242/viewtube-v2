import { useContext } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ModalContext from "../context/ModalContext";
import SidebarLink from "./SidebarLink";

function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useContext(ModalContext);
  const location = useLocation();

  return (
    <>
      {
        !location?.pathname.includes('/video') && (
          <div
            className={`w-20 hidden 2md:flex flex-col dark:bg-black border-r
          ${sidebarOpen && "xl:hidden"}`}
          >
            <SidebarLink
              to='/'
              icon='home'
            >
              Home
            </SidebarLink>
            <SidebarLink
              to='/subscriptions'
              icon='subscriptions'
            >
              Subscriptions
            </SidebarLink>
            <SidebarLink
              to='/likedvideos'
              icon='thumb_up'
            >
              Liked videos
            </SidebarLink>
          </div>
        )
      }

      {/* Sidebar (when open) */}
      {/* Below 1280px */}
      <div
        className={`absolute flex flex-col inset-y-0 left-0 w-60 bg-white dark:bg-black 
        ${!location?.pathname?.includes('/video') ? 'xl:hidden' : ' '}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-[100%]"} 
        duration-200 z-[60]`}
      >
        <div className="h-16 pl-6 flex items-center space-x-4">
          <button 
            className="flex items-center justify-center"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="material-symbols-outlined md-28">
              menu
            </span>
          </button>
          <Link to="/">
            <div className="flex items-center space-x-1">
              <i className="fa-brands fa-youtube text-red-400 text-xl md:text-2xl"></i>
              <span className="text-lg font-semibold">ViewTube</span>
            </div>
          </Link>
        </div>
        <SidebarLink 
          to='/'
          icon='home'
          open
        >
          Home
        </SidebarLink>
        <SidebarLink
          to='/subscriptions'
          icon='subscriptions'
          open
        >
          Subscriptions
        </SidebarLink>
        <SidebarLink
          to='/likedvideos'
          icon='thumb_up'
          open
        >
          Liked videos
        </SidebarLink>
      </div>
      <div
        className={`absolute inset-0 bg-black/50
        ${!location?.pathname?.includes('/video') ? 'xl:hidden' : ' '}
        ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } duration-200 z-50`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      {sidebarOpen && (
        <>
          {/* 1280px & above */}
          <div className={`w-56 hidden 
          ${!location?.pathname?.includes('/video') ? 'xl:flex' : ' '}
          flex-col dark:bg-black border-r py-1`}>
            <SidebarLink 
              to='/'
              icon='home'
              open
            >
              Home
            </SidebarLink>
            <SidebarLink
              to='/subscriptions'
              icon='subscriptions'
              open
            >
              Subscriptions
            </SidebarLink>
            <SidebarLink
              to='/likedvideos'
              icon='thumb_up'
              open
            >
              Liked videos
            </SidebarLink>
          </div>
        </>
      )}
      {/* Below 768px */}
      <div className="absolute bottom-0 inset-x-0 flex md:hidden bg-white dark:bg-black">
        <SidebarLink 
          to='/'
          icon='home'
          className="flex-1"
        >
          Home
        </SidebarLink>
        <SidebarLink
          to='/subscriptions'
          icon='subscriptions'
          className="flex-1"
        >
          Subscriptions
        </SidebarLink>
        <SidebarLink
          to='/likedvideos'
          icon='thumb_up'
          className="flex-1"
        >
          Liked videos
        </SidebarLink>
        <SidebarLink
          to='/createvideo'
          icon='video_call'
          className="flex-1"
        >
          Create video
        </SidebarLink>
      </div>
    </>
  );
}
export default Sidebar;
