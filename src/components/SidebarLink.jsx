import { useContext } from "react";
import { Link, useLocation } from "react-router-dom"
import ModalContext from "../context/ModalContext";

function SidebarLink({ to, children, icon, className, open, closeSidebar }) {
  const location = useLocation();
  const active = location?.pathname === to
  const { setSidebarOpen } = useContext(ModalContext)

  if(open) {
    return (
      <Link 
        to={to}
        className={`sidebar-link-open ${className}`}
        onClick={() => {if(closeSidebar) setSidebarOpen(false)}}
      >
        <span 
          className={`material-symbols-outlined ${active ? 'active' : ''}`}
        >
          {icon}
        </span>
        <span className="text-sm">{children}</span>
      </Link>
    )
  }

  return (
    <Link 
      to={to}
      className={`sidebar-link ${className}`}
      onClick={() => {if(closeSidebar) setSidebarOpen(false)}}
    >
      <span 
        className={`material-symbols-outlined ${active ? 'active' : ''}`}
      >
        {icon}
      </span>
      <span className="text-[10px]">{children}</span>
    </Link>
  )
}
export default SidebarLink