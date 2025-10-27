import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { FilterRule } from "../../hooks/use-filter-utils";
import { styles } from "./styles";

/**
 * Rectangular chips for field type selection
 */

type FieldTypeOption = { label: string; value: FilterRule["fieldType"] };

type Props = {
  value: FilterRule["fieldType"];
  options: FieldTypeOption[];
  onSelect: (v: FilterRule["fieldType"]) => void;
};

export default function RuleFieldTypeSelector({ value, options, onSelect }: Props) {
  return (
    <View style={styles.rowWrap}>
      {options.map((ft) => {
        const active = value === ft.value;
        const disabled = ft.value === "image";
        return (
          <TouchableOpacity
            key={ft.value}
            disabled={disabled}
            onPress={() => onSelect(ft.value)}
            style={[
              styles.chipRect,
              active ? styles.chipRectActive : styles.chipRectInactive,
              disabled && styles.chipDisabled,
            ]}
          >
            <Text
              style={[
                styles.chipRectText,
                active ? styles.chipRectTextActive : styles.chipRectTextInactive,
              ]}
            >
              {ft.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
