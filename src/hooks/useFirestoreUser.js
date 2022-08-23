import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import useAuthUser from "./useAuthUser";


export default function useFirestoreUser() {
  const [firestoreUser, setFirestoreUser] = useState(null)
  const [loading, setLoading] = useState(false);
  const { user } = useAuthUser();

  useEffect(() => {
    async function getFirestoreUser() {
      if(user) {
        setLoading(true);
        const docSnap = await getDoc(doc(db, "users", user.uid))
        setFirestoreUser(docSnap.data())
      } else {
        setFirestoreUser(null);
      }
      setLoading(false);
    }
    getFirestoreUser();
  }, [user])

  return { firestoreUser, loading }
}