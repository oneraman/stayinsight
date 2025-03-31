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
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (email: string, password: string) => Promise<User | null>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signIn: async () => null,
  signUp: async () => null,
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
    signIn,
    signUp,
    logOut,
    resetPassword,
    updateUserProfile,
  };
  
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
