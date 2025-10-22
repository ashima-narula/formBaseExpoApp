import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../lib/apiClient";
import { ENV } from "../../../lib/env";
import { useCustomHeader } from "../../../hooks/use-custom-header";
import { TEXTS } from "../../../constants/texts";

export default function AddRecord() {
  const { id, from, field, name: locName, lat, lng } = useLocalSearchParams<{
    id: string;
    from?: string;
    field?: string;
    name?: string;
    lat?: string;
    lng?: string;
  }>();

  const router = useRouter();
  const navigation = useNavigation();

  // ✅ Apply custom header
  useCustomHeader(navigation, router, "📝 Recorder");

  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});
  const [openPickerFor, setOpenPickerFor] = useState<string | null>(null);
  const [existingRecordId, setExistingRecordId] = useState<number | null>(null);

  // ✅ Update state
  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  // ✅ Pick Image
  const handleImagePick = async (key: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) handleChange(key, result.assets[0].uri);
  };

  // ✅ Format Date
  const formatDateDisplay = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  // ✅ Load fields & previous record
  useEffect(() => {
    const load = async () => {
      try {
        const [fieldsRes, recordsRes]: any = await Promise.all([
          api.get("/field", { form_id: `eq.${id}` }),
          api.get("/record", {
            form_id: `eq.${id}`,
            username: `eq.${ENV.VITE_USERNAME}`,
          }),
        ]);

        setFields(fieldsRes || []);
        console.log(recordsRes,'recordsRes')
        console.log(fieldsRes,'fieldRes')
        if (recordsRes?.length > 0) {
          const latestRecord = recordsRes[recordsRes.length - 1];
          setExistingRecordId(latestRecord.id);
          setFormData(latestRecord.values || {});
        }
      } catch {
        Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.LOAD_RECORDS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ✅ Handle returned location
  useEffect(() => {
    if (from === "map" && field && locName && lat && lng) {
      handleChange(field, { name: locName, lat: Number(lat), lng: Number(lng) });
    }
  }, [from, field, locName, lat, lng]);

  // ✅ VALIDATION (Required + Numeric)
  const validateForm = () => {
    for (const f of fields) {
      const value = formData[f.name];

      // Required check
      if (f.required && !value) {
        Alert.alert(TEXTS.ERROR.TITLE, TEXTS.VALIDATION.REQUIRED);
        return false;
      }

      // Numeric check
      if (f.field_type === "numeric" && value && isNaN(value)) {
        Alert.alert(TEXTS.ERROR.TITLE, TEXTS.VALIDATION.NUMERIC);
        return false;
      }
    }
    return true;
  };

  // ✅ Submit / Update
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        form_id: Number(id),
        values: formData,
        username: ENV.VITE_USERNAME,
      };

      if (existingRecordId) {
        await api.patch("/record", { values: formData }, { id: `eq.${existingRecordId}` });
        Alert.alert("Success", TEXTS.SUCCESS.RECORD_UPDATED);
      } else {
        await api.post("/record", payload);
        Alert.alert("Success", TEXTS.SUCCESS.RECORD_ADDED);
      }

      router.back();
    } catch {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.SAVE_RECORD);
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#DFFFD6]">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const openMapForField = (fieldName: string) => {
    router.push({
      pathname: "/form/map/[id]",
      params: { id: String(id), field: fieldName },
    });
  };

  return (
    <ScrollView className="flex-1 bg-[#DFFFD6] p-5">
      <Text className="text-2xl font-bold text-emerald-700 mb-4">
        {existingRecordId ? "Edit Record" : "Add Record"}
      </Text>

      {/* ✅ Render Dynamic Fields */}
      {fields.map((f) => (
        <View key={f.id} className="mb-6">
          <Text className="font-semibold text-gray-800 mb-2">
            {f.name} {f.required && <Text className="text-red-500">*</Text>}
          </Text>

          {/* TEXT / NUMERIC */}
          {(f.field_type === "text" || f.field_type === "numeric") && (
            <TextInput
              className="bg-white rounded-xl px-4 py-3 border border-emerald-500"
              placeholder={`Enter ${f.name}`}
              keyboardType={f.field_type === "numeric" ? "numeric" : "default"}
              value={formData[f.name] ?? ""}
              onChangeText={(val) => handleChange(f.name, val)}
            />
          )}

          {/* DROPDOWN */}
          {f.field_type === "dropdown" && f.options && (
            <>
              <TouchableOpacity
                onPress={() => setOpenPickerFor(openPickerFor === f.name ? null : f.name)}
                className="flex-row justify-between items-center bg-white border border-emerald-500 rounded-xl px-4 py-3"
              >
                <Text className="text-gray-700">
                  {formData[f.name] || `Select ${f.name}`}
                </Text>
                <Ionicons
                  name={openPickerFor === f.name ? "chevron-up-outline" : "chevron-down-outline"}
                  size={20}
                  color="#059669"
                />
              </TouchableOpacity>

              <Modal visible={openPickerFor === f.name} transparent animationType="fade">
                <TouchableOpacity
                  className="flex-1 bg-black/40 justify-center px-8"
                  onPressOut={() => setOpenPickerFor(null)}
                  activeOpacity={1}
                >
                  <View className="bg-white rounded-xl p-4 shadow-lg">
                    <Text className="font-bold text-lg mb-3 text-gray-800">
                      Select {f.name}
                    </Text>
                    <FlatList
                      data={Array.isArray(f.options) ? f.options : String(f.options).split(",")}
                      keyExtractor={(item) => item.trim()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => {
                            handleChange(f.name, item.trim());
                            setOpenPickerFor(null);
                          }}
                          className="px-4 py-3 rounded-lg"
                        >
                          <Text className="text-gray-800">{item.trim()}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            </>
          )}

          {/* DATE */}
          {f.field_type === "date" && (
            <>
              <TouchableOpacity
                onPress={() => setOpenPickerFor(f.name)}
                className="bg-white border border-emerald-500 rounded-xl px-4 py-3"
              >
                <Text className="text-gray-700">
                  {formData[f.name] || `Select ${f.name}`}
                </Text>
              </TouchableOpacity>

              {openPickerFor === f.name && (
                <Modal transparent animationType="fade">
                  <TouchableOpacity
                    className="flex-1 bg-black/40 justify-center px-8"
                    activeOpacity={1}
                    onPressOut={() => setOpenPickerFor(null)}
                  >
                    <View className="bg-white rounded-xl p-4 shadow-lg">
                      <Text className="font-bold text-lg mb-3 text-gray-800">
                        Select {f.name}
                      </Text>

                      <DateTimePicker
                        mode="date"
                        display="spinner"
                        value={new Date()}
                        onChange={(e, selectedDate) => {
                          if (selectedDate) {
                            handleChange(f.name, formatDateDisplay(selectedDate));
                          }
                        }}
                      />

                      <TouchableOpacity
                        onPress={() => setOpenPickerFor(null)}
                        className="mt-3 bg-emerald-600 py-3 rounded-xl"
                      >
                        <Text className="text-center text-white font-semibold">
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
            </>
          )}

          {/* LOCATION */}
          {f.field_type === "location" && (
            <View className="bg-white border border-emerald-500 rounded-xl">
              <TouchableOpacity
                onPress={() => openMapForField(f.name)}
                className="px-4 py-3 flex-row items-center justify-between"
              >
                <View className="flex-1 mr-3">
                  {formData[f.name]?.name ? (
                    <>
                      <Text className="text-gray-900 font-medium" numberOfLines={1}>
                        {formData[f.name].name}
                      </Text>
                      <Text className="text-gray-600 text-xs mt-1">
                        Lat: {formData[f.name].lat} | Lng: {formData[f.name].lng}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-gray-700">Select {f.name}</Text>
                  )}
                </View>
                <Ionicons name="location-outline" size={20} color="#059669" />
              </TouchableOpacity>
            </View>
          )}

          {/* IMAGE */}
          {f.field_type === "image" && (
            <>
              <TouchableOpacity
                onPress={() => handleImagePick(f.name)}
                className="bg-white border border-emerald-500 rounded-xl p-3 flex-row items-center mt-1"
              >
                <Ionicons name="image-outline" size={20} color="#059669" />
                <Text className="ml-2 text-gray-700">
                  {formData[f.name] ? "Change Image" : "Pick Image"}
                </Text>
              </TouchableOpacity>

              {formData[f.name] && (
                <Image
                  source={{ uri: formData[f.name] }}
                  className="w-full h-40 mt-2 rounded-xl"
                />
              )}
            </>
          )}
        </View>
      ))}

      {/* ✅ SAVE / UPDATE BUTTON */}
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-emerald-600 py-4 rounded-full mt-8 flex-row items-center justify-center"
      >
        <Ionicons name="checkmark-circle-outline" size={22} color="white" />
        <Text className="text-white ml-2 font-semibold text-base">
          {existingRecordId ? TEXTS.BUTTON.UPDATE : TEXTS.BUTTON.SUBMIT}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
