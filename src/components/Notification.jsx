import { formatDistanceToNowStrict } from "date-fns"
import { useContext } from "react"
import { Link } from "react-router-dom"
import ModalContext from "../context/ModalContext"

function Notification({ notification }) {
  const { setNotificationsOpen } = useContext(ModalContext)

  const typeToVerb = (type) => {
    switch(type) {
      case "upload":
        return "uploaded"
      case "reply":
        return "replied"
      case "comment":
        return "commented on your video"
      case "subscription":
        return "subscribed to your channel"
    }
  }

  return (
    <>
      <Link 
        to={notification?.to}
        className="p-4 hidden md:flex items-start space-x-4 hover:bg-gray-50 dark:hover:bg-dark1 duration-100"
        onClick={() => setNotificationsOpen(false)}
      >
        <div 
          className="w-8 h-8 rounded-full bg-cover bg-center bg-no-repeat flex-shrink-0"
          style={{
            backgroundImage: `url(${notification?.photoURL})`
          }}
        ></div>
        <div className="space-y-2">
          <div className="text-sm text-left line-clamp-2">
            {
              (notification?.type === "subscription") && <>
              New subscriber:&nbsp;
              </>
            }
            <span className="font-semibold">{notification?.displayName}</span>
            {
              (notification?.type !== "subscription") && <>
              &nbsp;{typeToVerb(notification?.type)}: {notification?.content}
              </>
            }
          </div>
          <div className="text-xs text-secondary">
            {notification?.dateCreated && formatDistanceToNowStrict(notification?.dateCreated)} ago
          </div>
        </div>
      </Link>
      <Link 
        to={notification?.to}
        className="notifications-link md:hidden"
        onClick={() => setNotificationsOpen(false)}
      >
        <div 
          className="w-8 h-8 rounded-full bg-cover bg-center bg-no-repeat flex-shrink-0"
          style={{
            backgroundImage: `url(${notification?.photoURL})`
          }}
        ></div>
        <div className="space-y-2">
          <div className="text-sm text-left line-clamp-2">
            {
              (notification?.type === "subscription") && <>
              New subscriber:&nbsp;
              </>
            }
            <span className="font-semibold">{notification?.displayName}</span>
            {
              (notification?.type !== "subscription") && <>
              &nbsp;{typeToVerb(notification?.type)}: {notification?.content}
              </>
            }
          </div>
          <div className="text-xs text-secondary">
            {notification?.dateCreated && formatDistanceToNowStrict(notification?.dateCreated)} ago
          </div>
        </div>
      </Link>
    </>
  )
}
export default Notification