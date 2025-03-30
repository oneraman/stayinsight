
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBK_fKZkwhgpNynp4C0xPBGBjL5YnEPLVw",
  authDomain: "stayinsight0.firebaseapp.com",
  projectId: "stayinsight0",
  storageBucket: "stayinsight0.firebasestorage.app",
  messagingSenderId: "198296844866",
  appId: "1:198296844866:web:ccb518b3a8f84481030bdb",
  measurementId: "G-VT887HFH91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
