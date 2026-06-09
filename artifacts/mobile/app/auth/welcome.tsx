import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLang } from "@/context/LanguageContext";

const { width: SW, height: SH } = Dimensions.get("window");

/* ── PIN geometry ────────────────────────────────────────────────────────── */
const PIN_D = 196;          // circle diameter
const PIN_R = PIN_D / 2;
const TAIL_W = 52;          // triangle base width
const TAIL_H = 76;          // triangle height

/* ── Map grid (memoised, zero interaction) ───────────────────────────────── */
const GRID = 44;
const MapGrid = React.memo(() => {
  const cols = Math.ceil(SW / GRID) + 1;
  const rows = Math.ceil(SH / GRID) + 1;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: cols }).map((_, i) => (
        <View key={`v${i}`} style={[s.gridLine, s.gridV, { left: i * GRID }]} />
      ))}
      {Array.from({ length: rows }).map((_, i) => (
        <View key={`h${i}`} style={[s.gridLine, s.gridH, { top: i * GRID }]} />
      ))}
    </View>
  );
});

/* ── GPS Pin shape ───────────────────────────────────────────────────────── */
function GpsPin() {
  return (
    <View style={s.pinOuter}>
      {/* Outer glow ring */}
      <View style={s.pinGlow} />

      {/* White circle */}
      <View style={s.pinCircle}>
        {/* Inner gradient */}
        <LinearGradient
          colors={["#ffffff", "#f0f9f4"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        />

        {/* Italian flag stripe at top edge */}
        <View style={s.flagStripe}>
          <View style={[s.flagBar, { backgroundColor: "#009246" }]} />
          <View style={[s.flagBar, { backgroundColor: "#ffffff" }]} />
          <View style={[s.flagBar, { backgroundColor: "#CE2B37" }]} />
        </View>

        {/* Logo */}
        <Image
          source={require("@/assets/images/icon.png")}
          style={s.pinLogo}
          resizeMode="contain"
        />

        {/* Subtle inner border */}
        <View style={s.pinInnerBorder} />
      </View>

      {/* Tail — triangle pointing downward */}
      <View style={s.tail} />

      {/* Tail shadow softener */}
      <View style={s.tailShadow} />
    </View>
  );
}

/* ── Screen ──────────────────────────────────────────────────────────────── */
export default function WelcomeScreen() {
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  /* Double-tap guard — prevents rapid repeat taps on CTAs. Self-resets so
     re-entering the screen (e.g. back from provider-register) re-enables taps. */
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);

  const go = useCallback((nav: () => void) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    nav();
    setTimeout(() => {
      lock.current = false;
      setBusy(false);
    }, 800);
  }, []);

  /* Shared animation values */
  const headerOp = useSharedValue(0);
  const headerTY = useSharedValue(-28);
  const chipsOp  = useSharedValue(0);
  const chipsTY  = useSharedValue(20);
  const pinOp    = useSharedValue(0);
  const pinScale = useSharedValue(0.55);
  const panelOp  = useSharedValue(0);
  const panelTY  = useSharedValue(36);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    /* Header fades + slides down */
    headerOp.value = withTiming(1, { duration: 650, easing: ease });
    headerTY.value = withTiming(0, { duration: 650, easing: ease });

    /* Chips follow */
    chipsOp.value  = withDelay(220, withTiming(1, { duration: 500, easing: ease }));
    chipsTY.value  = withDelay(220, withTiming(0, { duration: 500, easing: ease }));

    /* Pin springs into place */
    pinOp.value    = withDelay(380, withTiming(1, { duration: 400 }));
    pinScale.value = withDelay(380, withSpring(1, { damping: 13, stiffness: 130 }));

    /* Panel slides up last */
    panelOp.value  = withDelay(560, withTiming(1, { duration: 480, easing: ease }));
    panelTY.value  = withDelay(560, withSpring(0, { damping: 16, stiffness: 110 }));
  }, []);

  /* Auto-redirect fallback — navigate to login after 6s of inactivity */
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerTY.value }],
  }));
  const chipsStyle = useAnimatedStyle(() => ({
    opacity: chipsOp.value,
    transform: [{ translateY: chipsTY.value }],
  }));
  const pinStyle = useAnimatedStyle(() => ({
    opacity: pinOp.value,
    transform: [{ scale: pinScale.value }],
  }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: panelOp.value,
    transform: [{ translateY: panelTY.value }],
  }));

  return (
    <View style={s.root}>
      {/* ── Full-screen gradient ── */}
      <LinearGradient
        colors={["#00200e", "#003d1a", "#006633", "#009246"]}
        locations={[0, 0.3, 0.65, 1]}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Map grid overlay ── */}
      <MapGrid />

      {/* ── Header branding ── */}
      <Animated.View style={[s.header, { paddingTop: topPad + 28 }, headerStyle]}>
        {/* Logo badge */}
        <View style={s.badgeWrap}>
          <LinearGradient
            colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.08)"]}
            style={s.badge}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={s.badgeLogo}
              resizeMode="contain"
            />
          </LinearGradient>
        </View>

        <Text style={s.appName}>CuraVicino</Text>
        <Text style={s.slogan}>{t("appSlogan")}</Text>
      </Animated.View>

      {/* ── Feature chips ── */}
      <Animated.View style={[s.chips, chipsStyle]}>
        {(
          [
            { icon: "heart",   key: "elderlyCarePill",   fallback: "Elderly Care"   },
            { icon: "package", key: "deliveryPill",       fallback: "Delivery"       },
            { icon: "home",    key: "homeServicesPill",   fallback: "Home Services"  },
          ] as const
        ).map(({ icon, key, fallback }) => (
          <View key={key} style={s.chip}>
            <Feather name={icon} size={11} color="rgba(255,255,255,0.85)" />
            <Text style={s.chipTxt}>{t(key as any) || fallback}</Text>
          </View>
        ))}
      </Animated.View>

      {/* ── GPS Pin — emerging from bottom edge ── */}
      <Animated.View style={[s.pinWrap, pinStyle]}>
        <GpsPin />
      </Animated.View>

      {/* ── Red accent dot (Italian) ── */}
      <View style={s.accentDotRed} />
      <View style={s.accentDotWhite} />

      {/* ── Bottom action panel ── */}
      <Animated.View style={[s.panel, { paddingBottom: botPad + 20 }, panelStyle]}>
        {/* Panel handle */}
        <View style={s.panelHandle} />

        <Text style={s.panelTitle}>{t("welcomeHeading")}</Text>
        <Text style={s.panelSub}>{t("welcomeSub")}</Text>

        {/* Customer CTA */}
        <TouchableOpacity
          style={s.btnGreen}
          onPress={() => go(() => router.push("/auth/login"))}
          disabled={busy}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={["#00a854", "#009246", "#007a3a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.btnGradient}
          >
            <Feather name="user" size={19} color="#fff" />
            <Text style={s.btnGreenTxt}>{t("continueAsCustomer")}</Text>
            <Feather name="arrow-right" size={17} color="rgba(255,255,255,0.75)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Provider CTA */}
        <TouchableOpacity
          style={s.btnOutline}
          onPress={() => go(() => router.push("/auth/provider-register"))}
          disabled={busy}
          activeOpacity={0.88}
        >
          <Feather name="briefcase" size={19} color="#CE2B37" />
          <Text style={s.btnOutlineTxt}>{t("continueAsProvider")}</Text>
          <Feather name="arrow-right" size={17} color="#CE2B37" />
        </TouchableOpacity>

        {/* Sign-in link */}
        <TouchableOpacity
          style={s.signinRow}
          onPress={() => go(() => router.push("/auth/login"))}
          disabled={busy}
          activeOpacity={0.7}
        >
          <Text style={s.signinNote}>{t("haveAccount")} </Text>
          <Text style={s.signinLink}>{t("signIn")}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const PANEL_H = 310;
/* Pin centre sits at screen bottom edge; circle is visible, tail goes off-screen */
const PIN_BOTTOM = -(TAIL_H + PIN_R * 0.35);

const s = StyleSheet.create({
  root: { flex: 1 },

  /* Map grid */
  gridLine: { position: "absolute", backgroundColor: "rgba(255,255,255,0.055)" },
  gridV:    { width: 1, top: 0, bottom: 0 },
  gridH:    { height: 1, left: 0, right: 0 },

  /* Header */
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 10,
  },
  badgeWrap: { marginBottom: 18 },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  badgeLogo: { width: 56, height: 56 },
  appName: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  slogan: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.80)",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 32,
  },

  /* Feature chips */
  chips: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 20,
    zIndex: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  chipTxt: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.88)",
  },

  /* GPS Pin wrapper — absolutely positioned, bottom-center */
  pinWrap: {
    position: "absolute",
    bottom: PIN_BOTTOM,
    left: (SW - PIN_D) / 2,
    zIndex: 20,
    alignItems: "center",
  },

  /* Pin outer shell */
  pinOuter: {
    alignItems: "center",
  },

  /* Glow ring */
  pinGlow: {
    position: "absolute",
    width: PIN_D + 24,
    height: PIN_D + 24,
    borderRadius: (PIN_D + 24) / 2,
    backgroundColor: "rgba(0,146,70,0.28)",
    top: -12,
    left: -12,
  },

  /* Main circle */
  pinCircle: {
    width: PIN_D,
    height: PIN_D,
    borderRadius: PIN_R,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(0,146,70,0.6)",
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },

  /* Italian flag stripe at top of circle */
  flagStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    height: 8,
    overflow: "hidden",
  },
  flagBar: { flex: 1 },

  /* Logo inside pin */
  pinLogo: {
    width: PIN_D * 0.62,
    height: PIN_D * 0.62,
  },

  /* Inner border ring */
  pinInnerBorder: {
    position: "absolute",
    inset: 8,
    borderRadius: PIN_R - 8,
    borderWidth: 1.5,
    borderColor: "rgba(0,146,70,0.15)",
  },

  /* Downward pointing tail */
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: TAIL_W / 2,
    borderRightWidth: TAIL_W / 2,
    borderTopWidth: TAIL_H,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#ffffff",
    marginTop: -2,
  },

  /* Soft shadow under tail */
  tailShadow: {
    position: "absolute",
    bottom: TAIL_H - 10,
    width: TAIL_W - 6,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.12)",
  },

  /* Accent decorative dots */
  accentDotRed: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CE2B37",
    top: "18%",
    right: "14%",
    opacity: 0.7,
  },
  accentDotWhite: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#ffffff",
    top: "26%",
    left: "10%",
    opacity: 0.45,
  },

  /* Bottom action panel */
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 30,
  },
  panelHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
    marginBottom: 18,
  },
  panelTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 6,
  },
  panelSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6b6b6b",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },

  /* Green CTA button */
  btnGreen: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#009246",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  btnGreenTxt: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    textAlign: "center",
  },

  /* Outlined provider button */
  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#CE2B37",
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  btnOutlineTxt: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#CE2B37",
    textAlign: "center",
  },

  /* Sign-in row */
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 4,
  },
  signinNote: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6b6b6b",
  },
  signinLink: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#009246",
  },
});
