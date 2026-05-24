import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}

const STAR_FILLED = "#f0a500";
const STAR_EMPTY = "#d8d8d8";

export function StarRating({ rating, size = 18, interactive = false, onRate }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(rating);
        return (
          <TouchableOpacity
            key={i}
            disabled={!interactive}
            onPress={() => onRate?.(i)}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <AntDesign
              name={filled ? "star" : "staro"}
              size={size}
              color={filled ? STAR_FILLED : STAR_EMPTY}
              style={styles.star}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 2 },
  star: {},
});
