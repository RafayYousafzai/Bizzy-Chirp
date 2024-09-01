import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { firebase } from "../firebase";
import Header from "./Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../colors";

export default function ChatsList({ navigation }) {
  const [chats, setChats] = useState([]);
  const [originalChats, setOriginalChats] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const loadChats = async () => {
      let currentUserId = await AsyncStorage.getItem("currentUserId");

      if (!currentUserId) {
        currentUserId = firebase.auth().currentUser.uid;
        AsyncStorage.setItem("currentUserId", currentUserId).catch((error) => {
          console.error("Error saving current user ID:", error);
        });
      }

      const unsubscribe = firebase
        .firestore()
        .collection("chats")
        .where("participants", "array-contains", currentUserId)
        .onSnapshot((snapshot) => {
          const chatList = [];
          const promises = [];

          snapshot.forEach((doc) => {
            const chatData = doc.data();
            const otherParticipantId = chatData.participants.find(
              (participantId) => participantId !== currentUserId
            );

            const participantPromise = firebase
              .firestore()
              .collection("users")
              .doc(otherParticipantId)
              .get()
              .then((participantDoc) => {
                const participantData = participantDoc.data();
                const chatWithParticipantsData = {
                  ...chatData,
                  participantsData: [
                    { ...participantData, receiverId: otherParticipantId },
                  ],
                };
                chatList.push(chatWithParticipantsData);
              })
              .catch((error) => {
                console.error("Error retrieving participant data:", error);
              });

            promises.push(participantPromise);
          });

          Promise.all(promises)
            .then(() => {
              setChats(chatList);
              setOriginalChats(chatList); // Store original chats for resetting
              setIsDataLoaded(true);

              // Save chats to AsyncStorage
              AsyncStorage.setItem("chats", JSON.stringify(chatList)).catch(
                (error) => {
                  console.error("Error saving chat data:", error);
                }
              );
            })
            .catch((error) => {
              console.error("Error retrieving chat data:", error);
            });
        });

      // Check if chats are already stored in AsyncStorage
      AsyncStorage.getItem("chats")
        .then((storedChats) => {
          if (storedChats) {
            const parsedChats = JSON.parse(storedChats);
            setChats(parsedChats);
            setOriginalChats(parsedChats);
            setIsDataLoaded(true);
          }
        })
        .catch((error) => {
          console.error("Error retrieving stored chat data:", error);
        });

      return () => {
        unsubscribe();
        AsyncStorage.removeItem("currentUserId").catch((error) => {
          console.error("Error removing current user ID:", error);
        });
      };
    };

    loadChats();
  }, []);

  const filterChats = (text) => {
    const filteredChats = originalChats.filter((chat) => {
      const displayName = chat.participantsData[0]?.displayName || "";
      return displayName.toLowerCase().includes(text.toLowerCase());
    });
    setChats(filteredChats);
  };

  const handleSearchTextChange = (text) => {
    setSearchText(text);

    if (text === "") {
      setChats(originalChats);
    } else {
      filterChats(text);
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <Image
        source={{ uri: item.participantsData[0].photoURL }}
        style={styles.photoURL}
      />
      <View style={styles.chatItemContent}>
        <Text style={styles.chatItemTitle}>
          {item.participantsData[0].displayName}
        </Text>
        <Text style={styles.chatItemMessage}>
          {item.participantsData[0].email}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleChatPress = (item) => {
    const participantData = item.participantsData[0];
    navigation.navigate("ChatScreen", {
      displayName: participantData.displayName,
      email: participantData.email,
      photoURL: participantData.photoURL,
      receiverId: participantData.receiverId,
    });
  };

  if (!isDataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentSecondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color={colors.accentPrimary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={handleSearchTextChange}
        />
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    padding: 10,
  },
  chatList: {
    padding: 10,
  },
  chatItem: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  photoURL: {
    width: 50,
    height: 50,
    borderRadius: 60,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: colors.accentSecondary,
  },
  chatItemContent: {
    flex: 1,
  },
  chatItemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginVertical: 4,
  },
  chatItemMessage: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 4,
  },
  loadingIndicator: {
    alignSelf: "center",
  },
});
