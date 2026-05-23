import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

const COMPLAINT_TYPES = ["Provider Behavior", "Service Quality", "Payment Issue", "App Bug", "Other"];

export default function ComplaintsScreen() {
  const colors = useColors();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [type, setType] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!type || !title || !description) {
      Alert.alert("", t("required"));
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.red }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("complaints")}</Text>
        <View style={{ width: 38 }} />
      </View>

      {submitted ? (
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.lightGreen }]}>
            <Feather name="check-circle" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.darkText }]}>Complaint Submitted</Text>
          <Text style={[styles.successSub, { color: colors.subText }]}>
            We'll review your complaint and respond within 24 hours.
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>{t("back")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionTitle, { color: colors.darkText }]}>Complaint Type</Text>
          <View style={styles.typesGrid}>
            {COMPLAINT_TYPES.map((ct) => (
              <TouchableOpacity
                key={ct}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: type === ct ? colors.red : colors.muted,
                    borderColor: type === ct ? colors.red : colors.border,
                  },
                ]}
                onPress={() => setType(ct)}
              >
                <Text style={[styles.typeChipText, { color: type === ct ? "#fff" : colors.darkText }]}>
                  {ct}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.darkText }]}>{t("complaintTitle")}</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.input, { color: colors.darkText }]}
              value={title}
              onChangeText={setTitle}
              placeholder={t("complaintTitle")}
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: colors.darkText }]}>{t("complaintDesc")}</Text>
          <View style={[styles.textareaWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.textarea, { color: colors.darkText }]}
              value={description}
              onChangeText={setDescription}
              placeholder={t("complaintDesc")}
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.red }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Feather name="send" size={18} color="#ffffff" />
            <Text style={styles.submitBtnText}>{t("submit")}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#ffffff" },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10, marginTop: 4 },
  typesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  typeChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: "center",
    marginBottom: 16,
  },
  input: { fontSize: 15, fontFamily: "Inter_400Regular" },
  textareaWrap: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    minHeight: 120,
  },
  textarea: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderRadius: 16,
    shadowColor: "#CE2B37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#ffffff" },
  successContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  successIcon: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 12, textAlign: "center" },
  successSub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 28 },
  doneBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  doneBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#ffffff" },
});
