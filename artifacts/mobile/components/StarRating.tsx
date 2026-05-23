import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}

export function StarRating({ rating, size = 18, interactive = false, onRate }: Props) {
  const colors = useColors();

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => onRate?.(i)}
          activeOpacity={0.7}
        >
          <Feather
            name={i <= Math.round(rating) ? "star" : "star"}
            size={size}
            color={i <= Math.round(rating) ? colors.star : colors.border}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 2 },
  star: {},
});
