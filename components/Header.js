import React from "react";

import InstagramLogoFont from "../assets/fonts/Bulgatti-xgMV.ttf";
import { useFonts } from "expo-font";
import { ActivityIndicator, Text, View } from "react-native";
import { colors } from "../colors";

const styleGradient = {
  gradientText: {
    fontSize: 20,
    color: colors.textPrimary,
    margin: 12,
    fontFamily: "Instagram-Logo-Font",
    padding: 10,
    letterSpacing: 1,
  },
};

export default function Header() {
  // Load the custom font asynchronously
  const [isFontsLoaded] = useFonts({
    "Instagram-Logo-Font": InstagramLogoFont,
  });

  if (!isFontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <View style={{ marginTop: 5, backgroundColor: colors.backgroundPrimary }}>
      <Text style={styleGradient.gradientText}>BizzyChirp</Text>
    </View>
  );
}
