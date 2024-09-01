import React, { useState } from "react";
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { firebase } from "../firebase";
import Header from "./Header";
import { colors } from "../colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreatePost() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false); // State for loader

  const handleBrowseImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === "granted") {
        const result = await ImagePicker.launchImageLibraryAsync();
        if (!result.canceled) {
          setSelectedImage(result.uri);
        }
      } else {
        throw new Error("Permission not granted");
      }
    } catch (error) {
      console.log("Error selecting image:", error);
    }
  };

  const handleSharePost = async () => {
    if (!selectedImage) {
      console.log("No image selected");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child(
        `images/${await AsyncStorage.getItem("uid")}/${Date.now()}`
      );

      await imageRef.put(blob);

      const imageUrl = await imageRef.getDownloadURL();
      console.log(imageUrl); // Log the imageUrl

      const currentUser = {
        uid: await AsyncStorage.getItem("uid"),
        email: await AsyncStorage.getItem("email"),
        photoURL: await AsyncStorage.getItem("photoURL"),
        displayName: await AsyncStorage.getItem("displayName"),
      };

      const post = {
        imageUrl,
        caption,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userPic: currentUser.photoURL,
        userName: currentUser.displayName,
        likes_by_users: [],
      };

      const postsCollection = firebase.firestore().collection("posts");
      const postRef = await postsCollection.add(post);
      console.log("Post created successfully with ID:", postRef.id);

      // Reset the form after successful post creation
      setSelectedImage(null);
      setCaption("");
    } catch (error) {
      console.log("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <View style={styles.container}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name="image-outline"
              size={48}
              color={colors.textSecondary}
            />
          </View>
        )}
        <TextInput
          placeholder="Write a caption..."
          placeholderTextColor={colors.textSecondary}
          style={styles.captionInput}
          value={caption}
          onChangeText={setCaption}
        />
        <View style={{ display: "flex", flexDirection: "row" }}>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={handleBrowseImage}
          >
            <Ionicons
              name="images-outline"
              size={24}
              color={colors.accentPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleSharePost}
          >
            {loading ? (
              <ActivityIndicator color={colors.accentPrimary} /> // Show loader while loading
            ) : (
              <Ionicons name="share" size={24} color={colors.accentSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    margin: 10,
    borderRadius: 5,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 4,
    marginBottom: 16,
  },
  captionInput: {
    width: 200,
    height: 60,
    borderColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  browseButton: {
    width: 48,
    height: 48,
    borderRadius: 5,
    backgroundColor: colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    margin: 5,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 5,
    backgroundColor: colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    margin: 5,
  },
});
