import { useLayoutEffect } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function useCustomHeader(navigation: any, router: any, title: string) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title,
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerStyle: { backgroundColor: "#059669" },
      headerTintColor: "#fff",
    });
  }, [navigation, router, title]);
}
