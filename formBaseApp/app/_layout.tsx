import "../global.css";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerTintColor: Colors.WHITE,
          headerStyle: { backgroundColor: Colors.HEADER },
          drawerActiveTintColor: Colors.PRIMARY,
        }}
      >
        {/* ✅ Drawer Screens (header ON) */}
        <Drawer.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: true,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="about"
          options={{
            title: "About",
            headerShown: true,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="information-circle-outline" size={size} color={color} />
            ),
          }}
        />

        {/* ✅ Form List (header ON, because it’s part of Drawer) */}
        <Drawer.Screen
          name="form/index"
          options={{
            title: "Forms",
            headerShown: true,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />

        {/* ❌ All other form screens (header OFF, handled by stack + custom header) */}
        <Drawer.Screen
          name="form"
          options={{
            headerShown: false,
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
