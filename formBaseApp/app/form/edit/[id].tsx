import React, { useState, useEffect } from "react";
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
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { api } from "../../../lib/apiClient";
import { useCustomHeader } from "../../../hooks/use-custom-header";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function EditForm() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ✅ Custom Header (instead of useLayoutEffect)
  useCustomHeader(navigation, router, "✏️ Edit Form");

  useEffect(() => {
    const fetchForm = async () => {
      if (!id) return;
      setFetching(true);
      try {
        const data = await api.get<any[]>("/form", { id: `eq.${id}` });
        if (data && data.length > 0) {
          setTitle(data[0].name);
          setDescription(data[0].description || "");
        } else {
          Alert.alert("Error", "Form not found", [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      } catch (err) {
        Alert.alert("Error", "Failed to fetch form", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } finally {
        setFetching(false);
      }
    };
    fetchForm();
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim())
      return Alert.alert("Error", "Form title cannot be empty.");

    setLoading(true);
    try {
      await api.patch(
        `/form`,
        { name: title, description },
        { id: `eq.${id}` },
      );
      Alert.alert("Success", "Form updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <View style={[styles.inputContainer]}>
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
      <View style={[styles.inputContainer]}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter form description"
          style={[styles.input, { height: screenHeight * 0.15 }]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!loading}
        />
      </View>

      {/* Update Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleUpdate}
        style={styles.buttonWrapper}
        disabled={loading}
      >
        <LinearGradient
          colors={loading ? ["#A7F3D0", "#A7F3D0"] : ["#34D399", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.buttonGradient, { height: screenHeight * 0.06 }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update Form</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DFFFD6",
  },
  container: {
    flex: 1,
    backgroundColor: "#DFFFD6",
    paddingHorizontal: screenWidth * 0.06,
    paddingVertical: screenHeight * 0.03,
  },
  inputContainer: {
    marginBottom: screenHeight * 0.035,
  },
  label: {
    fontSize: screenWidth * 0.045,
    color: "#374151",
    fontWeight: "500",
    marginBottom: screenHeight * 0.01,
  },
  input: {
    backgroundColor: "#fff",
    padding: screenHeight * 0.02,
    borderRadius: screenWidth * 0.04,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: screenWidth * 0.045,
    color: "#111827",
    elevation: 2,
  },
  buttonWrapper: {
    borderRadius: screenWidth * 0.06,
    overflow: "hidden",
  },
  buttonGradient: {
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
