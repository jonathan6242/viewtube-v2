import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import useAuthUser from "./useAuthUser";


export default function useFirestoreUser() {
  const [firestoreUser, setFirestoreUser] = useState(null)
  const [loading, setLoading] = useState(true);
  const { user } = useAuthUser();

  useEffect(() => {
    async function getFirestoreUser() {
      const docSnap = await getDoc(doc(db, "users", user.uid))
      setFirestoreUser(docSnap.data())
    }
    setLoading(true);
    if(user) {
      getFirestoreUser();
    }
    setLoading(false);
  }, [user])

  return { firestoreUser, loading }
}