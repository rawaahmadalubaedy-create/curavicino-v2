import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterTypeScreen() {
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 12 }]}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={22} color={colors.darkText} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.logoCircle, { backgroundColor: colors.lightGreen }]}>
          <Feather name="heart" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.heading, { color: colors.darkText }]}>{t("chooseAccount")}</Text>
        <Text style={[styles.sub, { color: colors.subText }]}>{t("iAmA")}</Text>

        <TouchableOpacity
          style={[styles.card, { borderColor: colors.primary, backgroundColor: colors.card }]}
          onPress={() => router.push("/auth/customer-register")}
          activeOpacity={0.85}
        >
          <LinearGradient colors={["#e8f5ee", "#f8f8f8"]} style={styles.cardGrad}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
              <Feather name="user" size={28} color="#ffffff" />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.darkText }]}>{t("customer")}</Text>
              <Text style={[styles.cardDesc, { color: colors.subText }]}>
                Book elderly care, delivery & home services
              </Text>
            </View>
            <Feather name="chevron-right" size={22} color={colors.primary} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderColor: colors.red, backgroundColor: colors.card }]}
          onPress={() => router.push("/auth/provider-register")}
          activeOpacity={0.85}
        >
          <LinearGradient colors={["#fdeaea", "#f8f8f8"]} style={styles.cardGrad}>
            <View style={[styles.iconBox, { backgroundColor: colors.red }]}>
              <Feather name="briefcase" size={28} color="#ffffff" />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.darkText }]}>{t("serviceProvider")}</Text>
              <Text style={[styles.cardDesc, { color: colors.subText }]}>
                Offer services and earn on your schedule
              </Text>
            </View>
            <Feather name="chevron-right" size={22} color={colors.red} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginRow} onPress={() => router.push("/auth/login")}>
          <Text style={[styles.loginNote, { color: colors.subText }]}>{t("haveAccount")} </Text>
          <Text style={[styles.loginLink, { color: colors.primary }]}>{t("signIn")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: "absolute", left: 20, zIndex: 10, padding: 8 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heading: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6, textAlign: "center" },
  sub: { fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 36, textAlign: "center" },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardGrad: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 14,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  loginRow: { flexDirection: "row", marginTop: 24 },
  loginNote: { fontSize: 14, fontFamily: "Inter_400Regular" },
  loginLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
