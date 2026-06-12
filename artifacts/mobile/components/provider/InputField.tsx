import React from "react";
import { Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: string;
  keyboard?: any;
  placeholder?: string;
};

export default function InputField({
  label,
  value,
  onChange,
  icon,
  keyboard = "default",
  placeholder = "",
}: Props) {
  const colors = useColors();

  return (
    <View>
      <Text>{label}</Text>

      <View>
        <Feather
          name={icon as any}
          size={18}
          color={colors.subText}
        />

        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard}
          placeholder={placeholder || label}
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize={
            keyboard === "email-address"
              ? "none"
              : "words"
          }
        />
      </View>
    </View>
  );
}