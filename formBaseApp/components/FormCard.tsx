import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

type CardProps = {
  id: number;
  name: string;
  description: string;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function FormCard({
  id,
  name,
  description,
  index,
  onView,
  onEdit,
  onDelete,
}: CardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      className="rounded-2xl mb-4 shadow-md overflow-hidden"
    >
      {/* Card Background */}
      <LinearGradient
        colors={["#f9fafb", "#f3f4f6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5"
      >
        <Text className="text-xl font-bold text-gray-900 mb-1">{name}</Text>
        <Text className="text-gray-700 mb-4">{description}</Text>

        {/* Buttons */}
        <View className="flex-row justify-between">
          {/* View */}
          <TouchableOpacity className="flex-1 mr-2" onPress={onView}>
            <LinearGradient
              colors={["#6366F1", "#4F46E5"]}
              className="flex-row items-center justify-center py-2 rounded-xl shadow"
            >
              <Ionicons name="eye-outline" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">View</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Edit */}
          <TouchableOpacity className="flex-1 mx-2" onPress={onEdit}>
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              className="flex-row items-center justify-center py-2 rounded-xl shadow"
            >
              <Ionicons name="pencil-outline" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Edit</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity className="flex-1 ml-2" onPress={onDelete}>
            <LinearGradient
              colors={["#EF4444", "#B91C1C"]}
              className="flex-row items-center justify-center py-2 rounded-xl shadow"
            >
              <Ionicons name="trash-outline" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Delete</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
