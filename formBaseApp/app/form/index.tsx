import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import FormsList from "../../components/FormsList";
import { useRouter, useNavigation } from "expo-router";
import { Colors } from "../../constants/theme";
import { useCustomHeader } from "../../hooks/use-custom-header";

export default function FormsListUI() {
  const router = useRouter();
  const navigation = useNavigation();

  // ✅ Apply your reusable custom header here
  useCustomHeader(navigation, router, "📋 My Forms");

  return (
    <View className="flex-1 p-5" style={{ backgroundColor: Colors.BACKGROUND }}>

      {/* ✅ Page Title + Add Button */}
      <View className="flex-row justify-between items-center mb-5 mt-2">
        <Text className="text-2xl font-bold" style={{ color: Colors.TEXT_DARK }}>
          My Forms
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/form/add/[id]")}
          activeOpacity={0.8}
          className="px-4 py-2 rounded-xl shadow-md"
          style={{ backgroundColor: Colors.PRIMARY }}
        >
          <Text className="text-white font-semibold text-base">+ Add Form</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ List Component */}
      <FormsList />
    </View>
  );
}
