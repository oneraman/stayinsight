
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from "@/components/settings/ProfileSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import { toast } from "sonner";

const Settings = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSaveSettings = (type: string) => {
    toast.success(`${type} settings saved successfully!`);
  };

  return (
    <DashboardLayout>
      <div className="container py-6 md:py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <Card>
            <TabsContent value="profile">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSettings 
                  user={currentUser} 
                  onSave={() => handleSaveSettings("Profile")} 
                />
              </CardContent>
            </TabsContent>
            
            <TabsContent value="notifications">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationSettings 
                  onSave={() => handleSaveSettings("Notification")} 
                />
              </CardContent>
            </TabsContent>
            
            <TabsContent value="appearance">
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize how StayInsights looks for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppearanceSettings 
                  onSave={() => handleSaveSettings("Appearance")} 
                />
              </CardContent>
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
