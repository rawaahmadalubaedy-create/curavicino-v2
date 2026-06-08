import { Platform } from "react-native";

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0,0,0";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

export function shadow(
  color: string,
  opacity: number,
  radius: number,
  offsetY: number,
  elevation: number
) {
  if (Platform.OS === "web") {
    return {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(${hexToRgb(color)},${opacity})`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}
