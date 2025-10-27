import React, { createContext, useContext, useState, useCallback } from "react";
import { Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Colors, screenWidth } from "../constants/theme";

const ToastContext = createContext({
  showToast: (msg: string) => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: any) => {
  const [toastMessage, setToastMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const slideAnim = new Animated.Value(-60);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setVisible(true);

    // Slide down
    Animated.timing(slideAnim, {
      toValue: 50,
      duration: 250,
      useNativeDriver: false,
    }).start();

    // Auto-hide after 2 sec
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 250,
        useNativeDriver: false,
      }).start(() => setVisible(false));
    }, 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {visible && (
        <Animated.View style={[styles.toast, { top: slideAnim }]}>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    alignSelf: "center",
    minWidth: screenWidth * 0.6,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 999,
  },
  toastText: {
    color: Colors.WHITE,
    fontWeight: "600",
    textAlign: "center",
  },
});
