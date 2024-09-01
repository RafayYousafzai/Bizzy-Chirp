import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { firebase } from "../firebase";
import * as ImagePicker from "expo-image-picker";
import Header from "../components/Header";
import { colors } from "../colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleSignUp = async () => {
    try {
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);

      const { user } = userCredential;

      // Save user details to Firestore
      const userRef = firebase.firestore().collection("users").doc(user.uid);
      await userRef.set({
        displayName: name,
        email: user.email,
        photoURL: user.photoURL,
        userId: user.uid,
        phone: phone,
      });

      // Upload profile photo if selected
      if (profilePhoto) {
        const photoURL = await uploadProfilePhoto(user.uid);
        await userRef.update({ photoURL }); // Save the photo URL in the user document
      }

      // Save user details in AsyncStorage
      try {
        await AsyncStorage.setItem("isSignedIn", "true");
        await AsyncStorage.setItem("uid", user.uid);
        await AsyncStorage.setItem("displayName", name);
        await AsyncStorage.setItem("photoURL", user.photoURL);
        await AsyncStorage.setItem("email", user.email);
        await AsyncStorage.setItem("phone", user.phone);
      } catch (error) {
        console.log("AsyncStorage Error:", error);
      }

      navigation.navigate("Home"); // Replace "Home" with your desired destination screen
    } catch (error) {
      console.log("Signup Error:", error);
      Alert.alert(error.message);
    }
  };

  const uploadProfilePhoto = async (userId) => {
    try {
      const response = await fetch(profilePhoto);
      const blob = await response.blob();

      const storageRef = firebase
        .storage()
        .ref()
        .child(`profilePhotos/${userId}`);
      await storageRef.put(blob);

      const photoURL = await storageRef.getDownloadURL();
      return photoURL;
    } catch (error) {
      console.log("Upload Photo Error:", error);
      Alert.alert("Error", "Failed to upload profile photo. Please try again.");
      return null;
    }
  };

  const handleSelectProfilePhoto = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access the photo library."
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync();

    if (!pickerResult.canceled) {
      const selectedImageUri = pickerResult.assets[0].uri;
      setProfilePhoto(selectedImageUri);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Header />
        <Image source={require("../assets/signup.png")} style={styles.image} />
        <TouchableOpacity onPress={handleSelectProfilePhoto}>
          <View style={styles.profilePhotoContainer}>
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={styles.profilePhoto}
              />
            ) : (
              <Text style={styles.profilePhotoPlaceholder}>Select Photo</Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.textSecondary}
            onChangeText={(text) => setName(text)}
            autoCapitalize="words"
          />
          {/* Phone field */}
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor={colors.textSecondary}
            onChangeText={(text) => setPhone(text)}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            onChangeText={(text) => setEmail(text)}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={true}
            onChangeText={(text) => setPassword(text)}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <Text
          style={styles.navigate}
          onPress={() => navigation.navigate("SigninScreen")}
        >
          Already have an Account? Let's Sign In
        </Text>
      </View>
    </ScrollView>
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
  profilePhotoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePhotoPlaceholder: {
    color: colors.backgroundSecondary,
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
    color: colors.textPrimary,
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
