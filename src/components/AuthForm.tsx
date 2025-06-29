import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, AlertCircle, LogIn } from "lucide-react";

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (email: string, password: string) => void;
  onGoogleSignIn?: () => void;
}

const AuthForm = ({ type, onSubmit, onGoogleSignIn }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Email and password are required.",
      });
      return;
    }
    
    if (type === "signup" && password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(email, password);
    } catch (error) {
      // Error handling is done in the AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-indigo-50 to-teal-50 pb-8">
        <CardTitle className="text-3xl font-bold text-center text-slate-800">
          {type === "login" ? "Welcome Back" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-center text-slate-600 text-base mt-2">
          {type === "login"
            ? "Enter your credentials to access your account"
            : "Fill in the details below to create your account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-slate-700 font-medium">
              <Mail className="h-4 w-4 text-indigo-500" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2 text-slate-700 font-medium">
              <Lock className="h-4 w-4 text-indigo-500" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          {type === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="flex items-center gap-2 text-slate-700 font-medium">
                <Lock className="h-4 w-4 text-indigo-500" />
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : type === "login"
              ? "Sign In"
              : "Create Account"}
          </Button>
          
          {onGoogleSignIn && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-white px-4 text-slate-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>
          )}
          
          {onGoogleSignIn && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-2 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
              onClick={onGoogleSignIn}
              disabled={loading}
            >
              <svg
                className="mr-3 h-5 w-5"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="#EA4335"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              <span className="font-medium">Sign in with Google</span>
            </Button>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-center bg-gray-50 py-6">
        {type === "login" ? (
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-300">
              Sign up
            </Link>
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-300">
              Sign in
            </Link>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;