import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Provider } from "@/context/BookingContext";
import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  provider: Provider;
  onBook?: (provider: Provider) => void;
}

const AVAIL_COLOR: Record<string, string> = {
  available: "#009246",
  busy: "#f0a500",
  offline: "#999",
};

const HERO_BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";
const AVATAR_BLURHASH = "L9AS$dt7IU~q~qofM{xt%Mj[ayj[";

export function ProviderCard({ provider, onBook }: Props) {
  const colors = useColors();
  const { t } = useLang();

  const availColor = AVAIL_COLOR[provider.availabilityStatus] ?? "#aaa";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/provider/${provider.id}` as any)}
      activeOpacity={0.93}
    >
      <View style={styles.heroWrap}>
        <Image
          source={{ uri: provider.heroImage }}
          style={styles.heroImg}
          contentFit="cover"
          transition={250}
          placeholder={{ blurhash: HERO_BLURHASH }}
        />
        <View style={styles.heroGrad} />
        <View style={[styles.availBadge, { backgroundColor: availColor + "ee" }]}>
          <View style={styles.availDot} />
          <Text style={styles.availText}>
            {provider.availabilityStatus === "available"
              ? "Available"
              : provider.availabilityStatus === "busy"
              ? "Busy"
              : "Offline"}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Image
            source={{ uri: provider.profilePhoto }}
            style={[styles.avatar, { borderColor: colors.background }]}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: AVATAR_BLURHASH }}
          />
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.darkText }]} numberOfLines={1}>
                {provider.name}
              </Text>
              {provider.isVerified && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.lightGreen }]}>
                  <Feather name="check-circle" size={10} color={colors.primary} />
                  <Text style={[styles.verifiedText, { color: colors.primary }]}>{t("verified")}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.specialty, { color: colors.subText }]} numberOfLines={1}>
              {provider.specialty}
            </Text>
          </View>
          <View style={styles.priceBlock}>
            <Text style={[styles.price, { color: colors.primary }]}>€{provider.pricePerHour}</Text>
            <Text style={[styles.perHour, { color: colors.subText }]}>/hr</Text>
          </View>
        </View>

        <View style={[styles.statsRow, { borderTopColor: colors.divider }]}>
          <View style={styles.stat}>
            <Feather name="star" size={13} color="#f0a500" />
            <Text style={[styles.statVal, { color: colors.darkText }]}>{provider.rating}</Text>
            <Text style={[styles.statSub, { color: colors.subText }]}>({provider.reviews})</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.stat}>
            <Feather name="clock" size={13} color={colors.subText} />
            <Text style={[styles.statSub, { color: colors.subText }]}>{provider.experience}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.stat}>
            <Feather name="check-square" size={13} color={colors.subText} />
            <Text style={[styles.statSub, { color: colors.subText }]}>{provider.completedServices} done</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.viewBtn, { borderColor: colors.border }]}
            onPress={() => router.push(`/provider/${provider.id}` as any)}
          >
            <Text style={[styles.viewBtnText, { color: colors.darkText }]}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: colors.primary }]}
            onPress={(e) => {
              e.stopPropagation?.();
              onBook?.(provider);
            }}
            activeOpacity={0.85}
          >
            <Feather name="calendar" size={14} color="#fff" />
            <Text style={styles.bookBtnText}>{t("bookNow")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  heroWrap: { position: "relative", height: 110 },
  heroImg: { width: "100%", height: "100%", position: "absolute" },
  heroGrad: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  availBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  availDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  availText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
  body: { padding: 14, paddingTop: 0 },
  topRow: { flexDirection: "row", alignItems: "flex-end", marginTop: -20, marginBottom: 10, gap: 10 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
  },
  info: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  name: { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  specialty: { fontSize: 12, fontFamily: "Inter_400Regular" },
  priceBlock: { alignItems: "flex-end", paddingBottom: 2 },
  price: { fontSize: 20, fontFamily: "Inter_700Bold" },
  perHour: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: 10,
    marginBottom: 10,
  },
  stat: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  statVal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  statSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 16 },
  actionRow: { flexDirection: "row", gap: 8 },
  viewBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  viewBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  bookBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bookBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#ffffff" },
});
