// components/FieldRenderer.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";

export default function FieldRenderer({ field, value, onChange }: any) {
  const [location, setLocation] = useState(null);

  const handleLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    onChange(loc.coords);
  };

  switch (field.field_type) {
    case "text":
      return (
        <View style={{ marginBottom: 16 }}>
          <Text>{field.label}</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={field.label}
            style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
          />
        </View>
      );

    case "multiline":
      return (
        <View style={{ marginBottom: 16 }}>
          <Text>{field.label}</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={field.label}
            multiline
            numberOfLines={4}
            style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
          />
        </View>
      );

    case "dropdown":
      return (
        <View style={{ marginBottom: 16 }}>
          <Text>{field.label}</Text>
          <Picker
            selectedValue={value}
            onValueChange={(val) => onChange(val)}
            style={{ borderWidth: 1, borderRadius: 8 }}
          >
            {field.options.map((opt: string, idx: number) => (
              <Picker.Item key={idx} label={opt} value={opt} />
            ))}
          </Picker>
        </View>
      );

    case "location":
      return (
        <View style={{ marginBottom: 16 }}>
          <Text>{field.label}</Text>
          <TouchableOpacity
            onPress={handleLocation}
            style={{
              backgroundColor: "#7C3AED",
              padding: 12,
              borderRadius: 8,
              marginTop: 8,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Get Current Location
            </Text>
          </TouchableOpacity>
          {location && (
            <Text style={{ marginTop: 6 }}>
              {`Lat: ${location.latitude}, Lng: ${location.longitude}`}
            </Text>
          )}
        </View>
      );

    case "image":
      return (
        <View style={{ marginBottom: 16 }}>
          <Text>{field.label}</Text>
          <TouchableOpacity
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
              });
              if (!result.canceled) onChange(result.assets[0].uri);
            }}
            style={{
              backgroundColor: "#D946EF",
              padding: 12,
              borderRadius: 8,
              marginTop: 8,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Pick Image
            </Text>
          </TouchableOpacity>
          {value && (
            <Image
              source={{ uri: value }}
              style={{ width: "100%", height: 150, marginTop: 10, borderRadius: 8 }}
            />
          )}
        </View>
      );

    default:
      return null;
  }
}
