{/* ── STEP 2: Languages ── */}
<View style={[styles.stepBadge, { backgroundColor: colors.red + "18", marginTop: 8 }]}>
  <Text style={[styles.stepBadgeText, { color: colors.red }]}>
    2 — {t("languagesSpoken")}
  </Text>
</View>

<View style={styles.chipRow}>
  {LANGUAGES.map((lang) => {
    const active = selectedLanguages.includes(lang);

    return (
      <TouchableOpacity
        key={lang}
        style={[
          styles.chip,
          {
            backgroundColor: active ? colors.red : colors.surface,
            borderColor: active ? colors.red : colors.border,
          },
        ]}
        onPress={() =>
          toggleItem(selectedLanguages, lang, setSelectedLanguages)
        }
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.chipText,
            { color: active ? "#fff" : colors.darkText },
          ]}
        >
          {lang}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>