import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, DeviceEventEmitter } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCustomHeader } from "../../../hooks/use-custom-header";

// ✅ Same event name used inside RecordList.tsx
const LOCATION_SELECTED_EVENT = "LOCATION_SELECTED_EVENT";

export default function SelectLocation() {
  const router = useRouter();
  const navigation = useNavigation();

  // ✅ Custom header for this screen
  useCustomHeader(navigation, router, "📍 Select Location");

  // ✅ Params from previous screen: form ID and fieldName (like "Shop Location")
  const { id, field } = useLocalSearchParams<{ id: string; field: string }>();

  // ✅ Map reference (to animate camera)
  const mapRef = useRef<MapView>(null);

  // ✅ Default location (Brisbane)
  const initialRegion: any = {
    latitude: -27.4705,
    longitude: 153.026,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
    locName: "Brisbane"
  };

  // ✅ Local UI states
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  /** ✅ Convert lat/lng to a readable address */
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return data.display_name || "Selected Location";
    } catch {
      return "Selected Location";
    }
  };

  /** ✅ Set initial marker on first load */
  useEffect(() => {
    setMarker({
      lat: initialRegion.latitude,
      lng: initialRegion.longitude,
    });
  }, []);

  /** ✅ Animate camera to a new location */
  const animateTo = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      400
    );
  };

  /** ✅ Search places by text (OpenStreetMap search API) */
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

  /** ✅ Use GPS to fetch current location */
  const handleUseCurrentLocation = async () => {
    // Show default name immediately, even before GPS resolves
    setSearch(initialRegion.locName);

    // Default marker (fallback)
    const lat = initialRegion.latitude;
    const lng = initialRegion.longitude;
    setMarker({ lat, lng });

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Permission denied");

      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      const address = await reverseGeocode(lat, lng);

      setMarker({ lat, lng });
      setSearch(address);
      animateTo(lat, lng);
    } catch {
      // If user denies location — do nothing, default marker stays
    }
  };

  /** ✅ Main action: send location back to RecordList via DeviceEventEmitter */
  const handleConfirm = () => {
    if (!marker || !search.trim() || !field) return;

    // Emit event with location to RecordList
    DeviceEventEmitter.emit(LOCATION_SELECTED_EVENT, {
      field: String(field),
      location: {
        name: search.trim(),
        lat: marker.lat,
        lng: marker.lng,
      },
    });

    router.back(); // ✅ Go back without reload
  };

  return (
    <View className="flex-1 bg-white">

      {/* 🔍 Search Box */}
      <View className="absolute top-20 left-4 right-4 z-20">
        <TextInput
          value={search}
          onChangeText={searchPlaces}
          placeholder="Search or select location on map"
          className="bg-white p-3 rounded-xl border border-gray-300"
        />

        {/* 📌 Autocomplete Suggestions */}
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
                  setSearch(item.display_name);
                  animateTo(lat, lng);
                  setSuggestions([]);
                }}
                className="p-2 border-b border-gray-200"
              >
                <Text>{item.display_name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* 📌 GPS Button */}
        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          className="self-end mt-2 bg-emerald-600 px-3 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="locate-outline" size={18} color="#fff" />
          <Text className="text-white ml-1">Use Current Location</Text>
        </TouchableOpacity>
      </View>

      {/* 🗺 Map View */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        onPress={async (e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setMarker({ lat: latitude, lng: longitude });
          const address = await reverseGeocode(latitude, longitude);
          setSearch(address);
        }}
      >
        {/* 📌 Marker */}
        {marker && (
          <Marker
            draggable
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            onDragEnd={async (e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setMarker({ lat: latitude, lng: longitude });
              const address = await reverseGeocode(latitude, longitude);
              setSearch(address);
            }}
          />
        )}
      </MapView>

      {/* ✅ Confirm Button */}
      <View className="absolute bottom-6 left-4 right-4">
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!search.trim()}
          className={`rounded-full py-4 items-center ${search.trim() ? "bg-emerald-600" : "bg-emerald-300"}`}
        >
          <Text className="text-white font-semibold">Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
