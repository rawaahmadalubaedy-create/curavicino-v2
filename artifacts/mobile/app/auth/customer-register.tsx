import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

export default function CustomerRegisterScreen() {
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { registerCustomer } = useAuth();

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [forFamily, setForFamily] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !phone || !address) {
      Alert.alert("", t("required"));
      return;
    }
    setLoading(true);
    try {
      await registerCustomer({
        fullName,
        age: parseInt(age),
        address,
        phone,
        email,
        forFamilyMember: forFamily,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("", t("registerSuccess"), [
        { text: "OK", onPress: () => router.replace("/(tabs)/home") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    label,
    value,
    onChange,
    icon,
    keyboard = "default",
    placeholder = "",
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    icon: string;
    keyboard?: any;
    placeholder?: string;
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.darkText }]}>{label}</Text>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Feather name={icon as any} size={18} color={colors.subText} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.darkText }]}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard}
          placeholder={placeholder || label}
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize={keyboard === "email-address" ? "none" : "words"}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("customer")} {t("register")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <InputField label={t("fullName")} value={fullName} onChange={setFullName} icon="user" />
        <InputField label={t("age")} value={age} onChange={setAge} icon="calendar" keyboard="numeric" />
        <InputField label={t("address")} value={address} onChange={setAddress} icon="map-pin" />
        <InputField label={t("phone")} value={phone} onChange={setPhone} icon="phone" keyboard="phone-pad" placeholder="+39 000 000 0000" />
        <InputField label={t("email")} value={email} onChange={setEmail} icon="mail" keyboard="email-address" />

        <Text style={[styles.label, { color: colors.darkText, marginBottom: 10 }]}>{t("forWhom")}</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !forFamily && { backgroundColor: colors.primary }]}
            onPress={() => setForFamily(false)}
          >
            <Feather name="user" size={16} color={!forFamily ? "#fff" : colors.subText} />
            <Text style={[styles.toggleTxt, { color: !forFamily ? "#fff" : colors.subText }]}>
              {t("myself")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, forFamily && { backgroundColor: colors.primary }]}
            onPress={() => setForFamily(true)}
          >
            <Feather name="users" size={16} color={forFamily ? "#fff" : colors.subText} />
            <Text style={[styles.toggleTxt, { color: forFamily ? "#fff" : colors.subText }]}>
              {t("familyMember")}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }, loading && styles.disabled]}
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
  toggleRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#f0f0f0",
  },
  toggleTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  submitBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#009246",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#ffffff" },
  disabled: { opacity: 0.6 },
});
