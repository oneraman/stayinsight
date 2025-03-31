
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Bell, Mail, MessageSquare, Phone } from "lucide-react";

interface NotificationSettingsProps {
  onSave: () => void;
}

const NotificationSettings = ({ onSave }: NotificationSettingsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState({
    customerUpdates: true,
    riskAlerts: true,
    weeklyReports: true,
    marketingContent: false,
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    customerUpdates: false,
    riskAlerts: true,
    weeklyReports: false,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave();
    } catch (error) {
      console.error("Error saving notification settings:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleEmailSetting = (key: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const togglePushSetting = (key: keyof typeof pushNotifications) => {
    setPushNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-[#5E5AFF]" />
            <CardTitle className="text-lg">Email Notifications</CardTitle>
          </div>
          <CardDescription>
            Control what types of email notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-customer-updates" className="flex-1">
              Customer updates
              <p className="text-sm text-muted-foreground mt-1">
                Get notified about important changes to your customers
              </p>
            </Label>
            <Switch 
              id="email-customer-updates" 
              checked={emailNotifications.customerUpdates}
              onCheckedChange={() => toggleEmailSetting('customerUpdates')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-risk-alerts" className="flex-1">
              Risk alerts
              <p className="text-sm text-muted-foreground mt-1">
                Get notified when a customer's risk score changes significantly
              </p>
            </Label>
            <Switch 
              id="email-risk-alerts" 
              checked={emailNotifications.riskAlerts}
              onCheckedChange={() => toggleEmailSetting('riskAlerts')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-weekly-reports" className="flex-1">
              Weekly reports
              <p className="text-sm text-muted-foreground mt-1">
                Receive a weekly summary of your customer retention metrics
              </p>
            </Label>
            <Switch 
              id="email-weekly-reports" 
              checked={emailNotifications.weeklyReports}
              onCheckedChange={() => toggleEmailSetting('weeklyReports')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-marketing" className="flex-1">
              Marketing content
              <p className="text-sm text-muted-foreground mt-1">
                Receive updates about new features and promotions
              </p>
            </Label>
            <Switch 
              id="email-marketing" 
              checked={emailNotifications.marketingContent}
              onCheckedChange={() => toggleEmailSetting('marketingContent')}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-[#5E5AFF]" />
            <CardTitle className="text-lg">Push Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage push notifications in your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="push-customer-updates" className="flex-1">
              Customer updates
              <p className="text-sm text-muted-foreground mt-1">
                Get notified about important changes to your customers
              </p>
            </Label>
            <Switch 
              id="push-customer-updates" 
              checked={pushNotifications.customerUpdates}
              onCheckedChange={() => togglePushSetting('customerUpdates')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="push-risk-alerts" className="flex-1">
              Risk alerts
              <p className="text-sm text-muted-foreground mt-1">
                Get notified when a customer's risk score changes significantly
              </p>
            </Label>
            <Switch 
              id="push-risk-alerts" 
              checked={pushNotifications.riskAlerts}
              onCheckedChange={() => togglePushSetting('riskAlerts')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="push-weekly-reports" className="flex-1">
              Weekly reports
              <p className="text-sm text-muted-foreground mt-1">
                Receive a weekly summary of your customer retention metrics
              </p>
            </Label>
            <Switch 
              id="push-weekly-reports" 
              checked={pushNotifications.weeklyReports}
              onCheckedChange={() => togglePushSetting('weeklyReports')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default NotificationSettings;
