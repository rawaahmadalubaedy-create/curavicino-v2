import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookingCard } from "@/components/BookingCard";
import { useBooking, BookingStatus } from "@/context/BookingContext";
import { useLang, TKey } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

type FilterTab = BookingStatus | "all";
const FILTERS: { key: FilterTab; labelKey: TKey }[] = [
  { key: "all", labelKey: "myBookings" },
  { key: "pending", labelKey: "pending" },
  { key: "active", labelKey: "active" },
  { key: "completed", labelKey: "completed" },
];

export default function BookingsScreen() {
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { bookings } = useBooking();
  const [filter, setFilter] = useState<FilterTab>("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.darkText }]}>{t("myBookings")}</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              filter === f.key && { backgroundColor: colors.primary },
              filter !== f.key && { backgroundColor: colors.muted },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterTxt, { color: filter === f.key ? "#fff" : colors.subText }]}>
              {f.key === "all" ? "All" : t(f.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 },
        ]}
        scrollEnabled={!!filtered.length}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => router.push(`/booking/${item.id}` as any)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.lightGreen }]}>
              <Feather name="calendar" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.darkText }]}>{t("noBookings")}</Text>
            <Text style={[styles.emptySub, { color: colors.subText }]}>
              Book a service to get started
            </Text>
            <TouchableOpacity
              style={[styles.bookBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/home")}
            >
              <Text style={styles.bookBtnText}>{t("findProvider")}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  filterTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 8, textAlign: "center" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 24 },
  bookBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  bookBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#ffffff" },
});
