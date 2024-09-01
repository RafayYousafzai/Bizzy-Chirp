import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { firebase } from "../firebase";
import { StatusBar } from "expo-status-bar";
import { colors } from "../colors";

export default function AuthScreen({ navigation, btnName, desc, title, nav }) {
  const handleGoogleSignUp = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();

      if (Platform.OS === "web") {
        // For web, use signInWithRedirect
        await firebase.auth().signInWithRedirect(provider);
      } else {
        // For Android and iOS, use signInWithPopup
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;

        // Save user details to Firestore
        const userRef = firebase.firestore().collection("users").doc(user.uid);
        await userRef.set({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          userId: user.uid,
          // Additional user details you want to save
        });

        console.log("Logged in with Google", result);
      }
    } catch (error) {
      console.log("Error signing in with Google:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar />

      <Image source={require("../assets/signup.png")} style={styles.logo} />

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignUp}
      >
        <FontAwesome
          name="google"
          size={25}
          color={colors.textPrimary}
          style={styles.googleIcon}
        />
        <Text style={styles.googleText}>{btnName} with Google</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or</Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{desc}</Text>
        <TouchableOpacity onPress={() => navigation.navigate(nav)}>
          <Text style={styles.footerLink}>{btnName}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundPrimary,
    padding: 20,
  },
  logo: {
    height: 600,
    width: 400,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.textPrimary,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentPrimary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    width: 250,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  footerLink: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
});
