
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

const Signup = () => {
  const { signUp, signInWithGoogle } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <AuthForm 
          type="signup" 
          onSubmit={signUp} 
          onGoogleSignIn={signInWithGoogle}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
