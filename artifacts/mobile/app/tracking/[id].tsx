import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBooking } from "@/context/BookingContext";
import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const STEPS = [
  { icon: "check-circle", label: "Confirmed", done: true },
  { icon: "user", label: "Provider En Route", done: true },
  { icon: "map-pin", label: "Arriving Soon", done: false },
  { icon: "home", label: "At Location", done: false },
];

export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { bookings } = useBooking();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const booking = bookings.find((b) => b.id === id);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;
  const [eta] = useState("12 min");

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#009246", "#00703a"]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("tracking")}</Text>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <View style={[styles.mapPlaceholder, { backgroundColor: colors.lightGreen }]}>
        <View style={styles.mapGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[styles.gridLine, { backgroundColor: colors.primary + "22" }]} />
          ))}
        </View>
        <View style={[styles.mapRoute, { backgroundColor: colors.primary + "44" }]} />
        <Animated.View style={[styles.providerDot, { backgroundColor: colors.primary, transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.providerDotInner, { backgroundColor: "#ffffff" }]}>
            <Feather name="user" size={14} color={colors.primary} />
          </View>
        </Animated.View>
        <View style={[styles.homeDot, { backgroundColor: colors.red }]}>
          <Feather name="home" size={14} color="#ffffff" />
        </View>
        <View style={[styles.etaBubble, { backgroundColor: colors.primary }]}>
          <Feather name="clock" size={12} color="#ffffff" />
          <Text style={styles.etaText}>ETA {eta}</Text>
        </View>
      </View>

      <View style={[styles.infoPanel, { backgroundColor: colors.background }]}>
        <View style={styles.providerRow}>
          <View style={[styles.providerAvatar, { backgroundColor: colors.lightGreen }]}>
            <Text style={[styles.providerAvatarText, { color: colors.primary }]}>
              {booking?.providerName?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "PR"}
            </Text>
          </View>
          <View style={styles.providerInfo}>
            <Text style={[styles.providerName, { color: colors.darkText }]}>
              {booking?.providerName ?? "Provider"}
            </Text>
            <Text style={[styles.providerStatus, { color: colors.primary }]}>
              On the way — {eta} away
            </Text>
          </View>
          <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.lightGreen }]}>
            <Feather name="phone" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepIconCol}>
                <View style={[styles.stepIcon, { backgroundColor: step.done ? colors.primary : colors.muted }]}>
                  <Feather name={step.icon as any} size={14} color={step.done ? "#ffffff" : colors.subText} />
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[styles.stepLine, { backgroundColor: step.done ? colors.primary : colors.muted }]} />
                )}
              </View>
              <Text style={[styles.stepLabel, { color: step.done ? colors.darkText : colors.subText }]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
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
  mapPlaceholder: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  mapGrid: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  gridLine: { width: 1, height: "100%" },
  mapRoute: {
    position: "absolute",
    top: "30%",
    left: "20%",
    width: "60%",
    height: 4,
    borderRadius: 2,
  },
  providerDot: {
    position: "absolute",
    top: "28%",
    left: "22%",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  providerDotInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  homeDot: {
    position: "absolute",
    top: "26%",
    right: "18%",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  etaBubble: {
    position: "absolute",
    top: "18%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  etaText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#ffffff" },
  infoPanel: {
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  providerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  providerAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  providerAvatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  providerStatus: { fontSize: 13, fontFamily: "Inter_500Medium" },
  callBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  steps: { gap: 0 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, minHeight: 44 },
  stepIconCol: { alignItems: "center", width: 28 },
  stepIcon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepLine: { width: 2, flex: 1, minHeight: 16, marginTop: 4 },
  stepLabel: { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 28 },
});
