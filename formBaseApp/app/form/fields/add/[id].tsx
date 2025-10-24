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
import { Colors, screenWidth, screenHeight } from "../../../../constants/theme";
import { TEXTS } from "../../../../constants/texts";

export default function AddField() {
  const { id } = useLocalSearchParams(); // ✅ form_id
  const router = useRouter();
  const navigation = useNavigation();

  // ✅ Apply custom brown header
  useCustomHeader(navigation, router, TEXTS.FIELD.ADDFIELDTITLE);

  // ✅ Local component states
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState<string>("");
  const [options, setOptions] = useState("");
  const [required, setRequired] = useState(false);
  const [isNumeric, setIsNumeric] = useState(false); // ✅ Only for text fields
  const [showPicker, setShowPicker] = useState(false);

  // ✅ Field Type dropdown data
  const fieldTypes = [
    { label: "Text", value: "text" },
    { label: "Multiline", value: "multiline" },
    { label: "Dropdown", value: "dropdown" },
    { label: "Date", value: "date" },
    { label: "Location", value: "location" },
    { label: "Image", value: "image" },
  ];

  // ✅ SAVE FIELD
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
      Alert.alert(TEXTS.SUCCESS.FIELD_ADDED);

      // ✅ Reset the form
      setName("");
      setFieldType("");
      setOptions("");
      setRequired(false);
      setIsNumeric(false);
    } catch (err) {
      console.error(err);
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.GENERIC);
    }
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: Colors.BACKGROUND }}
      contentContainerStyle={{ padding: screenWidth * 0.04 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Screen Title */}
      <Animated.View entering={FadeInDown.duration(500)}>
        {/* FIELD NAME */}
        <Text style={{ fontWeight: "600", color: Colors.TEXT, marginBottom: 6 }}>
          {TEXTS.FIELD.LABEL_NAME}
        </Text>
        <TextInput
          placeholder={TEXTS.FIELD.PLACEHOLDER_NAME}
          value={name}
          onChangeText={setName}
          style={{
            backgroundColor: Colors.WHITE,
            borderWidth: 1,
            borderColor: Colors.CARD_BORDER,
            borderRadius: 14,
            padding: screenHeight * 0.018,
            marginBottom: screenHeight * 0.02,
          }}
        />

        {/* FIELD TYPE (Dropdown) */}
        <Text style={{ fontWeight: "600", color: Colors.TEXT, marginBottom: 6 }}>
          {TEXTS.FIELD.LABEL_TYPE}
        </Text>

        {Platform.OS === "ios" ? (
          <>
            {/* iOS Picker trigger */}
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={{
                backgroundColor: Colors.WHITE,
                borderWidth: 1,
                borderColor: Colors.CARD_BORDER,
                borderRadius: 14,
                padding: screenHeight * 0.018,
                marginBottom: screenHeight * 0.02,
              }}
            >
              <Text style={{ color: Colors.TEXT_DARK }}>
                {fieldType || "Select field type..."}
              </Text>
            </TouchableOpacity>

            {/* iOS Modal Picker */}
            <Modal visible={showPicker} transparent animationType="slide">
              <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
                <View
                  style={{
                    backgroundColor: Colors.WHITE,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    padding: 16,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text style={{ color: Colors.PRIMARY, fontWeight: "600" }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text style={{ color: Colors.PRIMARY, fontWeight: "600" }}>Done</Text>
                    </TouchableOpacity>
                  </View>

                  <Picker selectedValue={fieldType} onValueChange={(v) => setFieldType(v)}>
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
          // ✅ Android Picker
          <View
            style={{
              backgroundColor: Colors.WHITE,
              borderWidth: 1,
              borderColor: Colors.CARD_BORDER,
              borderRadius: 14,
              marginBottom: screenHeight * 0.02,
            }}
          >
            <Picker selectedValue={fieldType} onValueChange={(v) => setFieldType(v)}>
              <Picker.Item label="Select field type..." value="" />
              {fieldTypes.map((f) => (
                <Picker.Item key={f.value} label={f.label} value={f.value} />
              ))}
            </Picker>
          </View>
        )}

        {/* ✅ NUMERIC TOGGLE (Text Only) */}
        {fieldType === "text" && (
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: screenHeight * 0.02 }}>
            <Text style={{ fontWeight: "600", color: Colors.TEXT }}>{TEXTS.FIELD.NUMERIC}</Text>
            <Switch value={isNumeric} onValueChange={setIsNumeric} />
          </View>
        )}

        {/* ✅ DROPDOWN OPTIONS */}
        {fieldType === "dropdown" && (
          <View style={{ marginBottom: screenHeight * 0.02 }}>
            <Text style={{ fontWeight: "600", color: Colors.TEXT, marginBottom: 6 }}>
              {TEXTS.FIELD.LABEL_OPTIONS}
            </Text>
            <TextInput
              placeholder={TEXTS.FIELD.PLACEHOLDER_OPTIONS}
              value={options}
              onChangeText={setOptions}
              style={{
                backgroundColor: Colors.WHITE,
                borderWidth: 1,
                borderColor: Colors.CARD_BORDER,
                borderRadius: 14,
                padding: screenHeight * 0.018,
              }}
            />
          </View>
        )}

        {/* ✅ REQUIRED TOGGLE */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: screenHeight * 0.02 }}>
          <Text style={{ fontWeight: "600", color: Colors.TEXT }}>{TEXTS.FIELD.REQUIRED}</Text>
          <Switch value={required} onValueChange={setRequired} />
        </View>

        {/* ✅ SAVE BUTTON (GRADIENT) */}
        <View style={{ marginTop: screenHeight * 0.02, alignItems: "center" }}>
          <TouchableOpacity className="w-2/3 rounded-xl overflow-hidden shadow-md" onPress={handleSave}>
            <LinearGradient
              colors={Colors.PRIMARY_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: screenHeight * 0.06,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.WHITE} />
              <Text style={{ color: Colors.WHITE, fontWeight: "700", fontSize: screenWidth * 0.045, marginLeft: 8 }}>
                {TEXTS.FIELD.SAVE_BUTTON}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
