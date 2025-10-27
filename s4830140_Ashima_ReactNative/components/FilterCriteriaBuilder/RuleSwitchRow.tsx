import React from "react";
import { View, Switch, Text } from "react-native";
import { Colors } from "../../constants/theme";
import { styles } from "./styles";

/**
 * Two brown-on toggle switches:
 * - Required only
 * - Numeric only
 */

type Props = {
  requiredOnly: boolean;
  numericOnly: boolean;
  onChangeRequired: (v: boolean) => void;
  onChangeNumeric: (v: boolean) => void;
};

export default function RuleSwitchRow({
  requiredOnly,
  numericOnly,
  onChangeRequired,
  onChangeNumeric,
}: Props) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchItem}>
        <Switch
          value={requiredOnly}
          onValueChange={onChangeRequired}
          trackColor={{ true: Colors.PRIMARY, false: "#d6d6d6" }}
          thumbColor={requiredOnly ? Colors.PRIMARY : "#ffffff"}
        />
        <Text style={styles.switchLabel}>Required only</Text>
      </View>

      <View style={styles.switchItem}>
        <Switch
          value={numericOnly}
          onValueChange={onChangeNumeric}
          trackColor={{ true: Colors.PRIMARY, false: "#d6d6d6" }}
          thumbColor={numericOnly ? Colors.PRIMARY : "#ffffff"}
        />
        <Text style={styles.switchLabel}>Numeric only</Text>
      </View>
    </View>
  );
}
