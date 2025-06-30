import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type AuthContextType = {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: { display_name?: string; avatar_url?: string; phone_number?: string; company?: string }) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  session: null,
  loading: true,
  isLoading: true,
  signIn: async () => null,
  signUp: async () => null,
  signInWithGoogle: async () => null,
  logOut: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Please try again.");
        } else if (error.message.includes('Email not confirmed')) {
          toast.error("Please check your email and confirm your account before signing in.");
        } else if (error.message.includes('Too many requests')) {
          toast.error("Too many failed attempts. Please try again later.");
        } else {
          toast.error(error.message || "Failed to sign in. Please try again.");
        }
        return null;
      }

      if (data.user) {
        toast.success("Successfully signed in!");
        return data.user;
      }

      return null;
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      return null;
    }
  };

  const signUp = async (email: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        
        if (error.message.includes('User already registered')) {
          toast.error("An account with this email already exists. Please sign in instead.");
        } else if (error.message.includes('Password should be')) {
          toast.error("Password must be at least 6 characters long.");
        } else {
          toast.error(error.message || "Failed to create account. Please try again.");
        }
        return null;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          toast.success("Account created successfully!");
        } else {
          toast.success("Account created! Please check your email to confirm your account.");
        }
        return data.user;
      }

      return null;
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      return null;
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      console.log('🔄 Starting Google sign-in with Supabase...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ Google sign-in error:', error);
        
        if (error.message.includes('OAuth')) {
          toast.error("Google sign-in is not properly configured. Please use email/password or contact support.");
        } else if (error.message.includes('popup')) {
          toast.error("Popup was blocked. Please allow popups for this site and try again.");
        } else {
          toast.error(error.message || "Failed to sign in with Google");
        }
        return null;
      }

      // OAuth redirect will handle the rest
      console.log('✅ Google OAuth redirect initiated');
      toast.success("Redirecting to Google...");
      return null;
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      toast.error("Failed to sign in with Google. Please try again or use email/password.");
      return null;
    }
  };

  const logOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out");
        return;
      }

      toast.success("Successfully signed out!");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        toast.error(error.message || "Failed to send password reset email");
        return;
      }

      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error("Failed to send password reset email");
    }
  };

  const updateUserProfile = async (updates: { 
    display_name?: string; 
    avatar_url?: string; 
    phone_number?: string; 
    company?: string;
  }): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        console.error("Profile update error:", error);
        toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setCurrentUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setCurrentUser(session?.user ?? null);
        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          console.log('✅ User signed in:', session?.user?.email);
          
          // Check if this is a Google OAuth sign-in
          if (session?.user?.app_metadata?.provider === 'google') {
            toast.success(`Welcome back, ${session.user.user_metadata?.name || session.user.email}!`);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    session,
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