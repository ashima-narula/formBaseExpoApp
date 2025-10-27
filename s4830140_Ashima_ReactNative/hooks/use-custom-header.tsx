import { useLayoutEffect } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

/**
 * Custom reusable hook for setting a consistent header across screens.
 * It applies:
 *  - Title
 *  - Back button with icon
 *  - App-wide header colors
 *
 * @param navigation - navigation object from expo-router
 * @param router     - router instance for navigation actions
 * @param title      - header title to show on the screen
 */
export function useCustomHeader(navigation: any, router: any, title: string) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title,

      // Left header element — a back arrow button
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
          {/* Back Arrow Icon */}
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
      ),

      // Header background and text styling
      headerStyle: { backgroundColor: Colors.HEADER },
      headerTintColor: Colors.WHITE, // applies to title & back icon by default
      headerTitleStyle: {
        fontWeight: "700", // bold title text
      },
    });
  }, [navigation, router, title]);
}
