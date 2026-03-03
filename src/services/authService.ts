import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { FirebaseConfig } from "../types/product";
import { getFirebaseAuth } from "./firebase";

export const registerWithEmail = async (
  email: string,
  password: string,
  config: FirebaseConfig
) => {
  const auth = getFirebaseAuth(config);
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithEmail = async (
  email: string,
  password: string,
  config: FirebaseConfig
) => {
  const auth = getFirebaseAuth(config);
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutCurrentUser = async (config: FirebaseConfig) => {
  const auth = getFirebaseAuth(config);
  return signOut(auth);
};
