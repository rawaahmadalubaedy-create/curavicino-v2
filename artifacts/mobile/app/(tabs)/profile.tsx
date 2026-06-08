import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { useRealtime } from "@/context/RealtimeContext";
import { useColors } from "@/hooks/useColors";

const STATUS_COLOR: Record<string, string> = {
  connected:    "#22c55e",
  connecting:   "#f59e0b",
  disconnected: "#9ca3af",
  error:        "#CE2B37",
};

export default function ProfileScreen() {
  const colors = useColors();
  const { t, lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const { status } = useRealtime();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const dotColor = STATUS_COLOR[status] ?? "#9ca3af";

  const handleLogout = () => {
    Alert.alert(t("logout"), "Are you sure you want to log out?", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: async () => {
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const MenuItem = ({
    icon,
    label,
    onPress,
    color,
    badge,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    color?: string;
    badge?: string;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.divider }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: (color ?? colors.primary) + "1a" }]}>
        <Feather name={icon as any} size={20} color={color ?? colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.darkText }]}>{label}</Text>
      {badge && (
        <View style={[styles.badge, { backgroundColor: colors.red }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={18} color={colors.subText} />
    </TouchableOpacity>
  );

  const isProvider = user?.userType === "provider";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#009246", "#00703a"]}
        style={[styles.headerGrad, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Text style={styles.avatarText}>
              {user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "?"}
            </Text>
          </View>
          {/* Connection status dot — bottom-left of avatar */}
          <View style={[styles.statusDot, { backgroundColor: dotColor, borderColor: "#009246" }]} />
          {user?.isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: "#ffffff" }]}>
              <Feather name="check-circle" size={14} color={colors.primary} />
            </View>
          )}
        </View>
        <Text style={styles.name}>{user?.fullName ?? "Guest"}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>
        <View style={[styles.typeBadge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
          <Feather
            name={isProvider ? "briefcase" : "user"}
            size={12}
            color="#ffffff"
          />
          <Text style={styles.typeBadgeText}>
            {isProvider ? t("serviceProvider") : t("customer")}
          </Text>
        </View>
      </LinearGradient>

      {isProvider && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Provider Dashboard</Text>
          <MenuItem icon="bar-chart-2" label={t("providerDashboard")} onPress={() => {}} />
          <MenuItem icon="dollar-sign" label={t("earnings")} onPress={() => {}} />
          <MenuItem
            icon="grid"
            label={t("qrCode")}
            onPress={() => router.push("/qr-code")}
          />
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Account</Text>
        <MenuItem icon="user" label={t("profile")} onPress={() => {}} />
        <MenuItem
          icon="globe"
          label={t("language")}
          onPress={() => setLang(lang === "en" ? "it" : "en")}
          badge={lang === "en" ? "EN" : "IT"}
        />
        <MenuItem icon="credit-card" label={t("paymentMethods")} onPress={() => {}} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Help</Text>
        <MenuItem icon="phone-call" label={t("support")} onPress={() => router.push("/support")} />
        <MenuItem icon="star" label={t("ratingsReviews")} onPress={() => {}} />
        <MenuItem icon="alert-circle" label={t("complaints")} onPress={() => router.push("/complaints")} />
        <MenuItem icon="file-text" label={t("terms")} onPress={() => router.push("/terms")} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Account</Text>
        <MenuItem
          icon="log-out"
          label={t("logout")}
          onPress={handleLogout}
          color={colors.red}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGrad: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  avatarText: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#ffffff" },
  statusDot: {
    position: "absolute",
    bottom: 2,
    left: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#ffffff", marginBottom: 4 },
  email: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginBottom: 12 },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#ffffff" },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 4 },
  badgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#ffffff" },
});
