import admin from "firebase-admin";
import fs from "fs";

// simple way to read JSON in ES modules
const serviceAccount = JSON.parse(
  fs.readFileSync("./firebase-service-account.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 🔴 PASTE THE TOKEN FROM YOUR MONGODB/CONSOLE HERE
const registrationToken =
  "dmX7qXI0tJZXYqZq3lQ130:APA91bHAJQ2aROLdyDIweHnGDvtkAFv3m45jYmt1HCDckxyXdO2hGffhq_uXeBZS2Hg1YHFjgtA7SNfVDONpKshOfTUKIzEtHoaZizWlI7auiCvrVBuIulI";

const message = {
  notification: {
    title: "🚨 Test Alert",
    body: "This is a test message from your Small Hands backend!",
  },
  token: registrationToken,
};

admin
  .messaging()
  .send(message)
  .then((response) => {
    console.log("Successfully sent message:", response);
    process.exit(0);
  })
  .catch((error) => {
    console.log("Error sending message:", error);
    process.exit(1);
  });
