import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppConfig } from "../context/AppConfigContext";
import {
  clearAuthError,
  registerUser,
  selectAuthStatus,
} from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export const RegisterScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const config = useAppConfig();
  const status = useAppSelector(selectAuthStatus);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submitting = status === "loading";
  const passwordMatch = password.length > 0 && password === confirmPassword;
  const canSubmit =
    email.trim().length > 4 && password.length >= 6 && passwordMatch && !submitting;

  const onRegister = async () => {
    if (!passwordMatch) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    const result = await dispatch(registerUser({ email, password, config }));
    if (registerUser.rejected.match(result)) {
      const message = result.payload ?? "Registration failed.";
      Alert.alert("Registration failed", String(message));
      return;
    }

    dispatch(clearAuthError());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Register to start uploading products</Text>

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
        placeholder="Password (min 6 chars)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Pressable
        style={[styles.primaryButton, !canSubmit && styles.disabled]}
        onPress={onRegister}
        disabled={!canSubmit}
      >
        <Text style={styles.primaryText}>
          {submitting ? "Creating..." : "Register"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
