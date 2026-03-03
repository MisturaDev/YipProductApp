import React, { createContext, PropsWithChildren, useContext } from "react";
import type { AppConfig } from "../types/product";

const env = ((globalThis as any)?.process?.env ?? {}) as Record<string, string>;

const defaultConfig: AppConfig = {
  firebase: {
    apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "YOUR_FIREBASE_API_KEY",
    authDomain:
      env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "YOUR_FIREBASE_PROJECT_ID",
    storageBucket:
      env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId:
      env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
      "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "YOUR_FIREBASE_APP_ID",
  },
  cloudinary: {
    cloudName: env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "YOUR_CLOUD_NAME",
    uploadPreset:
      env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "YOUR_UPLOAD_PRESET",
  },
};

const AppConfigContext = createContext<AppConfig>(defaultConfig);

export const AppConfigProvider = ({ children }: PropsWithChildren) => {
  return (
    <AppConfigContext.Provider value={defaultConfig}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);
