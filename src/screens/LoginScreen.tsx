import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppConfig } from "../context/AppConfigContext";
import { clearAuthError, loginUser, selectAuthStatus } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export const LoginScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const config = useAppConfig();
  const status = useAppSelector(selectAuthStatus);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitting = status === "loading";
  const canSubmit = email.trim().length > 4 && password.length >= 6 && !submitting;

  const onLogin = async () => {
    const result = await dispatch(loginUser({ email, password, config }));
    if (loginUser.rejected.match(result)) {
      const message = result.payload ?? "Login failed.";
      Alert.alert("Login failed", String(message));
      return;
    }

    dispatch(clearAuthError());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.primaryButton, !canSubmit && styles.disabled]}
        onPress={onLogin}
        disabled={!canSubmit}
      >
        <Text style={styles.primaryText}>{submitting ? "Signing in..." : "Login"}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>No account? Register</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  disabled: {
    backgroundColor: "#94a3b8",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  link: {
    textAlign: "center",
    marginTop: 8,
    color: "#0f766e",
    fontWeight: "600",
  },
});
