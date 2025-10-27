import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCustomHeader } from "../../../hooks/use-custom-header";

export default function SelectLocation() {
  const router = useRouter();
  const navigation = useNavigation();

  useCustomHeader(navigation, router, "📍 Select Location");

  const { id, field, onSelect: onSelectString } = useLocalSearchParams();
  const onSelect = typeof onSelectString === "function" ? onSelectString : null;

  const mapRef = useRef<MapView>(null);

  const initialRegion: Region = {
    latitude: -27.4705,
    longitude: 153.026,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  /** ✅ Reverse Geocode */
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

  /** ✅ Initial marker */
  useEffect(() => {
    setMarker({
      lat: initialRegion.latitude,
      lng: initialRegion.longitude,
    });
  }, []);

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
      const address = await reverseGeocode(lat, lng);

      setMarker({ lat, lng });
      setSearch(address);
      animateTo(lat, lng);
    } catch {
      console.log("Could not fetch current location");
    }
  };

  /** ✅ MAIN FIX — using callback instead of params */
  const handleConfirm = () => {
    if (!marker || !search.trim()) return;

    const result = {
      name: search.trim(),
      lat: marker.lat,
      lng: marker.lng,
    };

    if (typeof onSelect === "function") {
      onSelect(result); // ✅ Update parent instantly
    }

    router.back(); // ✅ No reload, no filter reset
  };

  return (
    <View className="flex-1 bg-white">

      {/* 🔍 Search Input */}
      <View className="absolute top-20 left-4 right-4 z-20">
        <TextInput
          value={search}
          onChangeText={searchPlaces}
          placeholder="Search or select location on map"
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
        onPress={async (e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setMarker({ lat: latitude, lng: longitude });
          const address = await reverseGeocode(latitude, longitude);
          setSearch(address);
        }}
      >
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
          className={`rounded-full py-4 items-center ${
            search.trim() ? "bg-emerald-600" : "bg-emerald-300"
          }`}
        >
          <Text className="text-white font-semibold">Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
