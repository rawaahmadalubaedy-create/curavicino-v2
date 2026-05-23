import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function SupportScreen() {
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const FAQS = [
    {
      q: "How do I book a service?",
      a: "Go to Home, select a category, choose a service and provider, then confirm your booking.",
    },
    {
      q: "How can I cancel a booking?",
      a: "Go to My Bookings, open the booking you want to cancel, and tap the Cancel button.",
    },
    {
      q: "What payment methods are accepted?",
      a: "We accept PayPal and major credit/debit cards via Stripe.",
    },
    {
      q: "How are providers verified?",
      a: "All providers submit government ID, medical certificates, and criminal records. Our team reviews each application.",
    },
    {
      q: "Come posso cambiare la lingua?",
      a: "Vai al Profilo, tocca Lingua e seleziona Italiano o Inglese.",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#009246", "#00703a"]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("support")}</Text>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        <TouchableOpacity
          style={[styles.callCard, { backgroundColor: colors.lightGreen, borderColor: colors.primary }]}
          onPress={() => Linking.openURL("tel:+39800123456")}
          activeOpacity={0.85}
        >
          <LinearGradient colors={["#009246", "#00703a"]} style={styles.callCardGrad}>
            <Feather name="phone-call" size={32} color="#ffffff" />
            <View style={styles.callInfo}>
              <Text style={styles.callTitle}>{t("callSupport")}</Text>
              <Text style={styles.callNumber}>{t("supportNumber")}</Text>
              <Text style={styles.callSub}>Available 24/7 — Disponibile 24/7</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.optionsRow}>
          {[
            { icon: "mail", label: "Email Support", onPress: () => Linking.openURL("mailto:support@curavicino.it") },
            { icon: "message-circle", label: "Live Chat", onPress: () => {} },
            { icon: "alert-circle", label: t("complaints"), onPress: () => router.push("/complaints") },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={opt.onPress}
              activeOpacity={0.8}
            >
              <Feather name={opt.icon as any} size={24} color={colors.primary} />
              <Text style={[styles.optionLabel, { color: colors.darkText }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.faqTitle, { color: colors.darkText }]}>FAQ</Text>
        {FAQS.map((faq, i) => (
          <View key={i} style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.faqQ}>
              <View style={[styles.faqIcon, { backgroundColor: colors.lightGreen }]}>
                <Text style={[styles.faqIconText, { color: colors.primary }]}>Q</Text>
              </View>
              <Text style={[styles.faqQuestion, { color: colors.darkText }]}>{faq.q}</Text>
            </View>
            <Text style={[styles.faqAnswer, { color: colors.subText }]}>{faq.a}</Text>
          </View>
        ))}
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
  scroll: { paddingHorizontal: 16, paddingTop: 20 },
  callCard: { borderRadius: 20, borderWidth: 0, overflow: "hidden", marginBottom: 16 },
  callCardGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  callInfo: { flex: 1 },
  callTitle: { fontSize: 14, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.85)", marginBottom: 4 },
  callNumber: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#ffffff", marginBottom: 4 },
  callSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  optionsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  optionCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  faqTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 12 },
  faqCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 10 },
  faqQ: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  faqIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  faqIconText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  faqQuestion: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  faqAnswer: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginLeft: 38 },
});
