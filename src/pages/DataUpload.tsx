
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Code, FileUp } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { useToast } from "@/components/ui/use-toast";

const DataUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleUploadComplete = (file: File) => {
    setUploadComplete(true);
    
    // Simulate processing
    setTimeout(() => {
      toast({
        title: "Processing complete",
        description: "Your data has been processed successfully.",
      });
      navigate("/dashboard");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-churnify-blue text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link to="/" className="text-xl font-bold">Churnify</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-churnify-blue/20">Help</Button>
            <Button variant="ghost" className="text-white hover:bg-churnify-blue/20">Settings</Button>
            <Link to="/">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-churnify-blue">Logout</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-churnify-blue mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Import Your Customer Data</h1>
          <p className="text-gray-600 mt-2">
            Upload your customer data to get started with churn predictions and retention strategies.
          </p>
        </div>
        
        <Tabs defaultValue="file-upload" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file-upload">
              <FileUp className="h-4 w-4 mr-2" /> File Upload
            </TabsTrigger>
            <TabsTrigger value="api">
              <Code className="h-4 w-4 mr-2" /> API Integration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file-upload" className="space-y-6">
            <FileUpload onUploadComplete={handleUploadComplete} />
            
            {uploadComplete && (
              <Card>
                <CardHeader>
                  <CardTitle>Processing Your Data</CardTitle>
                  <CardDescription>
                    We're analyzing your customer data and generating insights. This may take a few moments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div className="bg-churnify-blue h-2 rounded-full animate-pulse" style={{ width: "65%" }}></div>
                    </div>
                    <p className="text-sm text-gray-500">
                      You'll be redirected to your dashboard once processing is complete.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>File Format Requirements</CardTitle>
                <CardDescription>
                  Please ensure your file meets the following requirements for accurate analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Supported Formats</h3>
                    <p className="text-sm text-gray-500">CSV, XLS, or XLSX files up to 10MB</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Required Columns</h3>
                    <ul className="text-sm text-gray-500 list-disc pl-5">
                      <li>Customer ID (unique identifier)</li>
                      <li>Email address</li>
                      <li>Signup date</li>
                      <li>Last activity date</li>
                      <li>Subscription value</li>
                      <li>Subscription status</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Recommended Columns</h3>
                    <p className="text-sm text-gray-500">
                      For more accurate predictions, include usage data, support tickets, feature engagement, and other behavioral metrics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Integration</CardTitle>
                <CardDescription>
                  Connect your systems directly to Churnify for real-time churn prediction and analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Your API Key</h3>
                    <div className="flex">
                      <code className="bg-gray-100 p-2 text-sm flex-1 rounded-l-md">sk_churnify_59fxks72jd92h57j39f72j20</code>
                      <Button variant="ghost" className="rounded-l-none border border-l-0 border-gray-200">
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Keep this key secure. Do not share it publicly.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Example Request</h3>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-xs overflow-auto">
                      <code>
{`curl -X POST https://api.churnify.io/v1/customers \\
  -H "Authorization: Bearer sk_churnify_59fxks72jd92h57j39f72j20" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_id": "cus_12345",
    "email": "customer@example.com",
    "signup_date": "2023-01-15",
    "last_activity": "2023-06-20",
    "subscription_value": 99.00,
    "subscription_status": "active",
    "usage_metrics": {
      "logins_last_30_days": 5,
      "features_used": 8,
      "support_tickets": 2
    }
  }'`}</code>
                    </pre>
                  </div>
                  
                  <Button className="w-full bg-churnify-blue hover:bg-churnify-dark-blue">
                    View Full API Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataUpload;
