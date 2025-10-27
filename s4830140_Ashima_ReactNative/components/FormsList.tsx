import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../lib/apiClient";
import { ENV } from "../lib/env";
import NoData from "./NoData";
import { useFocusEffect } from "@react-navigation/native";
import { pastelColors, Colors } from "../constants/theme";
import { TEXTS } from "../constants/texts";

type Form = {
  id: number;
  name: string;
  description: string;
  username: string;
};

export default function FormsList() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchForms = async () => {
    try {
      const data = await api.get<Form[]>(`/form?username=eq.${ENV.VITE_USERNAME}`);
      setForms(data);
    } catch {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.LOAD_FORMS);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchForms();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchForms();
  };

  const handleDelete = (id: number) => {
    Alert.alert(TEXTS.CONFIRM.DELETE_TITLE, TEXTS.CONFIRM.DELETE_MESSAGE, [
      { text: "Cancel", style: "cancel" },
      {
        text: TEXTS.BUTTON.DELETE,
        style: "destructive",
        onPress: async () => {
          try {
            await api.del("/form", { id: `eq.${id}` });
            setForms((prev) => prev.filter((f) => f.id !== id));
          } catch {
            Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.DELETE_FORM);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item, index }: { item: Form; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      className="mb-3 rounded-2xl overflow-hidden shadow-md"
      style={{
        borderWidth: 2,
        borderColor: Colors.CARD_BORDER,
        shadowColor: Colors.CARD_SHADOW,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/form/records/${item.id}`)}
        className="flex-row items-center p-4 bg-white rounded-t-2xl"
      >
        <View
          className="w-14 h-14 rounded-full mr-4 shadow-md items-center justify-center"
          style={{ backgroundColor: pastelColors[index % pastelColors.length] }}
        >
          <Text className="font-extrabold text-lg text-gray-700">
            {item.name[0]?.toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
          <Text className="text-gray-600 text-sm mt-1">
            {item.description || TEXTS.PLACEHOLDER.NO_DESCRIPTION}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="bg-gray-50 p-3 rounded-b-2xl border-t border-gray-300">
        <View className="flex-row justify-between mb-2">
          <TouchableOpacity
            className="flex-1 mr-2 rounded-md py-2 px-3 flex-row items-center justify-center"
            style={{ backgroundColor: Colors.PRIMARY }}
            onPress={() => router.push(`/form/edit/${item.id}`)}
          >
            <Ionicons name="pencil-outline" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">{TEXTS.BUTTON.EDIT}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 ml-2 rounded-md py-2 px-3 flex-row items-center justify-center"
            style={{ backgroundColor: Colors.PRIMARY_LIGHT }}
            onPress={() => router.push(`/form/records/${item.id}`)}
          >
            <Ionicons name="eye-outline" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">{TEXTS.BUTTON.VIEW}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between">
          <TouchableOpacity
            className="flex-1 mr-2 rounded-md py-2 px-3 flex-row items-center justify-center"
            style={{ backgroundColor: Colors.PRIMARY_LIGHT }}
            onPress={() => router.push(`/form/fields/${item.id}`)}
          >
            <Ionicons name="construct-outline" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">{TEXTS.BUTTON.FIELDS}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 ml-2 rounded-md py-2 px-3 flex-row items-center justify-center"
            style={{ backgroundColor: Colors.DANGER }}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">{TEXTS.BUTTON.DELETE}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1 p-3" style={{ backgroundColor: Colors.BACKGROUND }}>
      <FlatList
        data={forms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<NoData message={TEXTS.PLACEHOLDER.NO_FORMS} />}
        contentContainerStyle={{
          paddingBottom: 30,
          flexGrow: forms.length === 0 ? 1 : 0,
        }}
      />
    </View>
  );
}
