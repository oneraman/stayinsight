
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    // Simulate authentication
    // In a real app, this would make an API call to your auth service
    setTimeout(() => {
      toast({
        title: "Login successful",
        description: "Welcome back to Churnify!",
      });
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <AuthForm type="login" onSubmit={handleLogin} />
      </div>
      <Footer />
    </div>
  );
};

export default Login;
