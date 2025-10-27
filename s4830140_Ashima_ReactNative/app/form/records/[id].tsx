import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
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

export default function RecordList() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const [filtersApplied, setFiltersApplied] = useState(false);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [existingRecordId, setExistingRecordId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [rules, setRules] = useState<FilterRule[]>([emptyRule()]);
  const [filteredFieldNames, setFilteredFieldNames] =
    useState<Set<string> | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useCustomHeader(
    navigation,
    router,
    filtersApplied ? "🔎 Filtered Records" : "📝 Recorder"
  );

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopyRecord = async () => {
    try {
      await Clipboard.setStringAsync(JSON.stringify(formData, null, 2));
      Alert.alert("Copied", "Record data copied to clipboard!");
    } catch {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.GENERIC);
    }
  };

  const openMapForField = (fieldName: string, formData:any) => {
    console.log(formData,'formDataAshima')
    router.push({
      pathname: "/form/map/[id]",
      params: {
        id: String(id),
        field: fieldName,
        // @ts-ignore
        onSelect: (location: any) => {
          console.log({...formData,
            [fieldName]: location},'Asghghk')
          setFormData({
            ...formData,
            [fieldName]: location,
          });
        },
      },
    });
  };

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
      }
    } catch {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.LOAD_RECORDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (existingRecordId) {
        await api.patch(
          "/record",
          { values: formData },
          { id: `eq.${existingRecordId}` }
        );
        Alert.alert("Success", TEXTS.SUCCESS.RECORD_UPDATED);
      } else {
        await api.post("/record", {
          form_id: Number(id),
          values: formData,
          username: ENV.VITE_USERNAME,
        });
        Alert.alert("Success", TEXTS.SUCCESS.RECORD_ADDED);
      }
      router.back();
    } catch {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.SAVE_RECORD);
    }
  };

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

  const onApplyFilters = () => {
    const setNames = applyRulesToFields({ rules, fields, values: formData });
    setFilteredFieldNames(setNames);
    setFiltersApplied(true);
  };

  const onClearFilters = () => {
    setRules([emptyRule()]);
    setFilteredFieldNames(null);
    setFiltersApplied(false);
  };

  const visibleFields =
    !filtersApplied || !filteredFieldNames
      ? fields
      : fields.filter((f) => filteredFieldNames.has(f.name));

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity
        onPress={() => setShowFilters((prev) => !prev)}
        style={styles.filterToggleButton}
      >
        <Text style={styles.filterToggleText}>
          {showFilters ? "🔽 Hide Filters" : "🔎 Show Filters"}
        </Text>
      </TouchableOpacity>

      {showFilters && (
        <FilterCriteriaBuilder
          rules={rules}
          setRules={setRules}
          onApply={onApplyFilters}
          onClear={onClearFilters}
        />
      )}

      <Text style={styles.titleText}>
        {existingRecordId
          ? filtersApplied
            ? "Edit Record (Filtered)"
            : "Edit Record"
          : filtersApplied
          ? "Add Record (Filtered)"
          : "Add Record"}
      </Text>

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
            onOpenMap={() => openMapForField(f.name, formData)}
          />
        ))
      )}

      <RecordFooterButtons
        isEditMode={!!existingRecordId}
        onSubmit={handleSubmit}
        onDelete={confirmDeleteRecord}
        onCopy={handleCopyRecord}
      />
    </ScrollView>
  );
}

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
