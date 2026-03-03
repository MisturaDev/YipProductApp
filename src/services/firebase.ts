import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import type { FirebaseConfig } from "../types/product";

const isMissing = (value: string) => !value || value.includes("YOUR_");

export const validateFirebaseConfig = (config: FirebaseConfig) => {
  const values = Object.values(config);
  if (values.some(isMissing)) {
    throw new Error(
      "Missing Firebase config. Set EXPO_PUBLIC_FIREBASE_* values first."
    );
  }
};

export const getFirebaseApp = (config: FirebaseConfig): FirebaseApp => {
  if (getApps().length > 0) {
    return getApp();
  }
  validateFirebaseConfig(config);
  return initializeApp(config);
};

let authInstance: Auth | null = null;

export const getFirebaseAuth = (config: FirebaseConfig): Auth => {
  if (authInstance) {
    return authInstance;
  }

  const app = getFirebaseApp(config);
  authInstance = getAuth(app);

  return authInstance;
};

export const getFirestoreDb = (config: FirebaseConfig): Firestore => {
  const app = getFirebaseApp(config);
  return getFirestore(app);
};
