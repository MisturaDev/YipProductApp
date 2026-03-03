import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
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
import { useAppConfig } from "../context/AppConfigContext";
import {
  editProduct,
  removeProduct,
  selectProductById,
  selectProductsStatus,
} from "../features/products/productsSlice";
import { selectAuthUser } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetails">;

export const ProductDetailsScreen = ({ navigation, route }: Props) => {
  const dispatch = useAppDispatch();
  const config = useAppConfig();
  const status = useAppSelector(selectProductsStatus);
  const user = useAppSelector(selectAuthUser);
  const product = useAppSelector(selectProductById(route.params.productId));

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUri, setImageUri] = useState("");

  useEffect(() => {
    if (!product) {
      navigation.goBack();
      return;
    }
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setImageUri("");
  }, [navigation, product]);

  const submitting = status === "loading";
  const formValid = useMemo(() => {
    return (
      name.trim().length > 0 &&
      description.trim().length > 0 &&
      !Number.isNaN(Number(price)) &&
      Number(price) > 0
    );
  }, [name, description, price]);

  if (!product) {
    return null;
  }

  const canManage = !!user && user.uid === product.ownerId;

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

  const onSave = async () => {
    if (!canManage) {
      Alert.alert("Not allowed", "You can only edit your own product.");
      return;
    }

    if (!formValid) {
      Alert.alert("Invalid input", "Please complete all required fields.");
      return;
    }

    const result = await dispatch(
      editProduct({
        data: {
          id: product.id,
          name,
          description,
          price: Number(price),
          ...(imageUri ? { imageUri } : {}),
        },
        config,
      })
    );

    if (editProduct.rejected.match(result)) {
      Alert.alert("Update failed", String(result.payload ?? "Could not update product."));
      return;
    }

    setEditing(false);
    setImageUri("");
    Alert.alert("Updated", "Product details saved.");
  };

  const onDelete = () => {
    if (!canManage) {
      Alert.alert("Not allowed", "You can only delete your own product.");
      return;
    }

    Alert.alert("Delete product", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await dispatch(removeProduct({ id: product.id, config }));
          if (removeProduct.rejected.match(result)) {
            Alert.alert("Delete failed", String(result.payload ?? "Could not delete product."));
            return;
          }

          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUri || product.imageUrl }} style={styles.image} />

      {editing ? (
        <>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <Pressable style={styles.secondaryButton} onPress={pickImage}>
            <Text style={styles.secondaryText}>Change Image</Text>
          </Pressable>

          <View style={styles.row}>
            <Pressable
              onPress={() => {
                setEditing(false);
                setName(product.name);
                setDescription(product.description);
                setPrice(String(product.price));
                setImageUri("");
              }}
              style={[styles.actionButton, styles.cancelButton]}
              disabled={submitting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={!formValid || submitting}
              style={[
                styles.actionButton,
                styles.saveButton,
                (!formValid || submitting) && styles.disabled,
              ]}
            >
              <Text style={styles.saveText}>{submitting ? "Saving..." : "Save"}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <Text style={styles.timestamp}>Created: {product.createdAt}</Text>
          <Text style={styles.timestamp}>Owner: {product.ownerEmail ?? "Unknown"}</Text>

          {canManage ? (
            <>
              <Pressable
                style={[styles.actionButton, styles.saveButton, styles.editButton]}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.saveText}>Edit Product</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
                onPress={onDelete}
                disabled={submitting}
              >
                <Text style={styles.deleteText}>Delete Product</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.note}>
              You can view this product but only the owner can edit or delete it.
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flexGrow: 1,
    gap: 10,
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  description: {
    color: "#334155",
    fontSize: 15,
  },
  price: {
    fontWeight: "700",
    fontSize: 20,
    color: "#134e4a",
  },
  timestamp: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    color: "#334155",
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    marginTop: 4,
  },
  secondaryText: {
    color: "#0f766e",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#0f766e",
    flex: 1,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#94a3b8",
    backgroundColor: "#fff",
  },
  cancelText: {
    color: "#475569",
    fontWeight: "700",
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#b91c1c",
    backgroundColor: "#fff",
  },
  deleteText: {
    color: "#b91c1c",
    fontWeight: "700",
  },
  disabled: {
    backgroundColor: "#94a3b8",
  },
  editButton: {
    alignSelf: "flex-start",
    paddingVertical: 9,
    paddingHorizontal: 16,
    flex: 0,
  },
  note: {
    color: "#334155",
    fontSize: 14,
    marginTop: 8,
  },
});
