// app/about.tsx
import React, { useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, screenWidth, screenHeight } from "../constants/theme";
import { TEXTS } from "../constants/texts";

/**
 * Interactive About Screen (Option C)
 * - Hero with brown gradient
 * - Horizontal card slider for features with scale animation
 * - Dot indicators
 * - Clean brown theme, fully responsive
 * - No custom header (as requested)
 */

// Card sizes / spacing
const CARD_W = screenWidth * 0.78;
const CARD_H = screenHeight * 0.24;
const SPACING = screenWidth * 0.045;
const SNAP = CARD_W + SPACING;

type FeatureCard = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const FEATURES: FeatureCard[] = [
  {
    key: "create",
    title: TEXTS.HOME.FEAT_CREATE,
    subtitle: TEXTS.ABOUT.FEATURES_HINT, // short helper text from ABOUT
    icon: "create-outline",
  },
  {
    key: "collect",
    title: TEXTS.HOME.FEAT_COLLECT,
    subtitle: TEXTS.ABOUT.FEATURES_HINT,
    icon: "download-outline",
  },
  {
    key: "filter",
    title: TEXTS.HOME.FEAT_FILTER,
    subtitle: TEXTS.ABOUT.FEATURES_HINT,
    icon: "filter-outline",
  },
  {
    key: "map",
    title: TEXTS.HOME.FEAT_MAP,
    subtitle: TEXTS.ABOUT.FEATURES_HINT,
    icon: "map-outline",
  },
];

export default function About() {
  // Animated value that tracks horizontal scroll
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={styles.screen}>
      {/* #### Hero / Title Block #### */}
      <LinearGradient
        colors={Colors.PRIMARY_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.hero}
      >
        <View style={styles.heroRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="albums-outline" size={28} color={Colors.WHITE} />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.heroSubtitle}>{TEXTS.ABOUT.SUBTITLE}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* #### What is FormBase #### */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{TEXTS.ABOUT.WHAT_TITLE}</Text>
        <Text style={styles.body}>{TEXTS.ABOUT.WHAT_BODY}</Text>
      </View>

      {/* #### Interactive Feature Slider #### */}
      <Text style={styles.sectionLabel}>{TEXTS.ABOUT.FEATURES_TITLE}</Text>

      <Animated.FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FEATURES}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingHorizontal: SPACING }}
        snapToInterval={SNAP}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          // input ranges for this item’s position
          const inputRange = [
            (index - 1) * SNAP,
            index * SNAP,
            (index + 1) * SNAP,
          ];

          // Scale the current card up a bit as it comes to center
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: "clamp",
          });

          // Fade text slightly for non-focused cards
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: "clamp",
          });

          return (
            <Animated.View style={[styles.featureCard, { transform: [{ scale }] }]}>
              <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={item.icon} size={26} color={Colors.PRIMARY} />
                </View>
                <Animated.Text style={[styles.featureTitle, { opacity }]}>
                  {item.title}
                </Animated.Text>
                <Animated.Text style={[styles.featureSubtitle, { opacity }]}>
                  {item.subtitle}
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

      {/* #### Dots Indicator #### */}
      <View style={styles.dotsRow}>
        {FEATURES.map((_, i) => {
          const inputRange = [(i - 1) * SNAP, i * SNAP, (i + 1) * SNAP];
          const dotScale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.35, 1],
            extrapolate: "clamp",
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={`dot-${i}`}
              style={[
                styles.dot,
                {
                  transform: [{ scale: dotScale }],
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>

      {/* #### Tech Stack #### */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{TEXTS.ABOUT.POWERED_TITLE}</Text>
        <View style={styles.bulletsWrap}>
          <Bullet text={TEXTS.HOME.POWERED_EXPO} icon="logo-react" />
          <Bullet text={TEXTS.HOME.POWERED_API} icon="link-outline" />
          <Bullet text={TEXTS.HOME.POWERED_UI} icon="color-palette-outline" />
        </View>
      </View>

      <Text style={styles.footer}>{TEXTS.ABOUT.FOOTER}</Text>
    </SafeAreaView>
  );
}

/** Small helper for tech bullets */
function Bullet({ text, icon }: { text: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.bulletRow}>
      <Ionicons name={icon} size={18} color={Colors.PRIMARY} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

/* =========================
   Styles
   ========================= */
const PAD = screenWidth * 0.05;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },

  /* Hero */
  hero: {
    paddingHorizontal: PAD,
    paddingTop: screenHeight * 0.02,
    paddingBottom: screenHeight * 0.02,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: Colors.CARD_SHADOW,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroRow: { flexDirection: "row", alignItems: "center" },
  iconBadge: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARY_LIGHT,
  },
  heroTitle: { color: Colors.WHITE, fontWeight: "900", fontSize: 22 },
  heroSubtitle: { color: Colors.WHITE, opacity: 0.85, marginTop: 2 , fontSize: 18,},

  /* Sections / Cards */
  sectionLabel: {
    marginTop: screenHeight * 0.018,
    marginBottom: 8,
    paddingHorizontal: PAD,
    color: Colors.TEXT_DARK,
    fontWeight: "800",
    fontSize: 16,
  },
  card: {
    marginTop: screenHeight * 0.018,
    marginHorizontal: PAD,
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.CARD_BORDER,
    padding: PAD,
  },
  cardTitle: {
    color: Colors.TEXT_DARK,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 8,
  },
  body: { color: Colors.TEXT, lineHeight: 20 },

  /* Feature Carousel */
  featureCard: {
    width: CARD_W,
    height: CARD_H,
    marginRight: SPACING,
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.CARD_BORDER,
    padding: PAD,
    justifyContent: "center",
    shadowColor: Colors.CARD_SHADOW,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3E7DF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  featureTitle: {
    color: Colors.TEXT_DARK,
    fontWeight: "800",
    fontSize: 16,
  },
  featureSubtitle: {
    color: Colors.TEXT_MUTED,
    marginTop: 4,
  },

  /* Dots */
  dotsRow: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: Colors.PRIMARY,
    marginHorizontal: 5,
  },

  /* Tech bullets */
  bulletsWrap: { marginTop: 6 },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  bulletText: { color: Colors.TEXT, marginLeft: 8 },
  footer: {
    textAlign: "center",
    color: Colors.TEXT_MUTED,
    fontSize: 12,
    marginTop: screenHeight * 0.02,
    marginBottom: screenHeight * 0.02,
  },
});
