import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { toast } from "react-toastify";
import useAuthUser from "../hooks/useAuthUser"

function PrivateRoute() {
  const { user, loading } = useAuthUser();
  const location = useLocation();

  // useEffect(() => {
  //   if(!loading && !user) {
  //     if(location.pathname.includes('create')) {
  //       toast.info('Sign in to create videos.', {theme: 'colored'})
  //     } else {
  //       toast.info('Sign in to edit videos.', {theme: 'colored'})
  //     }
  //   }
  // }, [loading])

  if(loading) {
    return <></>
  }

  if(user) {
    return <Outlet />
  } else {
    if(location.pathname.includes('create')) {
      toast.info('Sign in to create videos.', {theme: 'colored'})
    } else {
      toast.info('Sign in to edit videos.', {theme: 'colored'})
    }
    return <Navigate to='/' />
  }
}
export default PrivateRoute