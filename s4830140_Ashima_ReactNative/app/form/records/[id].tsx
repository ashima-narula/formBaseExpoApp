import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  DeviceEventEmitter,
  EmitterSubscription,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import * as Clipboard from "expo-clipboard";

import { api } from "../../../lib/apiClient";
import { ENV } from "../../../lib/env";
import { useCustomHeader } from "../../../hooks/use-custom-header";
import { Colors } from "../../../constants/theme";
import { TEXTS } from "../../../constants/texts";

import { FieldDef, RecordRow } from "../../../constants/type";
import RecordFieldItem from "../../../components/RecordFieldItem";
import RecordFooterButtons from "../../../components/RecordFooterButtons";

import {
  FilterRule,
  applyRulesToFields,
  emptyRule,
} from "../../../hooks/use-filter-utils";
import FilterCriteriaBuilder from "../../../components/FilterCriteriaBuilder/index";

// ✅ Same event name used in SelectLocation.tsx
const LOCATION_SELECTED_EVENT = "LOCATION_SELECTED_EVENT";

export default function RecordList() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  // ✅ Local State
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [existingRecordId, setExistingRecordId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Filter states
  const [rules, setRules] = useState<FilterRule[]>([emptyRule()]);
  const [filteredFieldNames, setFilteredFieldNames] =
    useState<Set<string> | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Setup custom screen header
  useCustomHeader(
    navigation,
    router,
    filtersApplied ? "🔎 Filtered Records" : "📝 Recorder"
  );

  /** ✅ Update form state when user types/changes input */
  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  /** ✅ Copy full form JSON to clipboard */
  const handleCopyRecord = async () => {
    try {
      await Clipboard.setStringAsync(JSON.stringify(formData, null, 2));
      Alert.alert("Copied", "Record data copied to clipboard!");
    } catch {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.GENERIC);
    }
  };

  /** ✅ Open Map and listen for location result */
  const openMapForField = (fieldName: string) => {
    // Subscribe once to location event
    const sub: EmitterSubscription = DeviceEventEmitter.addListener(
      LOCATION_SELECTED_EVENT,
      (payload: { field: string; location: { name: string; lat: number; lng: number } }) => {
        if (!payload || payload.field !== fieldName) return;

        // Update just this field in formData
        setFormData((prev) => ({
          ...prev,
          [fieldName]: payload.location,
        }));

        sub.remove(); // Clean listener after first update
      }
    );

    // Navigate to map screen
    router.push({
      pathname: "/form/map/[id]",
      params: { id: String(id), field: fieldName },
    });
  };

  /** ✅ Fetch fields + latest saved record */
  const fetchRecord = async () => {
    try {
      const [fieldsRes, recordsRes] = await Promise.all([
        api.get<FieldDef[]>("/field", { form_id: `eq.${id}` }),
        api.get<RecordRow[]>("/record", {
          form_id: `eq.${id}`,
          username: `eq.${ENV.VITE_USERNAME}`,
        }),
      ]);

      setFields(fieldsRes || []);

      if (recordsRes?.length > 0) {
        const latest = recordsRes[recordsRes.length - 1];
        setExistingRecordId(latest.id);
        setFormData(latest.values || {});
      } else {
        setExistingRecordId(null);
        setFormData({});
      }
    } catch {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.LOAD_RECORDS);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Fetch data when screen loads */
  useEffect(() => {
    setLoading(true);
    fetchRecord();
  }, [id]);

  /** ✅ Validate all fields before saving */
  const validateForm = () => {
    for (const f of fields) {
      const value = formData[f.name];

      if (f.required && !value) {
        Alert.alert("Required", `${f.name} is required`);
        return false;
      }

      if (f.is_num && value && isNaN(Number(value))) {
        Alert.alert(`${f.name} must be number`);
        return false;
      }
    }
    return true;
  };

  /** ✅ Save record (insert or update) */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (existingRecordId) {
        // Update record
        await api.patch(
          "/record",
          { values: formData },
          { id: `eq.${existingRecordId}` }
        );
        Alert.alert("Success", TEXTS.SUCCESS.RECORD_UPDATED);
      } else {
        // Insert new record
        await api.post("/record", {
          form_id: Number(id),
          values: formData,
          username: ENV.VITE_USERNAME,
        });
        Alert.alert("Success", TEXTS.SUCCESS.RECORD_ADDED);
      }
      router.back(); // Go back
    } catch {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.SAVE_RECORD);
    }
  };

  /** ✅ Delete record */
  const confirmDeleteRecord = () => {
    if (!existingRecordId) return;

    Alert.alert(TEXTS.CONFIRM.DELETE_RECORD_TITLE, TEXTS.CONFIRM.DELETE_RECORD_MESSAGE, [
      { text: "Cancel", style: "cancel" },
      {
        text: TEXTS.BUTTON.DELETE,
        style: "destructive",
        onPress: async () => {
          try {
            await api.del("/record", { id: `eq.${existingRecordId}` });
            Alert.alert("Success", TEXTS.SUCCESS.RECORD_DELETED);
            router.back();
          } catch {
            Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.GENERIC);
          }
        },
      },
    ]);
  };

  /** ✅ Apply Filters */
  const onApplyFilters = () => {
    const setNames = applyRulesToFields({ rules, fields, values: formData });
    setFilteredFieldNames(setNames);
    setFiltersApplied(true);
  };

  /** ✅ Clear Filters */
  const onClearFilters = () => {
    setRules([emptyRule()]);
    setFilteredFieldNames(null);
    setFiltersApplied(false);
  };

  /** ✅ Decide which fields are visible */
  const visibleFields =
    !filtersApplied || !filteredFieldNames
      ? fields
      : fields.filter((f) => filteredFieldNames.has(f.name));

  /** ✅ Loading UI */
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  /** ✅ MAIN SCREEN UI */
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      
      {/* Toggle Filters */}
      <TouchableOpacity onPress={() => setShowFilters((prev) => !prev)} style={styles.filterToggleButton}>
        <Text style={styles.filterToggleText}>
          {showFilters ? "🔽 Hide Filters" : "🔎 Show Filters"}
        </Text>
      </TouchableOpacity>

      {/* Filter UI */}
      {showFilters && (
        <FilterCriteriaBuilder
          rules={rules}
          setRules={setRules}
          onApply={onApplyFilters}
          onClear={onClearFilters}
        />
      )}

      {/* Title */}
      <Text style={styles.titleText}>
        {existingRecordId
          ? filtersApplied ? "Edit Record (Filtered)" : "Edit Record"
          : filtersApplied ? "Add Record (Filtered)" : "Add Record"}
      </Text>

      {/* Fields */}
      {visibleFields.length === 0 ? (
        <View style={styles.noFieldsBox}>
          <Text style={styles.noFieldsText}>No fields match your filters.</Text>
        </View>
      ) : (
        visibleFields.map((f) => (
          <RecordFieldItem
            key={f.id}
            field={f}
            value={formData[f.name]}
            onChange={(val) => handleChange(f.name, val)}
            onOpenMap={() => openMapForField(f.name)}
          />
        ))
      )}

      {/* Buttons */}
      <RecordFooterButtons
        isEditMode={!!existingRecordId}
        onSubmit={handleSubmit}
        onDelete={confirmDeleteRecord}
        onCopy={handleCopyRecord}
      />
    </ScrollView>
  );
}

/** ✅ Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  scrollContent: { padding: 20, paddingBottom: 36 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BACKGROUND,
  },
  filterToggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: Colors.PRIMARY,
  },
  filterToggleText: { color: Colors.WHITE, fontWeight: "700" },
  titleText: { fontSize: 22, fontWeight: "800", marginBottom: 16, color: Colors.PRIMARY },
  noFieldsBox: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.CARD_BORDER,
  },
  noFieldsText: { textAlign: "center", color: Colors.TEXT_MUTED },
});
