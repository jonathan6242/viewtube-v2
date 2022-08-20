import { useContext, useEffect } from "react"
import ModalContext from "../context/ModalContext"
import ThemeContext from "../context/ThemeContext"
import UndrawVideo from "../assets/undrawvideo.svg"
import { signin, signout } from "../services"
import useAuthUser from "../hooks/useAuthUser"
import { Link } from "react-router-dom"

function NavbarModal({ signedIn = true }) {
  const { theme, setTheme } = useContext(ThemeContext)
  const { navbarModalOpen, setNavbarModalOpen } = useContext(ModalContext)
  const { user, loading } = useAuthUser();

  useEffect(() => {
    setNavbarModalOpen(false);
  }, [user])

  const toggleTheme = (e) => {
    if(e.target.checked) {
      localStorage.setItem("theme", "dark")
      document.documentElement.classList.add('dark')
      setTheme('dark')
    } else {
      localStorage.setItem("theme", "light")
      document.documentElement.classList.remove('dark')
      setTheme('light')
    }
  }

  if(!signedIn) {
    return (
      <div className="navbar-modal">
        {/* 768px & above */}
        {
          navbarModalOpen && (
            <div 
              className="absolute z-50 top-8 -right-2 hidden md:flex flex-col w-72 bg-white 
              border rounded divide-y dark:bg-black"
            >
              <div className="flex flex-col items-center text-center space-y-4 p-4">
                <div className="text-gray-400">
                  Sign in now to subscribe to channels and create videos.
                </div>
                <button 
                  className="flex items-center p-[6px] px-4 border bg-blue-400 border-blue-400 space-x-1 font-medium rounded text-white"
                  onClick={signin}
                >
                  <span className="material-symbols-outlined person">
                    person
                  </span>
                  <span className="uppercase">
                    Sign in
                  </span>
                </button>
              </div>
              <div className="flex flex-col">
                <button className="h-12 px-4 flex items-center
                hover:bg-gray-50 dark:hover:bg-dark1 duration-100">
                  {
                    theme === 'dark' ? (
                      <span className="material-symbols-outlined fill-1">
                        dark_mode
                      </span>
                    ) : (
                      <span className="material-symbols-outlined fill-1">
                        light_mode
                      </span>
                    )
                  }
                  <span className="ml-3">
                    { theme === 'dark' ? 'Dark mode' : 'Light mode' }
                  </span>
                  <label htmlFor="default-toggle" className="inline-flex relative items-center cursor-pointer ml-auto">
                    <input
                      type="checkbox"
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                      id="default-toggle"
                      className="sr-only peer ml-auto"
                    />
                    {/* Toggle Theme */}
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:border-transparent
                    peer-checked:after:bg-dark1 border-gray-500"
                    ></div>
                  </label>
                </button>
              </div>
            </div>
          )
        }
        {/* Below 768px */}
        <div className={`fixed z-50 inset-0 bg-white dark:bg-black md:hidden flex flex-col
        ${navbarModalOpen ? 'translate-y-0' : 'translate-y-full'} ease-out duration-200`}>
          <button
            className="self-start h-12 flex items-center px-3"
            onClick={() => setNavbarModalOpen(false)}
          >
            <span className="material-symbols-outlined md-32">
              close
            </span>
          </button>
          <div className="p-4 pb-6 flex flex-col items-center space-y-12">
            <img 
              className="w-48"
              src={UndrawVideo}
              alt=""
            />
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="font-semibold text-lg">Do more with ViewTube</div>
              <div className="text-gray-400 max-w-md">
                Sign in now to subscribe to channels and create videos.
              </div>
              <button 
                className="flex items-center p-[6px] px-4 border bg-blue-400 border-blue-400 space-x-1 font-medium rounded text-white"
                onClick={signin}
              >
                <span className="material-symbols-outlined person">
                  person
                </span>
                <span className="uppercase">
                  Sign in
                </span>
              </button>
            </div>
          </div>
          <button className="py-6 px-4 flex items-center border-t">
            {
              theme === 'dark' ? (
                <span className="material-symbols-outlined fill-1">
                  dark_mode
                </span>
              ) : (
                <span className="material-symbols-outlined fill-1">
                  light_mode
                </span>
              )
            }
            <span className="ml-3">
              { theme === 'dark' ? 'Dark mode' : 'Light mode' }
            </span>
            <label htmlFor="default-toggle" className="inline-flex relative items-center cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                id="default-toggle"
                className="sr-only peer ml-auto"
              />
              {/* Toggle Theme */}
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:border-transparent
              peer-checked:after:bg-dark1 border-gray-500"
              ></div>
            </label>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="navbar-modal">
        {/* 768px & above */}
        {
          navbarModalOpen && (
            <div 
              className="absolute z-50 top-8 -right-2 hidden md:flex flex-col w-72 bg-white 
              border rounded divide-y dark:bg-black"
            >
              <div className="flex items-center space-x-4 p-4">
                <div 
                  className="w-8 h-8 rounded-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${user?.photoURL})`
                  }}
                >
                </div>
                <div className="font-semibold">{user?.displayName}</div>
              </div>
              <div className="flex flex-col">
                <Link
                  to={`/channel/${user?.uid}`}
                  className="navbar-modal-link"
                  onClick={() => setNavbarModalOpen(false)}
                >
                  <span className="material-symbols-outlined person">
                    person
                  </span>
                  <span>Your channel</span>
                </Link>
                <button className="h-12 px-4 flex items-center
                hover:bg-gray-50 dark:hover:bg-dark1 duration-100">
                  {
                    theme === 'dark' ? (
                      <span className="material-symbols-outlined fill-1">
                        dark_mode
                      </span>
                    ) : (
                      <span className="material-symbols-outlined fill-1">
                        light_mode
                      </span>
                    )
                  }
                  <span className="ml-3">
                    { theme === 'dark' ? 'Dark mode' : 'Light mode' }
                  </span>
                  <label htmlFor="default-toggle" className="inline-flex relative items-center cursor-pointer ml-auto">
                    <input
                      type="checkbox"
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                      id="default-toggle"
                      className="sr-only peer ml-auto"
                    />
                    {/* Toggle Theme */}
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:border-transparent
                    peer-checked:after:bg-dark1 border-gray-500"
                    ></div>
                  </label>
                </button>
                <button 
                  className="navbar-modal-link"
                  onClick={signout}
                >
                  <span className="material-symbols-outlined">
                    logout
                  </span>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )
        }
        {/* Below 768px */}
        <div className={`fixed z-50 inset-0 bg-white dark:bg-black md:hidden flex flex-col
        ${navbarModalOpen ? 'translate-y-0' : 'translate-y-full'} ease-out duration-200`}>
          <button
            className="self-start h-12 flex items-center px-3"
            onClick={() => setNavbarModalOpen(false)}
          >
            <span className="material-symbols-outlined md-32">
              close
            </span>
          </button>
          <div className="p-4 flex items-center space-x-4">
            <div 
              className="w-8 h-8 rounded-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${user?.photoURL})`
              }}
            ></div>
            <div className="font-semibold">{user?.displayName}</div>
          </div>
          <Link
            to={`/channel/${user?.uid}`}
            className="navbar-modal-link"
            onClick={() => setNavbarModalOpen(false)}
          >
              <span className="material-symbols-outlined person">
                person
              </span>
              <span>Your channel</span>
          </Link>
          <button className="h-12 px-4 flex items-center
          hover:bg-gray-50 dark:hover:bg-dark1 duration-100">
            {
              theme === 'dark' ? (
                <span className="material-symbols-outlined fill-1">
                  dark_mode
                </span>
              ) : (
                <span className="material-symbols-outlined fill-1">
                  light_mode
                </span>
              )
            }
            <span className="ml-3">
              { theme === 'dark' ? 'Dark mode' : 'Light mode' }
            </span>
            <label htmlFor="default-toggle" className="inline-flex relative items-center cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                id="default-toggle"
                className="sr-only peer ml-auto"
              />
              {/* Toggle Theme */}
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:border-transparent
              peer-checked:after:bg-dark1 border-gray-500"
              ></div>
            </label>
          </button>
          <button 
            className="navbar-modal-link"
            onClick={signout}
          >
            <span className="material-symbols-outlined">
              logout
            </span>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </>
  )
}
export default NavbarModal