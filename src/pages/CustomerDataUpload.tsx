
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Server, FileUp, AlertCircle, Info } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const CustomerDataUpload = () => {
  const { currentUser } = useAuth();
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);

  const handleUploadSuccess = (url: string) => {
    setUploadedFileUrl(url);
    
    // Simulate processing completion after 3 seconds
    setTimeout(() => {
      setProcessingComplete(true);
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 inline-flex items-center">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Import Customer Data</h1>
          <p className="text-gray-500">Upload your customer data to analyze churn risk and retention metrics</p>
        </div>
        
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="file" className="data-[state=active]:bg-blue-50">
              <FileUp className="mr-2 h-4 w-4" />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-blue-50">
              <Server className="mr-2 h-4 w-4" />
              API Integration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Upload Customer Data File</CardTitle>
                <CardDescription>
                  Upload your customer data file in CSV, XLS, or XLSX format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader onUploadSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>
            
            {uploadedFileUrl && !processingComplete && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Processing File</CardTitle>
                  <CardDescription>
                    Your file is being processed and analyzed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Analyzing customer data... This may take a few moments.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {processingComplete && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-700">Processing Complete</CardTitle>
                  <CardDescription>
                    Your customer data has been processed successfully
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start mb-4">
                    <Info className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">
                        Your data has been imported and analyzed. You can now view insights and predictions on your dashboard.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <Link to="/dashboard">
                      <Button>
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Integration</CardTitle>
                <CardDescription>
                  Connect your systems directly to StayInsights for real-time data processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Your API Key</h3>
                    <div className="flex">
                      <code className="bg-gray-100 p-2 text-sm flex-1 rounded-l-md">
                        {currentUser?.uid ? `sk_live_${currentUser.uid.substring(0, 16)}` : 'Please login to view your API key'}
                      </code>
                      <Button variant="outline" className="rounded-l-none border border-l-0">
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Keep this key secure. Do not share it publicly.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Example API Request</h3>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-xs overflow-auto">
                      <code>
{`curl -X POST https://api.stayinsights.com/v1/customer-data \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
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
  }'`}
                      </code>
                    </pre>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Note</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          For detailed API documentation including all available endpoints and data schemas, please refer to our developer documentation.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    View API Documentation
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

export default CustomerDataUpload;
