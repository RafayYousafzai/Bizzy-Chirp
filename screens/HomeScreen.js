import React, { useCallback, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import ChatsList from "../components/ChatsList";
import Account from "../components/Account";
import SearchUsers from "../components/SearchUsers";
import BottomTabBar from "../components/BottomTabNav";
import Social from "../components/Social";
import CreatePost from "../components/CreatePost";
import { Divider } from "react-native-elements";

import { colors } from "../colors";

export default function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("chats");

  const renderScreen = () => {
    switch (activeTab) {
      case "chats":
        return <ChatsList navigation={navigation} />;
      case "social":
        return <Social navigation={navigation} />;
      case "createPost":
        return <CreatePost navigation={navigation} />;
      case "search":
        return <SearchUsers navigation={navigation} />;
      case "account":
        return <Account />;
      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Divider color="#ffffff0e" />
          {renderScreen()}
        </View>
        <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  contentContainer: {
    flex: 1,
  },
});
