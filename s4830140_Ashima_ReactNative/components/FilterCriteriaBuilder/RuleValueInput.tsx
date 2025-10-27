import React from "react";
import { View, Text, TextInput } from "react-native";
import { Colors } from "../../constants/theme";
import { FilterRule } from "../../hooks/use-filter-utils";
import { styles } from "./styles";

/**
 * Input for rule.value with context-aware placeholder and keyboard type
 */

type Props = {
  fieldType: FilterRule["fieldType"];
  value: string;
  onChange: (v: string) => void;
};

export default function RuleValueInput({ fieldType, value, onChange }: Props) {
  const placeholder =
    fieldType === "numeric"
      ? "Enter number…"
      : fieldType === "date"
      ? "DD-MM-YYYY"
      : fieldType === "dropdown"
      ? "Option text…"
      : fieldType === "location"
      ? "Search text in name…"
      : "Enter text…";

  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>Value</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={fieldType === "numeric" ? "numeric" : "default"}
        placeholderTextColor={Colors.TEXT_MUTED}
        style={styles.input}
      />
    </View>
  );
}
