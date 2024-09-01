import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SignedInStack, SignedOutStack } from "./navigation";
import { firebase } from "./firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "./colors";

const AuthNavigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setIsLoading(false);
      setIsSignedIn(!!user); // Update isSignedIn based on user existence
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkUserSignIn = async () => {
      try {
        const value = await AsyncStorage.getItem("isSignedIn");
        setIsSignedIn(value === "true");
      } catch (error) {
        console.log("AsyncStorage Error:", error);
      }
    };

    checkUserSignIn();
  }, []);

  useEffect(() => {
    const handleSignInChange = async () => {
      try {
        await AsyncStorage.setItem("isSignedIn", String(isSignedIn));
      } catch (error) {
        console.log("AsyncStorage Error:", error);
      }
    };

    handleSignInChange();
  }, [isSignedIn]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.backgroundPrimary,
        }}
      >
        <ActivityIndicator size="large" color={colors.accentSecondary} />
      </View>
    );
  }

  if (isSignedIn) {
    return <SignedInStack />;
  }

  return <SignedOutStack />;
};

export default AuthNavigation;
