import { signInWithPopup, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { toast } from "react-toastify"
import { auth, db, provider } from "./firebase"

export const signin = async () => {
  const { user } = await signInWithPopup(auth, provider)
  const docSnap = await getDoc(doc(db, "users", user.uid))

  if(!docSnap.exists()) {
    // If user is NOT in database (new account)
    await setDoc(doc(db, "users", user.uid), {
      displayName: user.displayName,
      photoURL: user.photoURL,
      email: user.email,
      uid: user.uid,
      subscribers: [],
      subscriptions: [],
      notifications: []
    })
    toast.success('Successfully signed up.', { theme: 'colored' })
  } else {
    // If user is already in database (existing account)
    toast.success('Successfully signed in.', { theme: 'colored' })
  }
}

export const signout = async () => {
  await signOut(auth)
  toast.success('Successfully signed out.', { theme: 'colored' })
}

export const getUserByUID = async (uid) => {
  const docSnap = await getDoc(doc(db, "users", uid))
  return ({...docSnap.data(), id: docSnap?.id})
  
}