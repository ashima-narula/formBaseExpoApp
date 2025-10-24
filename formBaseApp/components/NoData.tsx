import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Colors, screenWidth, screenHeight } from "../constants/theme";
import { TEXTS } from "../constants/texts";

type NoDataProps = {
  message?: string;   // Optional custom message for the user
  imageUrl?: string;  // Optional custom image for the empty state
};

export default function NoData({
  message = TEXTS.NODATA.TITLE, // Default title from global text constants
  imageUrl = "https://cdn-icons-png.flaticon.com/512/4076/4076549.png",
}: NoDataProps) {
  // Responsive dynamic spacing and sizing
  const horizontalPadding = screenWidth * 0.05;
  const verticalMargin = screenHeight * 0.02;
  const imageHeight = screenHeight * 0.25;
  const imageWidth = screenWidth * 0.4;

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      {/* Empty State Illustration */}
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: imageWidth,
          height: imageHeight,
          marginBottom: verticalMargin,
        }}
        resizeMode="contain"
      />

      {/* Title Message */}
      <Text style={[styles.title, { marginBottom: verticalMargin / 2 }]}>
        {message}
      </Text>

      {/* Subtitle / Helper Text */}
      <Text style={[styles.subtitle, { marginTop: verticalMargin / 2 }]}>
        {TEXTS.NODATA.SUBTITLE}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Center UI content and use theme background
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.BACKGROUND,
  },
  // Title (bold + dark text)
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.TEXT,
    textAlign: "center",
  },
  // Subtitle (lighter gray tone)
  subtitle: {
    fontSize: 16,
    color: Colors.TEXT_MUTED,
    textAlign: "center",
  },
});
