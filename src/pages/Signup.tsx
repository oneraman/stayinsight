
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = (email: string, password: string) => {
    // Simulate account creation
    // In a real app, this would make an API call to your auth service
    setTimeout(() => {
      toast({
        title: "Account created",
        description: "Welcome to Churnify! Your account has been created successfully.",
      });
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <AuthForm type="signup" onSubmit={handleSignup} />
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
