// Import scripts from Google (Versions must match mostly)
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
firebase.initializeApp({
  apiKey: "AIzaSyB8Fg_2EKkAecY4na7jPEQzwZbVsBLyvmA",
  authDomain: "small-hands.firebaseapp.com",
  projectId: "small-hands",
  storageBucket: "small-hands.firebasestorage.app",
  messagingSenderId: "654078592638",
  appId: "1:654078592638:web:04e28a9d90cc6f5a33fa2f",
  measurementId: "G-WQ3LL79YVS",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background Message:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/vite.svg", // Or your logo path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
