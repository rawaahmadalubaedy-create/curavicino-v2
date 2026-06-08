import { useColorScheme } from "react-native";
import { useMemo } from "react";
import colors from "@/constants/colors";

export function useColors() {
  const scheme = useColorScheme();

  const palette = scheme === "dark" && "dark" in colors
    ? (colors as any).dark
    : colors.light;

  return useMemo(() => {
    return {
      ...palette,
      radius: colors.radius,
    };
  }, [palette]);
}