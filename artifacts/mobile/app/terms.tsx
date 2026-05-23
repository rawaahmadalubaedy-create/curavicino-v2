import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
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

const SECTIONS = [
  {
    title: "1. Service Agreement",
    body: "By using CuraVicino, you agree to our terms of service. CuraVicino connects customers with independent service providers. We are not responsible for the direct provision of care services.",
  },
  {
    title: "2. User Responsibilities",
    body: "Users must provide accurate information during registration. Customers are responsible for ensuring the safety of their home environment. Providers must maintain valid certifications and comply with Italian law.",
  },
  {
    title: "3. Service Fees",
    body: "Elderly & Medical Care: 23% platform fee. Delivery & Shopping: 25% platform fee. Home Services: 22% platform fee. All fees are deducted from the provider's earnings automatically.",
  },
  {
    title: "4. Payment Policy",
    body: "Payments are processed securely via PayPal or Stripe. Funds are held until service completion and then released to providers according to their withdrawal preference (daily, weekly, or monthly).",
  },
  {
    title: "5. Cancellation Policy",
    body: "Cancellations made more than 24 hours in advance receive a full refund. Cancellations within 24 hours may incur a fee of up to 50% of the booking value.",
  },
  {
    title: "6. Privacy & Data",
    body: "We collect and process personal data in accordance with the GDPR and Italian privacy law (D.lgs. 196/2003). Your data is never sold to third parties.",
  },
  {
    title: "7. Provider Verification",
    body: "All providers must submit valid government ID, medical experience certificates, and a clean criminal record. Documents are reviewed and must be renewed annually.",
  },
  {
    title: "8. Liability",
    body: "CuraVicino acts as an intermediary platform. Maximum liability is limited to the value of the disputed service. We carry platform liability insurance.",
  },
];

export default function TermsScreen() {
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.darkText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.darkText }]}>{t("terms")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={[styles.banner, { backgroundColor: colors.lightGreen, borderColor: colors.primary }]}>
          <Feather name="file-text" size={20} color={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.primary }]}>
            Last updated: January 2025 • CuraVicino s.r.l.
          </Text>
        </View>

        {SECTIONS.map((sec, i) => (
          <View key={i} style={[styles.section, { borderLeftColor: i % 2 === 0 ? colors.primary : colors.red }]}>
            <Text style={[styles.secTitle, { color: colors.darkText }]}>{sec.title}</Text>
            <Text style={[styles.secBody, { color: colors.subText }]}>{sec.body}</Text>
          </View>
        ))}

        <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Feather name="phone" size={16} color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.subText }]}>
            Questions? Call us at {t("supportNumber")}
          </Text>
        </View>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  bannerText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  section: {
    borderLeftWidth: 3,
    paddingLeft: 14,
    marginBottom: 20,
  },
  secTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 6 },
  secBody: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
