import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
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

  // ✅ Apply reusable brown header
  useCustomHeader(navigation, router, TEXTS.FIELD.TITLE);

  // ✅ Fetch fields from API
  const fetchFields = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.get<FieldDef[]>(`/field?form_id=eq.${id}&order=order_index.asc`);
      setFields(data);
    } catch {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.LOAD_FIELDS);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refresh when screen returns into focus
  useFocusEffect(
    useCallback(() => {
      fetchFields();
    }, [id])
  );

  // ✅ Confirm + Delete Field
  const handleDelete = (fieldId: number) => {
    Alert.alert(
      TEXTS.FIELD.DELETE_CONFIRM_TITLE,
      TEXTS.FIELD.DELETE_CONFIRM_MSG,
      [
        { text: TEXTS.BUTTON.CANCEL ?? "Cancel", style: "cancel" },
        {
          text: TEXTS.BUTTON.DELETE,
          style: "destructive",
          onPress: async () => {
            await api.del("/field", { id: `eq.${fieldId}` });
            setFields((prev) => prev.filter((f) => f.id !== fieldId));
          },
        },
      ]
    );
  };

  // ✅ Single Field Item
  const renderItem = ({ item, index }: { item: FieldDef; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400)}
      style={{
        backgroundColor: Colors.WHITE,
        borderRadius: 16,
        padding: screenHeight * 0.018,
        marginBottom: screenHeight * 0.012,
        borderWidth: 1.5,
        borderColor: Colors.CARD_BORDER,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.TEXT }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.TEXT_MUTED, marginTop: 2 }}>
            {TEXTS.FIELD.FIELD_TYPE_LABEL}: {fieldTypeLabels[item.field_type]}
          </Text>
        </View>

        {/* Trash icon */}
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={22} color={Colors.DANGER} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.BACKGROUND }}>
      <FlatList
        data={fields}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchFields}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: screenWidth * 0.04,
          paddingBottom: screenHeight * 0.12,
        }}
        ListHeaderComponent={
          <View style={{ paddingTop: 20, paddingBottom: 6 }}>
            <Text style={{ fontSize: 16, color: Colors.TEXT_MUTED, marginTop: 3 }}>
              {TEXTS.FIELD.SUBTITLE}
            </Text>
          </View>
        }
        ListEmptyComponent={<NoData message={TEXTS.FIELD.NO_FIELDS} />}
      />

      {/* ✅ Floating Add Field Button */}
      <TouchableOpacity
        onPress={() => router.push(`/form/fields/add/${id}`)}
        style={{
          position: "absolute",
          right: 24,
          bottom: 28,
          backgroundColor: Colors.PRIMARY,
          borderRadius: 30,
          paddingVertical: screenHeight * 0.018,
          paddingHorizontal: screenWidth * 0.07,
        }}
      >
        <Text style={{ color: Colors.WHITE, fontWeight: "700", fontSize: 16 }}>
          {TEXTS.BUTTON.ADD_FIELD}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
