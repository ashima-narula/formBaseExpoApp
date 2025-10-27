// lib/filterUtils.ts
import { FieldDef } from "../constants/type";

// AND/OR
export type AndOr = "AND" | "OR";

// ✅ Operator sets (MUTABLE arrays — fixes readonly tuple errors)
export const TEXT_OPS: any = ["equals", "contains", "startswith"];
export const NUMERIC_OPS: any = [
  "equals",
  "greater than",
  "less than",
  "greater or equal",
  "less or equal",
];
export const DATE_OPS: any= [
  "equals",
  "greater than",
  "less than",
  "greater or equal",
  "less or equal",
];
export const DROPDOWN_OPS: any= ["equals"];

// ✅ Operator types
export type OperatorText = (typeof TEXT_OPS)[number];
export type OperatorNum = (typeof NUMERIC_OPS)[number];
export type OperatorDate = (typeof DATE_OPS)[number];
export type OperatorDrop = (typeof DROPDOWN_OPS)[number];

// ✅ Clean Operator union
export type Operator =
  | OperatorText
  | OperatorNum
  | OperatorDate
  | OperatorDrop;

// ✅ Field type
export type FieldTypeValue =
  | "text"
  | "multiline"
  | "dropdown"
  | "date"
  | "location"
  | "image"
  | "numeric";

// ✅ Selector List
export const fieldTypes: { label: string; value: FieldTypeValue }[] = [
  { label: "Text", value: "text" },
  { label: "Multiline", value: "multiline" },
  { label: "Dropdown", value: "dropdown" },
  { label: "Date", value: "date" },
  { label: "Location", value: "location" },
  { label: "Image", value: "image" },
  { label: "Numeric", value: "numeric" },
];

// ✅ Filter Rule
export type FilterRule = {
  id: string;
  join: AndOr;
  fieldType: FieldTypeValue;
  operator: Operator | null;
  value: string;
  requiredOnly: boolean;
  numericOnly: boolean;
};

// ✅ default new rule
export const emptyRule = (): FilterRule => ({
  id: Math.random().toString(36).slice(2),
  join: "AND",
  fieldType: "text",
  operator: "contains",
  value: "",
  requiredOnly: false,
  numericOnly: false,
});

// ---------------- helpers ----------------

const isNumericDef = (f: FieldDef) =>
  f.is_num || f.field_type === "numeric" || f.field_type === "number";

const typeMatches = (f: FieldDef, t: FieldTypeValue) => {
  if (t === "numeric") return isNumericDef(f);
  if (t === "multiline") return f.field_type === "multiline";
  return f.field_type === t;
};

// ✅ Parse DD-MM-YYYY -> 20240325
export const dateToNumber = (s: string): number => {
  if (!s) return NaN;
  const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return NaN;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (!yyyy || !mm || !dd) return NaN;
  return yyyy * 10000 + mm * 100 + dd;
};

// ✅ Core comparator
export function evalSingle(
  rawValue: any,
  operator: Operator,
  want: string,
  fieldType: FieldTypeValue
): boolean {
  if (fieldType === "numeric" || fieldType === "date") {
    const a = fieldType === "numeric" ? Number(rawValue) : dateToNumber(String(rawValue));
    const b = fieldType === "numeric" ? Number(want) : dateToNumber(String(want));
    if (!isFinite(a) || !isFinite(b)) return false;
    switch (operator) {
      case "equals": return a === b;
      case "greater than": return a > b;
      case "less than": return a < b;
      case "greater or equal": return a >= b;
      case "less or equal": return a <= b;
    }
  }

  if (fieldType === "dropdown") {
    return String(rawValue ?? "").toLowerCase() === want.toLowerCase();
  }

  if (fieldType === "location") {
    return (rawValue?.name ?? "").toLowerCase().includes(want.toLowerCase());
  }

  if (fieldType === "image") return false;

  // text / multiline
  const A = (rawValue ?? "").toString().toLowerCase();
  const B = want.toLowerCase();
  switch (operator) {
    case "equals": return A === B;
    case "contains": return A.includes(B);
    case "startswith": return A.startsWith(B);
  }
}

// ✅ Main filter engine
export function applyRulesToFields(params: {
  rules: FilterRule[];
  fields: FieldDef[];
  values: Record<string, any>;
}): Set<string> {
  const { rules, fields, values } = params;
  const effective = rules.filter((r) => r.operator && r.fieldType !== "image");

  if (effective.length === 0) {
    return new Set(fields.map((f) => f.name));
  }

  const result = new Set<string>();

  fields.forEach((f) => {
    const val = values[f.name];

    const passesAll = effective.reduce((acc, rule, idx) => {
      const candidate =
        typeMatches(f, rule.fieldType) &&
        (!rule.requiredOnly || !!f.required) &&
        (!rule.numericOnly || !!f.is_num);

      const ok = candidate
        ? evalSingle(val, rule.operator!, rule.value, rule.fieldType)
        : false;

      return idx === 0 ? ok : rule.join === "AND" ? acc && ok : acc || ok;
    }, true);

    if (passesAll) result.add(f.name);
  });

  return result;
}
