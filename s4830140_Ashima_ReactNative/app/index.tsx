import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { Colors, screenWidth, screenHeight } from "../constants/theme";
import { TEXTS } from "../constants/texts";

/**
 * Final Home Screen
 * - Premium spacious layout
 * - Snappy animations (hero + staggered cards + CTA)
 * - Reanimated-driven horizontal slider with scaling/lift
 * - Gold pagination dots (active dot scales)
 */

type Slide = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
};

const SLIDES: Slide[] = [
  {
    key: "create",
    icon: "create-outline",
    title: TEXTS.HOME.SLIDE_CREATE_TITLE,
    desc: TEXTS.HOME.SLIDE_CREATE_DESC,
  },
  {
    key: "capture",
    icon: "clipboard-outline",
    title: TEXTS.HOME.SLIDE_CAPTURE_TITLE,
    desc: TEXTS.HOME.SLIDE_CAPTURE_DESC,
  },
  {
    key: "filter",
    icon: "funnel-outline",
    title: TEXTS.HOME.SLIDE_FILTER_TITLE,
    desc: TEXTS.HOME.SLIDE_FILTER_DESC,
  },
  {
    key: "map",
    icon: "location-outline",
    title: TEXTS.HOME.SLIDE_MAP_TITLE,
    desc: TEXTS.HOME.SLIDE_MAP_DESC,
  },
];

const CARD_W = screenWidth * 0.78;
const CARD_GAP = screenWidth * 0.045;
const SNAP_INTERVAL = CARD_W + CARD_GAP;
const PAD = screenWidth * 0.05;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Slide>);

export default function Home() {
  const router = useRouter();

  // --- Reanimated scroll system ---
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  // For pagination dots: number of slides
  const slideCount = SLIDES.length;

  // Stagger base for hero/cta
  const heroEnter = FadeInUp.duration(260).springify().damping(14);
  const ctaEnter = FadeInUp.delay(280).duration(260).springify().damping(16);

  const renderItem = ({ item, index }: { item: Slide; index: number }) => (
    <SlideCard item={item} index={index} scrollX={scrollX} />
  );

  const keyExtractor = (it: Slide) => it.key;

  // Memoize content container style
  const listContentStyle = useMemo(
    () => ({
      paddingHorizontal: CARD_GAP,
      paddingTop: screenHeight * 0.006, // tiny breath below hint
    }),
    []
  );

  return (
    <SafeAreaView style={styles.screen}>
      {/* Glossy Premium Hero */}
      <Animated.View entering={heroEnter} style={styles.heroShadowWrapper}>
        <LinearGradient
          colors={Colors.GLOSS_GRADIENT}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Gold top shine */}
          <LinearGradient
            colors={[Colors.GOLD_LIGHT + "99", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.4 }}
            style={styles.heroShine}
          />
          {/* Content */}
          <View style={styles.heroIconWrap}>
            <Ionicons name="clipboard-outline" size={36} color={Colors.WHITE} />
          </View>
          <Text style={styles.appName}>{TEXTS.HOME.TITLE}</Text>
          <Text style={styles.tagline}>{TEXTS.HOME.TAGLINE}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Hint */}
      <Text style={styles.hint}>{TEXTS.HOME.FEATURES_HINT}</Text>

      {/* Horizontal interactive slider */}
      <AnimatedFlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={SLIDES}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={listContentStyle}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        bounces={false}
      />

      {/* Pagination Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <Dot key={i} index={i} scrollX={scrollX} />
        ))}
      </View>

      {/* Gold CTA fixed at bottom */}
      <Animated.View entering={ctaEnter} style={styles.ctaWrap}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => router.push("/form")}
        >
          <LinearGradient
            colors={Colors.GOLD_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            <Ionicons
              name="arrow-forward-circle-outline"
              size={22}
              color={Colors.TEXT_DARK}
            />
            <Text style={styles.ctaText}>{TEXTS.HOME.GET_STARTED}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <Text style={styles.footer}>{TEXTS.HOME.FOOTER}</Text>
    </SafeAreaView>
  );
}

/* -------------------- Slide Card -------------------- */
function SlideCard({
  item,
  index,
  scrollX,
}: {
  item: Slide;
  index: number;
  // @ts-ignore
  scrollX: Animated.SharedValue<number>;
}) {
  // Snappy staggered entrance for cards
  const enterDelay = 120 * index;
  const entering = FadeInUp.delay(120 + enterDelay)
    .duration(220)
    .springify()
    .damping(15)
    .stiffness(120);

  // Animated style based on scrollX to scale + lift center card
  // @ts-ignore
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SNAP_INTERVAL,
      index * SNAP_INTERVAL,
      (index + 1) * SNAP_INTERVAL,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.95, 1, 0.95],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [8, 0, 8],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  }, []);

  return (
    // @ts-ignore
    <Animated.View entering={entering} style={[styles.slideCardWrap, animatedStyle]}>
      {/* Glossy mini card */}
      <LinearGradient
        colors={Colors.PRIMARY_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.slideCard}
      >
        {/* subtle gloss overlay */}
        <LinearGradient
          colors={["rgba(255,255,255,0.18)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGloss}
        />
        <View style={styles.slideIconBadge}>
          <Ionicons name={item.icon} size={26} color={Colors.GOLD_LIGHT} />
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDesc}>{item.desc}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

/* -------------------- Pagination Dot -------------------- */
function Dot({
  index,
  scrollX,
}: {
  index: number;
  // @ts-ignore
  scrollX: Animated.SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const center = index * SNAP_INTERVAL;

    const scale = interpolate(
      scrollX.value,
      [center - SNAP_INTERVAL, center, center + SNAP_INTERVAL],
      [1, 1.6, 1],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      [center - SNAP_INTERVAL, center, center + SNAP_INTERVAL],
      [0.45, 1, 0.45],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        style,
        { backgroundColor: Colors.GOLD_LIGHT },
      ]}
    />
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: PAD,
   
  },

  /* ---------- HERO (gloss) ---------- */
  heroShadowWrapper: {
    marginTop: screenHeight * 0.05, // premium breathing space
    marginHorizontal:screenWidth*0.03,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  hero: {
    borderRadius: 22,
    paddingVertical: screenHeight * 0.032,
    paddingHorizontal: PAD,
    overflow: "hidden",
  },
  heroShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: -20,
    height: "50%",
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    marginBottom: 10,
  },
  appName: {
    color: Colors.WHITE,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  tagline: {
    color: Colors.WHITE,
    opacity: 0.95,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 18,
  },

  /* ---------- HINT ---------- */
  hint: {
    color: Colors.TEXT_MUTED,
    fontSize: 12,
    marginTop: screenHeight * 0.028, // larger gap below hero (premium)
    marginBottom: screenHeight * 0.012,
    marginHorizontal:screenWidth*0.03,
  },

  /* ---------- SLIDER ---------- */
  slideCardWrap: {
    width: CARD_W,
  },
  slideCard: {
    borderRadius: 18,
    padding: PAD,
    height: screenHeight * 0.18,
    justifyContent: "center",
    overflow: "hidden",
  },
  cardGloss: {
    position: "absolute",
    top: 0,
    left: -10,
    right: -10,
    height: "45%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  slideIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 10,
  },
  slideTitle: { color: Colors.GOLD_LIGHT, fontWeight: "800", fontSize: 16 },
  slideDesc: {
    color: Colors.WHITE,
    opacity: 0.92,
    marginTop: 6,
    lineHeight: 18,
    fontSize: 13.5,
  },

  /* ---------- DOTS ---------- */
  dotsRow: {
    marginTop: screenHeight * 0.012,
    marginBottom: screenHeight * 0.01,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  /* ---------- CTA ---------- */
  ctaWrap: {
    position: "absolute",
    left: PAD,
    right: PAD,
    bottom: screenHeight * 0.06, // more luxurious spacing
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cta: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ctaText: {
    color: Colors.TEXT_DARK,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.2,
  },

  /* ---------- FOOTER ---------- */
  footer: {
    position: "absolute",
    bottom: screenHeight * 0.02, // subtle offset from bottom edge
    left: PAD,
    right: PAD,
    textAlign: "center",
    color: Colors.TEXT_MUTED,
    fontSize: 12,
  },
});
