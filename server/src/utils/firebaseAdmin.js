import admin from "firebase-admin";
import serviceAccount from "../../firebase-service-account.json" assert { type: "json" };
// Note: If 'assert' throws an error (older Node versions), use createRequire(import.meta.url)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
