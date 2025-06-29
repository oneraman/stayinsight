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
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "sonner";

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isLoading: true,
  signIn: async () => null,
  signUp: async () => null,
  signInWithGoogle: async () => null,
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
      console.error("Sign in error:", error);
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
      console.error("Sign up error:", error);
      toast.error(error.message);
      return null;
    }
  };

  // Enhanced Google sign-in with better error handling and fallback
  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      console.log('🔄 Starting Google sign-in...');
      
      // Check if we're in a mobile environment or popup is blocked
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      let result;
      
      if (isMobile) {
        // Use redirect for mobile devices
        console.log('📱 Using redirect method for mobile');
        await signInWithRedirect(auth, googleProvider);
        return null; // Will be handled by getRedirectResult
      } else {
        // Use popup for desktop
        console.log('🖥️ Using popup method for desktop');
        result = await signInWithPopup(auth, googleProvider);
      }
      
      if (result && result.user) {
        console.log('✅ Google sign-in successful:', result.user.email);
        toast.success("Successfully signed in with Google!");
        return result.user;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      
      // Handle specific Google auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Sign-in was cancelled");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("Popup was blocked. Please allow popups and try again.");
        // Fallback to redirect method
        try {
          console.log('🔄 Falling back to redirect method...');
          await signInWithRedirect(auth, googleProvider);
          return null;
        } catch (redirectError) {
          console.error('❌ Redirect fallback failed:', redirectError);
          toast.error("Failed to sign in with Google");
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error("This domain is not authorized for Google sign-in");
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error("Google sign-in is not enabled. Please contact support.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Don't show error for cancelled popup requests
        console.log('Popup request cancelled');
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
      console.error("Sign out error:", error);
      toast.error(error.message);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message);
    }
  };

  const updateUserProfile = () => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser({ ...user });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 Auth state changed:', user?.email || 'No user');
      setCurrentUser(user);
      setLoading(false);
    });
    
    // Check for redirect result on app load
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          console.log('✅ Redirect sign-in successful:', result.user.email);
          toast.success("Successfully signed in with Google!");
        }
      })
      .catch((error) => {
        console.error('❌ Redirect result error:', error);
        if (error.code !== 'auth/null-user') {
          toast.error("Failed to complete Google sign-in");
        }
      });
    
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    isLoading: loading,
    signIn,
    signUp,
    signInWithGoogle,
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