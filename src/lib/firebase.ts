
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBK_fKZkwhgpNynp4C0xPBGBjL5YnEPLVw",
  authDomain: "stayinsight0.firebaseapp.com",
  projectId: "stayinsight0",
  storageBucket: "stayinsight0.appspot.com",
  messagingSenderId: "198296844866",
  appId: "1:198296844866:web:ccb518b3a8f84481030bdb",
  measurementId: "G-VT887HFH91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const firestore = getFirestore(app);

// Configure Google provider with additional settings
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, storage, firestore, googleProvider };
