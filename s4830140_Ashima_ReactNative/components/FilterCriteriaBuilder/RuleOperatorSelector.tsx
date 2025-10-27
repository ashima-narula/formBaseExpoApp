import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { FilterRule } from "../../hooks/use-filter-utils";
import { styles } from "./styles";

/**
 * Rectangular operator chips
 */

type Operator = NonNullable<FilterRule["operator"]>;

type Props = {
  value: Operator;
  options: Operator[];
  onSelect: (v: Operator) => void;
};

export default function RuleOperatorSelector({ value, options, onSelect }: Props) {
  return (
    <View style={styles.rowWrap}>
      {options.map((op) => {
        const active = value === op;
        return (
          <TouchableOpacity
            key={op}
            onPress={() => onSelect(op)}
            style={[styles.chipRect, active ? styles.chipRectActive : styles.chipRectInactive]}
          >
            <Text
              style={[
                styles.chipRectText,
                active ? styles.chipRectTextActive : styles.chipRectTextInactive,
              ]}
            >
              {op}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
