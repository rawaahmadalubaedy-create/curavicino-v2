import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle, loginWithFacebook, loginWithPhone } = useAuth();

  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (mode === "email" && !email) {
      Alert.alert("", t("required"));
      return;
    }

    setLoading(true);

    try {
      if (mode === "email") await login(email, password);
      else await loginWithPhone(phone);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/home");
    } catch (e) {
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (method: "google" | "facebook") => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setLoading(true);

    try {
      if (method === "google") await loginWithGoogle();
      else await loginWithFacebook();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/home");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER ثابت بدون LinearGradient */}
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View style={styles.logo}>
          <Feather name="heart" size={34} color="#fff" />
        </View>

        <Text style={styles.title}>CuraVicino</Text>
        <Text style={styles.subtitle}>{t("appSlogan")}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 24,
            paddingBottom: insets.bottom + 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.heading, { color: colors.darkText }]}>
            {t("signIn")}
          </Text>

          {/* MODE SWITCH */}
          <View style={[styles.switch, { backgroundColor: colors.muted }]}>
            <TouchableOpacity
              style={[
                styles.switchBtn,
                mode === "email" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setMode("email")}
            >
              <Text
                style={{
                  color: mode === "email" ? "#fff" : colors.subText,
                }}
              >
                {t("email")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.switchBtn,
                mode === "phone" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setMode("phone")}
            >
              <Text
                style={{
                  color: mode === "phone" ? "#fff" : colors.subText,
                }}
              >
                {t("phone")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* INPUTS */}
          {mode === "email" ? (
            <>
              <TextInput
                style={[styles.input, { borderColor: colors.border }]}
                placeholder={t("email")}
                value={email}
                onChangeText={setEmail}
              />

              <TextInput
                style={[styles.input, { borderColor: colors.border }]}
                placeholder={t("password")}
                value={password}
                secureTextEntry={!showPass}
                onChangeText={setPassword}
              />
            </>
          ) : (
            <TextInput
              style={[styles.input, { borderColor: colors.border }]}
              placeholder="+39..."
              value={phone}
              onChangeText={setPhone}
            />
          )}

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {t("signIn")}
              </Text>
            )}
          </TouchableOpacity>

          {/* SOCIAL */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.social}
              onPress={() => handleSocial("google")}
              disabled={loading}
            >
              <Feather name="globe" size={18} />
              <Text>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.social}
              onPress={() => handleSocial("facebook")}
              disabled={loading}
            >
              <Feather name="facebook" size={18} />
              <Text>Facebook</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    backgroundColor: "#009246",
    alignItems: "center",
    paddingBottom: 30,
  },

  logo: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  title: { color: "#fff", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#fff", fontSize: 13 },

  heading: { fontSize: 22, marginBottom: 20, fontWeight: "700" },

  switch: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },

  switchBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  btn: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  social: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
  },
});