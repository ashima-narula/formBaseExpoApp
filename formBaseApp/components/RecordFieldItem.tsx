import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "../constants/theme";
import {FieldDef} from "../constants/type"

type Props = {
  field: FieldDef;
  value: any;
  onChange: (val: any) => void;
  onOpenMap: () => void;
};

const formatDateDisplay = (date: Date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

export default function RecordFieldItem({
  field,
  value,
  onChange,
  onOpenMap,
}: Props) {
  const [openPicker, setOpenPicker] = useState(false);

  const openDropdown = () => setOpenPicker(true);
  const closeDropdown = () => setOpenPicker(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) onChange(result.assets[0].uri);
  };

  // ---- label row with trash ----
  const LabelRow = (
    <View className="flex-row items-center justify-between mb-2" style={{ paddingRight: 2 }}>
      <Text style={{ color: Colors.TEXT_DARK, fontWeight: "600" }}>
        {field.name} {field.required && <Text style={{ color: Colors.DANGER }}>*</Text>}
      </Text>
    </View>
  );

  // ---- input variations ----
  // text + numeric
  if (field.field_type === "text" || field.field_type === "numeric" || field.field_type === "number") {
    return (
      <View className="mb-6">
        {LabelRow}
        <TextInput
          className="bg-white rounded-xl px-4 py-3 border"
          style={{ borderColor: Colors.CARD_BORDER }}
          placeholder={`Enter ${field.name}`}
          placeholderTextColor={Colors.TEXT_MUTED}
          keyboardType={field.field_type === "numeric" || field.field_type === "number" ? "numeric" : "default"}
          value={value ?? ""}
          onChangeText={onChange}
        />
      </View>
    );
  }

  // multiline
  if (field.field_type === "multiline") {
    return (
      <View className="mb-6">
        {LabelRow}
        <TextInput
          className="bg-white rounded-xl px-4 py-3 border"
          style={{ borderColor: Colors.CARD_BORDER, height: 120 }}
          placeholder={`Enter ${field.name}`}
          placeholderTextColor={Colors.TEXT_MUTED}
          multiline
          value={value ?? ""}
          onChangeText={onChange}
          textAlignVertical="top"
        />
      </View>
    );
  }

  // dropdown
  if (field.field_type === "dropdown" && field.options) {
    const opts = Array.isArray(field.options)
      ? field.options
      : String(field.options).split(",").map((o) => o.trim()).filter(Boolean);

    return (
      <View className="mb-6">
        {LabelRow}

        <TouchableOpacity
          onPress={openDropdown}
          className="flex-row justify-between items-center bg-white border rounded-xl px-4 py-3"
          style={{ borderColor: Colors.CARD_BORDER }}
        >
          <Text style={{ color: Colors.TEXT_DARK }}>
            {value || `Select ${field.name}`}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color={Colors.PRIMARY} />
        </TouchableOpacity>

        <Modal visible={openPicker} transparent animationType="fade" onRequestClose={closeDropdown}>
          <TouchableOpacity
            className="flex-1 bg-black/40 justify-center px-8"
            onPressOut={closeDropdown}
            activeOpacity={1}
          >
            <View className="bg-white rounded-xl p-4 shadow-lg">
              <Text className="font-bold text-lg mb-3" style={{ color: Colors.TEXT_DARK }}>
                Select {field.name}
              </Text>
              <FlatList
                data={opts}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      onChange(item);
                      closeDropdown();
                    }}
                    className="px-4 py-3 rounded-lg"
                  >
                    <Text style={{ color: Colors.TEXT_DARK }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // date
  if (field.field_type === "date") {
    return (
      <View className="mb-6">
        {LabelRow}

        <TouchableOpacity
          onPress={openDropdown}
          className="bg-white border rounded-xl px-4 py-3"
          style={{ borderColor: Colors.CARD_BORDER }}
        >
          <Text style={{ color: Colors.TEXT_DARK }}>
            {value || `Select ${field.name}`}
          </Text>
        </TouchableOpacity>

        <Modal visible={openPicker} transparent animationType="fade" onRequestClose={closeDropdown}>
          <TouchableOpacity
            className="flex-1 bg-black/40 justify-center px-8"
            activeOpacity={1}
            onPressOut={closeDropdown}
          >
            <View className="bg-white rounded-xl p-4 shadow-lg">
              <Text className="font-bold text-lg mb-3" style={{ color: Colors.TEXT_DARK }}>
                Select {field.name}
              </Text>

              <DateTimePicker
                mode="date"
                display="spinner"
                value={new Date()}
                onChange={(e, selectedDate) => {
                  if (selectedDate) onChange(formatDateDisplay(selectedDate));
                }}
              />

              <TouchableOpacity
                onPress={closeDropdown}
                className="mt-3 py-3 rounded-xl"
                style={{ backgroundColor: Colors.PRIMARY }}
              >
                <Text style={{ textAlign: "center", color: Colors.WHITE, fontWeight: "600" }}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

 // location
if (field.field_type === "location") {
  console.log(field,value?.name, "value*****>");
  return (
    <View className="mb-6">
      {LabelRow}

      <View
        className="bg-white border rounded-xl"
        style={{ borderColor: Colors.CARD_BORDER }}
      >
        <TouchableOpacity
          onPress={onOpenMap}
          className="px-4 py-3 flex-row items-center justify-between"
        >
          <View className="flex-1 mr-3">
            <Text
              style={{ color: Colors.TEXT_DARK, fontWeight: value?.name ? "600" : "400" }}
              numberOfLines={1}
            >
              {value?.name
                ? `${value.name}`
                : `Select ${field.name}`}
            </Text>

            {value?.lat && value?.lng && (
              <Text
                style={{
                  color: Colors.TEXT_DARK,
                  opacity: 0.7,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Lat: {value.lat} | Lng: {value.lng}
              </Text>
            )}
          </View>

          <Ionicons name="location-outline" size={20} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>
    </View>
  );
}


  // image
  if (field.field_type === "image") {
    return (
      <View className="mb-6">
        {LabelRow}

        <TouchableOpacity
          onPress={pickImage}
          className="bg-white border rounded-xl p-3 flex-row items-center"
          style={{ borderColor: Colors.CARD_BORDER }}
        >
          <Ionicons name="image-outline" size={20} color={Colors.PRIMARY} />
          <Text style={{ marginLeft: 8, color: Colors.TEXT_DARK, opacity: 0.8 }}>
            {value ? "Change Image" : "Pick Image"}
          </Text>
        </TouchableOpacity>

        {value ? (
          <Image source={{ uri: value }} className="w-full h-40 mt-2 rounded-xl" />
        ) : null}
      </View>
    );
  }

  // fallback
  return (
    <View className="mb-6">
      {LabelRow}
      <Text style={{ color: Colors.TEXT_DARK, opacity: 0.7 }}>
        Unsupported field type: {field.field_type}
      </Text>
    </View>
  );
}
