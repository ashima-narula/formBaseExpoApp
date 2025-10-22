import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import FormsList from "../components/FormsList";
import { useRouter } from "expo-router";

export default function Home() {
    const router = useRouter();
    return (
        <View
            className="flex-1 p-5"
            style={{ backgroundColor: "#DFFFD6" }} // pista green hex
        >
            {/* Header + Add Form Button */}
            <View className="flex-row justify-between items-center mb-5">
                <Text className="text-3xl font-bold text-gray-800 tracking-tight">
                    📋 My Forms
                </Text>

                {/* Gradient Button */}
                <TouchableOpacity
                    onPress={() => router.push("/form/addForm")}
                    activeOpacity={0.8}
                    className="bg-green-700 px-4 py-2 rounded-xl shadow-md items-center justify-center"
                >
                    <Text className="text-white font-semibold text-lg">
                        + Add Form
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Forms List */}
            <FormsList />
        </View>
    );
}
