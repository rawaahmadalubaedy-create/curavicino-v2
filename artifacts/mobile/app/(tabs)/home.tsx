import { Feather } from "@expo/vector-icons";
import { shadow } from "@/utils/shadow";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
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

const { width } = Dimensions.get("window");

const CATEGORIES = [
  {
    id: "elderly-care",
    titleKey: "elderlyCare" as const,
    subtitleKey: "elderlyDesc" as const,
    feeKey: "serviceFeeMedical" as const,
    image: require("@/assets/images/elderly_care.png"),
    accent: "#009246",
    icon: "heart" as const,
  },
  {
    id: "delivery",
    titleKey: "delivery" as const,
    subtitleKey: "deliveryDesc" as const,
    feeKey: "serviceFeeDelivery" as const,
    image: require("@/assets/images/delivery.png"),
    accent: "#CE2B37",
    icon: "package" as const,
  },
  {
    id: "home-services",
    titleKey: "homeServices" as const,
    subtitleKey: "homeServicesDesc" as const,
    feeKey: "serviceFeeHome" as const,
    image: require("@/assets/images/home_services.png"),
    accent: "#005f9e",
    icon: "home" as const,
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const { t, lang, setLang } = useLang();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#009246", "#00703a"]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{t("welcomeBack")},</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.fullName ?? "Guest"} 
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.langBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              onPress={() => setLang(lang === "en" ? "it" : "en")}
            >
              <Text style={styles.langText}>{lang === "en" ? "IT" : "EN"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.notifBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              onPress={() => router.push("/(tabs)/notifications")}
            >
              <Feather name="bell" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: "rgba(255,255,255,0.95)" }]}>
          <Feather name="search" size={18} color={colors.subText} />
          <TextInput
            style={[styles.searchInput, { color: colors.darkText }]}
            placeholder={t("search")}
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.subText} />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.darkText }]}>{t("categories")}</Text>
        <Text style={[styles.slogan, { color: colors.subText }]}>{t("appSlogan")}</Text>

        {CATEGORIES.filter((c) => {
          if (!search) return true;
          const title = t(c.titleKey).toLowerCase();
          return title.includes(search.toLowerCase());
        }).map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.catCard}
            onPress={() => router.push(`/services/${cat.id}` as any)}
            activeOpacity={0.92}
          >
            <Image source={cat.image} style={styles.catImage} contentFit="cover" />
            <LinearGradient
              colors={[cat.accent + "cc", cat.accent + "ee"]}
              style={styles.catOverlay}
            >
              <View style={[styles.catIconBox, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Feather name={cat.icon} size={22} color="#ffffff" />
              </View>
              <View style={styles.catInfo}>
                <Text style={styles.catTitle}>{t(cat.titleKey)}</Text>
                <Text style={styles.catSubtitle}>{t(cat.subtitleKey)}</Text>
                <View style={[styles.feeBadge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                  <Text style={styles.feeBadgeText}>{t(cat.feeKey)}</Text>
                </View>
              </View>
              <View style={styles.catArrow}>
                <Feather name="arrow-right" size={20} color="#ffffff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <View style={[styles.supportCard, { backgroundColor: colors.lightGreen, borderColor: colors.primary }]}>
          <Feather name="phone-call" size={22} color={colors.primary} />
          <View style={styles.supportInfo}>
            <Text style={[styles.supportTitle, { color: colors.darkText }]}>{t("callSupport")}</Text>
            <Text style={[styles.supportNumber, { color: colors.primary }]}>{t("supportNumber")}</Text>
          </View>
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/support")}
          >
            <Feather name="phone" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  userName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#ffffff", maxWidth: 200 },
  headerRight: { flexDirection: "row", gap: 8 },
  langBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  langText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: 0.5 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  slogan: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 20, fontStyle: "italic" },
  catCard: {
    width: "100%",
    height: 190,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    ...shadow("#000", 0.15, 10, 4, 5),
  },
  catImage: { width: "100%", height: "100%", position: "absolute" },
  catOverlay: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 14,
  },
  catIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  catInfo: { flex: 1 },
  catTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#ffffff", marginBottom: 4 },
  catSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.9)", marginBottom: 8 },
  feeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  feeBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#ffffff" },
  catArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  supportInfo: { flex: 1 },
  supportTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  supportNumber: { fontSize: 16, fontFamily: "Inter_700Bold" },
  callBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
