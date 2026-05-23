import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StarRating } from "@/components/StarRating";
import { useBooking } from "@/context/BookingContext";
import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { bookings, updateBooking } = useBooking();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const booking = bookings.find((b) => b.id === id);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.darkText, padding: 20 }}>Booking not found</Text>
      </View>
    );
  }

  const statusColor = {
    pending: "#f0a500",
    active: colors.primary,
    completed: "#6b6b6b",
    cancelled: colors.red,
  }[booking.status];

  const handleCancel = () => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: t("back"), style: "cancel" },
      {
        text: t("confirm"),
        style: "destructive",
        onPress: () => {
          updateBooking(booking.id, { status: "cancelled" });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          router.back();
        },
      },
    ]);
  };

  const handleReview = () => {
    if (rating === 0) {
      Alert.alert("", "Please select a rating.");
      return;
    }
    updateBooking(booking.id, { rating, review: reviewText });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowReview(false);
    Alert.alert("", t("reviewSubmitted"));
  };

  const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
      <View style={[styles.infoIcon, { backgroundColor: colors.lightGreen }]}>
        <Feather name={icon as any} size={16} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: colors.subText }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.darkText }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.darkText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.darkText }]}>{t("bookingDetails")}</Text>
        <TouchableOpacity onPress={() => router.push(`/tracking/${booking.id}` as any)}>
          <Feather name="map-pin" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={[styles.statusCard, { backgroundColor: statusColor + "15", borderColor: statusColor + "44" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {t(booking.status as any)}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.darkText }]}>{booking.service}</Text>
          <InfoRow icon="user" label={t("serviceProvider")} value={booking.providerName} />
          <InfoRow icon="calendar" label={t("date")} value={booking.date} />
          <InfoRow icon="clock" label={t("time")} value={booking.time} />
          <InfoRow icon="clock" label={t("duration")} value={`${booking.duration}h`} />
          <InfoRow icon="dollar-sign" label={t("total")} value={`€${booking.totalCost}`} />
          {booking.notes && (
            <InfoRow icon="file-text" label={t("notes")} value={booking.notes} />
          )}
        </View>

        {booking.status === "completed" && !booking.rating && (
          <TouchableOpacity
            style={[styles.reviewBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowReview(true)}
            activeOpacity={0.85}
          >
            <Feather name="star" size={18} color="#ffffff" />
            <Text style={styles.reviewBtnText}>Leave a Review</Text>
          </TouchableOpacity>
        )}

        {booking.rating && (
          <View style={[styles.reviewCard, { backgroundColor: colors.lightGreen, borderColor: colors.primary }]}>
            <Text style={[styles.reviewTitle, { color: colors.darkText }]}>Your Review</Text>
            <StarRating rating={booking.rating} />
            {booking.review && (
              <Text style={[styles.reviewText, { color: colors.subText }]}>{booking.review}</Text>
            )}
          </View>
        )}

        {(booking.status === "pending" || booking.status === "active") && (
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.red }]}
            onPress={handleCancel}
            activeOpacity={0.85}
          >
            <Text style={[styles.cancelBtnText, { color: colors.red }]}>{t("cancelled")}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={showReview} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.darkText }]}>Rate Your Experience</Text>
            <StarRating rating={rating} interactive onRate={setRating} size={32} />
            <View style={[styles.reviewInput, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text
                style={[styles.reviewPlaceholder, { color: colors.darkText }]}
                onPress={() => {}}
              >
                {reviewText || "Write your review..."}
              </Text>
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalCancel, { borderColor: colors.border }]}
                onPress={() => setShowReview(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.darkText }]}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmit, { backgroundColor: colors.primary }]}
                onPress={handleReview}
              >
                <Text style={styles.modalSubmitText}>{t("submit")}</Text>
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
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: "hidden" },
  cardTitle: { fontSize: 18, fontFamily: "Inter_700Bold", padding: 16, paddingBottom: 12 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  infoValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    marginBottom: 12,
  },
  reviewBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#ffffff" },
  reviewCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12, gap: 8 },
  reviewTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  reviewText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  cancelBtn: { height: 50, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, gap: 16 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  reviewInput: { borderWidth: 1.5, borderRadius: 14, padding: 14, minHeight: 80 },
  reviewPlaceholder: { fontSize: 14, fontFamily: "Inter_400Regular" },
  modalBtns: { flexDirection: "row", gap: 12 },
  modalCancel: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modalSubmit: { flex: 1, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  modalSubmitText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#ffffff" },
});
