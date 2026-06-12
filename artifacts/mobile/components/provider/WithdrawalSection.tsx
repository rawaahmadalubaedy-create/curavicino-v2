import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { Withdrawal } from "@/constants/providerRegister.constants";

export default function WithdrawalSection({
  styles,
  colors,
  t,
  withdrawal,
  setWithdrawal,
}: any) {
  return (
    <>
      {/* Withdrawal preference */}
      <Text style={[styles.subLabel, { color: colors.darkText }]}>
        {t("withdrawal")}
      </Text>

      <View style={styles.withdrawalRow}>
        {(["daily", "weekly", "monthly"] as Withdrawal[]).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.withdrawalBtn,
              {
                backgroundColor:
                  withdrawal === opt
                    ? colors.primary
                    : colors.surface,
                borderColor:
                  withdrawal === opt
                    ? colors.primary
                    : colors.border,
              },
            ]}
            onPress={() => setWithdrawal(opt)}
          >
            <Text
              style={[
                styles.withdrawalTxt,
                {
                  color:
                    withdrawal === opt
                      ? "#fff"
                      : colors.subText,
                },
              ]}
            >
              {t(opt)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}