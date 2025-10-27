import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  FilterRule,
  emptyRule,
  fieldTypes,
  TEXT_OPS,
  NUMERIC_OPS,
  DATE_OPS,
  DROPDOWN_OPS,
} from "../../hooks/use-filter-utils";
import RuleCard from "./RuleCard";
import { styles } from "./styles";

/**
 * FilterCriteriaBuilder
 * - Renders the list of rules
 * - Provides Add / Clear / Apply actions
 */

type Props = {
  rules: FilterRule[];
  setRules: (fn: (prev: FilterRule[]) => FilterRule[]) => void;
  onApply: () => void;
  onClear: () => void;
};

type Operator = NonNullable<FilterRule["operator"]>;


const opListFor = (t: FilterRule["fieldType"]): Operator[] => {
    switch (t) {
      case "text":
      case "multiline":
        return TEXT_OPS;
      case "numeric":
        return NUMERIC_OPS;
      case "date":
        return DATE_OPS;
      case "dropdown":
        return DROPDOWN_OPS;
      case "location":
        return ["contains"];
      default:
        return TEXT_OPS;
    }
  };
  

export default function FilterCriteriaBuilder({
  rules,
  setRules,
  onApply,
  onClear,
}: Props) {
  // Add a fresh rule with sensible defaults
  const addRule = () =>
    setRules((prev) => [
      ...prev,
      {
        ...emptyRule(),
        join: prev.length === 0 ? "AND" : "AND",
        fieldType: "text",
        operator: "contains",
      },
    ]);

  const removeRule = (id: string) =>
    setRules((prev) => prev.filter((r) => r.id !== id));

  const updateRule = (id: string, patch: Partial<FilterRule>) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  // Disable Apply if no rules or any rule has an invalid operator
  const disabledApply = useMemo(
    () =>
      rules.length === 0 ||
      rules.some(
        (r) =>
          r.fieldType === "image" ||
          r.operator == null ||
          !(
            [
              "equals",
              "contains",
              "startswith",
              "greater than",
              "less than",
              "greater or equal",
              "less or equal",
            ] as Operator[]
          ).includes(r.operator as Operator)
      ),
    [rules]
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>🔎 Filters</Text>

      {/* Rules list */}
      {rules.map((rule, idx) => (
        <RuleCard
          key={rule.id}
          index={idx}
          rule={rule}
          fieldTypes={fieldTypes}
          operators={opListFor(rule.fieldType)}
          onChange={(patch) => updateRule(rule.id, patch)}
          onRemove={() => removeRule(rule.id)}
        />
      ))}

      {/* Footer actions */}
      <View style={styles.footerRow}>
        <TouchableOpacity onPress={addRule} style={styles.btnGhost}>
          <Text style={styles.btnGhostText}>+ Add</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClear} style={styles.btnWhite}>
          <Text style={styles.btnWhiteText}>Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={disabledApply}
          onPress={onApply}
          style={[styles.btnApply, disabledApply && styles.btnApplyDisabled]}
        >
          <Text style={styles.btnApplyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
