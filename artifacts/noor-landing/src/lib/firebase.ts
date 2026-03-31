import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0kNHpgVF2r5jsfuKTPR2WySmQD919-eY",
  authDomain: "noooor-1c021.firebaseapp.com",
  projectId: "noooor-1c021",
  storageBucket: "noooor-1c021.firebasestorage.app",
  messagingSenderId: "1057114703601",
  appId: "1:1057114703601:web:e3328c18ca99afa6940b50",
  measurementId: "G-PPYKEXH3HJ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export async function fetchReviews(): Promise<Review[]> {
  const q = query(collection(db, "app_ratings"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString();
    return {
      id: docSnap.id,
      name: data.name,
      rating: data.rating,
      comment: data.comment ?? "",
      createdAt,
    };
  });
}

export async function submitReview(data: {
  name: string;
  rating: number;
  comment: string;
}): Promise<Review & { token: string }> {
  const token = crypto.randomUUID();
  const docRef = await addDoc(collection(db, "app_ratings"), {
    ...data,
    token,
    createdAt: serverTimestamp(),
  });
  return {
    id: docRef.id,
    ...data,
    createdAt: new Date().toISOString(),
    token,
  };
}

export async function updateReview(
  id: string,
  token: string,
  data: { name: string; rating: number; comment: string }
): Promise<Review> {
  const docRef = doc(db, "app_ratings", id);
  const existing = await getDoc(docRef);
  if (!existing.exists() || existing.data().token !== token) {
    throw new Error("Unauthorized");
  }
  await updateDoc(docRef, data);
  const createdAt =
    existing.data().createdAt instanceof Timestamp
      ? existing.data().createdAt.toDate().toISOString()
      : new Date().toISOString();
  return { id, ...data, createdAt };
}

export async function deleteReview(id: string, token: string): Promise<void> {
  const docRef = doc(db, "app_ratings", id);
  const existing = await getDoc(docRef);
  if (!existing.exists() || existing.data().token !== token) {
    throw new Error("Unauthorized");
  }
  await deleteDoc(docRef);
}

export async function getDownloadCount(): Promise<number> {
  const docRef = doc(db, "app_stats", "downloads");
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return 0;
  return snapshot.data().count ?? 0;
}

export async function incrementDownloadCount(): Promise<void> {
  const docRef = doc(db, "app_stats", "downloads");
  await setDoc(docRef, { count: increment(1) }, { merge: true });
}
