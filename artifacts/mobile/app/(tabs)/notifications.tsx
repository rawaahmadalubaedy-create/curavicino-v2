import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Notification, useBooking } from "@/context/BookingContext";
import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function NotificationsScreen() {
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationRead } = useBooking();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const typeIcon = (type: Notification["type"]) => {
    if (type === "booking") return "calendar";
    if (type === "provider") return "user";
    return "bell";
  };

  const typeColor = (type: Notification["type"]) => {
    if (type === "booking") return colors.primary;
    if (type === "provider") return "#005f9e";
    return colors.red;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.darkText }]}>{t("notifications")}</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 },
        ]}
        scrollEnabled={!!notifications.length}
        renderItem={({ item }) => {
          const ic = typeColor(item.type);
          return (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: item.read ? colors.card : colors.lightGreen,
                  borderColor: item.read ? colors.border : colors.primary + "44",
                },
              ]}
              onPress={() => markNotificationRead(item.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconBox, { backgroundColor: ic + "22" }]}>
                <Feather name={typeIcon(item.type) as any} size={20} color={ic} />
              </View>
              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={[styles.notifTitle, { color: colors.darkText }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.read && (
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <Text style={[styles.message, { color: colors.subText }]} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={[styles.time, { color: colors.mutedForeground }]}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.lightGreen }]}>
              <Feather name="bell" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.darkText }]}>{t("noNotifications")}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
  },
  iconBox: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  content: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  notifTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  message: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 6 },
  time: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
});
