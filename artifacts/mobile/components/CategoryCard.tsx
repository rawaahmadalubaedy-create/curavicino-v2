import { Image } from "expo-image";
import React from "react";
import {
  Dimensions,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

interface Props {
  title: string;
  subtitle: string;
  fee: string;
  image: ImageSourcePropType;
  onPress: () => void;
  accentColor?: string;
}

export function CategoryCard({ title, subtitle, fee, image, onPress, accentColor }: Props) {
  const colors = useColors();
  const accent = accentColor ?? colors.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={image} style={styles.image} contentFit="cover" />
      <View style={[styles.overlay, { backgroundColor: accent + "cc" }]}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={[styles.feeBadge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Text style={styles.feeText}>{fee}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width - 32,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  image: { width: "100%", height: "100%", position: "absolute" },
  overlay: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-end",
  },
  content: {},
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 10,
  },
  feeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  feeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#ffffff",
  },
});
