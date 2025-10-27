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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { api } from "../../../lib/apiClient";
import { useCustomHeader } from "../../../hooks/use-custom-header";
import { Colors, screenWidth, screenHeight } from "../../../constants/theme";
import { TEXTS } from "../../../constants/texts";

/**
 * 📌 EditForm Screen
 * Allows user to edit an existing form (Title + Description)
 * Fetches current data via GET /form?id=eq.{id}
 * Updates data using PATCH /form
 */

export default function EditForm() {
  const router = useRouter();
  const navigation = useNavigation();

  // 🆔 Get route param (/form/edit/[id])
  const { id } = useLocalSearchParams<{ id: string }>();

  // 📝 Controlled inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // ⏳ UI Loading States
  const [loading, setLoading] = useState(false);   // For API update button
  const [fetching, setFetching] = useState(true);  // For initial GET request (screen loader)

  // ✅ Set custom header with title
  useCustomHeader(navigation, router, "✏️ Edit Form");

  /**
   * 📌 Fetch form details when screen opens
   */
  useEffect(() => {
    const fetchForm = async () => {
      if (!id) return;

      setFetching(true);
      try {
        // 🔍 Fetch form by ID
        const data = await api.get<any[]>("/form", { id: `eq.${id}` });

        if (data && data.length > 0) {
          setTitle(data[0].name);
          setDescription(data[0].description || "");
        } else {
          // ❌ If not found
          Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.LOAD_FORMS, [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      } catch (err) {
        // ❌ On fetch error
        Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.LOAD_FORMS, [
          { text: "OK", onPress: () => router.back() },
        ]);
      } finally {
        setFetching(false);
      }
    };

    fetchForm();
  }, [id]);

  /**
   * 💾 Update form details (PATCH request)
   */
  const handleUpdate = async () => {
    if (!title.trim()) {
      return Alert.alert(TEXTS.ERROR.TITLE, TEXTS.FORM.ERROR_EMPTY);
    }

    setLoading(true);
    try {
      // ✅ API call to update form
      await api.patch(
        `/form`,
        { name: title, description },
        { id: `eq.${id}` }
      );

      // ✅ Success alert + navigate back
      Alert.alert("Success", TEXTS.SUCCESS.FORM_UPDATED, [
        { text: "OK", onPress: () => router.back() },
      ]);

    } catch (err) {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ⏳ Show fullscreen loader while fetching initial data
   */
  if (fetching) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 🏷️ Title Input */}
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

      {/* 📝 Description Input */}
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

      {/* 💾 Update Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleUpdate}
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
            <Text style={styles.buttonText}>{TEXTS.BUTTON.UPDATE}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

/**
 * 🎨 Styles
 */
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BACKGROUND,
  },
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
