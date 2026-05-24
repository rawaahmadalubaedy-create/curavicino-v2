import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProviderCard } from "@/components/ProviderCard";
import { useAuth } from "@/context/AuthContext";
import { Booking, Provider, PROVIDERS, useBooking } from "@/context/BookingContext";
import { useLang, TKey } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

type CategoryKey = "elderly-care" | "delivery" | "home-services";

interface CategoryConfig {
  titleKey: TKey;
  image: any;
  accent: string;
  services: TKey[];
  feeKey: TKey;
}

const SERVICES: Record<string, CategoryConfig> = {
  "elderly-care": {
    titleKey: "elderlyCare",
    image: require("@/assets/images/elderly_care.png"),
    accent: "#009246",
    feeKey: "serviceFeeMedical",
    services: [
      "doctorCompanion",
      "hourlyCare",
      "fullTimeCare",
      "alzheimerCare",
      "dementiaCare",
      "disabilitySupport",
      "autismSupport",
      "downSyndromeSupport",
      "brainInjurySupport",
      "fullAssistance",
    ],
  },
  delivery: {
    titleKey: "delivery",
    image: require("@/assets/images/delivery.png"),
    accent: "#CE2B37",
    feeKey: "serviceFeeDelivery",
    services: ["pharmacyShopping", "localStoreShopping", "mallShopping", "restaurantDelivery"],
  },
  "home-services": {
    titleKey: "homeServices",
    image: require("@/assets/images/home_services.png"),
    accent: "#005f9e",
    feeKey: "serviceFeeHome",
    services: ["houseCleaning", "plumbing", "carpentry", "electricalRepair", "gardening", "homeMaintenance"],
  },
};

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { addBooking } = useBooking();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [selectedService, setSelectedService] = useState<TKey | null>(null);
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);
  const [notes, setNotes] = useState("");
  const date = new Date().toLocaleDateString("it-IT");
  const time = "09:00";

  const cat = SERVICES[category ?? "elderly-care"];
  if (!cat) return null;

  const providers = PROVIDERS.filter((p) => p.category === (category as CategoryKey));
  const accent = cat.accent;

  const handleBook = (provider: Provider) => {
    if (!selectedService) {
      Alert.alert("", t("selectService"));
      return;
    }
    setBookingProvider(provider);
  };

  const confirmBooking = async () => {
    if (!bookingProvider || !selectedService) return;
    const booking: Omit<Booking, "id"> = {
      providerId: bookingProvider.id,
      providerName: bookingProvider.name,
      service: t(selectedService),
      category: category as CategoryKey,
      status: "pending",
      date,
      time,
      duration: 2,
      totalCost: bookingProvider.pricePerHour * 2,
      notes,
    };
    await addBooking(booking);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBookingProvider(null);
    setNotes("");
    Alert.alert("", t("bookingConfirmed"), [
      { text: "OK", onPress: () => router.push("/(tabs)/bookings") },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero header */}
      <View style={{ height: 180 }}>
        <Image source={cat.image} style={styles.heroImage} contentFit="cover" transition={200} />
        <LinearGradient
          colors={[accent + "cc", accent + "f0"]}
          style={StyleSheet.absoluteFill}
        />
        {/* Back button — respects safe area */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { top: topPad + 6 }]}
        >
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{t(cat.titleKey)}</Text>
          <View style={[styles.feePill, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.feePillText}>{t(cat.feeKey)}</Text>
          </View>
          {category === "delivery" && (
            <View style={[styles.noteBadge, { backgroundColor: "rgba(0,0,0,0.2)" }]}>
              <Feather name="phone" size={11} color="#fff" />
              <Text style={styles.noteText}>{t("providerNote")}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.darkText }]}>{t("selectService")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesRow} contentContainerStyle={{ paddingRight: 16 }}>
          {cat.services.map((svc) => (
            <TouchableOpacity
              key={svc}
              style={[
                styles.serviceChip,
                {
                  backgroundColor: selectedService === svc ? accent : colors.surface,
                  borderColor: selectedService === svc ? accent : colors.border,
                },
              ]}
              onPress={() => {
                setSelectedService(svc);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.serviceChipText,
                  { color: selectedService === svc ? "#fff" : colors.darkText },
                ]}
              >
                {t(svc)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedService && (
          <View style={[styles.selectedHint, { backgroundColor: accent + "18", borderColor: accent + "44" }]}>
            <Feather name="check-circle" size={14} color={accent} />
            <Text style={[styles.selectedHintText, { color: accent }]}>
              Selected: {t(selectedService)}
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.darkText }]}>
          {t("availableProviders")} ({providers.length})
        </Text>

        {providers.map((p) => (
          <ProviderCard key={p.id} provider={p} onBook={handleBook} />
        ))}
      </ScrollView>

      {/* Booking confirmation modal */}
      <Modal visible={!!bookingProvider} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.darkText }]}>{t("bookingDetails")}</Text>

            <View style={[styles.modalInfoGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {[
                { label: t("serviceProvider"), value: bookingProvider?.name ?? "" },
                { label: t("date"), value: date },
                { label: t("time"), value: time },
                { label: t("total"), value: `€${(bookingProvider?.pricePerHour ?? 0) * 2}`, accent: true },
              ].map((row) => (
                <View key={row.label} style={[styles.modalInfoRow, { borderBottomColor: colors.divider }]}>
                  <Text style={[styles.modalLabel, { color: colors.subText }]}>{row.label}</Text>
                  <Text style={[styles.modalValue, { color: row.accent ? accent : colors.darkText, fontSize: row.accent ? 18 : 14 }]}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.notesWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.notesInput, { color: colors.darkText }]}
                placeholder={t("notes")}
                placeholderTextColor={colors.mutedForeground}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setBookingProvider(null)}
              >
                <Text style={[styles.modalCancelText, { color: colors.darkText }]}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: accent }]}
                onPress={confirmBooking}
              >
                <Feather name="check" size={16} color="#fff" />
                <Text style={styles.modalConfirmText}>{t("confirm")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroImage: { width: "100%", height: "100%", position: "absolute" },
  backBtn: {
    position: "absolute",
    left: 14,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    position: "absolute",
    bottom: 14,
    left: 16,
    right: 16,
    gap: 6,
  },
  heroTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#ffffff" },
  feePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  feePillText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#fff" },
  noteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  noteText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#ffffff" },
  scroll: { paddingHorizontal: 16, paddingTop: 18 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  servicesRow: { marginBottom: 12 },
  serviceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1.5,
    marginRight: 8,
  },
  serviceChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  selectedHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  selectedHintText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 18,
  },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 16 },
  modalInfoGrid: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  modalLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalValue: { fontFamily: "Inter_600SemiBold" },
  notesWrap: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    minHeight: 72,
  },
  notesInput: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  modalBtns: { flexDirection: "row", gap: 12 },
  modalCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modalConfirmBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  modalConfirmText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#ffffff" },
});
