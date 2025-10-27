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
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { api } from "../../../../lib/apiClient";
import { ENV } from "../../../../lib/env";
import { useCustomHeader } from "../../../../hooks/use-custom-header";
import { Colors, screenWidth, screenHeight } from "../../../../constants/theme";
import { TEXTS } from "../../../../constants/texts";

export default function AddField() {
  const { id } = useLocalSearchParams(); // ✅ form_id from route
  const router = useRouter();
  const navigation = useNavigation();

  // ✅ Set screen header
  useCustomHeader(navigation, router, TEXTS.FIELD.ADDFIELDTITLE);

  // ✅ Local state for field input
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState<string>("");
  const [options, setOptions] = useState("");
  const [required, setRequired] = useState(false);
  const [isNumeric, setIsNumeric] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // ✅ Available field types for picker
  const fieldTypes = [
    { label: "Text", value: "text" },
    { label: "Multiline", value: "multiline" },
    { label: "Dropdown", value: "dropdown" },
    { label: "Date", value: "date" },
    { label: "Location", value: "location" },
    { label: "Image", value: "image" },
  ];

  /**
   * ✅ Save field data to backend
   */
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.FIELD.ERROR_EMPTY);
      return;
    }

    if (!fieldType) {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.FIELD.ERROR_TYPE);
      return;
    }

    try {
      // ✅ Build payload to match DB schema
      const payload = {
        form_id: Number(id),
        name,
        field_type: fieldType,
        is_num: fieldType === "text" ? isNumeric : false,
        options:
          fieldType === "dropdown" && options
            ? options.split(",").map((o) => o.trim()).filter(Boolean)
            : null,
        required,
        order_index: Math.floor(Math.random() * 100),
        username: ENV.VITE_USERNAME,
      };

      await api.post("/field", payload);

      // ✅ Show toast instead of alert
     Alert.alert(TEXTS.SUCCESS.FIELD_ADDED);

      // ✅ Reset form
      setName("");
      setFieldType("");
      setOptions("");
      setRequired(false);
      setIsNumeric(false);
    } catch {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.GENERIC);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: Colors.BACKGROUND }}
      contentContainerStyle={{ padding: screenWidth * 0.04 }}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View entering={FadeInDown.duration(500)}>

        {/* 🏷️ Field Name Input */}
        <Text style={styles.label}>{TEXTS.FIELD.LABEL_NAME}</Text>
        <TextInput
          placeholder={TEXTS.FIELD.PLACEHOLDER_NAME}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* 🧩 Field Type Selector */}
        <Text style={styles.label}>{TEXTS.FIELD.LABEL_TYPE}</Text>

        {/* ✅ Different picker behavior for iOS vs Android */}
        {Platform.OS === "ios" ? (
          <>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
              <Text style={styles.dropdownText}>
                {fieldType || TEXTS.FIELD.PLACEHOLDER_TYPE}
              </Text>
            </TouchableOpacity>

            {/* 📌 iOS modal picker */}
            <Modal visible={showPicker} transparent animationType="slide">
              <View style={styles.pickerOverlay}>
                <View style={styles.pickerContainer}>
                  {/* iOS Picker Header (Cancel / Done) */}
                  <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text style={styles.pickerHeaderText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text style={styles.pickerHeaderText}>Done</Text>
                    </TouchableOpacity>
                  </View>

                  <Picker selectedValue={fieldType} onValueChange={(v) => setFieldType(v)}>
                    <Picker.Item label={TEXTS.FIELD.PLACEHOLDER_TYPE} value="" />
                    {fieldTypes.map((f) => (
                      <Picker.Item key={f.value} label={f.label} value={f.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          // 📌 Android Picker
          <View style={styles.pickerBox}>
            <Picker selectedValue={fieldType} onValueChange={(v) => setFieldType(v)}>
              <Picker.Item label={TEXTS.FIELD.PLACEHOLDER_TYPE} value="" />
              {fieldTypes.map((f) => (
                <Picker.Item key={f.value} label={f.label} value={f.value} />
              ))}
            </Picker>
          </View>
        )}

        {/* 🔢 Numeric toggle only for text fields */}
        {fieldType === "text" && (
          <View className="flex-row justify-between mb-4">
            <Text style={styles.label}>{TEXTS.FIELD.NUMERIC}</Text>
            <Switch
              value={isNumeric}
              onValueChange={setIsNumeric}
              thumbColor={isNumeric ? Colors.PRIMARY : Colors.WHITE}
              trackColor={{ true: Colors.PRIMARY, false: Colors.CARD_BORDER }}
            />
          </View>
        )}

        {/* 📌 Dropdown options input */}
        {fieldType === "dropdown" && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>{TEXTS.FIELD.LABEL_OPTIONS}</Text>
            <TextInput
              placeholder={TEXTS.FIELD.PLACEHOLDER_OPTIONS}
              value={options}
              onChangeText={setOptions}
              style={styles.input}
            />
          </View>
        )}

        {/* ✅ Required toggle */}
        <View className="flex-row justify-between mb-4">
          <Text style={styles.label}>{TEXTS.FIELD.REQUIRED}</Text>
          <Switch
            value={required}
            onValueChange={setRequired}
            thumbColor={required ? Colors.PRIMARY : Colors.WHITE}
            trackColor={{ true: Colors.PRIMARY, false: Colors.CARD_BORDER }}
          />
        </View>

        {/* 💾 Save Button */}
        <View className="items-center mt-2">
          <TouchableOpacity className="w-2/3 rounded-xl overflow-hidden shadow-md" onPress={handleSave}>
            <LinearGradient
              colors={Colors.PRIMARY_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.WHITE} />
              <Text style={styles.buttonText}>{TEXTS.FIELD.SAVE_BUTTON}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </ScrollView>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  label: {
    fontWeight: "600",
    color: Colors.TEXT,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.CARD_BORDER,
    borderRadius: 14,
    padding: screenHeight * 0.018,
    marginBottom: 16,
  },
  dropdownText: { color: Colors.TEXT_DARK },
  pickerBox: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.CARD_BORDER,
    borderRadius: 14,
    marginBottom: 16,
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  pickerContainer: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerHeaderText: {
    color: Colors.PRIMARY,
    fontWeight: "600",
  },
  button: {
    height: screenHeight * 0.06,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: Colors.WHITE,
    fontWeight: "700",
    fontSize: screenWidth * 0.045,
    marginLeft: 8,
  },
});
