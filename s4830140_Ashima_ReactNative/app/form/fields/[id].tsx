import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet , Alert} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

import { api } from "../../../lib/apiClient";
import NoData from "../../../components/NoData";
import { useCustomHeader } from "../../../hooks/use-custom-header";
import { Colors, screenWidth, screenHeight } from "../../../constants/theme";
import { TEXTS } from "../../../constants/texts";
import { FieldDef, FieldType } from "../../../constants/type";

// ✅ Field Type labels for UI
const fieldTypeLabels: Record<FieldType, string> = {
  text: "Text",
  multiline: "Multiline",
  dropdown: "Dropdown",
  location: "Location",
  image: "Image",
  numeric: "Numeric",
  number: "Number",
  date: "Date",
};

export default function FieldsListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [fields, setFields] = useState<FieldDef[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Apply reusable header
  useCustomHeader(navigation, router, TEXTS.FIELD.TITLE);

  // ✅ Fetch fields from API
  const fetchFields = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.get<FieldDef[]>(`/field?form_id=eq.${id}&order=order_index.asc`);
      setFields(data);
    } catch {
      Alert.alert(TEXTS.ERROR.LOAD_FIELDS);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchFields();
    }, [id])
  );

  // ✅ Delete field with toast
  const handleDelete = async (fieldId: number) => {
    try {
      await api.del(`/field?id=eq.${fieldId}`);
      setFields((prev) => prev.filter((f) => f.id !== fieldId));

      // ✅ Success Toast
      Alert.alert("Field deleted successfully");
    } catch {
      // ❌ Error Toast
      Alert.alert("Failed to delete field");
    }
  };

  // ✅ Single field item
  const renderItem = ({ item, index }: { item: FieldDef; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400)}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        {/* Field Title + Subtitle */}
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>
            {TEXTS.FIELD.FIELD_TYPE_LABEL}: {fieldTypeLabels[item.field_type]}
          </Text>
        </View>

        {/* Delete Icon */}
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={22} color={Colors.DANGER} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={fields}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchFields}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>{TEXTS.FIELD.SUBTITLE}</Text>
          </View>
        }
        ListEmptyComponent={<NoData message={TEXTS.FIELD.NO_FIELDS} />}
      />

      {/* ✅ Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push(`/form/fields/add/${id}`)}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>{TEXTS.BUTTON.ADD_FIELD}</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ✅ STYLES (Semantic & Clean) */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  listContent: {
    paddingHorizontal: screenWidth * 0.04,
    paddingBottom: screenHeight * 0.12,
  },
  listHeader: {
    paddingTop: 20,
    paddingBottom: 6,
  },
  listHeaderText: {
    fontSize: 16,
    color: Colors.TEXT_MUTED,
    marginTop: 3,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: screenHeight * 0.018,
    marginBottom: screenHeight * 0.012,
    borderWidth: 1.5,
    borderColor: Colors.CARD_BORDER,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.TEXT,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.TEXT_MUTED,
    marginTop: 2,
  },
  addButton: {
    position: "absolute",
    right: 24,
    bottom: 28,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 30,
    paddingVertical: screenHeight * 0.018,
    paddingHorizontal: screenWidth * 0.07,
  },
  addButtonText: {
    color: Colors.WHITE,
    fontWeight: "700",
    fontSize: 16,
  },
});
