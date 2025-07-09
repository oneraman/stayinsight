import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";

export const AuthenticationPrompt = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5 text-blue-600" />
          Authentication Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">
            Please log in to upload and process customer data.
          </p>
          <div className="space-x-2">
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};