
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

const Login = () => {
  const { signIn, signInWithGoogle } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <AuthForm 
          type="login" 
          onSubmit={signIn} 
          onGoogleSignIn={signInWithGoogle}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Login;
