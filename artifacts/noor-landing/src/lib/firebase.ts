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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: "noor-web-595df.firebaseapp.com",
  projectId: "noor-web-595df",
  storageBucket: "noor-web-595df.firebasestorage.app",
  messagingSenderId: "367457789673",
  appId: "1:367457789673:web:c8d42ff3fef4a12129b278",
  measurementId: "G-1387SXZHGL",
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
  try {
    const docRef = doc(db, "app_stats", "downloads");
    const snapshot = await getDoc(docRef);
    console.log("[Noor] getDownloadCount - exists:", snapshot.exists(), "data:", snapshot.data());
    if (!snapshot.exists()) return 0;
    return snapshot.data().count ?? 0;
  } catch (err) {
    console.error("[Noor] getDownloadCount error:", err);
    return 0;
  }
}

export async function incrementDownloadCount(): Promise<void> {
  console.log("[Noor] incrementDownloadCount called");
  const docRef = doc(db, "app_stats", "downloads");
  await setDoc(docRef, { count: increment(1) }, { merge: true });
  console.log("[Noor] incrementDownloadCount succeeded");
}

export async function getApkUrl(): Promise<string> {
  try {
    const docRef = doc(db, "app_config", "apk");
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return "/noor-app.apk";
    return snapshot.data().url ?? "/noor-app.apk";
  } catch {
    return "/noor-app.apk";
  }
}

export async function setApkUrl(url: string): Promise<void> {
  const docRef = doc(db, "app_config", "apk");
  await setDoc(docRef, { url, updatedAt: serverTimestamp() }, { merge: true });
}

