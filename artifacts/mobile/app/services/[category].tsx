import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProviderCard } from "@/components/ProviderCard";
import { useAuth } from "@/context/AuthContext";
import { Booking, Provider, PROVIDERS, useBooking } from "@/context/BookingContext";
import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

const SERVICES: Record<string, { titleKey: string; image: any; accent: string; services: string[]; feeKey: string }> = {
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
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);
  const [notes, setNotes] = useState("");
  const [date] = useState(new Date().toLocaleDateString("it-IT"));
  const [time] = useState("09:00");

  const cat = SERVICES[category ?? "elderly-care"];
  if (!cat) return null;

  const providers = PROVIDERS.filter((p) => p.category === (category as any));
  const accent = cat.accent;

  const handleBook = (provider: Provider) => {
    if (!selectedService) {
      Alert.alert("", t("selectService"));
      return;
    }
    setBookingProvider(provider);
  };

  const confirmBooking = () => {
    if (!bookingProvider || !selectedService) return;
    const booking: Omit<Booking, "id"> = {
      providerId: bookingProvider.id,
      providerName: bookingProvider.name,
      service: t(selectedService as any),
      category: category as any,
      status: "pending",
      date,
      time,
      duration: 2,
      totalCost: bookingProvider.pricePerHour * 2,
      notes,
    };
    addBooking(booking);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBookingProvider(null);
    Alert.alert("", t("bookingConfirmed"), [
      { text: "OK", onPress: () => router.push("/(tabs)/bookings") },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: accent }]}>
        <LinearGradient
          colors={[accent, accent + "cc"]}
          style={[styles.headerGrad, { paddingTop: topPad + 8 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Image source={cat.image} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{t(cat.titleKey as any)}</Text>
            <Text style={styles.heroFee}>{t(cat.feeKey as any)}</Text>
            {category === "delivery" && (
              <View style={[styles.noteBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Feather name="phone" size={12} color="#fff" />
                <Text style={styles.noteText}>{t("providerNote")}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.darkText }]}>{t("selectService")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesRow}>
          {cat.services.map((svc) => (
            <TouchableOpacity
              key={svc}
              style={[
                styles.serviceChip,
                {
                  backgroundColor: selectedService === svc ? accent : colors.muted,
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
                {t(svc as any)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colors.darkText, marginTop: 8 }]}>
          {t("availableProviders")}
        </Text>

        {providers.map((p) => (
          <ProviderCard key={p.id} provider={p} onBook={handleBook} />
        ))}
      </ScrollView>

      <Modal visible={!!bookingProvider} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.darkText }]}>{t("bookingDetails")}</Text>

            <View style={[styles.modalInfoRow, { backgroundColor: colors.surface }]}>
              <View style={styles.modalInfo}>
                <Text style={[styles.modalLabel, { color: colors.subText }]}>{t("serviceProvider")}</Text>
                <Text style={[styles.modalValue, { color: colors.darkText }]}>{bookingProvider?.name}</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={[styles.modalLabel, { color: colors.subText }]}>{t("date")}</Text>
                <Text style={[styles.modalValue, { color: colors.darkText }]}>{date}</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={[styles.modalLabel, { color: colors.subText }]}>{t("time")}</Text>
                <Text style={[styles.modalValue, { color: colors.darkText }]}>{time}</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={[styles.modalLabel, { color: colors.subText }]}>{t("total")}</Text>
                <Text style={[styles.modalValue, { color: accent, fontSize: 18 }]}>
                  €{(bookingProvider?.pricePerHour ?? 0) * 2}
                </Text>
              </View>
            </View>

            <TextInput
              style={[styles.notesInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.darkText }]}
              placeholder={t("notes")}
              placeholderTextColor={colors.mutedForeground}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

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
  header: {},
  headerGrad: { position: "relative", height: 180 },
  backBtn: {
    position: "absolute",
    top: 0,
    left: 12,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  heroImage: { width: "100%", height: "100%", position: "absolute", opacity: 0.35 },
  heroOverlay: { position: "absolute", bottom: 16, left: 16, right: 16 },
  heroTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#ffffff", marginBottom: 6 },
  heroFee: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.9)", marginBottom: 6 },
  noteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  noteText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#ffffff" },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  servicesRow: { marginBottom: 20 },
  serviceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  serviceChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 16 },
  modalInfoRow: {
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  modalInfo: { flexDirection: "row", justifyContent: "space-between" },
  modalLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  notesInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: "top",
  },
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
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#ffffff" },
});
