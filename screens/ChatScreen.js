import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { firebase } from "../firebase";
import { Divider, Icon } from "react-native-elements";
import NetInfo from "@react-native-community/netinfo";
import { StatusBar } from "expo-status-bar";
import { colors } from "../colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatScreen = ({ route, navigation }) => {
  const { displayName, photoURL, receiverId } = route.params;
  const [currentUserId, setCurrentUserId] = useState(null);
  console.log(currentUserId);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const userId = await AsyncStorage.getItem("uid");
      setCurrentUserId(userId);
    };

    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const chatId =
      currentUserId < receiverId
        ? `${currentUserId}_${receiverId}`
        : `${receiverId}_${currentUserId}`;
    const chatRef = firebase.firestore().collection("chats").doc(chatId);

    const unsubscribe = chatRef
      .collection("messages")
      .orderBy("timestamp")
      .onSnapshot((snapshot) => {
        const messageList = snapshot.docs.map((doc) => doc.data());
        setMessages(messageList);
        if (!isConnected) {
          // Save offline messages here
        }
      });

    const unsubscribeNetInfo = NetInfo.addEventListener(({ isConnected }) => {
      setIsConnected(isConnected);
      if (isConnected) {
        chatRef
          .collection("messages")
          .orderBy("timestamp")
          .get()
          .then((snapshot) => {
            const messageList = snapshot.docs.map((doc) => doc.data());
            setMessages(messageList);
          })
          .catch((error) => {
            console.error("Error fetching messages:", error);
          });
      }
    });

    return () => {
      unsubscribe();
      unsubscribeNetInfo();
    };
  }, [currentUserId, receiverId]);

  const handleSend = async () => {
    try {
      if (!currentUserId) {
        return;
      }

      const chatId =
        currentUserId < receiverId
          ? `${currentUserId}_${receiverId}`
          : `${receiverId}_${currentUserId}`;
      const chatRef = firebase.firestore().collection("chats").doc(chatId);
      const messageRef = chatRef.collection("messages").doc();

      const chatData = {
        senderId: currentUserId,
        message: messageText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      const participantsData = {
        participants: [currentUserId, receiverId],
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await Promise.all([
        messageRef.set(chatData),
        chatRef.set(participantsData, { merge: true }),
      ]);

      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUserId;
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.userMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <StatusBar />
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
            style={styles.backIcon}
            onPress={() => navigation.navigate("HomeScreen")}
          />
          <Image source={{ uri: photoURL }} style={styles.profileImage} />
          <Text style={styles.headerText}>{displayName}</Text>
        </View>
        <Divider />
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => index.toString()} // Use the index as the keyExtractor
          renderItem={renderMessage}
          style={styles.flex1}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundPrimary,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    backgroundColor: colors.backgroundSecondary,
    padding: 15,
    borderRadius: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#fc7a1e",
  },
  headerText: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  messageContainer: {
    maxWidth: "70%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    margin: 8,
    height: "auto",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.accentPrimary,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSecondary,
  },
  messageText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    height: 40,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 5,
    paddingHorizontal: 12,
    marginRight: 8,
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sendButtonText: {
    color: colors.textPrimary,
    fontWeight: "bold",
  },
});

export default ChatScreen;
