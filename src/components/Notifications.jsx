import { useContext } from "react"
import ModalContext from "../context/ModalContext"
import UndrawNotify from "../assets/undrawnotify.svg"
import { signin } from "../services"
import Notification from "./Notification"
import useAuthUser from "../hooks/useAuthUser"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"

function Notifications({ signedIn = true, notifications, setNotifications }) {
  const { notificationsOpen, setNotificationsOpen } = useContext(ModalContext)
  const { user } = useAuthUser();

  const clearNotifications = async (e) => {
    setNotifications([]);
    await updateDoc(doc(db, "users", user?.uid), {
      notifications: []
    })
  }

  if(!signedIn) {
    return (
      <div className="notifications-modal">
        {/* Below 768px */}
        <div className={`fixed z-50 inset-0 bg-white dark:bg-black md:hidden flex flex-col
        ${notificationsOpen ? 'translate-y-0' : 'translate-y-full'} ease-out duration-200`}>
          <button
            className="self-start h-12 flex items-center px-3"
            onClick={() => setNotificationsOpen(false)}
          >
            <span className="material-symbols-outlined md-32">
              close
            </span>
          </button>
          <div className="p-4 pb-6 flex flex-col items-center space-y-12">
            <img 
              className="w-48"
              src={UndrawNotify}
              alt=""
            />
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="font-semibold text-lg">Your notifications live here</div>
              <div className="text-gray-400 max-w-md">
                Sign in to see the latest videos and more from your favourite channels.
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
        </div>
      </div>
    )
  }

  return (
    <div className="notifications">
      {/* 768px & above */}
      {
        notificationsOpen && (
          <div className="absolute z-50 top-8 -right-2 hidden md:flex flex-col w-96 bg-white 
          border rounded divide-y dark:bg-black">
            <div className="p-4 flex justify-between items-center">
              <div>Notifications</div>
              {
                notifications?.length > 0 && (
                  <button 
                    className="flex justify-center items-center w-6 h-6 rounded-sm 
                    bg-gray-100 hover:bg-gray-200 dark:bg-dark1 dark:hover:bg-dark2
                    duration-150"
                    onClick={clearNotifications}
                  >
                    <span className="material-symbols-outlined md-22">
                      check
                    </span>
                  </button>
                )
              }

            </div>
            <div className="flex flex-col h-[500px] overflow-y-scroll scrollbar-hide">
              {
                notifications?.map((notification, index) => (
                  <Notification
                    key={index}
                    notification={notification}
                  />
                ))
              }
              {
                notifications?.length === 0 && (
                  <div className="p-4 hidden md:flex items-start space-x-4 hover:bg-gray-50 dark:hover:bg-dark1 duration-100 text-secondary text-sm">
                    No new notifications.
                  </div>
                )
              }
            </div>
        
          </div>
        )
      }
      {/* Below 768px */}
      <div className={`fixed z-50 inset-0 bg-white dark:bg-black md:hidden flex flex-col
      ${notificationsOpen ? 'translate-y-0' : 'translate-y-full'} ease-out duration-200
      overflow-y-scroll`}>
        <div className="flex items-center justify-between px-3">
          <div className="self-start flex items-center space-x-1">
            <button
              className="h-12 flex items-center justify-center pr-3"
              onClick={() => setNotificationsOpen(false)}
            >
              <span className="material-symbols-outlined md-28">
                arrow_back_ios_new
              </span>
            </button>
            <div className="text-lg font-semibold">Notifications</div>
          </div>
          {
            notifications?.length > 0 && (
              <button 
                className="flex justify-center items-center w-7 h-7 rounded-sm 
                bg-gray-100 hover:bg-gray-200 dark:bg-dark1 dark:hover:bg-dark2
                duration-150"
                onClick={clearNotifications}
              >
                <span className="material-symbols-outlined">
                  check
                </span>
              </button>
            )
          }
        </div>
        {
          notifications?.map((notification, index) => (
            <Notification
              key={index}
              notification={notification}
            />
          ))
        }
        {
          notifications?.length === 0 && (
            <div className="notifications-link md:hidden text-secondary">
              No new notifications.
            </div>
          )
        }
      </div>
    </div>
  )
}
export default Notifications