import React, { useState, useLayoutEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useNavigation } from "expo-router";
import { api } from "../../../lib/apiClient";
import { ENV } from "../../../lib/env";
import { useCustomHeader } from "../../../hooks/use-custom-header";
import { Colors, screenWidth , screenHeight} from "../../../constants/theme";
import { TEXTS } from "../../../constants/texts";

// const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function AddForm() {
  const router = useRouter();
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Use shared custom header
  useCustomHeader(navigation, router, TEXTS.FORM.TITLE);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.FORM.ERROR_EMPTY);
      return;
    }

    setLoading(true);
    try {
      await api.post("/form", {
        name: title,
        description: description || "",
        username: ENV.VITE_USERNAME,
      });

      setTitle("");
      setDescription("");

      Alert.alert("Success", TEXTS.FORM.SUCCESS_SAVE, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{TEXTS.FORM.LABEL_NAME}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={TEXTS.FORM.PLACEHOLDER_NAME}
          placeholderTextColor={Colors.TEXT_MUTED}
          style={styles.input}
          editable={!loading}
        />
      </View>

      {/* Description */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{TEXTS.FORM.LABEL_DESCRIPTION}</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={TEXTS.FORM.PLACEHOLDER_DESCRIPTION}
          placeholderTextColor={Colors.TEXT_MUTED}
          style={[styles.input, styles.textArea]}
          multiline
          textAlignVertical="top"
          editable={!loading}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleSubmit}
        style={styles.buttonWrapper}
        disabled={loading}
      >
        <LinearGradient
         colors={Colors.PRIMARY_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.WHITE} />
          ) : (
            <Text style={styles.buttonText}>{TEXTS.FORM.BUTTON_SAVE}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ✅ Styles (uses theme colors)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: screenWidth * 0.06,
    paddingVertical: screenHeight * 0.03,
  },
  inputContainer: {
    marginBottom: screenHeight * 0.03,
  },
  label: {
    fontSize: screenWidth * 0.045,
    color: Colors.TEXT_DARK,
    fontWeight: "600",
    marginBottom: screenHeight * 0.008,
  },
  input: {
    backgroundColor: Colors.WHITE,
    padding: screenHeight * 0.018,
    borderRadius: screenWidth * 0.04,
    borderWidth: 1,
    borderColor: Colors.CARD_BORDER,
    fontSize: screenWidth * 0.045,
    color: Colors.TEXT_DARK,
  },
  textArea: {
    height: screenHeight * 0.15,
  },
  buttonWrapper: {
    marginTop: screenHeight * 0.02,
    borderRadius: screenWidth * 0.06,
    overflow: "hidden",
  },
  buttonGradient: {
    height: screenHeight * 0.06,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: screenWidth * 0.06,
  },
  buttonText: {
    color: Colors.WHITE,
    fontWeight: "bold",
    fontSize: screenWidth * 0.048,
  },
});
