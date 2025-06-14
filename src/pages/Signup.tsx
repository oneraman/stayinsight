
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

const Signup = () => {
  const { signUp, signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleSignUp = async (email: string, password: string) => {
    const user = await signUp(email, password);
    if (user) {
      navigate("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <AuthForm 
          type="signup" 
          onSubmit={handleSignUp} 
          onGoogleSignIn={handleGoogleSignIn}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
