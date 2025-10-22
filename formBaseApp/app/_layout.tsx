import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  return (
    <GestureHandlerRootView>
      {/* Child View handles layout styling */}
      <View style={{ flex: 1 }}>
        <Drawer
          screenOptions={{
            headerShown: true,
            drawerActiveTintColor: "#22C55E",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#006A4E" }, // ✅ solid header color
          }}
        >
          <Drawer.Screen
            name="index"
            options={{
              title: "Home",
              drawerIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="about"
            options={{
              title: "About",
              drawerIcon: ({ color, size }) => (
                <Ionicons
                  name="information-circle-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="form/addForm"
            options={{
              drawerItemStyle: { display: "none" }, // hidden from drawer
              headerShown: true,
            }}
          />
          <Drawer.Screen
            name="form/edit/[id]"
            options={{
              drawerItemStyle: { display: "none" }, // hidden from drawer
              headerShown: true,
            }}
          />
        </Drawer>
      </View>
    </GestureHandlerRootView>
  );
}
