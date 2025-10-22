import { View, Text } from "react-native";

export default function Filter() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <Text className="text-lg font-bold">Filter Builder</Text>
      <Text className="text-gray-500 mt-2 text-center">
        Build filter criteria to query form records (AND/OR supported).
      </Text>
    </View>
  );
}