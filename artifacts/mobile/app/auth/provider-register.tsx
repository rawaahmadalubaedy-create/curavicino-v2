import { Feather } from
  "@expo/vector-icons";
import { shadow } from "@/utils/shadow";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
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

const LANGUAGES = ["Italian", "English", "French", "German", "Spanish", "Arabic"];
const SERVICE_CATEGORIES = [
  { id: "elderly-care", label: "Medical Care", icon: "activity" },
  { id: "delivery", label: "Delivery & Shopping", icon: "package" },
  { id: "home-services", label: "Home Services", icon: "home" },
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ─────────────────────────────────────────────────────────────────────────────
   InputField — hoisted to MODULE scope so its identity is stable across renders.
   Defining it inside the screen function would create a new component type on
   every render, causing React to unmount/remount the TextInput and lose focus.
───────────────────────────────────────────────────────────────────────────── */
function InputField({
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
}) {
  const colors = useColors();
  return (
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
}

/* ─────────────────────────────────────────────────────────────────────────────
   UploadRow — also hoisted to MODULE scope for the same reason.
───────────────────────────────────────────────────────────────────────────── */
function UploadRow({
  label,
  icon,
  uploaded,
  onUpload,
}: {
  label: string;
  icon: string;
  uploaded: boolean;
  onUpload: () => void;
}) {
  const colors = useColors();
  const { t } = useLang();
  return (
    <TouchableOpacity
      style={[
        styles.uploadRow,
        {
          borderColor: uploaded ? colors.primary : colors.border,
          backgroundColor: uploaded ? colors.lightGreen : colors.surface,
        },
      ]}
      onPress={onUpload}
      activeOpacity={0.8}
    >
      <View style={[styles.uploadIcon, { backgroundColor: uploaded ? colors.primary : colors.muted }]}>
        <Feather name={icon as any} size={18} color={uploaded ? "#fff" : colors.subText} />
      </View>
      <Text style={[styles.uploadLabel, { color: colors.darkText }]}>{label}</Text>
      <View style={[styles.uploadStatus, { backgroundColor: uploaded ? colors.primary : "#f0f0f0" }]}>
        <Feather name={uploaded ? "check" : "upload"} size={14} color={uploaded ? "#fff" : colors.subText} />
        <Text style={[styles.uploadStatusText, { color: uploaded ? "#fff" : colors.subText }]}>
          {uploaded ? t("uploaded") : t("tapToUpload")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Screen
───────────────────────────────────────────────────────────────────────────── */
export default function ProviderRegisterScreen() {
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { registerProvider } = useAuth();

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Italian"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [workingDays, setWorkingDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [hoursFrom, setHoursFrom] = useState("08:00");
  const [hoursTo, setHoursTo] = useState("18:00");
  const [isOnline, setIsOnline] = useState(true);

  const [uploads, setUploads] = useState<Record<string, boolean>>({
    id: false,
    medical: false,
    criminal: false,
    photo: false,
  });
  const [withdrawal, setWithdrawal] = useState<Withdrawal>("weekly");
  const [loading, setLoading] = useState(false);

  const toggleItem = (arr: string[], item: string, setArr: (v: string[]) => void) => {
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

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
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!fullName || !phone) {
      Alert.alert("", t("required"));
      return;
    }
    if (selectedCategories.length === 0) {
      Alert.alert("", t("selectCategoryRequired"));
      return;
    }
    setLoading(true);
    try {
      await registerProvider({
        fullName,
        phone,
        email,
        address,
        withdrawalPreference: withdrawal,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("", t("providerVerification"), [
        { text: "OK", onPress: () => router.replace("/(tabs)/home") },
      ]);
    } catch (e: any) {
      Alert.alert("", e?.status ? t("registerFailed") : t("connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.red }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("providerRegistration")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── STEP 1: Basic Info ── */}
          {/* ── STEP 2: Languages ── */}
        <View style={[styles.stepBadge, { backgroundColor: colors.red + "18", marginTop: 8 }]}>
          <Text style={[styles.stepBadgeText, { color: colors.red }]}>2 — {t("languagesSpoken")}</Text>
        </View>
        <View style={styles.chipRow}>
          {LANGUAGES.map((lang) => {
            const active = selectedLanguages.includes(lang);
            return (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.red : colors.surface,
                    borderColor: active ? colors.red : colors.border,
                  },
                ]}
                onPress={() => toggleItem(selectedLanguages, lang, setSelectedLanguages)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: active ? "#fff" : colors.darkText }]}>{lang}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── STEP 3: Service Categories ── */}
        <View style={[styles.stepBadge, { backgroundColor: colors.red + "18", marginTop: 8 }]}>
          <Text style={[styles.stepBadgeText, { color: colors.red }]}>3 — {t("serviceCategories")}</Text>
        </View>
        <Text style={[styles.helperText, { color: colors.subText }]}>{t("selectAllThatApply")}</Text>
        {SERVICE_CATEGORIES.map((cat) => {
          const active = selectedCategories.includes(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                {
                  borderColor: active ? colors.red : colors.border,
                  backgroundColor: active ? colors.red + "12" : colors.surface,
                },
              ]}
              onPress={() => toggleItem(selectedCategories, cat.id, setSelectedCategories)}
              activeOpacity={0.85}
            >
              <View style={[styles.catIconBox, { backgroundColor: active ? colors.red : colors.muted }]}>
                <Feather name={cat.icon as any} size={20} color={active ? "#fff" : colors.subText} />
              </View>
              <Text style={[styles.catLabel, { color: active ? colors.red : colors.darkText }]}>
                {cat.label}
              </Text>
              {active && <Feather name="check-circle" size={20} color={colors.red} />}
            </TouchableOpacity>
          );
        })}

        {/* ── STEP 4: Availability ── */}
        <View style={[styles.stepBadge, { backgroundColor: colors.red + "18", marginTop: 8 }]}>
          <Text style={[styles.stepBadgeText, { color: colors.red }]}>4 — {t("availabilitySetup")}</Text>
        </View>

        <View style={[styles.availRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.availRowLeft}>
            <View style={[styles.availDot, { backgroundColor: isOnline ? "#009246" : "#999" }]} />
            <Text style={[styles.availLabel, { color: colors.darkText }]}>
              {isOnline ? t("availableOnline") : t("setOffline")}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: "#ccc", true: colors.primary + "88" }}
            thumbColor={isOnline ? colors.primary : "#f0f0f0"}
          />
        </View>

        <Text style={[styles.subLabel, { color: colors.darkText }]}>{t("workingDays")}</Text>
        <View style={styles.daysRow}>
          {DAYS.map((day) => {
            const active = workingDays.includes(day);
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleItem(workingDays, day, setWorkingDays)}
              >
                <Text style={[styles.dayTxt, { color: active ? "#fff" : colors.subText }]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.subLabel, { color: colors.darkText }]}>{t("workingHours")}</Text>
        <View style={styles.hoursRow}>
          <View style={styles.hourBlock}>
            <Text style={[styles.hourLabel, { color: colors.subText }]}>{t("from")}</Text>
            <View style={[styles.hourInput, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Feather name="clock" size={16} color={colors.primary} />
              <TextInput
                style={[styles.hourText, { color: colors.darkText }]}
                value={hoursFrom}
                onChangeText={setHoursFrom}
                placeholder="08:00"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          <Feather name="arrow-right" size={18} color={colors.subText} style={styles.arrowIcon} />
          <View style={styles.hourBlock}>
            <Text style={[styles.hourLabel, { color: colors.subText }]}>{t("to")}</Text>
            <View style={[styles.hourInput, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Feather name="clock" size={16} color={colors.primary} />
              <TextInput
                style={[styles.hourText, { color: colors.darkText }]}
                value={hoursTo}
                onChangeText={setHoursTo}
                placeholder="18:00"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </View>

        {/* ── STEP 5: Documents ── */}
        <View style={[styles.stepBadge, { backgroundColor: colors.red + "18", marginTop: 8 }]}>
          <Text style={[styles.stepBadgeText, { color: colors.red }]}>5 — {t("verificationDocs")}</Text>
        </View>

        <UploadRow
          label={t("uploadId")}
          icon="credit-card"
          uploaded={uploads.id}
          onUpload={() => handleUpload("id")}
        />
        <UploadRow
          label={t("uploadMedical")}
          icon="activity"
          uploaded={uploads.medical}
          onUpload={() => handleUpload("medical")}
        />
        <UploadRow
          label={t("uploadCriminal")}
          icon="shield"
          uploaded={uploads.criminal}
          onUpload={() => handleUpload("criminal")}
        />
        <UploadRow
          label={t("uploadPhoto")}
          icon="camera"
          uploaded={uploads.photo}
          onUpload={() => handleUpload("photo")}
        />

        {/* Banking */}
        <Text style={[styles.subLabel, { color: colors.darkText }]}>{t("linkBanking")}</Text>
        <TouchableOpacity
          style={[styles.bankingBtn, { borderColor: colors.primary, backgroundColor: colors.lightGreen }]}
          activeOpacity={0.8}
        >
          <Feather name="credit-card" size={20} color={colors.primary} />
          <Text style={[styles.bankingBtnText, { color: colors.primary }]}>{t("linkBanking")}</Text>
          <Feather name="chevron-right" size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Withdrawal preference */}
        <Text style={[styles.subLabel, { color: colors.darkText }]}>{t("withdrawal")}</Text>
        <View style={styles.withdrawalRow}>
          {(["daily", "weekly", "monthly"] as Withdrawal[]).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.withdrawalBtn,
                {
                  backgroundColor: withdrawal === opt ? colors.primary : colors.surface,
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

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.red }, loading && styles.disabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>{t("register")}</Text>
          )}
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
  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  stepBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  stepBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },

  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  subLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10, marginTop: 4 },
  helperText: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 10, marginTop: -4 },
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

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  catIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  catLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },

  availRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  availRowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  availDot: { width: 10, height: 10, borderRadius: 5 },
  availLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  daysRow: { flexDirection: "row", gap: 6, marginBottom: 16, flexWrap: "wrap" },
  dayBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  dayTxt: { fontSize: 11, fontFamily: "Inter_700Bold" },

  hoursRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  hourBlock: { flex: 1 },
  hourLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  hourInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  hourText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  arrowIcon: { marginTop: 20 },

  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  uploadIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
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
    marginBottom: 16,
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
    ...shadow("#CE2B37", 0.3, 8, 4, 5),
  },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#ffffff" },
  disabled: { opacity: 0.6 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12, marginTop: 8 },
});
