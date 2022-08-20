import { useContext } from "react"
import ModalContext from "../context/ModalContext"
import UndrawNotify from "../assets/undrawnotify.svg"
import { signin } from "../services"

function Notifications({ signedIn = true }) {
  const { notificationsOpen, setNotificationsOpen } = useContext(ModalContext)

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
              <button className="flex justify-center items-center w-6 h-6 rounded-sm 
              bg-gray-200 dark:bg-dark1">
                <span className="material-symbols-outlined md-22">
                  check
                </span>
              </button>
            </div>
            <div className="flex flex-col">
              <button className="p-4 flex items-start space-x-4
              hover:bg-gray-50 dark:hover:bg-dark1 duration-100">
                <div className="w-8 h-8 rounded-full bg-green-400 flex-shrink-0"></div>
                <div className="text-sm text-left line-clamp-2">
                  <span className="font-semibold">PewDiePie</span> uploaded: TRY NOT TO LAUGH CHALLENGE #69
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nihil repellendus accusamus ipsa, obcaecati nam, reprehenderit suscipit eveniet optio tenetur aliquid placeat aliquam praesentium recusandae. Molestias ad sapiente a dicta officiis quaerat ipsam, voluptas earum qui quibusdam magni veritatis ab reprehenderit!
                </div>
              </button>
              <button className="p-4 flex items-start space-x-4
              hover:bg-gray-50 dark:hover:bg-dark1 duration-100">
                <div className="w-8 h-8 rounded-full bg-red-400 flex-shrink-0"></div>
                <div className="text-sm text-left line-clamp-2">
                  <span className="font-semibold">MrBeast</span> replied: Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde!
                </div>
              </button>
              <button className="p-4 flex items-start space-x-4
              hover:bg-gray-50 dark:hover:bg-dark1 duration-100">
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex-shrink-0"></div>
                <div className="text-sm text-left line-clamp-2">
                  <span className="font-semibold">Jake Paul</span> commented: Nice video!
                </div>
              </button>
            </div>
        
          </div>
        )
      }
      {/* Below 768px */}
      <div className={`fixed z-50 inset-0 bg-white dark:bg-black md:hidden flex flex-col
      ${notificationsOpen ? 'translate-y-0' : 'translate-y-full'} ease-out duration-200
      overflow-y-scroll`}>
        <div className="self-start flex items-center space-x-1">
          <button
            className="h-12 flex items-center justify-center px-3"
            onClick={() => setNotificationsOpen(false)}
          >
            <span className="material-symbols-outlined md-28">
              arrow_back_ios_new
            </span>
          </button>
          <div className="text-lg font-semibold">Notifications</div>
        </div>
        <button className="notifications-link">
          <div className="w-8 h-8 rounded-full bg-green-400 flex-shrink-0"></div>
          <div className="text-sm text-left line-clamp-2">
            <span className="font-semibold">PewDiePie</span> uploaded: TRY NOT TO LAUGH CHALLENGE #69
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nihil repellendus accusamus ipsa, obcaecati nam, reprehenderit suscipit eveniet optio tenetur aliquid placeat aliquam praesentium recusandae. Molestias ad sapiente a dicta officiis quaerat ipsam, voluptas earum qui quibusdam magni veritatis ab reprehenderit!
          </div>
        </button>
        <button className="notifications-link">
          <div className="w-8 h-8 rounded-full bg-red-400 flex-shrink-0"></div>
          <div className="text-sm text-left line-clamp-2">
            <span className="font-semibold">MrBeast</span> replied: Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde!
          </div>
        </button>
        <button className="notifications-link">
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex-shrink-0"></div>
          <div className="text-sm text-left line-clamp-2">
            <span className="font-semibold">Jake Paul</span> commented: Nice video!
          </div>
        </button>
       
      </div>
    </div>
  )
}
export default Notifications