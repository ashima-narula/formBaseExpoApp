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
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useNavigation } from "expo-router";
import { TouchableOpacity as RNTouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/apiClient";
import { ENV } from "../../lib/env";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function AddForm() {
  const router = useRouter();
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerLeft: () => (
        <RNTouchableOpacity style={styles.headerLeft} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </RNTouchableOpacity>
      ),
      title: "📝 Add New Form",
      headerStyle: { backgroundColor: "#059669" },
      headerTintColor: "#fff",
    });
  }, [navigation, router]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Form title cannot be empty.");
      return;
    }
  
    setLoading(true);
    try {
      const payload = {
        name: title,
        description: description || "",
        username: ENV.VITE_USERNAME,
      };
  
      await api.post("/form", payload);
  
      // ✅ CLEAR FIELDS BEFORE LEAVING
      setTitle("");
      setDescription("");
  
      Alert.alert(
        "Success",
        "Form has been saved successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(), // go back ONLY after clearing
          },
        ],
        { cancelable: false }
      );
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      {/* Form Title */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Form Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter form title"
          style={styles.input}
          editable={!loading}
        />
      </View>

      {/* Description */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter form description"
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
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
          colors={loading ? ["#6ee7b7", "#34d399"] : ["#34D399", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Form</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DFFFD6",
    paddingHorizontal: screenWidth * 0.06,
    paddingVertical: screenHeight * 0.03,
  },
  headerLeft: { marginLeft: 15 },

  inputContainer: {
    marginBottom: screenHeight * 0.03,
  },
  label: {
    fontSize: screenWidth * 0.045,
    color: "#065f46",
    fontWeight: "600",
    marginBottom: screenHeight * 0.008,
  },
  input: {
    backgroundColor: "#fff",
    padding: screenHeight * 0.018,
    borderRadius: screenWidth * 0.04,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    fontSize: screenWidth * 0.045,
    color: "#064e3b",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
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
    color: "#fff",
    fontWeight: "bold",
    fontSize: screenWidth * 0.048,
  },
});
