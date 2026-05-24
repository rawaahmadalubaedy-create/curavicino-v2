import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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
    } catch {
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (method: "google" | "facebook") => {
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
      <LinearGradient
        colors={["#009246", "#007a3a", colors.background]}
        locations={[0, 0.55, 1]}
        style={[styles.headerGrad, { paddingTop: insets.top + 24 }]}
      >
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>
        <Text style={styles.appName}>CuraVicino</Text>
        <Text style={styles.slogan}>{t("appSlogan")}</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.heading, { color: colors.darkText }]}>{t("signIn")}</Text>

          <View style={[styles.modeToggle, { backgroundColor: colors.muted }]}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === "email" && { backgroundColor: colors.primary }]}
              onPress={() => setMode("email")}
            >
              <Text style={[styles.modeTxt, { color: mode === "email" ? "#fff" : colors.subText }]}>
                {t("email")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === "phone" && { backgroundColor: colors.primary }]}
              onPress={() => setMode("phone")}
            >
              <Text style={[styles.modeTxt, { color: mode === "phone" ? "#fff" : colors.subText }]}>
                {t("phone")}
              </Text>
            </TouchableOpacity>
          </View>

          {mode === "email" ? (
            <>
              <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Feather name="mail" size={18} color={colors.subText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.darkText }]}
                  placeholder={t("email")}
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Feather name="lock" size={18} color={colors.subText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.darkText }]}
                  placeholder={t("password")}
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Feather name={showPass ? "eye-off" : "eye"} size={18} color={colors.subText} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotWrap}>
                <Text style={[styles.forgot, { color: colors.primary }]}>{t("forgotPassword")}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Feather name="phone" size={18} color={colors.subText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.darkText }]}
                placeholder="+39 000 000 0000"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }, loading && styles.disabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.loginBtnText}>{t("signIn")}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.subText }]}>{t("orEmail")}</Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => handleSocial("google")}
              activeOpacity={0.8}
              disabled={loading}
            >
              <View style={[styles.socialIconBg, { backgroundColor: "#DB4437" + "18" }]}>
                <Feather name="globe" size={17} color="#DB4437" />
              </View>
              <Text style={[styles.socialText, { color: colors.darkText }]}>{t("google")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => handleSocial("facebook")}
              activeOpacity={0.8}
              disabled={loading}
            >
              <View style={[styles.socialIconBg, { backgroundColor: "#1877F2" + "18" }]}>
                <Feather name="facebook" size={17} color="#1877F2" />
              </View>
              <Text style={[styles.socialText, { color: colors.darkText }]}>{t("facebook")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerRow}>
            <Text style={[styles.registerNote, { color: colors.subText }]}>{t("noAccount")} </Text>
            <TouchableOpacity onPress={() => router.push("/auth/register-type")}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>{t("signUp")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  headerGrad: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: "center",
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  logoImage: { width: 80, height: 80 },
  appName: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  slogan: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.88)",
    letterSpacing: 0.2,
  },
  scroll: { paddingHorizontal: 24, paddingTop: 28 },
  heading: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 20 },
  modeToggle: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  modeTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  eyeBtn: { padding: 4 },
  forgotWrap: { alignItems: "flex-end", marginBottom: 20 },
  forgot: { fontSize: 13, fontFamily: "Inter_500Medium" },
  loginBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#009246",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#ffffff" },
  disabled: { opacity: 0.65 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 10 },
  line: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  socialRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  socialIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  registerRow: { flexDirection: "row", justifyContent: "center" },
  registerNote: { fontSize: 14, fontFamily: "Inter_400Regular" },
  registerLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
