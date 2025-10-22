import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Platform,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../lib/apiClient";
import { ENV } from "../../../../lib/env";
import { useCustomHeader } from "../../../../hooks/use-custom-header";

export default function AddField() {
  const { id } = useLocalSearchParams(); // form_id
  const router = useRouter();
  const navigation = useNavigation();

  // ✅ Apply custom header
  useCustomHeader(navigation, router, "+ Add Field");

  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState<string>("");
  const [options, setOptions] = useState("");
  const [required, setRequired] = useState(false);
  const [isNumeric, setIsNumeric] = useState(false); // ✅ for is_num
  const [showPicker, setShowPicker] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Field name is required.");
      return;
    }
    if (!fieldType) {
      Alert.alert("Validation", "Please select a field type.");
      return;
    }

    try {
      const payload = {
        form_id: Number(id),
        name,
        field_type: fieldType,
        is_num: fieldType === "text" ? isNumeric : false, // ✅ numeric toggle
        options:
          fieldType === "dropdown" && options
            ? options.split(",").map((o) => o.trim()).filter(Boolean)
            : null,
        required,
        order_index: Math.floor(Math.random() * 100),
        username: ENV.VITE_USERNAME,
      };

      await api.post("/field", payload);
      Alert.alert("Success", "Field added successfully!");

      // reset fields
      setName("");
      setFieldType("");
      setOptions("");
      setRequired(false);
      setIsNumeric(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save field.");
    }
  };

  const fieldTypes = [
    { label: "Text", value: "text" },
    { label: "Multiline", value: "multiline" },
    { label: "Dropdown", value: "dropdown" },
    { label: "Date", value: "date" },
    { label: "Location", value: "location" },
    { label: "Image", value: "image" },
  ];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: "#DFFFD6" }}
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text className="text-2xl font-bold text-green-800 mb-5">
          Add New Field
        </Text>

        {/* Field Name */}
        <Text className="font-semibold text-gray-700 mb-1">Field Name</Text>
        <TextInput
          placeholder="Enter field name"
          value={name}
          onChangeText={setName}
          className="bg-white border border-green-300 rounded-xl px-4 py-3 mb-4"
        />

        {/* Field Type */}
        <Text className="font-semibold text-gray-700 mb-1">Field Type</Text>

        {Platform.OS === "ios" ? (
          <>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              className="bg-white border border-green-300 rounded-xl px-4 py-3 mb-4"
            >
              <Text className="text-green-800">
                {fieldType ? fieldType : "Select field type..."}
              </Text>
            </TouchableOpacity>

            <Modal visible={showPicker} transparent animationType="slide">
              <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-2xl p-4">
                  <View className="flex-row justify-between mb-2">
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text className="text-green-700 font-semibold">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text className="text-green-700 font-semibold">Done</Text>
                    </TouchableOpacity>
                  </View>

                  <Picker
                    selectedValue={fieldType}
                    onValueChange={(itemValue) => setFieldType(itemValue)}
                  >
                    <Picker.Item label="Select field type..." value="" />
                    {fieldTypes.map((f) => (
                      <Picker.Item key={f.value} label={f.label} value={f.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <View className="bg-white border border-green-300 rounded-xl px-2 mb-4 overflow-hidden">
            <Picker
              selectedValue={fieldType}
              onValueChange={(itemValue) => setFieldType(itemValue)}
              dropdownIconColor="#065f46"
              style={{ color: "#065f46", height: 50, width: "100%" }}
            >
              <Picker.Item label="Select field type..." value="" color="#9CA3AF" />
              {fieldTypes.map((f) => (
                <Picker.Item key={f.value} label={f.label} value={f.value} />
              ))}
            </Picker>
          </View>
        )}

        {/* ✅ Numeric toggle (only for text) */}
        {fieldType === "text" && (
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-medium text-gray-700">Is Number?</Text>
            <Switch value={isNumeric} onValueChange={setIsNumeric} />
          </View>
        )}

        {/* ✅ Dropdown Options */}
        {fieldType === "dropdown" && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <Text className="font-semibold text-gray-700 mb-1">
              Dropdown Options (comma separated)
            </Text>
            <TextInput
              placeholder="option1, option2, option3"
              value={options}
              onChangeText={setOptions}
              className="bg-white border border-green-300 rounded-xl px-4 py-3 mb-4"
            />
          </Animated.View>
        )}

        {/* Required Toggle */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-medium text-gray-700">Required Field</Text>
          <Switch value={required} onValueChange={setRequired} />
        </View>

        {/* Save Button */}
        <View className="w-full items-center mt-4">
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.8}
            className="w-2/3 rounded-xl overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#34D399", "#059669"]}
              className="h-14 rounded-xl px-4 items-center justify-center"
            >
              <View className="flex-row items-center" style={{ margin: 10 }}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color="white"
                />
                <Text
                  className="text-white font-semibold text-lg ml-2"
                  style={{ lineHeight: 22, textAlign: "center" }}
                >
                  Save Field
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
