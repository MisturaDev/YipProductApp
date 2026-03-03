import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MAX_PRODUCTS } from "../constants/limits";
import {
  clearProductsError,
  selectProductsCount,
  selectProductsStatus,
  uploadProduct,
} from "../features/products/productsSlice";
import { useAppConfig } from "../context/AppConfigContext";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ProductUpload">;

export const ProductUploadScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const config = useAppConfig();
  const count = useAppSelector(selectProductsCount);
  const status = useAppSelector(selectProductsStatus);
  const canUpload = count < MAX_PRODUCTS;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUri, setImageUri] = useState("");

  const submitting = status === "loading";

  const formValid = useMemo(() => {
    return (
      name.trim().length > 0 &&
      description.trim().length > 0 &&
      !Number.isNaN(Number(price)) &&
      Number(price) > 0 &&
      !!imageUri
    );
  }, [name, description, price, imageUri]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow gallery permission.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onSubmit = async () => {
    if (!canUpload) {
      Alert.alert(
        "Limit reached",
        `You can upload a maximum of ${MAX_PRODUCTS} products.`
      );
      return;
    }

    const result = await dispatch(
      uploadProduct({
        data: {
          name,
          description,
          price: Number(price),
          imageUri,
        },
        config,
      })
    );

    if (uploadProduct.fulfilled.match(result)) {
      Alert.alert("Success", "Product uploaded successfully.");
      dispatch(clearProductsError());
      navigation.goBack();
      return;
    }

    const message = result.payload ?? "Could not upload product.";
    Alert.alert("Upload failed", String(message));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Product Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Leather Bag"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Short description"
        multiline
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="e.g. 45"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Image</Text>
      <Pressable style={styles.secondaryButton} onPress={pickImage}>
        <Text style={styles.secondaryText}>Choose Image</Text>
      </Pressable>

      {!!imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      <View style={styles.spacer} />

      <Pressable
        disabled={!formValid || !canUpload || submitting}
        onPress={onSubmit}
        style={[
          styles.primaryButton,
          (!formValid || !canUpload || submitting) && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.primaryText}>
          {submitting ? "Uploading..." : "Upload Product"}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#0f766e",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryText: {
    color: "#0f766e",
    fontWeight: "700",
  },
  preview: {
    width: "100%",
    height: 220,
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  primaryButton: {
    backgroundColor: "#0f766e",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
  },
  primaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
