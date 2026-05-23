import React from "react";
import { View } from "react-native";

interface Props {
  size?: number;
}

export function ItalianFlagStripes({ size = 24 }: Props) {
  const barWidth = size / 3;
  const height = size * 0.6;
  return (
    <View style={{ flexDirection: "row", width: size, height, borderRadius: 3, overflow: "hidden" }}>
      <View style={{ flex: 1, backgroundColor: "#009246" }} />
      <View style={{ flex: 1, backgroundColor: "#ffffff" }} />
      <View style={{ flex: 1, backgroundColor: "#CE2B37" }} />
    </View>
  );
}

export function HeartHandsLogo({ size = 60 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#009246",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#009246",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: size * 0.11,
            backgroundColor: "#CE2B37",
            marginRight: 2,
          }}
        />
        <View
          style={{
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: size * 0.11,
            backgroundColor: "#ffffff",
          }}
        />
      </View>
    </View>
  );
}
