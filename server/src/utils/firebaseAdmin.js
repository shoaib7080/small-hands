import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

let serviceAccount;

try {
  // STRATEGY 1: PRODUCTION (Read from Render Env Var)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  // STRATEGY 2: LOCAL DEV (Read from file if Env Var is missing)
  else if (fs.existsSync("./firebase-service-account.json")) {
    serviceAccount = JSON.parse(
      fs.readFileSync("./firebase-service-account.json", "utf8")
    );
  }
  // Fallback for nested folder issues in dev
  else if (fs.existsSync("../../firebase-service-account.json")) {
    serviceAccount = JSON.parse(
      fs.readFileSync("../../firebase-service-account.json", "utf8")
    );
  } else {
    throw new Error("Firebase Service Account credentials not found!");
  }
} catch (error) {
  console.error("🔥 Firebase Auth Error:", error.message);
}

// Initialize only if we found credentials
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
