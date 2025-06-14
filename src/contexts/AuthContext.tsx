import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
} from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "sonner";

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  isLoading: boolean; // Added for consistency with ProtectedRoute
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>; // Added for Google sign-in
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isLoading: true, // Added for consistency with ProtectedRoute
  signIn: async () => null,
  signUp: async () => null,
  signInWithGoogle: async () => null, // Added for Google sign-in
  logOut: async () => {},
  resetPassword: async () => {},
  updateUserProfile: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully signed in!");
      return userCredential.user;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const signUp = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Successfully signed up!");
      return userCredential.user;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  // Enhanced Google sign-in method with better error handling
  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      console.log('Attempting Google sign-in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful:', result.user);
      toast.success("Successfully signed in with Google!");
      return result.user;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle specific Google auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Sign-in was cancelled");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("Popup was blocked by browser. Please allow popups and try again.");
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error("This domain is not authorized for Google sign-in");
      } else {
        toast.error(error.message || "Failed to sign in with Google");
      }
      return null;
    }
  };

  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      toast.success("Successfully signed out!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateUserProfile = () => {
    const user = auth.currentUser;
    if (user) {
      // Force refresh of the user object
      setCurrentUser({ ...user });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    isLoading: loading, // Added for consistency with ProtectedRoute
    signIn,
    signUp,
    signInWithGoogle, // Added the Google sign-in method
    logOut,
    resetPassword,
    updateUserProfile,
  };
  
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
