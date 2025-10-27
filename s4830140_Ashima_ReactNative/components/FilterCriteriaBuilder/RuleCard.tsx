import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FilterRule } from "../../hooks/use-filter-utils";
import RuleFieldTypeSelector from "./RuleFieldTypeSelector";
import RuleOperatorSelector from "./RuleOperatorSelector";
import RuleSwitchRow from "./RuleSwitchRow";
import RuleValueInput from "./RuleValueInput";
import { styles } from "./styles";

/**
 * RuleCard
 * - Displays a single rule card (join selector, field type, switches, operator, value, remove)
 */

type FieldTypeOption = { label: string; value: FilterRule["fieldType"] };
type Operator = NonNullable<FilterRule["operator"]>;

type Props = {
  index: number;
  rule: FilterRule;
  fieldTypes: FieldTypeOption[];
  operators: Operator[];
  onChange: (patch: Partial<FilterRule>) => void;
  onRemove: () => void;
};

export default function RuleCard({
  index,
  rule,
  fieldTypes,
  operators,
  onChange,
  onRemove,
}: Props) {
  return (
    <View style={styles.card}>
      {/* AND/OR row for non-first rules */}
      {index > 0 && (
        <View style={styles.joinRow}>
          {(["AND", "OR"] as const).map((opt) => {
            const active = rule.join === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => onChange({ join: opt })}
                style={[
                  styles.chipRect,
                  active ? styles.chipRectActive : styles.chipRectInactive,
                ]}
              >
                <Text
                  style={[
                    styles.chipRectText,
                    active ? styles.chipRectTextActive : styles.chipRectTextInactive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Field type */}
      <View style={styles.block}>
        <Text style={styles.blockLabel}>Field type</Text>
        <RuleFieldTypeSelector
          value={rule.fieldType}
          options={fieldTypes}
          onSelect={(ft) =>
            onChange({
              fieldType: ft,
              operator:
                ft === "text" || ft === "multiline"
                  ? ("contains" as Operator)
                  : ft === "numeric"
                  ? ("equals" as Operator)
                  : ft === "date"
                  ? ("equals" as Operator)
                  : ft === "dropdown"
                  ? ("equals" as Operator)
                  : ft === "location"
                  ? ("contains" as Operator)
                  : rule.operator ?? ("contains" as Operator),
            })
          }
        />
      </View>

      {/* Switches */}
      <RuleSwitchRow
        requiredOnly={rule.requiredOnly}
        numericOnly={rule.numericOnly}
        onChangeRequired={(v) => onChange({ requiredOnly: v })}
        onChangeNumeric={(v) => onChange({ numericOnly: v })}
      />

      {/* Operators */}
      <View style={styles.block}>
        <Text style={styles.blockLabel}>Operator</Text>
        <RuleOperatorSelector
          value={(rule.operator ?? "contains") as Operator}
          options={operators}
          onSelect={(op) => onChange({ operator: op })}
        />
      </View>

      {/* Value input */}
      <RuleValueInput
        fieldType={rule.fieldType}
        value={rule.value}
        onChange={(v) => onChange({ value: v })}
      />

      {/* Remove */}
      <View style={styles.removeRow}>
        <TouchableOpacity onPress={onRemove} style={styles.btnDanger}>
          <Text style={styles.btnDangerText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
