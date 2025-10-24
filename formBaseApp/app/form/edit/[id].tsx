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

export default function EditForm() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ✅ Custom Header
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
          Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.LOAD_FORMS, [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      } catch (err) {
        Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.LOAD_FORMS, [
          { text: "OK", onPress: () => router.back() },
        ]);
      } finally {
        setFetching(false);
      }
    };
    fetchForm();
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      return Alert.alert(TEXTS.ERROR.TITLE, TEXTS.FORM.ERROR_EMPTY);
    }

    setLoading(true);
    try {
      await api.patch(
        `/form`,
        { name: title, description },
        { id: `eq.${id}` }
      );

      Alert.alert("Success", TEXTS.SUCCESS.FORM_UPDATED, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

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

      {/* Update Button */}
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

// ✅ Styles
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
