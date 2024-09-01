import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../colors";

export default function BottomTabBar({ activeTab, setActiveTab }) {
  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "chats" && styles.activeTab,
          activeTab === "chats" && styles.activeTabBackground,
        ]}
        onPress={() => handleTabPress("chats")}
      >
        <Ionicons
          name={activeTab === "chats" ? "chatbox" : "chatbox-outline"}
          size={24}
          color={
            activeTab === "chats"
              ? colors.accentPrimary
              : colors.accentSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "chats" && styles.activeTabText,
          ]}
        >
          Chats
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "social" && styles.activeTab,
          activeTab === "social" && styles.activeTabBackground,
        ]}
        onPress={() => handleTabPress("social")}
      >
        <Ionicons
          name={activeTab === "social" ? "people" : "people-outline"}
          size={24}
          color={
            activeTab === "social"
              ? colors.accentPrimary
              : colors.accentSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "social" && styles.activeTabText,
          ]}
        >
          social
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "createPost" && styles.activeTab,
          activeTab === "createPost" && styles.activeTabBackground,
        ]}
        onPress={() => handleTabPress("createPost")}
      >
        <Ionicons
          name={
            activeTab === "createPost" ? "add-circle" : "add-circle-outline"
          }
          size={24}
          color={
            activeTab === "createPost"
              ? colors.accentPrimary
              : colors.accentSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "createPost" && styles.activeTabText,
          ]}
        >
          Create Post
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "search" && styles.activeTab,
          activeTab === "search" && styles.activeTabBackground,
        ]}
        onPress={() => handleTabPress("search")}
      >
        <Ionicons
          name={activeTab === "search" ? "search" : "search-outline"}
          size={24}
          color={
            activeTab === "search"
              ? colors.accentPrimary
              : colors.accentSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "search" && styles.activeTabText,
          ]}
        >
          Search
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "account" && styles.activeTab,
          activeTab === "account" && styles.activeTabBackground,
        ]}
        onPress={() => handleTabPress("account")}
      >
        <Ionicons
          name={activeTab === "account" ? "person" : "person-outline"}
          size={24}
          color={
            activeTab === "account"
              ? colors.accentPrimary
              : colors.accentSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "account" && styles.activeTabText,
          ]}
        >
          Account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: colors.backgroundSecondary,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "80%",
    borderRadius: 15,
    margin: 10,
  },
  activeTab: {
    backgroundColor: colors.accentPrimary,
  },
  activeTabBackground: {
    backgroundColor: colors.backgroundPrimary,
  },
  tabText: {
    color: colors.accentSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  activeTabText: {
    color: colors.accentPrimary,
  },
});
