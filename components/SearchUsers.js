import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firebase } from "../firebase";
import Header from "./Header";
import { colors } from "../colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SearchUsers({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const currentUserId = AsyncStorage.getItem("currentUserUID");
  const handleSearch = async () => {
    try {
      const usersRef = firebase.firestore().collection("users");
      const querySnapshot = await usersRef
        .where("displayName", ">=", searchQuery)
        .where("displayName", "<=", searchQuery + "\uf8ff")
        .get();

      const results = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.userId !== currentUserId) {
          results.push(userData);
        }
      });

      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.log("Error searching for users:", error);
    }
  };

  const handleUserPress = (user) => {
    navigation.navigate("ChatScreen", {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      receiverId: user.userId,
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textPrimary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Search users"
          placeholderTextColor={colors.textPrimary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {showResults && (
        <>
          <Text style={[styles.userName, { marginLeft: 20 }]}>
            Search For "{searchQuery}"
          </Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <>
                <TouchableOpacity onPress={() => handleUserPress(item)}>
                  <View style={styles.userItem}>
                    <Text style={styles.userName}>{item.displayName}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                </TouchableOpacity>
                {/* <Divider color="#36393F" width={2} /> */}
              </>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: "#36393F",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 5,
    paddingHorizontal: 10,
    margin: 10,
    padding: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
  },
  searchButton: {
    marginLeft: 16,
    backgroundColor: colors.accentPrimary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  searchButtonText: {
    color: colors.textPrimary,
  },
  userItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 5,
    marginVertical: 3,
    margin: 10,
    padding: 15,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  userEmail: {
    color: colors.textPrimary,
    fontSize: 12,
  },
});
