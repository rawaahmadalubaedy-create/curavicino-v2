{/* ── STEP 1: Basic Info ── */}
<View style={[styles.stepBadge, { backgroundColor: colors.red + "18" }]}>
  <Text style={[styles.stepBadgeText, { color: colors.red }]}>
    1 — {t("basicInfo")}
  </Text>
</View>

<InputField
  label={t("fullName")}
  value={fullName}
  onChange={setFullName}
  icon="user"
/>

<InputField
  label={t("age")}
  value={age}
  onChange={setAge}
  icon="calendar"
  keyboard="numeric"
  placeholder="e.g. 35"
/>

<InputField
  label={t("phone")}
  value={phone}
  onChange={setPhone}
  icon="phone"
  keyboard="phone-pad"
  placeholder="+39 000 000 0000"
/>

<InputField
  label={t("email")}
  value={email}
  onChange={setEmail}
  icon="mail"
  keyboard="email-address"
  placeholder={t("email")}
/>

<InputField
  label={t("address")}
  value={address}
  onChange={setAddress}
  icon="map-pin"
  placeholder={t("address")}
/>