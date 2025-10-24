import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/theme";
import { TEXTS } from "../constants/texts";

// ✅ Footer now receives onCopy from parent instead of handling logic here
type Props = {
  isEditMode: boolean;
  onSubmit: () => void;
  onDelete: () => void;
  onCopy?: () => void; // ✅ NEW callback for copy
};

export default function RecordFooterButtons({
  isEditMode,
  onSubmit,
  onDelete,
  onCopy,
}: Props) {
  // ✅ EDIT MODE — shows Copy, Delete, Update (3 buttons)
  if (isEditMode) {
    return (
      <View className="mt-2 flex-row justify-between">
        {/* COPY */}
        <TouchableOpacity
          onPress={onCopy}
          className="py-3 rounded-xl flex-row items-center justify-center"
          style={{ backgroundColor: Colors.PRIMARY, width: "30%" }}
          activeOpacity={0.9}
        >
          <Ionicons name="copy-outline" size={18} color={Colors.WHITE} />
          <Text style={{ color: Colors.WHITE, fontWeight: "700", marginLeft: 6 }}>
            Copy
          </Text>
        </TouchableOpacity>

        {/* DELETE */}
        <TouchableOpacity
          onPress={onDelete}
          className="py-3 rounded-xl flex-row items-center justify-center"
          style={{ backgroundColor: Colors.DANGER, width: "30%" }}
          activeOpacity={0.9}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.WHITE} />
          <Text style={{ color: Colors.WHITE, fontWeight: "700", marginLeft: 6 }}>
            {TEXTS.BUTTON.DELETE}
          </Text>
        </TouchableOpacity>

        {/* UPDATE */}
        <LinearGradient
          colors={Colors.PRIMARY_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: "30%", borderRadius: 12, overflow: "hidden" }}
        >
          <TouchableOpacity
            onPress={onSubmit}
            className="py-3 rounded-xl flex-row items-center justify-center"
            activeOpacity={0.9}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.WHITE} />
            <Text style={{ color: Colors.WHITE, fontWeight: "700", marginLeft: 6 }}>
              {TEXTS.BUTTON.UPDATE}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // ✅ ADD MODE — Only 1 Submit button (same as before)
  return (
    <View className="items-center mt-4">
      <LinearGradient
        colors={Colors.PRIMARY_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: "70%", borderRadius: 16, overflow: "hidden" }}
      >
        <TouchableOpacity
          onPress={onSubmit}
          className="py-3 rounded-xl flex-row items-center justify-center"
          activeOpacity={0.9}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={Colors.WHITE} />
          <Text style={{ color: Colors.WHITE, fontWeight: "700", marginLeft: 8 }}>
            {TEXTS.BUTTON.SUBMIT}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}
