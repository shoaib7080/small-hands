import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./services/api";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB8Fg_2EKkAecY4na7jPEQzwZbVsBLyvmA",
  authDomain: "small-hands.firebaseapp.com",
  projectId: "small-hands",
  storageBucket: "small-hands.firebasestorage.app",
  messagingSenderId: "654078592638",
  appId: "1:654078592638:web:04e28a9d90cc6f5a33fa2f",
  measurementId: "G-WQ3LL79YVS",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to ask permission & save token
export const requestForToken = async () => {
  try {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("User not logged in, skipping FCM token request");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // vapidKey
      const fcmToken = await getToken(messaging, {
        vapidKey:
          "BCh-km97aMC0G770byZLcw8-QNcJ7b5hOBcDkDbyF6Ynb0j-5_ll5RMkjFSTYdtvA8dL1u3y8Z2fGwSvTzc77kE",
      });

      if (fcmToken) {
        console.log("FCM Token Generated:", fcmToken);
        // Send to backend
        await api.patch("/users/update-fcm-token", { fcmToken });
      }
    } else {
      console.log("Notification permission denied.");
    }
  } catch (err) {
    console.error("FCM Error:", err);
  }
};

// Function to listen for messages when app is OPEN
export const onMessageListener = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log("[Foreground] Message received:", payload);
    callback(payload);
  });
};
