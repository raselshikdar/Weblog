import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAP1GKocS_bJIsEmnFsmYu40RUcFB6Wy9U",
  authDomain: "devto-bd.firebaseapp.com",
  databaseURL: "https://devto-bd-default-rtdb.firebaseio.com",
  projectId: "devto-bd",
  storageBucket: "devto-bd.appspot.com",
  messagingSenderId: "38322377138",
  appId: "1:38322377138:web:19039a1e0c79ad435354ab",
  measurementId: "G-KFWF1VB2BB",
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const firestore = firebase.firestore();
export const storage = firebase.storage();

// Firestore exports
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
export const fromMillis = firebase.firestore.Timestamp.fromMillis;
export const increment = firebase.firestore.FieldValue.increment;
export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED;

/// Hepler Functions

/**
 * Gets a users/{uid} document with username
 * @param {string} username
 */
export async function getUserWithUsername(username) {
    const usersRef = firestore.collection("users");
    const query = usersRef.where("username", "==", username).limit(1);
    const userDoc = (await query.get()).docs[0];
    return userDoc;
}

/**
 * converts a firebase document to JSON
 * @param {DocumentSnapshot} doc
 */
export function postToJSON(doc) {
    const data = doc.data();
    return {
        ...data,
        // Gotcha! firestore timestamp NOT serializable to JSON
        createdAt: data?.createdAt.toMillis() || 0,
        updatedAt: data?.updatedAt.toMillis() || 0,
    };
}
