import { Feather } from "@expo/vector-icons";
import { shadow } from "@/utils/shadow";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

function QRPatternBox({ size = 180, color }: { size?: number; color: string }) {
  const blockSize = size / 7;
  const pattern = [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1],
  ];

  return (
    <View style={{ width: size, height: size, flexDirection: "column" }}>
      {pattern.map((row, r) => (
        <View key={r} style={{ flexDirection: "row" }}>
          {row.map((cell, c) => (
            <View
              key={c}
              style={{
                width: blockSize,
                height: blockSize,
                backgroundColor: cell ? color : "transparent",
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function QRCodeScreen() {
  const colors = useColors();
  const { t } = useLang();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.darkText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.darkText }]}>{t("qrCode")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.qrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.flagBar}>
            <View style={[styles.flagStripe, { backgroundColor: "#009246" }]} />
            <View style={[styles.flagStripe, { backgroundColor: "#ffffff", borderWidth: 1, borderColor: colors.border }]} />
            <View style={[styles.flagStripe, { backgroundColor: "#CE2B37" }]} />
          </View>

          <Text style={[styles.qrTitle, { color: colors.darkText }]}>{user?.fullName ?? "Provider"}</Text>
          <Text style={[styles.qrSub, { color: colors.subText }]}>{t("serviceProvider")} ID</Text>

          <View style={[styles.qrBox, { borderColor: colors.primary }]}>
            <View style={styles.qrCorner1} />
            <View style={styles.qrCorner2} />
            <View style={styles.qrCorner3} />
            <View style={styles.qrCorner4} />
            <QRPatternBox size={160} color={colors.primary} />
          </View>

          <Text style={[styles.qrId, { color: colors.subText }]}>
            ID: {user?.qrCode?.toUpperCase().slice(0, 12) ?? "CV-XXXXXXXX"}
          </Text>
          <Text style={[styles.qrSlogan, { color: colors.primary }]}>{t("appSlogan")}</Text>
        </View>

        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Feather name="share-2" size={18} color="#ffffff" />
          <Text style={styles.shareBtnText}>Share QR Code</Text>
        </TouchableOpacity>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  qrCard: {
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    marginBottom: 20,
    ...shadow("#000", 0.08, 12, 4, 4),
  },
  flagBar: { flexDirection: "row", width: 60, height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 16 },
  flagStripe: { flex: 1 },
  qrTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  qrSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 20 },
  qrBox: {
    width: 190,
    height: 190,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
    padding: 14,
  },
  qrCorner1: { position: "absolute", top: -2, left: -2, width: 18, height: 18, borderTopWidth: 4, borderLeftWidth: 4, borderRadius: 4, borderColor: "#009246" },
  qrCorner2: { position: "absolute", top: -2, right: -2, width: 18, height: 18, borderTopWidth: 4, borderRightWidth: 4, borderRadius: 4, borderColor: "#CE2B37" },
  qrCorner3: { position: "absolute", bottom: -2, left: -2, width: 18, height: 18, borderBottomWidth: 4, borderLeftWidth: 4, borderRadius: 4, borderColor: "#CE2B37" },
  qrCorner4: { position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderBottomWidth: 4, borderRightWidth: 4, borderRadius: 4, borderColor: "#009246" },
  qrId: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 8, letterSpacing: 1 },
  qrSlogan: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    ...shadow("#009246", 0.3, 8, 4, 5),
  },
  shareBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#ffffff" },
});
