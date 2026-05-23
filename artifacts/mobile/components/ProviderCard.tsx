import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Provider } from "@/context/BookingContext";
import { useColors } from "@/hooks/useColors";
import { useLang } from "@/context/LanguageContext";

interface Props {
  provider: Provider;
  onBook?: (provider: Provider) => void;
}

export function ProviderCard({ provider, onBook }: Props) {
  const colors = useColors();
  const { t } = useLang();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: colors.lightGreen }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {provider.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.darkText }]} numberOfLines={1}>
              {provider.name}
            </Text>
            {provider.isVerified && (
              <View style={[styles.badge, { backgroundColor: colors.lightGreen }]}>
                <Feather name="check-circle" size={10} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>{t("verified")}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.specialty, { color: colors.subText }]} numberOfLines={1}>
            {provider.specialty}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Feather name="star" size={13} color={colors.star} />
              <Text style={[styles.rating, { color: colors.darkText }]}>{provider.rating}</Text>
              <Text style={[styles.reviewCount, { color: colors.subText }]}>({provider.reviews})</Text>
            </View>
            <Text style={[styles.exp, { color: colors.subText }]}>{provider.experience}</Text>
          </View>
        </View>
        <View style={styles.priceBlock}>
          <Text style={[styles.price, { color: colors.primary }]}>€{provider.pricePerHour}</Text>
          <Text style={[styles.perHour, { color: colors.subText }]}>{t("perHour")}</Text>
          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: colors.primary }]}
            onPress={() => onBook?.(provider)}
            activeOpacity={0.8}
          >
            <Text style={[styles.bookBtnText, { color: colors.white }]}>{t("bookNow")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  info: { flex: 1, marginRight: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  specialty: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  rating: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  reviewCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  exp: { fontSize: 12, fontFamily: "Inter_400Regular" },
  priceBlock: { alignItems: "center" },
  price: { fontSize: 18, fontFamily: "Inter_700Bold" },
  perHour: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 8 },
  bookBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  bookBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
