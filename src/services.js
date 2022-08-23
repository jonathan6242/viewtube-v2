import { signInWithPopup, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
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
  } else {
    // If user is already in database (existing account)
    
  }
}

export const signout = async () => {
  console.log('signout')
  await signOut(auth)
}

export const getUserByUID = async (uid) => {
  const docSnap = await getDoc(doc(db, "users", uid))
  return ({...docSnap.data(), id: docSnap?.id})
  
}