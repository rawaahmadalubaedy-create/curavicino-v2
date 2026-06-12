import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SERVICE_CATEGORIES } from "@/constants/providerRegister.constants";

export default function ServiceCategories({
  styles,
  colors,
  t,
  selectedCategories,
  setSelectedCategories,
  toggleItem,
}: any) {
  return (
    <>
{/* ── STEP 3: Service Categories ── */}
        <View style={[styles.stepBadge, { backgroundColor: colors.red + "18", marginTop: 8 }]}>
          <Text style={[styles.stepBadgeText, { color: colors.red }]}>3 — {t("serviceCategories")}</Text>
        </View>
        <Text style={[styles.helperText, { color: colors.subText }]}>{t("selectAllThatApply")}</Text>
        {SERVICE_CATEGORIES.map((cat) => {
          const active = selectedCategories.includes(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                {
                  borderColor: active ? colors.red : colors.border,
                  backgroundColor: active ? colors.red + "12" : colors.surface,
                },
              ]}
              onPress={() => toggleItem(selectedCategories, cat.id, setSelectedCategories)}
              activeOpacity={0.85}
            >
              <View style={[styles.catIconBox, { backgroundColor: active ? colors.red : colors.muted }]}>
                <Feather name={cat.icon as any} size={20} color={active ? "#fff" : colors.subText} />
              </View>
              <Text style={[styles.catLabel, { color: active ? colors.red : colors.darkText }]}>
                {cat.label}
              </Text>
              {active && <Feather name="check-circle" size={20} color={colors.red} />}
            </TouchableOpacity>
          );
        })}
      </>
  );
}