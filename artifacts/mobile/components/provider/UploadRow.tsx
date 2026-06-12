import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { useLang } from "@/context/LanguageContext";
import { styles } from "@/styles/providerRegister.styles";
export default function 
  UploadRow({
  label,
  icon,
  uploaded,
  onUpload,
}: {
  label: string;
  icon: string;
  uploaded: boolean;
  onUpload: () => void;
}) {
  const colors = useColors();
  const { t } = useLang();
  return (
    <TouchableOpacity
      style={[
        styles.uploadRow,
        {
          borderColor: uploaded ? colors.primary : colors.border,
          backgroundColor: uploaded ? colors.lightGreen : colors.surface,
        },
      ]}
      onPress={onUpload}
      activeOpacity={0.8}
    >
      <View style={[styles.uploadIcon, { backgroundColor: uploaded ? colors.primary : colors.muted }]}>
        <Feather name={icon as any} size={18} color={uploaded ? "#fff" : colors.subText} />
      </View>
      <Text style={[styles.uploadLabel, { color: colors.darkText }]}>{label}</Text>
      <View style={[styles.uploadStatus, { backgroundColor: uploaded ? colors.primary : "#f0f0f0" }]}>
        <Feather name={uploaded ? "check" : "upload"} size={14} color={uploaded ? "#fff" : colors.subText} />
        <Text style={[styles.uploadStatusText, { color: uploaded ? "#fff" : colors.subText }]}>
          {uploaded ? t("uploaded") : t("tapToUpload")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}