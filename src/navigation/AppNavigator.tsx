import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { clearProducts, fetchUserProducts } from "../features/products/productsSlice";
import { useAppConfig } from "../context/AppConfigContext";
import {
  selectAuthInitializing,
  selectAuthUser,
  setAuthUser,
} from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { getFirebaseAuth } from "../services/firebase";
import { LoginScreen } from "../screens/LoginScreen";
import { ProductDetailsScreen } from "../screens/ProductDetailsScreen";
import { ProductListScreen } from "../screens/ProductListScreen";
import { ProductUploadScreen } from "../screens/ProductUploadScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const config = useAppConfig();
  const user = useAppSelector(selectAuthUser);
  const initializing = useAppSelector(selectAuthInitializing);

  useEffect(() => {
    const auth = getFirebaseAuth(config.firebase);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      dispatch(
        setAuthUser(
          firebaseUser
            ? {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
              }
            : null
        )
      );
    });

    return unsubscribe;
  }, [config.firebase, dispatch]);

  useEffect(() => {
    if (!user) {
      dispatch(clearProducts());
      return;
    }

    dispatch(fetchUserProducts({ config }));
  }, [config, dispatch, user]);

  if (initializing) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.loadingText}>Checking session...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="ProductList"
              component={ProductListScreen}
              options={{ title: "Products" }}
            />
            <Stack.Screen
              name="ProductUpload"
              component={ProductUploadScreen}
              options={{ title: "Upload Product" }}
            />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={{ title: "Product Details" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: "Login" }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Register" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    color: "#334155",
    fontWeight: "600",
  },
});
