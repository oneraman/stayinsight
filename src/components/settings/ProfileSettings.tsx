
import { useState } from "react";
import { User, updateProfile, updateEmail } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, Phone, Building, Upload } from "lucide-react";
import { toast } from "sonner";

interface ProfileSettingsProps {
  user: User | null;
  onSave: () => void;
}

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z.string().optional(),
  company: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettings = ({ user, onSave }: ProfileSettingsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const defaultValues: Partial<ProfileFormValues> = {
    displayName: user?.displayName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    company: "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update Firebase Auth profile
      const updates = [];
      
      // Update display name if changed
      if (data.displayName !== user.displayName) {
        updates.push(updateProfile(user, {
          displayName: data.displayName
        }));
      }
      
      // Update email if changed
      if (data.email !== user.email) {
        updates.push(updateEmail(user, data.email));
      }
      
      // Wait for all auth updates to complete
      await Promise.all(updates);
      
      // Update Firestore user document with additional fields
      if (user.uid) {
        const userDocRef = doc(firestore, "users", user.uid);
        await updateDoc(userDocRef, {
          displayName: data.displayName,
          email: data.email,
          phoneNumber: data.phoneNumber || null,
          company: data.company || null,
          updatedAt: new Date()
        });
      }
      
      toast.success("Profile updated successfully");
      onSave();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      
      // Handle specific Firebase errors
      if (error.code === "auth/requires-recent-login") {
        toast.error("Please log out and log back in to update your email");
      } else if (error.code === "auth/email-already-in-use") {
        toast.error("Email is already in use by another account");
      } else {
        toast.error("Failed to update profile: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
              <AvatarFallback className="text-lg bg-[#5E5AFF]/10 text-[#5E5AFF]">
                {getInitials(user?.displayName)}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" className="gap-2">
              <Upload size={16} />
              Upload new image
            </Button>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="px-0 grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="Your name" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          className="pl-10" 
                          placeholder="your.email@example.com" 
                          type="email" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="+1 (555) 000-0000" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="Your company" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileSettings;
