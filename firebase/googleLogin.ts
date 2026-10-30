import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "fourseasonsdrivingschool-ebb7b.firebaseapp.com",
  projectId: "fourseasonsdrivingschool-ebb7b",
  storageBucket: "fourseasonsdrivingschool-ebb7b.firebasestorage.app",
  messagingSenderId: "53482597366",
  appId: "1:53482597366:web:40d006e43a641ca79ff5d7",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export async function googleLogin() {
  const result = await signInWithPopup(auth, googleProvider);

  const user = result.user;
  const idToken = await user.getIdToken();

  return {
    user,
    idToken,
  };
}
