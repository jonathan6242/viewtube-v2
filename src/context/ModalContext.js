import { createContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [ navbarModalOpen, setNavbarModalOpen ] = useState(false);
  const [ sidebarOpen, setSidebarOpen ] = useState(false);
  const [ mobileSearchOpen, setMobileSearchOpen ] = useState(false);
  const [ notificationsOpen, setNotificationsOpen ] = useState(false);

  return <ModalContext.Provider value={{
    navbarModalOpen,
    setNavbarModalOpen,
    sidebarOpen,
    setSidebarOpen,
    mobileSearchOpen,
    setMobileSearchOpen,
    notificationsOpen,
    setNotificationsOpen
  }}>
    { children }
  </ModalContext.Provider>
}

export default ModalContext