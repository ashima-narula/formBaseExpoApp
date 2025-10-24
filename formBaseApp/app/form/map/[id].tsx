import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCustomHeader } from "../../../hooks/use-custom-header";

export default function SelectLocation() {
  const router = useRouter();
  const navigation = useNavigation();

  // ✅ Set custom header
  useCustomHeader(navigation, router, "📍 Select Location");

  const { id, field } = useLocalSearchParams<{ id: string; field: string }>();
  const mapRef = useRef<MapView>(null);

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [placeName, setPlaceName] = useState("");

  const initialRegion: Region = {
    latitude: -27.4705,  // Default: Brisbane
    longitude: 153.0260,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  const animateTo = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      400
    );
  };

  const searchPlaces = async (text: string) => {
    setSearch(text);
    if (!text.trim()) return setSuggestions([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${text}`
      );
      const data = await res.json();
      setSuggestions(data || []);
    } catch {
      setSuggestions([]);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Permission denied");

      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      setMarker({ lat, lng });
      setPlaceName("Current Location");
      animateTo(lat, lng);
    } catch (err) {
      // ✅ Silent fallback
      const lat = initialRegion.latitude;
      const lng = initialRegion.longitude;
      setMarker({ lat, lng });
      setPlaceName("Brisbane (Fallback)");
      animateTo(lat, lng);
    }
  };

  const handleConfirm = () => {
    if (!marker) return;
    router.replace({
      pathname: "/form/records/[id]",
      params: {
        id: String(id),
        from: "map",
        field: String(field),
        name: placeName,
        lat: String(marker.lat),
        lng: String(marker.lng),
      },
    });
  };

  return (
    <View className="flex-1 bg-white">

      {/* 🔍 Search Box */}
      <View className="absolute top-20 left-4 right-4 z-20">
        <TextInput
          value={search}
          onChangeText={searchPlaces}
          placeholder="Search location"
          className="bg-white p-3 rounded-xl border border-gray-300"
        />

        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id.toString()}
            className="bg-white rounded-xl mt-1 max-h-44"
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  const lat = parseFloat(item.lat);
                  const lng = parseFloat(item.lon);
                  setMarker({ lat, lng });
                  setPlaceName(item.display_name);
                  animateTo(lat, lng);
                  setSuggestions([]);
                  setSearch(item.display_name);
                }}
                className="p-2 border-b border-gray-200"
              >
                <Text>{item.display_name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          className="self-end mt-2 bg-emerald-600 px-3 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="locate-outline" size={18} color="#fff" />
          <Text className="text-white ml-1">Use Current Location</Text>
        </TouchableOpacity>
      </View>

      {/* 🗺️ Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setMarker({ lat: latitude, lng: longitude });
          setPlaceName("Dropped Pin");
        }}
      >
        {marker && (
          <Marker
            draggable
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            onDragEnd={(e) =>
              setMarker({
                lat: e.nativeEvent.coordinate.latitude,
                lng: e.nativeEvent.coordinate.longitude,
              })
            }
            title={placeName || "Selected"}
          />
        )}
      </MapView>

      {/* ✅ Confirm */}
      <View className="absolute bottom-6 left-4 right-4">
        {marker && (
          <View className="bg-white rounded-xl p-3 mb-3 shadow">
            <Text className="font-medium" numberOfLines={1}>{placeName}</Text>
            <Text className="text-xs text-gray-600 mt-1">
              Lat: {marker.lat.toFixed(6)} | Lng: {marker.lng.toFixed(6)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!marker}
          className={`rounded-full py-4 items-center ${
            marker ? "bg-emerald-600" : "bg-emerald-300"
          }`}
        >
          <Text className="text-white font-semibold">
            {marker ? "Confirm Location" : "Tap map or search location first"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
