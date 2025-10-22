import React from "react";
import { View, Text, Image, Dimensions, StyleSheet } from "react-native";

type NoDataProps = {
  message?: string;
  imageUrl?: string;
};

export default function NoData({
  message = "No data found!",
  imageUrl = "https://cdn-icons-png.flaticon.com/512/4076/4076549.png",
}: NoDataProps) {
  const { width, height } = Dimensions.get("window");

  // Dynamic spacing
  const horizontalPadding = width * 0.05; // 5% of screen width
  const verticalMargin = height * 0.02;   // 2% of screen height
  const imageHeight = height * 0.25;      // 25% of screen height
  const imageWidth = width * 0.4;         // 40% of screen width

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: imageWidth,
          height: imageHeight,
          marginBottom: verticalMargin,
        }}
        resizeMode="contain"
      />
      <Text style={[styles.title, { marginBottom: verticalMargin / 2 }]}>{message}</Text>
      <Text style={[styles.subtitle, { marginTop: verticalMargin / 2 }]}>
        Try adding a new item to get started!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
