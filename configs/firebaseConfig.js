import firebaseApp from "firebase-admin";
// import * as serviceAccount from "../serviceAccount.json";
import serviceAccount from "../serviceAccount.json" assert { type: "json" };

firebaseApp.initializeApp({
  credential: firebaseApp.credential.cert(serviceAccount),
});

export { firebaseApp };
