import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Booking, BookingStatus } from "@/context/BookingContext";
import { useColors } from "@/hooks/useColors";
import { useLang, TKey } from "@/context/LanguageContext";

interface Props {
  booking: Booking;
  onPress?: () => void;
}

const statusKeys: Record<BookingStatus, TKey> = {
  pending: "pending",
  active: "active",
  completed: "completed",
  cancelled: "cancelled",
};

export function BookingCard({ booking, onPress }: Props) {
  const colors = useColors();
  const { t } = useLang();

  const statusColor = {
    pending: "#f0a500",
    active: colors.primary,
    completed: "#6b6b6b",
    cancelled: colors.red,
  }[booking.status];

  const categoryIcon = {
    "elderly-care": "heart",
    delivery: "package",
    "home-services": "home",
  }[booking.category] as "heart" | "package" | "home";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: colors.lightGreen }]}>
          <Feather name={categoryIcon} size={20} color={colors.primary} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.service, { color: colors.darkText }]} numberOfLines={1}>
            {booking.service}
          </Text>
          <Text style={[styles.provider, { color: colors.subText }]} numberOfLines={1}>
            {booking.providerName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {t(statusKeys[booking.status])}
          </Text>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      <View style={styles.footer}>
        <View style={styles.meta}>
          <Feather name="calendar" size={12} color={colors.subText} />
          <Text style={[styles.metaText, { color: colors.subText }]}>{booking.date}</Text>
        </View>
        <View style={styles.meta}>
          <Feather name="clock" size={12} color={colors.subText} />
          <Text style={[styles.metaText, { color: colors.subText }]}>{booking.time}</Text>
        </View>
        <Text style={[styles.cost, { color: colors.primary }]}>€{booking.totalCost}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  titleBlock: { flex: 1, marginRight: 8 },
  service: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  provider: { fontSize: 13, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginBottom: 10 },
  footer: { flexDirection: "row", alignItems: "center", gap: 12 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cost: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
