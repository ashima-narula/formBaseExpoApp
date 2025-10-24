import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";

import { api } from "../../../lib/apiClient";
import { ENV } from "../../../lib/env";
import { useCustomHeader } from "../../../hooks/use-custom-header";
import { Colors } from "../../../constants/theme";
import { TEXTS } from "../../../constants/texts";
import RecordFieldItem from "../../../components/RecordFieldItem";
import RecordFooterButtons from "../../../components/RecordFooterButtons";
import { FieldDef, RecordRow } from "../../../constants/type";

export default function RecordList() {
    const {
        id,
        from,
        field,
        name: locName,
        lat,
        lng,
    } = useLocalSearchParams<{
        id: string;
        from?: string;
        field?: string;
        name?: string;
        lat?: string;
        lng?: string;
    }>();

    const router = useRouter();
    const navigation = useNavigation();
    useCustomHeader(navigation, router, "📝 Recorder");

    const [fields, setFields] = useState<FieldDef[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [existingRecordId, setExistingRecordId] = useState<number | null>(
        null
    );

    // ✅ Update formData
    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    // handle Copy Record
    const handleCopyRecord = async () => {
        try {
            await Clipboard.setStringAsync(JSON.stringify(formData, null, 2));
            Alert.alert("Copied", "Record data copied to clipboard!");
        } catch {
            Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.GENERIC);
        }
    };

    // ✅ Open Map
    const openMapForField = (fieldName: string) => {
        router.push({
            pathname: "/form/map/[id]",
            params: { id: String(id), field: fieldName },
        });
    };

    // ✅ Fetch Fields + Record
    const fetchRecord = async () => {
        try {
            const [fieldsRes, recordsRes] = await Promise.all([
                api.get<FieldDef[]>("/field", { form_id: `eq.${id}` }),
                api.get<RecordRow[]>("/record", {
                    form_id: `eq.${id}`,
                    username: `eq.${ENV.VITE_USERNAME}`,
                }),
            ]);

            setFields(fieldsRes || []);

            if (recordsRes?.length > 0) {
                const latest = recordsRes[recordsRes.length - 1];
                setExistingRecordId(latest.id);

                // ✅ Merge instead of overwrite
                setFormData((prev) => ({
                    ...prev,
                    ...(latest.values || {}),
                }));
            }
        } catch {
            Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.LOAD_RECORDS);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Load once
    useEffect(() => {
        fetchRecord();
    }, [id]);

    // ✅ Auto-refresh, BUT skip if returning from map
    useFocusEffect(
        useCallback(() => {
            if (from !== "map") {
                fetchRecord();
            }
        }, [id, from])
    );

    // ✅ Apply selected map location (Safest merge)
    useEffect(() => {
        if (from === "map" && field && locName && lat && lng) {
            setFormData((prev) => ({
                ...prev,
                [field]: { name: locName, lat: Number(lat), lng: Number(lng) },
            }));
        }
    }, [from, field, locName, lat, lng]);

    // ✅ Validation
    const validateForm = () => {
        for (const f of fields) {
            const value = formData[f.name];
            if (f.required && !value) {
                Alert.alert("Required", `${f.name} is required`);
                return false;
            }
            if (f.is_num && value && isNaN(Number(value))) {
                Alert.alert(`${f.name} must be number`);
                return false;
            }
        }
        return true;
    };

    // ✅ Save
    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            if (existingRecordId) {
                await api.patch(
                    "/record",
                    { values: formData },
                    { id: `eq.${existingRecordId}` }
                );
                Alert.alert("Success", TEXTS.SUCCESS.RECORD_UPDATED);
                router.back();
            } else {
                await api.post("/record", {
                    form_id: Number(id),
                    values: formData,
                    username: ENV.VITE_USERNAME,
                });
                Alert.alert("Success", TEXTS.SUCCESS.RECORD_ADDED);
                router.back();
            }
           
        } catch {
            Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.SAVE_RECORD);
        }
    };

    // ✅ Delete Record
    const confirmDeleteRecord = () => {
        if (!existingRecordId) return;
        Alert.alert(
            TEXTS.CONFIRM.DELETE_RECORD_TITLE,
            TEXTS.CONFIRM.DELETE_RECORD_MESSAGE,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: TEXTS.BUTTON.DELETE,
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.del("/record", {
                                id: `eq.${existingRecordId}`,
                            });
                            Alert.alert(
                                "Success",
                                TEXTS.SUCCESS.RECORD_DELETED
                            );
                            router.back();
                        } catch {
                            Alert.alert(TEXTS.ERROR.TITLE, TEXTS.ERROR.GENERIC);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View
                className="flex-1 justify-center items-center"
                style={{ backgroundColor: Colors.BACKGROUND }}
            >
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: Colors.BACKGROUND }}
            contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
            keyboardShouldPersistTaps="handled"
        >
            <Text
                className="text-2xl font-bold mb-4"
                style={{ color: Colors.PRIMARY }}
            >
                {existingRecordId ? "Edit Record" : "Add Record"}
            </Text>

            {fields.map((f) => (
                <RecordFieldItem
                    key={f.id}
                    field={f}
                    value={formData[f.name]}
                    onChange={(val) => handleChange(f.name, val)}
                    onOpenMap={() => openMapForField(f.name)}
                />
            ))}

            <RecordFooterButtons
                isEditMode={!!existingRecordId}
                onSubmit={handleSubmit}
                onDelete={confirmDeleteRecord}
                onCopy={handleCopyRecord} 
            />
        </ScrollView>
    );
}
