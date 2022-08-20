import { Link, useLocation } from "react-router-dom"

function SidebarLink({ to, children, icon, className, open }) {
  const location = useLocation();
  const active = location?.pathname === to

  if(open) {
    return (
      <Link to={to} className={`sidebar-link-open ${className}`}>
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
    <Link to={to} className={`sidebar-link ${className}`}>
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