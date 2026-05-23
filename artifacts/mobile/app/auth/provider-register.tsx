import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

type Withdrawal = "daily" | "weekly" | "monthly";

export default function ProviderRegisterScreen() {
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { registerProvider } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [withdrawal, setWithdrawal] = useState<Withdrawal>("weekly");
  const [uploads, setUploads] = useState<Record<string, boolean>>({
    id: false,
    medical: false,
    criminal: false,
    photo: false,
  });
  const [loading, setLoading] = useState(false);

  const handleUpload = async (key: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled) {
      setUploads((prev) => ({ ...prev, [key]: true }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !phone) {
      Alert.alert("", t("required"));
      return;
    }
    setLoading(true);
    try {
      await registerProvider({ fullName, phone, email, withdrawalPreference: withdrawal });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("", t("providerVerification"), [
        { text: "OK", onPress: () => router.replace("/(tabs)/home") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const UploadRow = ({
    docKey,
    label,
    icon,
  }: {
    docKey: string;
    label: string;
    icon: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.uploadRow,
        {
          borderColor: uploads[docKey] ? colors.primary : colors.border,
          backgroundColor: uploads[docKey] ? colors.lightGreen : colors.surface,
        },
      ]}
      onPress={() => handleUpload(docKey)}
      activeOpacity={0.8}
    >
      <View style={[styles.uploadIcon, { backgroundColor: uploads[docKey] ? colors.primary : colors.muted }]}>
        <Feather name={icon as any} size={18} color={uploads[docKey] ? "#fff" : colors.subText} />
      </View>
      <Text style={[styles.uploadLabel, { color: colors.darkText }]}>{label}</Text>
      <View style={[styles.uploadStatus, { backgroundColor: uploads[docKey] ? colors.primary : "#f0f0f0" }]}>
        <Feather
          name={uploads[docKey] ? "check" : "upload"}
          size={14}
          color={uploads[docKey] ? "#fff" : colors.subText}
        />
        <Text style={[styles.uploadStatusText, { color: uploads[docKey] ? "#fff" : colors.subText }]}>
          {uploads[docKey] ? t("uploaded") : t("tapToUpload")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.red }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("serviceProvider")} {t("register")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.darkText }]}>{t("fullName")}</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Feather name="user" size={18} color={colors.subText} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.darkText }]}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t("fullName")}
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.darkText }]}>{t("phone")}</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Feather name="phone" size={18} color={colors.subText} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.darkText }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+39 000 000 0000"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.darkText }]}>{t("email")}</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Feather name="mail" size={18} color={colors.subText} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.darkText }]}
              value={email}
              onChangeText={setEmail}
              placeholder={t("email")}
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.darkText }]}>Documents</Text>

        <UploadRow docKey="id" label={t("uploadId")} icon="credit-card" />
        <UploadRow docKey="medical" label={t("uploadMedical")} icon="activity" />
        <UploadRow docKey="criminal" label={t("uploadCriminal")} icon="shield" />
        <UploadRow docKey="photo" label={t("uploadPhoto")} icon="camera" />

        <Text style={[styles.sectionTitle, { color: colors.darkText }]}>{t("linkBanking")}</Text>
        <TouchableOpacity
          style={[styles.bankingBtn, { borderColor: colors.primary, backgroundColor: colors.lightGreen }]}
          activeOpacity={0.8}
        >
          <Feather name="credit-card" size={20} color={colors.primary} />
          <Text style={[styles.bankingBtnText, { color: colors.primary }]}>{t("linkBanking")}</Text>
          <Feather name="chevron-right" size={18} color={colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.darkText }]}>{t("withdrawal")}</Text>
        <View style={styles.withdrawalRow}>
          {(["daily", "weekly", "monthly"] as Withdrawal[]).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.withdrawalBtn,
                {
                  backgroundColor: withdrawal === opt ? colors.primary : "#f0f0f0",
                  borderColor: withdrawal === opt ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setWithdrawal(opt)}
            >
              <Text style={[styles.withdrawalTxt, { color: withdrawal === opt ? "#fff" : colors.subText }]}>
                {t(opt)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.red }, loading && styles.disabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>{loading ? "..." : t("register")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#ffffff" },
  scroll: { paddingHorizontal: 24, paddingTop: 24 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12, marginTop: 8 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  uploadStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  uploadStatusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  bankingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  bankingBtnText: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  withdrawalRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  withdrawalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawalTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  submitBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#CE2B37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#ffffff" },
  disabled: { opacity: 0.6 },
});
