{/* Banking */}
<Text style={[styles.subLabel, { color: colors.darkText }]}>
  {t("linkBanking")}
</Text>

<TouchableOpacity
  style={[
    styles.bankingBtn,
    {
      borderColor: colors.primary,
      backgroundColor: colors.lightGreen,
    },
  ]}
  activeOpacity={0.8}
>
  <Feather name="credit-card" size={20} color={colors.primary} />

  <Text
    style={[
      styles.bankingBtnText,
      { color: colors.primary },
    ]}
  >
    {t("linkBanking")}
  </Text>

  <Feather
    name="chevron-right"
    size={18}
    color={colors.primary}
  />
</TouchableOpacity>