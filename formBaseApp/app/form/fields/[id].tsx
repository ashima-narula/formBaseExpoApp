import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../../lib/apiClient";
import NoData from "../../../components/NoData";
import { useCustomHeader } from "../../../hooks/use-custom-header";

type FieldType =
  | "text"
  | "multiline"
  | "dropdown"
  | "location"
  | "image"
  | "date";

type Field = {
  id: number;
  form_id: number;
  name: string;
  field_type: FieldType;
  required: boolean;
};

const fieldTypeLabels: Record<FieldType, string> = {
  text: "Text",
  multiline: "Multiline",
  dropdown: "Dropdown",
  location: "Location",
  image: "Image",
  date: "Date",
};

export default function FieldsListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Apply reusable header
  useCustomHeader(navigation, router, "⚙️ Fields");

  // ✅ Fetch Fields
  const fetchFields = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.get<Field[]>(`/field?form_id=eq.${id}&order=order_index.asc`);
      setFields(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load fields.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFields();
    }, [id])
  );

  // ✅ Row
  const renderItem = ({ item, index }: { item: Field; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      className="bg-white rounded-2xl px-4 py-3 mb-3 border-2 border-emerald-600 shadow-sm"
    >
      <TouchableOpacity className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">{item.name}</Text>
          <Text className="text-xs text-gray-500 mt-1">
            Field Type: {fieldTypeLabels[item.field_type]}
          </Text>
        </View>

        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={22} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

  // ✅ Delete Field
  const handleDelete = (fieldId: number) => {
    Alert.alert("Delete Field?", "This field will be permanently removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.del("/field", { id: `eq.${fieldId}` });
            setFields((prev) => prev.filter((f) => f.id !== fieldId));
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to delete field.");
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-[#DFFFD6]">
      <FlatList
        data={fields}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchFields}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <View className="pt-4 pb-2">
            <Text className="text-2xl font-bold text-gray-900">Fields</Text>
            <Text className="text-sm text-gray-600 mt-1">
              Manage the fields for this form.
            </Text>
          </View>
        }
        ListEmptyComponent={<NoData message="No fields yet!" />}
      />

      {/* ✅ FAB */}
      <TouchableOpacity
        onPress={() => router.push(`/form/fields/add/${id}`)}
        className="absolute right-6 bottom-8 bg-emerald-600 rounded-full px-10 py-4 shadow-lg shadow-emerald-300"
      >
        <Text className="text-white font-semibold text-lg">+ Add Field</Text>
      </TouchableOpacity>
    </View>
  );
}
