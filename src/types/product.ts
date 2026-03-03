export type ProductInput = {
  name: string;
  description: string;
  price: number;
  imageUri: string;
};

export type ProductUpdateInput = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUri?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: string;
  ownerId: string;
  ownerEmail: string | null;
};

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export type CloudinaryConfig = {
  cloudName: string;
  uploadPreset: string;
};

export type AppConfig = {
  firebase: FirebaseConfig;
  cloudinary: CloudinaryConfig;
};
