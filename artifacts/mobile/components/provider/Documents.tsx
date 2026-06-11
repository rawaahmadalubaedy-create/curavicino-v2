        {/* ── STEP 5: Documents ── */}
        <View style={[styles.stepBadge, { backgroundColor: colors.red + "18", marginTop: 8 }]}>
          <Text style={[styles.stepBadgeText, { color: colors.red }]}>5 — {t("verificationDocs")}</Text>
        </View>

        <UploadRow
          label={t("uploadId")}
          icon="credit-card"
          uploaded={uploads.id}
          onUpload={() => handleUpload("id")}
        />
        <UploadRow
          label={t("uploadMedical")}
          icon="activity"
          uploaded={uploads.medical}
          onUpload={() => handleUpload("medical")}
        />
        <UploadRow
          label={t("uploadCriminal")}
          icon="shield"
          uploaded={uploads.criminal}
          onUpload={() => handleUpload("criminal")}
        />
        <UploadRow
          label={t("uploadPhoto")}
          icon="camera"
          uploaded={uploads.photo}
          onUpload={() => handleUpload("photo")}
        />
