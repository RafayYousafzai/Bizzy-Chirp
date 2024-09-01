import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { firebase } from "../firebase";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../colors";

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const { uid } = userCredential.user;

        // Retrieve user details from Firestore
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(uid)
          .get();
        if (userDoc.exists) {
          const { displayName, photoURL } = userDoc.data();
          // Save user details in AsyncStorage
          try {
            await AsyncStorage.setItem("isSignedIn", "true");
            await AsyncStorage.setItem("uid", uid);
            await AsyncStorage.setItem("displayName", displayName);
            await AsyncStorage.setItem("photoURL", photoURL);
            await AsyncStorage.setItem("email", email);
          } catch (error) {
            console.log("AsyncStorage Error:", error);
          }
        }
      })
      .catch((error) => {
        // Handle sign-in errors here
        console.log("Sign In Error:", error);
        Alert.alert(
          "Error",
          "Failed to sign in. Please check your credentials and try again."
        );
      });
  };

  return (
    <View style={styles.container}>
      <Header />
      <Image source={require("../assets/signup.png")} style={styles.image} />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          onChangeText={(text) => setEmail(text)}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={true}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <Text
        style={styles.navigate}
        onPress={() => navigation.navigate("SignupScreen")}
      >
        Don't have an Account? Let's Sign up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 400, // Set the desired width of the image
    height: 400, // Set the desired height of the image
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 50,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: "#fff",
  },
  button: {
    width: 300,
    height: 50,
    backgroundColor: colors.accentPrimary,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  navigate: {
    color: colors.textSecondary,
    margin: 20,
  },
});
