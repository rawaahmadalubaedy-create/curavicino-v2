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
import BasicInfo from "@/components/provider/BasicInfo";
import { styles } from "@/styles/providerRegister.styles";
import {
  Withdrawal,
  LANGUAGES,
  SERVICE_CATEGORIES,
  DAYS,
} from "@/constants/providerRegister.constants";
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
        keyboardShouldPersistTaps="handled">
      <BasicInfo     
  styles={styles}
  colors={colors}
  t={t}
  fullName={fullName}
  setFullName={setFullName}
  age={age}
  setAge={setAge}
  phone={phone}
  setPhone={setPhone}
  email={email}
  setEmail={setEmail}
  address={address}
  setAddress={setAddress}
/>
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

