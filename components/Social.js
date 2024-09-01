import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { firebase } from "../firebase";
import Header from "./Header";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../colors";

const Social = () => {
  const [posts, setPosts] = useState([]);
  const [offlineData, setOfflineData] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [networkStatus, setNetworkStatus] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const snapshot = await firebase.firestore().collection("posts").get();
        const postsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            likes_by_users: data.likes_by_users || [],
          };
        });
        setPosts(postsData);
        setOfflineData(postsData);
        await AsyncStorage.setItem("postsData", JSON.stringify(postsData));
      } catch (error) {
        console.log("Error fetching posts:", error);
      }
    };

    const loadOfflineData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("postsData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setOfflineData(parsedData);
          setPosts(parsedData);
        } else {
          fetchPosts();
        }
      } catch (error) {
        console.log("Error loading offline data:", error);
      }
    };

    const getEmail = async () => {
      const email = await AsyncStorage.getItem("email");
      setUserEmail(email);
    };

    loadOfflineData();
    getEmail();
  }, []);

  useEffect(() => {
    const checkNetworkStatus = async () => {
      const netInfoState = await NetInfo.fetch();
      if (netInfoState.isConnected && netInfoState.isInternetReachable) {
        syncData();
        setNetworkStatus(true);
      }
    };

    const syncData = async () => {
      try {
        const snapshot = await firebase.firestore().collection("posts").get();
        const postsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            likes_by_users: data.likes_by_users || [],
          };
        });
        setPosts(postsData);
        setOfflineData(postsData);
        await AsyncStorage.setItem("postsData", JSON.stringify(postsData));
      } catch (error) {
        console.log("Error fetching posts:", error);
      }
    };

    const unsubscribe = NetInfo.addEventListener(checkNetworkStatus);
    const getEmail = async () => {
      const email = await AsyncStorage.getItem("email");
      setUserEmail(email);
    };

    return () => {
      getEmail();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribeLikes = [];

    posts.forEach((post) => {
      const unsubscribe = firebase
        .firestore()
        .collection("posts")
        .doc(post.id)
        .onSnapshot((snapshot) => {
          const updatedPost = {
            id: snapshot.id,
            ...snapshot.data(),
          };
          setPosts((prevPosts) =>
            prevPosts.map((prevPost) =>
              prevPost.id === updatedPost.id ? updatedPost : prevPost
            )
          );
        });

      unsubscribeLikes.push(unsubscribe);
    });

    return () => {
      unsubscribeLikes.forEach((unsubscribe) => unsubscribe());
    };
  }, [posts]);

  const handleLike = (post) => {
    const currentLikeStatus = !post.likes_by_users.includes(userEmail);

    const updatedPosts = posts.map((p) => {
      if (p.id === post.id) {
        return {
          ...p,
          likes_by_users: currentLikeStatus
            ? [...p.likes_by_users, userEmail]
            : p.likes_by_users.filter((email) => email !== userEmail),
        };
      }
      return p;
    });

    setPosts(updatedPosts);

    try {
      firebase
        .firestore()
        .collection("posts")
        .doc(post.id)
        .update({
          likes_by_users: currentLikeStatus
            ? firebase.firestore.FieldValue.arrayUnion(userEmail)
            : firebase.firestore.FieldValue.arrayRemove(userEmail),
        });
      console.log("Like Counted");
    } catch (error) {
      console.log("Error updating document:", error);
    }
  };

  const renderPost = ({ item }) => {
    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image style={styles.avatar} source={{ uri: item.userPic }} />
          <Text style={styles.username}>{item.userName}</Text>
        </View>
        <Image style={styles.postImage} source={{ uri: item.imageUrl }} />
        <View style={styles.postDetails}>
          <Text style={styles.caption}>{item.caption}</Text>
          <Text style={styles.email}>{item.userEmail}</Text>
          <View style={styles.likeCommentsContainer}>
            {networkStatus ? (
              <Ionicons
                name="heart"
                size={24}
                color={
                  item.likes_by_users.includes(userEmail)
                    ? "#ff0000"
                    : "#000000"
                }
                style={styles.likeIcon}
                onPress={() => handleLike(item)}
              />
            ) : null}
            <Text style={styles.likes}>{item.likes_by_users.length} likes</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      {posts.length > 0 || offlineData.length > 0 ? (
        <FlatList
          data={posts.length > 0 ? posts : offlineData}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts available</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postContainer: {
    margin: 16,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    maxWidth: 550,
    width: "95%",
    alignSelf: "center",
    paddingVertical: 7,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: colors.accentSecondary,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary, // Set username text color to white
  },
  postImage: {
    // width: 400,
    maxWidth: 550,
    width: "100%",
    height: 400,
    resizeMode: "stretch",
  },
  postDetails: {
    padding: 8,
  },
  caption: {
    marginVertical: 8,
    color: colors.textPrimary, // Set caption text color to white
  },
  email: {
    fontSize: 10,
    color: colors.textSecondary,
    marginVertical: 2,
  },
  likeCommentsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeIcon: {
    marginRight: 8,
  },
  likes: {
    marginRight: 16,
    fontWeight: "bold",
    color: colors.textPrimary, // Set likes text color to white
  },
});

export default Social;
