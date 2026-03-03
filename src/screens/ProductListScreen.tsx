import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ProductCard } from "../components/ProductCard";
import { LimitBanner } from "../components/LimitBanner";
import { MAX_PRODUCTS } from "../constants/limits";
import { useAppConfig } from "../context/AppConfigContext";
import { logoutUser, selectAuthStatus, selectAuthUser } from "../features/auth/authSlice";
import {
  selectProducts,
  selectProductsCount,
  selectUploadLimitReached,
} from "../features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ProductList">;

export const ProductListScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const config = useAppConfig();
  const user = useAppSelector(selectAuthUser);
  const authStatus = useAppSelector(selectAuthStatus);
  const products = useAppSelector(selectProducts);
  const count = useAppSelector(selectProductsCount);
  const limitReached = useAppSelector(selectUploadLimitReached);
  const signingOut = authStatus === "loading";

  const onLogout = async () => {
    const result = await dispatch(logoutUser({ config }));
    if (logoutUser.rejected.match(result)) {
      const message = result.payload ?? "Logout failed.";
      Alert.alert("Logout failed", String(message));
    }
  };

  return (
    <View style={styles.container}>
      <LimitBanner reached={limitReached} maxProducts={MAX_PRODUCTS} />
      <View style={styles.userRow}>
        <Text style={styles.userEmail}>{user?.email ?? "Signed in"}</Text>
        <Pressable
          onPress={onLogout}
          disabled={signingOut}
          style={[styles.logoutButton, signingOut && styles.logoutDisabled]}
        >
          <Text style={styles.logoutText}>{signingOut ? "..." : "Logout"}</Text>
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.meta}>
          Uploaded: {count}/{MAX_PRODUCTS}
        </Text>
        <Pressable
          disabled={limitReached}
          onPress={() => navigation.navigate("ProductUpload")}
          style={[styles.button, limitReached && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Add Product</Text>
        </Pressable>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}>
            <ProductCard product={item} />
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No products yet. Add your first product.</Text>
        }
        contentContainerStyle={products.length === 0 ? styles.emptyWrap : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  header: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: {
    fontSize: 15,
    fontWeight: "600",
  },
  userRow: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userEmail: {
    color: "#334155",
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#0f766e",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  logoutDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: "#0f766e",
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#0f766e",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyWrap: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    textAlign: "center",
    color: "#475569",
    fontSize: 15,
  },
});
