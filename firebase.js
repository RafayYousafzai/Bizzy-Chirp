import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB80D61UTuEDwfPEucmXXD6BQRHjESHs0M",
  authDomain: "unity-13018.firebaseapp.com",
  projectId: "unity-13018",
  storageBucket: "unity-13018.appspot.com",
  messagingSenderId: "64825439231",
  appId: "1:64825439231:web:d036c4b71beaa7cf6cadca",
  measurementId: "G-2QMJRGHZR9",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
