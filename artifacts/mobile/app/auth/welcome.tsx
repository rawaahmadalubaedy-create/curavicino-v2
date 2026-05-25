import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function WelcomeScreen() {
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Gradient header ── */}
      <LinearGradient
        colors={["#009246", "#007a3a"]}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
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

      {/* ── Role cards ── */}
      <View style={[styles.body, { paddingBottom: botPad + 24 }]}>
        <Text style={[styles.heading, { color: colors.darkText }]}>
          {t("welcomeHeading")}
        </Text>
        <Text style={[styles.sub, { color: colors.subText }]}>
          {t("welcomeSub")}
        </Text>

        {/* Customer card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary }]}
          onPress={() => router.push("/auth/login")}
          activeOpacity={0.86}
        >
          <View style={[styles.cardIconBox, { backgroundColor: colors.primary }]}>
            <Feather name="user" size={28} color="#ffffff" />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: colors.darkText }]}>
              {t("continueAsCustomer")}
            </Text>
            <Text style={[styles.cardDesc, { color: colors.subText }]}>
              {t("customerDesc")}
            </Text>
          </View>
          <Feather name="chevron-right" size={22} color={colors.primary} />
        </TouchableOpacity>

        {/* Provider card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.red }]}
          onPress={() => router.push("/auth/provider-register")}
          activeOpacity={0.86}
        >
          <View style={[styles.cardIconBox, { backgroundColor: colors.red }]}>
            <Feather name="briefcase" size={28} color="#ffffff" />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: colors.darkText }]}>
              {t("continueAsProvider")}
            </Text>
            <Text style={[styles.cardDesc, { color: colors.subText }]}>
              {t("providerDesc")}
            </Text>
          </View>
          <Feather name="chevron-right" size={22} color={colors.red} />
        </TouchableOpacity>

        {/* Sign in link */}
        <TouchableOpacity
          style={styles.signinRow}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={[styles.signinNote, { color: colors.subText }]}>
            {t("haveAccount")}{" "}
          </Text>
          <Text style={[styles.signinLink, { color: colors.primary }]}>
            {t("signIn")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: { width: 88, height: 88 },
  appName: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  slogan: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.88)",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  heading: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardIconBox: {
    width: 58,
    height: 58,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 4 },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  signinNote: { fontSize: 14, fontFamily: "Inter_400Regular" },
  signinLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
