import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";

export default function SubmitButton({
  styles,
  colors,
  loading,
  handleRegister,
  t,
}: any) {
  return (
    <>
      <TouchableOpacity
        style={[
          styles.submitBtn,
          { backgroundColor: colors.red },
          loading && styles.disabled,
        ]}
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitBtnText}>
            {t("register")}
          </Text>
        )}
      </TouchableOpacity>
    </>
  );
}