import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StarRating } from "@/components/StarRating";
import { Booking, PROVIDERS, useBooking } from "@/context/BookingContext";
import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const HERO_HEIGHT = Math.round(SCREEN_H * 0.48);
const STICKY_THRESHOLD = HERO_HEIGHT - 90;

const AVAIL_COLOR: Record<string, string> = {
  available: "#009246",
  busy: "#f0a500",
  offline: "#999",
};
const AVAIL_LABEL: Record<string, string> = {
  available: "Available Now",
  busy: "Currently Busy",
  offline: "Offline",
};

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { addBooking } = useBooking();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const provider = PROVIDERS.find((p) => p.id === id);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [stickyVisible, setStickyVisible] = useState(false);
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [notes, setNotes] = useState("");
  const [expandAbout, setExpandAbout] = useState(false);

  const heroTranslate = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [HERO_HEIGHT * 0.5, 0, -HERO_HEIGHT * 0.3],
    extrapolate: "clamp",
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.6],
    outputRange: [1, 0.3],
    extrapolate: "clamp",
  });

  const headerBg = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 100, HERO_HEIGHT - 40],
    outputRange: ["rgba(255,255,255,0)", "rgba(255,255,255,1)"],
    extrapolate: "clamp",
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 80, HERO_HEIGHT - 20],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleScroll = useCallback(
    Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: false,
      listener: (e: any) => {
        setStickyVisible(e.nativeEvent.contentOffset.y > STICKY_THRESHOLD);
      },
    }),
    []
  );

  if (!provider) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 20 }}>
          <Feather name="arrow-left" size={22} color={colors.darkText} />
        </TouchableOpacity>
        <Text style={{ color: colors.darkText, padding: 20 }}>Provider not found.</Text>
      </View>
    );
  }

  const availColor = AVAIL_COLOR[provider.availabilityStatus];

  const handleBook = () => {
    if (!selectedService) {
      Alert.alert("", "Please select a service.");
      return;
    }
    const booking: Omit<Booking, "id"> = {
      providerId: provider.id,
      providerName: provider.name,
      service: selectedService,
      category: provider.category,
      status: "pending",
      date: new Date().toLocaleDateString("it-IT"),
      time: "09:00",
      duration: 2,
      totalCost: provider.pricePerHour * 2,
      notes,
    };
    addBooking(booking);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBookingModal(false);
    Alert.alert("Booking Confirmed", `Your booking with ${provider.name} has been confirmed.`, [
      { text: "View Bookings", onPress: () => router.push("/(tabs)/bookings") },
      { text: "OK" },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated sticky top bar */}
      <Animated.View
        style={[
          styles.stickyHeader,
          { paddingTop: topPad + 4, backgroundColor: headerBg as any },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={[styles.backCircle, { backgroundColor: "rgba(0,0,0,0.35)" }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Animated.Text
          style={[styles.stickyName, { color: colors.darkText, opacity: headerTitleOpacity }]}
          numberOfLines={1}
        >
          {provider.name}
        </Animated.Text>
        <TouchableOpacity
          style={[styles.backCircle, { backgroundColor: "rgba(0,0,0,0.35)" }]}
          onPress={() => Linking.openURL(`tel:${provider.phone}`)}
        >
          <Feather name="phone" size={18} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 100 }}
      >
        {/* ── HERO with parallax ── */}
        <View style={{ height: HERO_HEIGHT, overflow: "hidden" }}>
          <Animated.View
            style={[
              styles.heroImageWrap,
              { transform: [{ translateY: heroTranslate }] },
            ]}
          >
            <Animated.View style={{ opacity: heroOpacity }}>
              <Image
                source={{ uri: provider.heroImage }}
                style={{ width: SCREEN_W, height: HERO_HEIGHT + 80 }}
                contentFit="cover"
              />
            </Animated.View>
          </Animated.View>

          {/* Gradient overlays */}
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0)", "rgba(0,0,0,0.75)"]}
            style={StyleSheet.absoluteFill}
            locations={[0, 0.4, 1]}
          />

          {/* Hero bottom content */}
          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <View style={[styles.availPill, { backgroundColor: availColor + "dd" }]}>
                <View style={styles.availPillDot} />
                <Text style={styles.availPillText}>{AVAIL_LABEL[provider.availabilityStatus]}</Text>
              </View>
              <View style={[styles.responsePill, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
                <Feather name="zap" size={11} color="#fff" />
                <Text style={styles.availPillText}>{provider.responseTime}</Text>
              </View>
            </View>

            <View style={styles.heroProfile}>
              <View style={styles.heroAvatarWrap}>
                <Image
                  source={{ uri: provider.profilePhoto }}
                  style={styles.heroAvatar}
                  contentFit="cover"
                />
                {provider.isVerified && (
                  <View style={[styles.heroBadge, { backgroundColor: "#009246" }]}>
                    <Feather name="check" size={10} color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.heroName}>{provider.name}</Text>
                <Text style={styles.heroSpecialty}>{provider.specialty}</Text>
                <View style={styles.heroMeta}>
                  <Feather name="star" size={14} color="#f0a500" />
                  <Text style={styles.heroRating}>{provider.rating}</Text>
                  <Text style={styles.heroReviews}>({provider.reviews} reviews)</Text>
                  <View style={styles.heroDot} />
                  <Text style={styles.heroExp}>{provider.experience} exp.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── STATS BAND ── */}
        <View style={[styles.statsBand, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {[
            { label: "Completed", value: provider.completedServices.toString(), icon: "check-circle" },
            { label: "Rating", value: provider.rating.toString(), icon: "star" },
            { label: "Reviews", value: provider.reviews.toString(), icon: "message-square" },
            { label: "Since", value: provider.memberSince.split(" ")[1], icon: "calendar" },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Feather name={s.icon as any} size={16} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.darkText }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              {i < 3 && <View style={[styles.statSep, { backgroundColor: colors.divider }]} />}
            </View>
          ))}
        </View>

        <View style={styles.sections}>
          {/* ── ABOUT ── */}
          <SectionBlock title="About" icon="user" colors={colors}>
            <Text style={[styles.aboutText, { color: colors.subText }]} numberOfLines={expandAbout ? undefined : 4}>
              {provider.about}
            </Text>
            <TouchableOpacity
              onPress={() => setExpandAbout(!expandAbout)}
              style={styles.readMore}
            >
              <Text style={[styles.readMoreText, { color: colors.primary }]}>
                {expandAbout ? "Show less" : "Read more"}
              </Text>
              <Feather name={expandAbout ? "chevron-up" : "chevron-down"} size={14} color={colors.primary} />
            </TouchableOpacity>
          </SectionBlock>

          {/* ── GALLERY ── */}
          <SectionBlock title="Gallery" icon="image" colors={colors}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
              {provider.gallery.map((uri, i) => (
                <View key={i} style={styles.galleryItem}>
                  <Image
                    source={{ uri }}
                    style={styles.galleryImage}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.3)"]}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              ))}
            </ScrollView>
          </SectionBlock>

          {/* ── CERTIFICATIONS ── */}
          <SectionBlock title="Certifications" icon="award" colors={colors}>
            {provider.certifications.map((cert, i) => (
              <View key={i} style={[styles.certRow, { borderBottomColor: colors.divider }]}>
                <View style={[styles.certIcon, { backgroundColor: colors.lightGreen }]}>
                  <Feather name="shield" size={14} color={colors.primary} />
                </View>
                <Text style={[styles.certText, { color: colors.darkText }]}>{cert}</Text>
              </View>
            ))}
          </SectionBlock>

          {/* ── LANGUAGES & AREAS (side by side) ── */}
          <View style={styles.twoColRow}>
            <View style={[styles.twoColCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.miniSectionHead}>
                <View style={[styles.miniSectionIcon, { backgroundColor: colors.lightGreen }]}>
                  <Feather name="globe" size={14} color={colors.primary} />
                </View>
                <Text style={[styles.miniSectionTitle, { color: colors.darkText }]}>Languages</Text>
              </View>
              {provider.languages.map((lang, i) => (
                <View key={i} style={styles.tagRow}>
                  <View style={[styles.tag, { backgroundColor: colors.lightGreen }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{lang}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={[styles.twoColCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.miniSectionHead}>
                <View style={[styles.miniSectionIcon, { backgroundColor: "#fdeaea" }]}>
                  <Feather name="map-pin" size={14} color={colors.red} />
                </View>
                <Text style={[styles.miniSectionTitle, { color: colors.darkText }]}>Service Areas</Text>
              </View>
              {provider.serviceAreas.slice(0, 4).map((area, i) => (
                <View key={i} style={styles.tagRow}>
                  <View style={[styles.tag, { backgroundColor: "#fdeaea" }]}>
                    <Text style={[styles.tagText, { color: colors.red }]}>{area}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ── RESPONSE & STATS ── */}
          <SectionBlock title="Quick Info" icon="info" colors={colors}>
            {[
              { icon: "zap", label: "Response Time", value: provider.responseTime },
              { icon: "check-square", label: "Completed Services", value: `${provider.completedServices} services` },
              { icon: "calendar", label: "Member Since", value: provider.memberSince },
              { icon: "dollar-sign", label: "Rate", value: `€${provider.pricePerHour} / hour` },
            ].map((item, i) => (
              <View key={i} style={[styles.infoListRow, { borderBottomColor: colors.divider }]}>
                <View style={[styles.infoListIcon, { backgroundColor: colors.surface }]}>
                  <Feather name={item.icon as any} size={15} color={colors.primary} />
                </View>
                <Text style={[styles.infoListLabel, { color: colors.subText }]}>{item.label}</Text>
                <Text style={[styles.infoListValue, { color: colors.darkText }]}>{item.value}</Text>
              </View>
            ))}
          </SectionBlock>

          {/* ── REVIEWS ── */}
          <SectionBlock title={`Reviews (${provider.reviewsList.length})`} icon="message-square" colors={colors}>
            {provider.reviewsList.map((review) => (
              <View key={review.id} style={[styles.reviewCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <View style={styles.reviewHeader}>
                  <Image
                    source={{ uri: review.avatar }}
                    style={styles.reviewAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.reviewMeta}>
                    <Text style={[styles.reviewAuthor, { color: colors.darkText }]}>{review.author}</Text>
                    <Text style={[styles.reviewDate, { color: colors.mutedForeground }]}>{review.date}</Text>
                  </View>
                  <StarRating rating={review.rating} size={13} />
                </View>
                <Text style={[styles.reviewText, { color: colors.subText }]}>"{review.text}"</Text>
              </View>
            ))}
          </SectionBlock>
        </View>
      </Animated.ScrollView>

      {/* ── STICKY CTA BOTTOM BAR ── */}
      <View
        style={[
          styles.ctaBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: botPad + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.ctaIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => Linking.openURL(`tel:${provider.phone}`)}
          activeOpacity={0.8}
        >
          <Feather name="phone" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ctaIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <Feather name="message-circle" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ctaBookBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setBookingModal(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          activeOpacity={0.88}
        >
          <Feather name="calendar" size={18} color="#fff" />
          <Text style={styles.ctaBookText}>Book This Provider</Text>
        </TouchableOpacity>
      </View>

      {/* ── BOOKING MODAL ── */}
      <Modal visible={bookingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.darkText }]}>Book a Service</Text>
                <Text style={[styles.modalSub, { color: colors.subText }]}>with {provider.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setBookingModal(false)}>
                <Feather name="x" size={22} color={colors.subText} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: colors.subText }]}>Select Service</Text>
            <View style={styles.serviceGrid}>
              {[provider.specialty, ...["Doctor Companion", "Hourly Care", "Full-Time Care"]
                .filter(s => s !== provider.specialty).slice(0, 3)].map((svc) => (
                <TouchableOpacity
                  key={svc}
                  style={[
                    styles.serviceChip,
                    {
                      backgroundColor: selectedService === svc ? colors.primary : colors.surface,
                      borderColor: selectedService === svc ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedService(svc)}
                >
                  <Text style={[styles.serviceChipText, { color: selectedService === svc ? "#fff" : colors.darkText }]}>
                    {svc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: colors.subText }]}>Notes (optional)</Text>
            <View style={[styles.notesWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.notesInput, { color: colors.darkText }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any special requirements or information..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={[styles.priceSummary, { backgroundColor: colors.lightGreen, borderColor: colors.primary + "55" }]}>
              <Text style={[styles.priceSummaryLabel, { color: colors.subText }]}>Estimated (2 hours)</Text>
              <Text style={[styles.priceSummaryValue, { color: colors.primary }]}>
                €{provider.pricePerHour * 2}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
              onPress={handleBook}
              activeOpacity={0.88}
            >
              <Feather name="check" size={18} color="#fff" />
              <Text style={styles.confirmBtnText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SectionBlock({
  title,
  icon,
  children,
  colors,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={[styles.sectionBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionIconBox, { backgroundColor: colors.lightGreen }]}>
          <Feather name={icon as any} size={15} color={colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.darkText }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Sticky header */
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  stickyName: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginHorizontal: 8,
  },

  /* Hero */
  heroImageWrap: { position: "absolute", top: 0, left: 0, right: 0 },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroTopRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  availPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  responsePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  availPillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  availPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
  heroProfile: { flexDirection: "row", alignItems: "flex-end", gap: 14 },
  heroAvatarWrap: { position: "relative" },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#fff",
  },
  heroBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  heroInfo: { flex: 1, paddingBottom: 4 },
  heroName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  heroSpecialty: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.85)", marginBottom: 6 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroRating: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  heroReviews: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  heroDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.5)", marginHorizontal: 4 },
  heroExp: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },

  /* Stats band */
  statsBand: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  statValue: { fontSize: 17, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statSep: {
    position: "absolute",
    right: 0,
    top: "20%",
    width: 1,
    height: "60%",
  },

  /* Sections */
  sections: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  sectionBlock: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  sectionIconBox: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },

  /* About */
  aboutText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  readMore: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
  readMoreText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  /* Gallery */
  galleryScroll: { marginHorizontal: -16 },
  galleryItem: {
    width: 160,
    height: 112,
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 16,
    marginRight: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  galleryImage: { width: "100%", height: "100%" },

  /* Certifications */
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  certIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  certText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },

  /* Two column */
  twoColRow: { flexDirection: "row", gap: 10 },
  twoColCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 },
  miniSectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  miniSectionIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  miniSectionTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  tagRow: {},
  tag: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 4 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  /* Info list */
  infoListRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  infoListIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  infoListLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  infoListValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  /* Reviews */
  reviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewMeta: { flex: 1 },
  reviewAuthor: { fontSize: 13, fontFamily: "Inter_700Bold" },
  reviewDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  reviewText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic" },

  /* CTA bar */
  ctaBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  ctaIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaBookBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#009246",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaBookText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  /* Booking Modal */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  modalSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  modalLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  serviceChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  serviceChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  notesWrap: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    minHeight: 80,
  },
  notesInput: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  priceSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  priceSummaryLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  priceSummaryValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderRadius: 16,
    shadowColor: "#009246",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
