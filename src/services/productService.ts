import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  AppConfig,
  Product,
  ProductInput,
  ProductUpdateInput,
} from "../types/product";
import { uploadImageToCloudinary } from "./cloudinary";
import { getFirestoreDb } from "./firebase";

export const createProduct = async (
  input: ProductInput,
  config: AppConfig,
  owner: { uid: string; email: string | null }
): Promise<Product> => {
  const { imageUrl } = await uploadImageToCloudinary(
    input.imageUri,
    config.cloudinary.cloudName,
    config.cloudinary.uploadPreset
  );

  const createdAt = new Date().toISOString();
  const payload = {
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
    imageUrl,
    createdAt,
    ownerId: owner.uid,
    ownerEmail: owner.email,
  };

  const db = getFirestoreDb(config.firebase);
  const ref = await addDoc(collection(db, "products"), payload);

  return {
    id: ref.id,
    ...payload,
  };
};

export const updateProduct = async (
  input: ProductUpdateInput,
  config: AppConfig
): Promise<{
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}> => {
  const db = getFirestoreDb(config.firebase);
  const productRef = doc(db, "products", input.id);

  let nextImageUrl: string | undefined;
  if (input.imageUri) {
    const uploaded = await uploadImageToCloudinary(
      input.imageUri,
      config.cloudinary.cloudName,
      config.cloudinary.uploadPreset
    );
    nextImageUrl = uploaded.imageUrl;
  }

  const payload = {
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
    ...(nextImageUrl ? { imageUrl: nextImageUrl } : {}),
  };

  await updateDoc(productRef, payload);

  return {
    id: input.id,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    ...(nextImageUrl ? { imageUrl: nextImageUrl } : {}),
  };
};

export const deleteProduct = async (id: string, config: AppConfig) => {
  const db = getFirestoreDb(config.firebase);
  const productRef = doc(db, "products", id);
  await deleteDoc(productRef);
};

export const getProductsByOwner = async (
  ownerId: string,
  config: AppConfig
): Promise<Product[]> => {
  const db = getFirestoreDb(config.firebase);
  const q = query(collection(db, "products"), where("ownerId", "==", ownerId));
  const snap = await getDocs(q);

  const products: Product[] = snap.docs.map((item) => {
    const data = item.data() as Omit<Product, "id">;
    return {
      id: item.id,
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      createdAt: data.createdAt,
      ownerId: data.ownerId,
      ownerEmail: data.ownerEmail ?? null,
    };
  });

  return products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};
