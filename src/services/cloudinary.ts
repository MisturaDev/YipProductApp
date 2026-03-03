import axios from "axios";

type UploadResult = {
  secure_url: string;
  public_id: string;
};

const isMissing = (value: string) => !value || value.includes("YOUR_");

export const uploadImageToCloudinary = async (
  imageUri: string,
  cloudName: string,
  uploadPreset: string
) => {
  if (isMissing(cloudName) || isMissing(uploadPreset)) {
    throw new Error(
      "Missing Cloudinary config. Set EXPO_PUBLIC_CLOUDINARY_* values first."
    );
  }

  const formData = new FormData();
  formData.append(
    "file",
    {
      uri: imageUri,
      type: "image/jpeg",
      name: `product-${Date.now()}.jpg`,
    } as any
  );
  formData.append("upload_preset", uploadPreset);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const response = await axios.post<UploadResult>(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    imageUrl: response.data.secure_url,
    publicId: response.data.public_id,
  };
};
