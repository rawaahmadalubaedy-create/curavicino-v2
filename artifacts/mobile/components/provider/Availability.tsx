import React from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export default function Availability({
  styles,
  colors,
  t,
  isOnline,
  setIsOnline,
  workingDays,
  setWorkingDays,
  hoursFrom,
  setHoursFrom,
  hoursTo,
  setHoursTo,
  toggleItem,
  DAYS,
}: any) {
  return (
    <>
{/* ── STEP 4: Availability ── */}
<View style={[styles.stepBadge, { backgroundColor: colors.red + "18", marginTop: 8 }]}>
  <Text style={[styles.stepBadgeText, { color: colors.red }]}>4 — {t("availabilitySetup")}</Text>
</View>

<View style={[styles.availRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
  <View style={styles.availRowLeft}>
    <View style={[styles.availDot, { backgroundColor: isOnline ? "#009246" : "#999" }]} />
    <Text style={[styles.availLabel, { color: colors.darkText }]}>
      {isOnline ? t("availableOnline") : t("setOffline")}
    </Text>
  </View>
  <Switch
    value={isOnline}
    onValueChange={setIsOnline}
    trackColor={{ false: "#ccc", true: colors.primary + "88" }}
    thumbColor={isOnline ? colors.primary : "#f0f0f0"}
  />
</View>

<Text style={[styles.subLabel, { color: colors.darkText }]}>{t("workingDays")}</Text>
<View style={styles.daysRow}>
  {DAYS.map((day: any) => {
    const active = workingDays.includes(day);
    return (
      <TouchableOpacity
        key={day}
        style={[
          styles.dayBtn,
          {
            backgroundColor: active ? colors.primary : colors.surface,
            borderColor: active ? colors.primary : colors.border,
          },
        ]}
        onPress={() => toggleItem(workingDays, day, setWorkingDays)}
      >
        <Text style={[styles.dayTxt, { color: active ? "#fff" : colors.subText }]}>{day}</Text>
      </TouchableOpacity>
    );
  })}
</View>

<Text style={[styles.subLabel, { color: colors.darkText }]}>{t("workingHours")}</Text>
<View style={styles.hoursRow}>
  <View style={styles.hourBlock}>
    <Text style={[styles.hourLabel, { color: colors.subText }]}>{t("from")}</Text>
    <View style={[styles.hourInput, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Feather name="clock" size={16} color={colors.primary} />
      <TextInput
        style={[styles.hourText, { color: colors.darkText }]}
        value={hoursFrom}
        onChangeText={setHoursFrom}
        placeholder="08:00"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="numbers-and-punctuation"
      />
    </View>
  </View>
  <Feather name="arrow-right" size={18} color={colors.subText} style={styles.arrowIcon} />
  <View style={styles.hourBlock}>
    <Text style={[styles.hourLabel, { color: colors.subText }]}>{t("to")}</Text>
    <View style={[styles.hourInput, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Feather name="clock" size={16} color={colors.primary} />
      <TextInput
        style={[styles.hourText, { color: colors.darkText }]}
        value={hoursTo}
        onChangeText={setHoursTo}
        placeholder="18:00"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="numbers-and-punctuation"
      />
    </View>
  </View>
</View>
</>
  );
}