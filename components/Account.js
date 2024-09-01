import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { firebase } from "../firebase";
import Header from "./Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../colors";

const Account = () => {
  const [accountInfo, setAccountInfo] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const fetchAccountInfo = async () => {
    try {
      const uid = await AsyncStorage.getItem("uid");
      const displayName = await AsyncStorage.getItem("displayName");
      const photoURL = await AsyncStorage.getItem("photoURL");
      const email = await AsyncStorage.getItem("email");

      if (uid && displayName && photoURL && email) {
        const accountData = {
          uid,
          displayName,
          photoURL,
          email,
        };

        setAccountInfo(accountData);
        setIsDataLoaded(true);
      } else {
        console.error("Account info not found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error retrieving stored account info:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      firebase.auth().signOut("SigninScreen");
      AsyncStorage.setItem("isSignedIn", "false");
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.option}>
          <Text style={styles.optionLabel}>Username:</Text>
          <Text style={styles.optionValue}>{accountInfo.displayName}</Text>
        </View>
        <View style={styles.option}>
          <Text style={styles.optionLabel}>Email:</Text>
          <Text style={styles.optionValue}>{accountInfo.email}</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.option}>
          <Text style={styles.optionLabel}>Notifications:</Text>
          <Text style={styles.optionValue}>Enabled</Text>
        </View>
        <View style={styles.option}>
          <Text style={styles.optionLabel}>Privacy:</Text>
          <Text style={styles.optionValue}>Public</Text>
        </View>
        <View style={styles.option}>
          <Text style={styles.optionLabel}>Theme:</Text>
          <Text style={styles.optionValue}>Dark</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => handleLogout()}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: colors.backgroundSecondary,
    // padding: 16,
  },
  section: {
    marginBottom: 24,
    borderRadius: 6,
    margin: 10,
    backgroundColor: colors.backgroundSecondary,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  optionValue: {
    fontSize: 16,
    color: colors.textPrimary,
  },

  logoutButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Account;
