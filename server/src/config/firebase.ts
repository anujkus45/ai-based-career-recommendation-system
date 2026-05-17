import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Path to the firebase-service-account.json in the config/ directory at the root
const serviceAccountPath = path.resolve(import.meta.dirname, "../../../config/firebase-service-account.json");

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    console.error("Firebase service account init failed:", err);
    admin.initializeApp(); // Fallback to env vars
  }
} else {
  console.warn("Firebase service account file not found at:", serviceAccountPath);
  try {
    admin.initializeApp();
  } catch (err) {
    console.warn("Firebase init failed, continuing without Firebase.");
  }
}


export const authAdmin = admin.auth();
